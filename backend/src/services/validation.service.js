function toNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const cleaned = String(value)
    .replace(/[₹$€£,\s]/g, "")
    .replace(/[^\d.-]/g, "");

  if (!cleaned) {
    return null;
  }

  const number = Number(cleaned);

  return Number.isFinite(number) ? number : null;
}

function roundMoney(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function validateArithmetic(bill) {
  const discrepancies = [];

  const items = Array.isArray(bill.items)
    ? bill.items
    : [];

  let calculatedSubtotal = 0;

  for (const item of items) {
    const quantity = toNumber(item.quantity) ?? 1;
    const unitPrice = toNumber(item.unitPrice);

    if (unitPrice === null) {
      continue;
    }

    const expectedAmount = roundMoney(
      quantity * unitPrice
    );

    const actualAmount = toNumber(item.amount);

    if (actualAmount === null) {
      continue;
    }

    calculatedSubtotal += actualAmount;

    if (
      Math.abs(expectedAmount - actualAmount) > 0.01
    ) {
      discrepancies.push({
        type: "ITEM_ARITHMETIC_MISMATCH",
        severity: "medium",

        description:
          `The amount for "${item.description || "an item"}" ` +
          `does not match its quantity multiplied by unit price.`,

        item: {
          description: item.description || null,
          quantity,
          unitPrice,
          billedAmount: actualAmount,
          expectedAmount
        }
      });
    }
  }

  return {
    calculatedSubtotal: roundMoney(calculatedSubtotal),
    discrepancies
  };
}

function validateDuplicateCharges(bill) {
  const discrepancies = [];
  const items = Array.isArray(bill.items)
    ? bill.items
    : [];

  const seen = new Map();

  for (const item of items) {
    const description = String(
      item.description || ""
    )
      .trim()
      .toLowerCase();

    const amount = toNumber(item.amount);

    if (!description || amount === null) {
      continue;
    }

    const key = `${description}|${amount}`;

    if (seen.has(key)) {
      const previousIndex = seen.get(key);

      discrepancies.push({
        type: "POSSIBLE_DUPLICATE_CHARGE",
        severity: "medium",

        description:
          `A charge matching "${item.description}" ` +
          `with amount ${amount} appears more than once.`,

        item: {
          description: item.description,
          amount,
          currentIndex: items.indexOf(item),
          previousIndex
        }
      });
    } else {
      seen.set(key, items.indexOf(item));
    }
  }

  return discrepancies;
}

function validateSubtotal(bill, calculatedSubtotal) {
  const discrepancies = [];

  const declaredSubtotal = toNumber(
    bill.subtotal
  );

  if (
    declaredSubtotal === null ||
    calculatedSubtotal === 0
  ) {
    return discrepancies;
  }

  if (
    Math.abs(
      declaredSubtotal - calculatedSubtotal
    ) > 0.01
  ) {
    discrepancies.push({
      type: "SUBTOTAL_MISMATCH",
      severity: "high",

      description:
        "The declared subtotal does not match the sum of the itemized charges.",

      item: {
        declaredSubtotal,
        calculatedSubtotal
      }
    });
  }

  return discrepancies;
}

function validateTotal(bill, calculatedSubtotal) {
  const discrepancies = [];

  const declaredTotal = toNumber(bill.total);

  if (declaredTotal === null) {
    return discrepancies;
  }

  const tax = toNumber(bill.tax) ?? 0;
  const discount = toNumber(bill.discount) ?? 0;

  const expectedTotal = roundMoney(
    calculatedSubtotal +
      tax -
      discount
  );

  if (
    Math.abs(
      declaredTotal - expectedTotal
    ) > 0.01
  ) {
    discrepancies.push({
      type: "TOTAL_MISMATCH",
      severity: "high",

      description:
        "The final bill total does not match the calculated subtotal, tax, and discount.",

      item: {
        calculatedSubtotal,
        tax,
        discount,
        expectedTotal,
        declaredTotal
      }
    });
  }

  return discrepancies;
}

function validateMissingItemization(bill) {
  const discrepancies = [];

  const items = Array.isArray(bill.items)
    ? bill.items
    : [];

  const total = toNumber(bill.total);

  if (
    total !== null &&
    total > 0 &&
    items.length === 0
  ) {
    discrepancies.push({
      type: "MISSING_ITEMIZATION",
      severity: "medium",

      description:
        "A bill total was detected, but no itemized charges were extracted."
    });
  }

  return discrepancies;
}

export function validateBill(bill) {
  if (!bill || typeof bill !== "object") {
    throw new Error(
      "A valid bill object is required for validation."
    );
  }

  const arithmeticResult =
    validateArithmetic(bill);

  const duplicateDiscrepancies =
    validateDuplicateCharges(bill);

  const subtotalDiscrepancies =
    validateSubtotal(
      bill,
      arithmeticResult.calculatedSubtotal
    );

  const totalDiscrepancies =
    validateTotal(
      bill,
      arithmeticResult.calculatedSubtotal
    );

  const itemizationDiscrepancies =
    validateMissingItemization(bill);

  const discrepancies = [
    ...arithmeticResult.discrepancies,
    ...duplicateDiscrepancies,
    ...subtotalDiscrepancies,
    ...totalDiscrepancies,
    ...itemizationDiscrepancies
  ];

  const highCount = discrepancies.filter(
    (item) => item.severity === "high"
  ).length;

  const mediumCount = discrepancies.filter(
    (item) => item.severity === "medium"
  ).length;

  return {
    status:
      discrepancies.length === 0
        ? "PASS"
        : "REVIEW_REQUIRED",

    discrepancyCount:
      discrepancies.length,

    summary: {
      high: highCount,
      medium: mediumCount,
      total: discrepancies.length
    },

    calculatedSubtotal:
      arithmeticResult.calculatedSubtotal,

    discrepancies
  };
}

