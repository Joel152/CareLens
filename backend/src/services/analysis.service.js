import OpenAI from "openai";

import { env } from "../config/env.js";

import {
  analyzeDocument,
  normalizeBillResult
} from "./document.service.js";

import { validateBill } from "./validation.service.js";

import {
  searchKnowledgeBase
} from "./rag.service.js";


// ========================================
// NVIDIA CLIENT
// ========================================

const nvidia = new OpenAI({
  apiKey: env.nvidiaApiKey,
  baseURL: "https://integrate.api.nvidia.com/v1"
});


// ========================================
// NVIDIA LLM MODEL
// ========================================

const NVIDIA_LLM_MODEL =
  process.env.NVIDIA_LLM_MODEL;


// ========================================
// BUILD RAG EVIDENCE CONTEXT
// ========================================

function buildEvidenceContext(
  ragResults
) {
  if (
    !ragResults ||
    !Array.isArray(
      ragResults.results
    ) ||
    ragResults.results.length === 0
  ) {
    return (
      "No relevant policy or " +
      "regulation evidence was found."
    );
  }


  return ragResults.results
    .map(
      (result, index) => `
SOURCE ${index + 1}

Document:
${result.file_name || "Unknown"}

Document Type:
${result.document_type || "Unknown"}

Page:
${result.page_number || "Unknown"}

Similarity:
${result.similarity ?? "N/A"}

Content:
${result.content || ""}
`
    )
    .join(
      "\n-----------------------------\n"
    );
}


// ========================================
// BUILD ANALYSIS PROMPT
// ========================================

function buildAnalysisPrompt({
  bill,
  validation,
  ragResults
}) {
  const evidence =
    buildEvidenceContext(
      ragResults
    );


  return `
You are the explanation engine for CareLens.

CareLens helps patients understand medical bills and identify
charges or information that may require clarification.

Your job is to explain the extracted bill information using:
1. Deterministic validation results.
2. The available hospital policies, tariffs, rules, and regulations.
3. The evidence retrieved from the CareLens knowledge base.

IMPORTANT RULES:

1. Never state or imply that a patient was definitely overcharged.

2. Never state that money is definitely owed, refunded, illegally
   charged, or wrongly billed.

3. Never make a definitive legal conclusion.

4. Never make a medical diagnosis or medical judgment.

5. Use cautious and evidence-based language such as:
   - "potential discrepancy"
   - "may require clarification"
   - "the bill appears to..."
   - "the available policy states..."
   - "the available evidence indicates..."
   - "there is a difference of ₹X that may require clarification"
   - "this does not by itself establish an incorrect charge"

6. When a monetary difference is detected, describe it as a
   DIFFERENCE or POTENTIAL DISCREPANCY.

   For example:
   "The billed amount is ₹12,000, while the expected amount based
   on the quantity and unit price is ₹10,000, resulting in a
   difference of ₹2,000."

   Do NOT say:
   "The patient was overcharged by ₹2,000."

7. Deterministic validation results are more reliable than your
   own arithmetic.

8. If the deterministic validator reports a discrepancy, explain
   that discrepancy accurately. Do not override, remove, or invent
   a different result.

9. A deterministic arithmetic mismatch means that the billed line
   amount does not match quantity × unit price. It does NOT by
   itself prove overcharging, fraud, wrongdoing, or an amount that
   must be refunded.

10. Do not invent hospital policies.

11. Do not invent prices or rates.

12. Do not invent tariff codes.

13. Do not invent document names.

14. Do not invent page numbers.

15. Do not invent quotations or evidence.

16. Every policy, tariff, regulation, price, document name, page
   number, or quotation mentioned in the response must come from
   the evidence provided to you.

17. If the available evidence does not support a conclusion,
   clearly state that there is insufficient evidence to determine
   the reason for the charge.

18. If multiple possible explanations exist, present them as
   possibilities rather than facts.

19. Do not assume that the hospital's master tariff is necessarily
   the exact rate applicable to every patient. Other documented
   factors may exist, such as an approved upgrade, contracted
   rate, applicable tariff version, discount, package, or other
   documented billing rule.

20. When a bill rate differs from an available reference rate,
   explain the difference and suggest that the patient ask the
   hospital for the documented basis of the charge.

21. Recommendations must be framed as clarification steps or
   questions the patient can ask the hospital.

22. Do not instruct the patient to demand a refund or accuse the
   hospital of wrongdoing based only on the available evidence.

23. Keep explanations understandable for a normal patient.
   Avoid unnecessary technical, legal, or medical terminology.

24. Clearly distinguish between:
   - What is present on the bill.
   - What the deterministic validator detected.
   - What the available policy/evidence states.
   - What remains uncertain.

25. Never turn an uncertainty into a fact.

26. Never turn a potential discrepancy into a confirmed violation.

----------------------------------------
MEDICAL BILL
----------------------------------------

${JSON.stringify(
  bill,
  null,
  2
)}

----------------------------------------
DETERMINISTIC VALIDATION
----------------------------------------

${JSON.stringify(
  validation,
  null,
  2
)}

----------------------------------------
POLICY / REGULATION EVIDENCE
----------------------------------------

${evidence}

----------------------------------------
OUTPUT
----------------------------------------

Return ONLY valid JSON.

Use exactly this structure:

{
  "overallStatus": "CLEAR | REVIEW_REQUIRED | INSUFFICIENT_EVIDENCE",

  "summary": "Short plain-language summary",

  "explanation": "Detailed explanation of the bill and any potential discrepancies",

  "discrepancies": [
    {
      "title": "Short title",

      "type": "Type of issue",

      "severity": "low | medium | high",

      "description": "What was detected",

      "whyItMatters": "Why the patient may want clarification",

      "evidence": [
        {
          "document": "Document name",

          "page": 1,

          "quote": "Short relevant quote"
        }
      ],

      "suggestedAction": "What the patient can ask or verify"
    }
  ],

  "questionsToAskHospital": [
    "Question 1"
  ]
}

If there are no discrepancies, return:

"discrepancies": []

If there is insufficient policy evidence,
do not invent evidence.
`;
}


// ========================================
// CLEAN NVIDIA JSON RESPONSE
// ========================================

function cleanJsonResponse(
  content
) {
  if (!content) {
    throw new Error(
      "NVIDIA returned an empty response."
    );
  }


  let cleaned =
    content.trim();


  // --------------------------------------
  // Remove Markdown code fences
  // --------------------------------------

  if (
    cleaned.startsWith("```")
  ) {
    cleaned =
      cleaned
        .replace(
          /^```json\s*/i,
          ""
        )
        .replace(
          /^```\s*/i,
          ""
        )
        .replace(
          /\s*```$/i,
          ""
        )
        .trim();
  }


  // --------------------------------------
  // Extract JSON object
  // --------------------------------------

  const firstBrace =
    cleaned.indexOf("{");

  const lastBrace =
    cleaned.lastIndexOf("}");


  if (
    firstBrace !== -1 &&
    lastBrace !== -1
  ) {
    cleaned =
      cleaned.slice(
        firstBrace,
        lastBrace + 1
      );
  }


  return cleaned;
}


// ========================================
// GENERATE NVIDIA EXPLANATION
// ========================================

async function generateExplanation({
  bill,
  validation,
  ragResults
}) {
  if (!NVIDIA_LLM_MODEL) {
    throw new Error(
      "NVIDIA_LLM_MODEL is not configured."
    );
  }


  const prompt =
    buildAnalysisPrompt({
      bill,
      validation,
      ragResults
    });


  const response =
    await nvidia.chat.completions.create({
      model:
        NVIDIA_LLM_MODEL,

      messages: [
        {
          role: "system",

          content:
            "You are a careful healthcare bill explanation assistant. Follow the provided evidence and never invent facts."
        },

        {
          role: "user",

          content:
            prompt
        }
      ],

      temperature: 0.1,

      max_tokens: 2500
    });


  const content =
    response
      .choices?.[0]
      ?.message?.content;


  const cleaned =
    cleanJsonResponse(
      content
    );


  try {
    return JSON.parse(
      cleaned
    );
  } catch (error) {
    console.error(
      "Failed to parse NVIDIA JSON response:"
    );

    console.error(
      content
    );

    throw new Error(
      "NVIDIA returned an invalid analysis response."
    );
  }
}


// ========================================
// BUILD RAG QUERIES FROM BILL
// ========================================

function buildRagQueries(
  bill
) {
  const queries = [];


  // --------------------------------------
  // Search using bill items
  // --------------------------------------

  if (
    Array.isArray(
      bill.items
    )
  ) {
    for (
      const item of bill.items.slice(
        0,
        5
      )
    ) {

      if (
        item.description
      ) {
        queries.push(
          `hospital tariff policy ${item.description}`
        );
      }


      if (
        item.tariffCode
      ) {
        queries.push(
          `tariff code ${item.tariffCode}`
        );
      }
    }
  }


  // --------------------------------------
  // General billing query
  // --------------------------------------

  queries.push(
    "hospital billing policy medical bill charges"
  );


  // --------------------------------------
  // Remove duplicates
  // --------------------------------------

  return [
    ...new Set(
      queries
    )
  ].slice(
    0,
    5
  );
}


// ========================================
// SEARCH KNOWLEDGE BASE
// ========================================

async function searchBillKnowledgeBase(
  bill
) {
  const queries =
    buildRagQueries(
      bill
    );


  const ragSearches = [];


  for (
    const query of queries
  ) {
    try {

      console.log(
        "RAG analysis query:",
        query
      );


      const result =
        await searchKnowledgeBase(
          query,
          5
        );


      ragSearches.push(
        result
      );

    } catch (error) {

      console.error(
        `RAG search failed for "${query}":`,
        error.message
      );

    }
  }


  // --------------------------------------
  // Merge results
  // --------------------------------------

  const mergedResults =
    [];


  for (
    const search of ragSearches
  ) {

    for (
      const result of
        search.results || []
    ) {

      const exists =
        mergedResults.some(
          (existing) =>
            existing.id ===
            result.id
        );


      if (!exists) {
        mergedResults.push(
          result
        );
      }
    }
  }


  // --------------------------------------
  // Rank merged results
  // --------------------------------------

  mergedResults.sort(
    (a, b) =>
      (
        b.finalScore || 0
      ) -
      (
        a.finalScore || 0
      )
  );


  return {
    results:
      mergedResults.slice(
        0,
        10
      )
  };
}


// ========================================
// MAIN BILL ANALYSIS
// ========================================

export async function analyzeBill({
  fileBuffer,
  mimeType,
  originalFileName
}) {

  // ======================================
  // VALIDATE INPUT
  // ======================================

  if (!fileBuffer) {
    throw new Error(
      "Bill file is required."
    );
  }


  if (
    !Buffer.isBuffer(
      fileBuffer
    )
  ) {
    throw new Error(
      "Bill must be provided as a Buffer."
    );
  }


  // ======================================
  // STEP 1
  // AZURE DOCUMENT INTELLIGENCE
  // ======================================

  console.log(
    "========================================"
  );

  console.log(
    "STEP 1: Azure Document Intelligence"
  );

  console.log(
    "Analyzing:",
    originalFileName || "uploaded bill"
  );


  const azureResult =
    await analyzeDocument(
      fileBuffer,
      mimeType
    );


  console.log(
    "Azure document analysis completed."
  );


  // ======================================
  // STEP 2
  // NORMALIZE AZURE RESULT
  // ======================================

  console.log(
    "STEP 2: Normalizing bill data"
  );


  const bill =
    normalizeBillResult(
      azureResult
    );


  console.log(
    "Bill normalization completed."
  );


  // ======================================
  // STEP 3
  // DETERMINISTIC VALIDATION
  // ======================================

  console.log(
    "STEP 3: Validating bill"
  );


  const validation =
    validateBill(
      bill
    );


  console.log(
    "Validation result:",
    validation.status
  );


  console.log(
    "Discrepancies:",
    validation.discrepancyCount
  );


  // ======================================
  // STEP 4
  // RAG KNOWLEDGE SEARCH
  // ======================================

  console.log(
    "STEP 4: Searching knowledge base"
  );


  const ragResults =
    await searchBillKnowledgeBase(
      bill
    );


  console.log(
    "Knowledge base search completed."
  );


  console.log(
    "Evidence chunks:",
    ragResults.results.length
  );


  // ======================================
  // STEP 5
  // NVIDIA AI EXPLANATION
  // ======================================

  console.log(
    "STEP 5: Generating AI explanation"
  );


  const aiAnalysis =
    await generateExplanation({
      bill,
      validation,
      ragResults
    });


  console.log(
    "AI explanation generated."
  );


  // ======================================
  // FINAL RESPONSE
  // ======================================

  console.log(
    "========================================"
  );

  console.log(
    "CareLens analysis completed."
  );

  console.log(
    "========================================"
  );


  return {
    success: true,

    file: {
      name:
        originalFileName ||
        null,

      mimeType:
        mimeType ||
        null
    },

    bill,

    validation,

    evidence:
      ragResults.results.map(
        (result) => ({
          id:
            result.id,

          document:
            result.file_name ||
            null,

          documentType:
            result.document_type ||
            null,

          page:
            result.page_number ||
            null,

          content:
            result.content ||
            null,

          similarity:
            result.similarity ??
            null,

          score:
            result.finalScore ??
            null
        })
      ),

    analysis:
      aiAnalysis
  };
}

