import createDocumentIntelligenceClient, {
  getLongRunningPoller,
  isUnexpected
} from "@azure-rest/ai-document-intelligence";

import { env } from "../config/env.js";

const client =
  createDocumentIntelligenceClient(
    env.azureDocumentIntelligenceEndpoint,
    {
      key: env.azureDocumentIntelligenceKey
    }
  );


// ========================================
// ANALYZE RAW DOCUMENT
// ========================================

export async function analyzeDocument(
  documentBuffer,
  contentType = "application/pdf"
) {
  if (!documentBuffer) {
    throw new Error(
      "Document buffer is required."
    );
  }

  if (!Buffer.isBuffer(documentBuffer)) {
    throw new Error(
      "Document must be provided as a Buffer."
    );
  }

  // --------------------------------------
  // Start Azure analysis
  // --------------------------------------

  const initialResponse =
    await client
      .path(
        "/documentModels/{modelId}:analyze",
        "prebuilt-layout"
      )
      .post({
        contentType:
          "application/octet-stream",

        body: documentBuffer,

        queryParameters: {
          "api-version": "2024-11-30"
        },

        headers: {
          "Content-Type": contentType
        }
      });

  // --------------------------------------
  // Check Azure response
  // --------------------------------------

  if (isUnexpected(initialResponse)) {
    const message =
      initialResponse.body?.error?.message ||
      "Azure Document Intelligence analysis failed.";

    throw new Error(message);
  }

  // --------------------------------------
  // Create long-running poller
  // --------------------------------------

  const poller =
    getLongRunningPoller(
      client,
      initialResponse
    );

  // --------------------------------------
  // Wait for analysis to finish
  // --------------------------------------

  const result =
    await poller.pollUntilDone();

  // --------------------------------------
  // Return Azure result
  // --------------------------------------

  return result.body.analyzeResult;
}


// ========================================
// NORMALIZE AZURE RESULT
// ========================================

export function normalizeBillResult(
  analyzeResult
) {
  if (!analyzeResult) {
    throw new Error(
      "Azure returned an empty analysis result."
    );
  }

  const pages =
    analyzeResult.pages || [];

  const tables =
    analyzeResult.tables || [];


  // ======================================
  // EXTRACT ALL TEXT
  // ======================================

  const fullText =
    pages
      .flatMap(
        (page) =>
          (page.lines || []).map(
            (line) =>
              line.content || ""
          )
      )
      .join("\n");


  // ======================================
  // EXTRACT TABLES
  // ======================================

  const extractedTables =
    tables.map(
      (table) => {
        const rows = [];

        for (
          let rowIndex = 0;
          rowIndex < table.rowCount;
          rowIndex++
        ) {
          const row = [];

          for (
            let columnIndex = 0;
            columnIndex < table.columnCount;
            columnIndex++
          ) {
            const cell =
              table.cells?.find(
                (item) =>
                  item.rowIndex ===
                    rowIndex &&
                  item.columnIndex ===
                    columnIndex
              );

            row.push(
              cell?.content || ""
            );
          }

          rows.push(row);
        }

        return {
          rowCount:
            table.rowCount,

          columnCount:
            table.columnCount,

          rows
        };
      }
    );


  // ======================================
  // EXTRACT BILL ITEMS
  // ======================================

  const items =
    extractBillItems(
      extractedTables,
      fullText
    );


  // ======================================
  // EXTRACT TOTALS
  // ======================================

  const subtotal =
    extractAmount(
      fullText,
      [
        "subtotal",
        "sub total"
      ]
    );

  const tax =
    extractAmount(
      fullText,
      [
        "tax",
        "gst",
        "cgst",
        "sgst",
        "igst"
      ]
    );

  const discount =
    extractAmount(
      fullText,
      [
        "discount",
        "concession",
        "deduction"
      ]
    );

  const total =
    extractAmount(
      fullText,
      [
        "grand total",
        "total amount",
        "net amount",
        "amount payable",
        "total"
      ]
    );


  // ======================================
  // RETURN NORMALIZED BILL
  // ======================================

  return {
    vendor:
      extractField(
        fullText,
        [
          "vendor",
          "hospital",
          "hospital name"
        ]
      ),

    patient:
      extractField(
        fullText,
        [
          "patient",
          "patient name"
        ]
      ),

    billNumber:
      extractField(
        fullText,
        [
          "bill no",
          "bill number",
          "invoice no",
          "invoice number"
        ]
      ),

    billDate:
      extractField(
        fullText,
        [
          "bill date",
          "invoice date",
          "date"
        ]
      ),

    items,

    subtotal,

    tax,

    discount,

    total,

    currency:
      detectCurrency(fullText),

    rawText:
      fullText,

    tables:
      extractedTables,

    pages:
      pages.map(
        (page) => ({
          pageNumber:
            page.pageNumber,

          width:
            page.width,

          height:
            page.height,

          unit:
            page.unit
        })
      ),

    metadata: {
      modelId:
        analyzeResult.modelId,

      apiVersion:
        analyzeResult.apiVersion,

      pageCount:
        pages.length,

      tableCount:
        tables.length
    }
  };
}


// ========================================
// EXTRACT BILL ITEMS
// ========================================

function extractBillItems(
  tables,
  fullText
) {
  const items = [];


  // --------------------------------------
  // TABLE-BASED EXTRACTION
  // --------------------------------------

  for (const table of tables) {
    if (!table.rows?.length) {
      continue;
    }

    const headers =
      table.rows[0].map(
        (value) =>
          String(value)
            .trim()
            .toLowerCase()
      );


    const descriptionIndex =
      findColumn(
        headers,
        [
          "description",
          "particular",
          "particulars",
          "service",
          "item",
          "charge"
        ]
      );


    const quantityIndex =
      findColumn(
        headers,
        [
          "qty",
          "quantity"
        ]
      );


    const rateIndex =
      findColumn(
        headers,
        [
          "rate",
          "unit price",
          "price",
          "unit cost"
        ]
      );


    const amountIndex =
      findColumn(
        headers,
        [
          "amount",
          "total",
          "value"
        ]
      );


    const tariffCodeIndex =
      findColumn(
        headers,
        [
          "tariff code",
          "code",
          "tariff"
        ]
      );


    if (
      descriptionIndex === -1 &&
      amountIndex === -1
    ) {
      continue;
    }


    for (
      let index = 1;
      index < table.rows.length;
      index++
    ) {
      const row =
        table.rows[index];


      const description =
        descriptionIndex !== -1
          ? row[descriptionIndex]
          : null;


      const quantity =
        quantityIndex !== -1
          ? parseAmount(
              row[quantityIndex]
            )
          : 1;


      const unitPrice =
        rateIndex !== -1
          ? parseAmount(
              row[rateIndex]
            )
          : null;


      const amount =
        amountIndex !== -1
          ? parseAmount(
              row[amountIndex]
            )
          : null;


      const tariffCode =
        tariffCodeIndex !== -1
          ? String(
              row[tariffCodeIndex] || ""
            ).trim() || null
          : null;


      if (
        !description &&
        amount === null
      ) {
        continue;
      }


      items.push({
        description:
          description ||
          "Unknown charge",

        quantity:
          quantity || 1,

        unitPrice,

        amount,

        tariffCode:
          tariffCode ||
          extractTariffCode(
            description
          )
      });
    }
  }


  // --------------------------------------
  // TEXT FALLBACK
  // --------------------------------------

  if (
    items.length === 0
  ) {
    return extractItemsFromText(
      fullText
    );
  }


  return items;
}


// ========================================
// TEXT FALLBACK ITEM EXTRACTION
// ========================================

function extractItemsFromText(
  text
) {
  const items = [];

  const lines =
    text
      .split("\n")
      .map(
        (line) =>
          line.trim()
      )
      .filter(Boolean);


  for (const line of lines) {
    const match =
      line.match(
        /^(.+?)\s+(\d+(?:\.\d+)?)\s+(?:₹|Rs\.?|INR)?\s*([\d,]+(?:\.\d+)?)$/i
      );


    if (!match) {
      continue;
    }


    const description =
      match[1].trim();

    const quantity =
      Number(match[2]);

    const amount =
      parseAmount(
        match[3]
      );


    if (
      !description ||
      amount === null
    ) {
      continue;
    }


    items.push({
      description,

      quantity:
        quantity || 1,

      unitPrice:
        quantity
          ? amount / quantity
          : amount,

      amount,

      tariffCode:
        extractTariffCode(
          description
        )
    });
  }


  return items;
}


// ========================================
// FIND COLUMN
// ========================================

function findColumn(
  headers,
  possibleNames
) {
  for (
    let index = 0;
    index < headers.length;
    index++
  ) {
    const header =
      headers[index];

    if (
      possibleNames.some(
        (name) =>
          header.includes(name)
      )
    ) {
      return index;
    }
  }

  return -1;
}


// ========================================
// EXTRACT AMOUNT
// ========================================

function extractAmount(
  text,
  labels
) {
  for (const label of labels) {
    const regex =
      new RegExp(
        `${label.replace(
          / /g,
          "\\s+"
        )}\\s*[:\\-]?\\s*(?:₹|Rs\\.?|INR)?\\s*([\\d,]+(?:\\.\\d+)?)`,
        "i"
      );

    const match =
      text.match(regex);

    if (match) {
      return parseAmount(
        match[1]
      );
    }
  }

  return null;
}


// ========================================
// EXTRACT FIELD
// ========================================

function extractField(
  text,
  labels
) {
  const lines =
    text
      .split("\n")
      .map(
        (line) =>
          line.trim()
      )
      .filter(Boolean);


  for (
    let index = 0;
    index < lines.length;
    index++
  ) {
    const currentLine =
      lines[index];


    for (const label of labels) {
      const normalizedLabel =
        label
          .replace(
            /\s+/g,
            " "
          )
          .trim();


      // ----------------------------------
      // CASE 1
      // "Vendor: Demo Hospital"
      // ----------------------------------

      const sameLineRegex =
        new RegExp(
          `^${normalizedLabel}\\s*[:\\-]\\s*(.+)$`,
          "i"
        );

      const sameLineMatch =
        currentLine.match(
          sameLineRegex
        );


      if (sameLineMatch) {
        return sameLineMatch[1]
          .trim();
      }


      // ----------------------------------
      // CASE 2
      // "Vendor:"
      // "Demo Hospital"
      // ----------------------------------

      const labelOnlyRegex =
        new RegExp(
          `^${normalizedLabel}\\s*[:\\-]?\\s*$`,
          "i"
        );


      if (
        labelOnlyRegex.test(
          currentLine
        )
      ) {
        const nextLine =
          lines[index + 1];

        if (nextLine) {
          return nextLine.trim();
        }
      }
    }
  }


  return null;
}


// ========================================
// PARSE NUMBER
// ========================================

function parseAmount(
  value
) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const cleaned =
    String(value)
      .replace(
        /[₹$€£,\s]/g,
        ""
      )
      .replace(
        /[^\d.-]/g,
        ""
      );

  if (!cleaned) {
    return null;
  }

  const number =
    Number(cleaned);

  return Number.isFinite(number)
    ? number
    : null;
}


// ========================================
// DETECT CURRENCY
// ========================================

function detectCurrency(
  text
) {
  if (
    text.includes("₹") ||
    /(?:rs\.?|inr)/i.test(text)
  ) {
    return "INR";
  }

  if (text.includes("$")) {
    return "USD";
  }

  if (text.includes("€")) {
    return "EUR";
  }

  if (text.includes("£")) {
    return "GBP";
  }

  return null;
}


// ========================================
// EXTRACT TARIFF CODE
// ========================================

function extractTariffCode(
  value
) {
  if (!value) {
    return null;
  }

  const match =
    String(value).match(
      /\b[A-Z]{2,5}-[A-Z0-9]{2,10}\b/i
    );

  return match
    ? match[0]
    : null;
}