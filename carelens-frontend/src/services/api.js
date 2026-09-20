export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "/api";

/* =========================================================
   API ERROR
   ========================================================= */

export class ApiError extends Error {
  constructor(
    message,
    code = "unknown",
    status = 0
  ) {
    super(message);

    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

/* =========================================================
   GENERIC REQUEST
   ========================================================= */

async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(
      `${API_BASE_URL}${path}`,
      {
        ...options,
      }
    );
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new ApiError(
        "The request was cancelled.",
        "aborted"
      );
    }

    throw new ApiError(
      "Could not reach the CareLens server. Please check your connection and try again.",
      "network_error"
    );
  }

  const body = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    const message =
      body?.error ??
      getHttpErrorMessage(response.status);

    throw new ApiError(
      message,
      body?.code ?? getHttpErrorCode(response.status),
      response.status
    );
  }

  return body;
}

/* =========================================================
   HTTP ERROR HELPERS
   ========================================================= */

function getHttpErrorMessage(status) {
  switch (status) {
    case 400:
      return "The request could not be processed. Please check the information and try again.";

    case 413:
      return "The uploaded file is too large. Please choose a file smaller than 10 MB.";

    case 429:
      return "Too many requests. Please wait a few minutes before trying again.";

    case 500:
      return "CareLens could not complete the analysis. Please try again.";

    case 502:
    case 503:
    case 504:
      return "The CareLens service is temporarily unavailable. Please try again shortly.";

    default:
      return "Something went wrong. Please try again.";
  }
}

function getHttpErrorCode(status) {
  switch (status) {
    case 400:
      return "bad_request";

    case 413:
      return "FILE_TOO_LARGE";

    case 429:
      return "RATE_LIMITED";

    case 500:
      return "ANALYSIS_FAILED";

    case 502:
    case 503:
    case 504:
      return "SERVICE_UNAVAILABLE";

    default:
      return "request_failed";
  }
}

/* =========================================================
   BILL ANALYSIS
   ========================================================= */

export async function analyzeBill(
  file,
  { signal } = {}
) {
  if (!file) {
    throw new ApiError(
      "Please select a medical bill first.",
      "MISSING_FILE"
    );
  }

  const body = new FormData();

  body.append("bill", file);

  try {
    const response = await fetch(
      `${API_BASE_URL}/analysis`,
      {
        method: "POST",
        body,
        signal,
      }
    );

    const result = await response
      .json()
      .catch(() => null);

    if (!response.ok) {
      throw new ApiError(
        result?.error ??
          getHttpErrorMessage(response.status),
        result?.code ??
          getHttpErrorCode(response.status),
        response.status
      );
    }

    return result;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error?.name === "AbortError") {
      throw new ApiError(
        "Analysis was cancelled.",
        "aborted"
      );
    }

    throw new ApiError(
      "Could not reach the CareLens server. Please check your connection and try again.",
      "network_error"
    );
  }
}

/* =========================================================
   CARELENS CHAT
   ========================================================= */

export async function askCareLens(
  question,
  bill = null,
  { signal } = {}
) {
  if (!question?.trim()) {
    throw new ApiError(
      "Please enter a question.",
      "missing_question"
    );
  }

  return request("/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      question: question.trim(),
      ...(bill ? { bill } : {}),
    }),
    signal,
  });
}

/* =========================================================
   KNOWLEDGE BASE SEARCH
   ========================================================= */

export async function searchKnowledgeBase(
  question,
  limit = 8
) {
  if (!question?.trim()) {
    throw new ApiError(
      "A search question is required.",
      "missing_question"
    );
  }

  const params = new URLSearchParams({
    question: question.trim(),
    limit: String(limit),
  });

  return request(
    `/rag/search?${params.toString()}`
  );
}

/* =========================================================
   HEALTH CHECK
   ========================================================= */

export async function getHealth() {
  return request("/health");
}

/* =========================================================
   SUPABASE HEALTH CHECK
   ========================================================= */

export async function getSupabaseHealth() {
  return request("/health/supabase");
}