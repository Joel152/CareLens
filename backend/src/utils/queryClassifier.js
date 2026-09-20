const RATE_KEYWORDS = [
  "rate",
  "rates",
  "price",
  "prices",
  "cost",
  "charge",
  "charges",
  "tariff",
  "fee",
  "fees",
  "how much",
  "per day",
  "per hour",
  "amount"
];

const POLICY_KEYWORDS = [
  "policy",
  "policies",
  "rule",
  "rules",
  "regulation",
  "regulations",
  "dispute",
  "complaint",
  "grievance",
  "refund",
  "rights",
  "responsibilities",
  "allowed",
  "eligible",
  "procedure",
  "process",
  "can a patient",
  "what should"
];

export function classifyQuery(question) {
  const normalized = question.toLowerCase().trim();

  const rateScore = RATE_KEYWORDS.reduce((score, keyword) => {
    return score + (normalized.includes(keyword) ? 1 : 0);
  }, 0);

  const policyScore = POLICY_KEYWORDS.reduce((score, keyword) => {
    return score + (normalized.includes(keyword) ? 1 : 0);
  }, 0);

  if (rateScore > policyScore && rateScore > 0) {
    return {
      type: "RATE",
      documentType: "master_tariff"
    };
  }

  if (policyScore > rateScore && policyScore > 0) {
    return {
      type: "POLICY",
      documentType: "regulation"
    };
  }

  return {
    type: "GENERAL",
    documentType: null
  };
}