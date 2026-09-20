import express from "express";
import cors from "cors";

import { env } from "./config/env.js";
import { supabase } from "./services/supabase.js";
import { searchKnowledgeBase } from "./services/rag.service.js";

import chatRoutes from "./routes/chat.routes.js";
import analysisRoutes from "./routes/analysis.routes.js";

import {
  chatRateLimiter,
  analysisRateLimiter,
  ragRateLimiter,
} from "./middleware/rateLimit.js";

const app = express();

app.set("trust proxy", 1);

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

/*
|--------------------------------------------------------------------------
| Body parsing
|--------------------------------------------------------------------------
*/

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

/*
|--------------------------------------------------------------------------
| Root
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "CareLens backend is running.",
    runtime: "vercel",
  });
});

/*
|--------------------------------------------------------------------------
| Health
|--------------------------------------------------------------------------
*/

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    service: "carelens-backend",
    status: "healthy",
    runtime: "vercel",
  });
});

/*
|--------------------------------------------------------------------------
| Supabase Health
|--------------------------------------------------------------------------
*/

app.get("/api/health/supabase", async (req, res) => {
  try {
    const { error } = await supabase
      .from("documents")
      .select("id")
      .limit(1);

    if (error) {
      throw error;
    }

    return res.json({
      success: true,
      supabase: "connected",
    });
  } catch (error) {
    console.error("Supabase health check failed:", error);

    return res.status(500).json({
      success: false,
      supabase: "connection_failed",
      error: error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| RAG Search - GET
|--------------------------------------------------------------------------
*/

app.get(
  "/api/rag/search",
  ragRateLimiter,
  async (req, res) => {
    try {
      const question = req.query.question;

      if (
        typeof question !== "string" ||
        !question.trim()
      ) {
        return res.status(400).json({
          success: false,
          error: "Question is required.",
          code: "MISSING_QUESTION",
        });
      }

      const results = await searchKnowledgeBase(
        question.trim(),
        8
      );

      return res.json({
        success: true,
        question: question.trim(),
        ...results,
      });
    } catch (error) {
      console.error("RAG search failed:", error);

      return res.status(500).json({
        success: false,
        error:
          error.message ||
          "Knowledge base search failed.",
        code: "RAG_SEARCH_FAILED",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| RAG Search - POST
|--------------------------------------------------------------------------
*/

app.post(
  "/api/rag/search",
  ragRateLimiter,
  async (req, res) => {
    try {
      const { question } = req.body;

      if (
        typeof question !== "string" ||
        !question.trim()
      ) {
        return res.status(400).json({
          success: false,
          error: "Question is required.",
          code: "MISSING_QUESTION",
        });
      }

      const results = await searchKnowledgeBase(
        question.trim(),
        8
      );

      return res.json({
        success: true,
        question: question.trim(),
        ...results,
      });
    } catch (error) {
      console.error("RAG search failed:", error);

      return res.status(500).json({
        success: false,
        error:
          error.message ||
          "Knowledge base search failed.",
        code: "RAG_SEARCH_FAILED",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Chat
|--------------------------------------------------------------------------
*/

app.use(
  "/api/chat",
  chatRateLimiter,
  chatRoutes
);

/*
|--------------------------------------------------------------------------
| Bill Analysis
|--------------------------------------------------------------------------
*/

app.use(
  "/api/analysis",
  analysisRateLimiter,
  analysisRoutes
);

/*
|--------------------------------------------------------------------------
| 404
|--------------------------------------------------------------------------
*/

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    error: "Route not found.",
    code: "ROUTE_NOT_FOUND",
  });
});

/*
|--------------------------------------------------------------------------
| Global Error Handler
|--------------------------------------------------------------------------
*/

app.use((err, req, res, next) => {
  console.error("Unhandled server error:", err);

  return res.status(err.status || 500).json({
    success: false,
    error:
      err.message ||
      "Internal server error.",
    code: "INTERNAL_SERVER_ERROR",
  });
});

/*
|--------------------------------------------------------------------------
| Vercel export
|--------------------------------------------------------------------------
*/

export default app;