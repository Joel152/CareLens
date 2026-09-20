import { supabase } from "./supabase.js";
import { generateEmbedding } from "./embeddings.js";
import { classifyQuery } from "../utils/queryClassifier.js";


// ========================================
// KEYWORD EXTRACTION
// ========================================

function extractKeywords(question) {
  return question
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length >= 3);
}


// ========================================
// KEYWORD SCORE
// ========================================

function calculateKeywordScore(question, content) {
  const keywords = extractKeywords(question);
  const normalizedContent = content.toLowerCase();

  if (keywords.length === 0) {
    return 0;
  }

  let matches = 0;

  for (const keyword of keywords) {
    if (normalizedContent.includes(keyword)) {
      matches++;
    }
  }

  return matches / keywords.length;
}


// ========================================
// DOCUMENT TYPE BONUS
// ========================================

function calculateDocumentTypeBonus(result, queryType) {
  if (queryType === "RATE") {
    return result.document_type === "master_tariff"
      ? 0.15
      : 0;
  }

  if (queryType === "POLICY") {
    return result.document_type === "regulation"
      ? 0.15
      : 0;
  }

  return 0;
}


// ========================================
// TABLE BONUS
// ========================================

function calculateTableBonus(result, queryType) {
  const contentType = result.metadata?.content_type;

  if (
    queryType === "RATE" &&
    contentType === "table"
  ) {
    return 0.10;
  }

  return 0;
}


// ========================================
// EXACT TERM BONUS
// ========================================

function calculateExactTermBonus(
  result,
  question,
  queryType
) {
  const content = (result.content || "").toLowerCase();
  const normalizedQuestion = question.toLowerCase();

  let bonus = 0;

  // --------------------------------------
  // Tariff code such as ROOM-PR
  // --------------------------------------

  const tariffCodeMatch = normalizedQuestion.match(
    /\b[a-z]{2,5}-[a-z0-9]{2,10}\b/i
  );

  if (
    tariffCodeMatch &&
    content.includes(
      tariffCodeMatch[0].toLowerCase()
    )
  ) {
    bonus += 0.20;
  }


  // --------------------------------------
  // Private room rate
  // --------------------------------------

  if (
    queryType === "RATE" &&
    normalizedQuestion.includes("private room") &&
    content.includes("private room")
  ) {
    bonus += 0.10;
  }


  // --------------------------------------
  // Tariff table signal
  // --------------------------------------

  if (
    queryType === "RATE" &&
    content.includes("tariff code") &&
    content.includes("rate")
  ) {
    bonus += 0.05;
  }

  return bonus;
}


// ========================================
// FINAL SCORE
// ========================================

function calculateFinalScore(
  result,
  question,
  queryType
) {
  const vectorScore =
    Number(result.similarity) || 0;

  const keywordScore = calculateKeywordScore(
    question,
    result.content || ""
  );

  const documentTypeBonus =
    calculateDocumentTypeBonus(
      result,
      queryType
    );

  const tableBonus =
    calculateTableBonus(
      result,
      queryType
    );

  const exactTermBonus =
    calculateExactTermBonus(
      result,
      question,
      queryType
    );

  return (
    vectorScore +
    keywordScore * 0.10 +
    documentTypeBonus +
    tableBonus +
    exactTermBonus
  );
}


// ========================================
// QUERY EMBEDDING
// ========================================

export async function generateQueryEmbedding(
  question
) {
  if (!question || !question.trim()) {
    throw new Error(
      "Question is required for embedding generation."
    );
  }

  return await generateEmbedding(question);
}


// ========================================
// KNOWLEDGE BASE SEARCH
// ========================================

export async function searchKnowledgeBase(
  question,
  matchCount = 10
) {
  // --------------------------------------
  // Validate question
  // --------------------------------------

  if (!question || !question.trim()) {
    throw new Error("Question is required.");
  }

  const query = question.trim();


  // --------------------------------------
  // 1. Classify query
  // --------------------------------------

  const classification =
    classifyQuery(query);

  console.log(
    "Query classification:",
    classification
  );


  // --------------------------------------
  // 2. Generate query embedding
  // --------------------------------------

  const embedding =
    await generateQueryEmbedding(query);


  // --------------------------------------
  // 3. Retrieve larger candidate pool
  // --------------------------------------

  const { data, error } =
    await supabase.rpc(
      "match_document_chunks",
      {
        query_embedding: embedding,
        match_count: Math.max(
          matchCount * 3,
          30
        )
      }
    );

  if (error) {
    throw new Error(
      `Knowledge base search failed: ${error.message}`
    );
  }

  let results = data || [];


  // --------------------------------------
  // 4. Apply document-type filtering
  // --------------------------------------

  if (classification.documentType) {
    const filteredResults =
      results.filter(
        (result) =>
          result.document_type ===
          classification.documentType
      );

    /*
     * Only apply the filter if it produced
     * results.
     *
     * This prevents an empty result if the
     * knowledge base changes later.
     */

    if (filteredResults.length > 0) {
      results = filteredResults;
    }
  }


  // --------------------------------------
  // 5. Calculate ranking scores
  // --------------------------------------

  const rankedResults = results
    .map((result) => ({
      ...result,

      keywordScore:
        calculateKeywordScore(
          query,
          result.content || ""
        ),

      finalScore:
        calculateFinalScore(
          result,
          query,
          classification.type
        )
    }))
    .sort(
      (a, b) =>
        b.finalScore - a.finalScore
    );


  // --------------------------------------
  // 6. Return requested number of results
  // --------------------------------------

  return {
    question: query,

    classification,

    results:
      rankedResults.slice(
        0,
        matchCount
      )
  };
}

