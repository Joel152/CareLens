import rateLimit from "express-rate-limit";

const commonOptions = {
  standardHeaders: "draft-8",
  legacyHeaders: false,

  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: "Too many requests. Please wait a moment and try again.",
      code: "RATE_LIMITED",
    });
  },
};

/*
|--------------------------------------------------------------------------
| Chat Rate Limit
|--------------------------------------------------------------------------
| AI chat calls use NVIDIA resources, so keep this stricter.
|
| 20 requests per 10 minutes per IP
|--------------------------------------------------------------------------
*/

export const chatRateLimiter = rateLimit({
  ...commonOptions,
  windowMs: 10 * 60 * 1000,
  limit: 20,
});

/*
|--------------------------------------------------------------------------
| Bill Analysis Rate Limit
|--------------------------------------------------------------------------
| Bill analysis is the most expensive operation because it can call:
| - Azure Document Intelligence
| - Supabase / RAG
| - NVIDIA LLM
|
| 5 requests per 10 minutes per IP
|--------------------------------------------------------------------------
*/

export const analysisRateLimiter = rateLimit({
  ...commonOptions,
  windowMs: 10 * 60 * 1000,
  limit: 5,
});

/*
|--------------------------------------------------------------------------
| RAG Search Rate Limit
|--------------------------------------------------------------------------
| RAG searches use embeddings + Supabase vector search.
|
| 30 requests per 10 minutes per IP
|--------------------------------------------------------------------------
*/

export const ragRateLimiter = rateLimit({
  ...commonOptions,
  windowMs: 10 * 60 * 1000,
  limit: 30,
});