import OpenAI from "openai";

import { env } from "../config/env.js";

const EMBEDDING_MODEL = "nvidia/nemotron-3-embed-1b";

const nvidia = new OpenAI({
  apiKey: env.nvidiaApiKey,
  baseURL: "https://integrate.api.nvidia.com/v1"
});

export async function generateEmbedding(text) {
  if (!text || !text.trim()) {
    throw new Error("Text is required for embedding generation.");
  }

  const response = await nvidia.embeddings.create({
    input: text.trim(),
    model: EMBEDDING_MODEL
  });

  return response.data[0].embedding;
}

export { EMBEDDING_MODEL };