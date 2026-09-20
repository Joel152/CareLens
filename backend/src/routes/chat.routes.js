import express from "express";
import OpenAI from "openai";

import { env } from "../config/env.js";
import { searchKnowledgeBase } from "../services/rag.service.js";

const router = express.Router();

const nvidia = new OpenAI({
  apiKey: env.nvidiaApiKey,
  baseURL: "https://integrate.api.nvidia.com/v1"
});

const NVIDIA_LLM_MODEL =
  process.env.NVIDIA_LLM_MODEL;

function buildContext(results) {
  if (
    !results ||
    !Array.isArray(results.results) ||
    results.results.length === 0
  ) {
    return "No relevant policy or regulation evidence was found.";
  }

  return results.results
    .map(
      (result, index) => `
SOURCE ${index + 1}
Document: ${result.file_name || "Unknown"}
Type: ${result.document_type || "Unknown"}
Page: ${result.page_number || "Unknown"}

Content:
${result.content}
`
    )
    .join(
      "\n-----------------------------\n"
    );
}

router.post(
  "/",
  async (req, res) => {
    try {
      const {
        question,
        bill
      } = req.body;

      if (
        !question ||
        !question.trim()
      ) {
        return res.status(400).json({
          success: false,
          error:
            "Question is required."
        });
      }

      if (!NVIDIA_LLM_MODEL) {
        return res.status(500).json({
          success: false,
          error:
            "NVIDIA_LLM_MODEL is not configured."
        });
      }

      /*
       * Search the knowledge base.
       */
      const ragResults =
        await searchKnowledgeBase(
          question.trim(),
          8
        );

      const context =
        buildContext(ragResults);

      /*
       * Optional bill context.
       *
       * This allows the frontend to send the
       * extracted bill alongside a question.
       */
      const billContext =
        bill
          ? `
CURRENT BILL CONTEXT:
${JSON.stringify(
  bill,
  null,
  2
)}
`
          : "";

      const systemPrompt = `
You are the CareLens healthcare bill
explanation assistant.

Your job is to help users understand
medical billing information and the
hospital policies available in the
CareLens knowledge base.

Rules:

1. Be factual and concise.
2. Never say a hospital definitely overcharged
   the patient.
3. Never make definitive legal conclusions.
4. Never provide a medical diagnosis.
5. If evidence is insufficient, say so.
6. Do not invent policies, rates, or rules.
7. Cite the document and page when evidence
   is available.
8. Use cautious wording such as:
   "potential discrepancy",
   "may require clarification",
   "the available document states..."
`;

      const userPrompt = `
USER QUESTION:

${question.trim()}

${billContext}

KNOWLEDGE BASE EVIDENCE:

${context}

Answer the user's question using the
available evidence.

If a source contains a relevant rate,
policy, rule, or definition, mention the
document and page.

If the evidence does not answer the
question, clearly say that additional
information may be required.
`;

      const response =
        await nvidia.chat.completions.create({
          model: NVIDIA_LLM_MODEL,

          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: userPrompt
            }
          ],

          temperature: 0.2,

          max_tokens: 1200
        });

      const answer =
        response.choices?.[0]?.message?.content;

      if (!answer) {
        throw new Error(
          "NVIDIA returned an empty response."
        );
      }

      return res.status(200).json({
        success: true,

        question:
          question.trim(),

        answer,

        classification:
          ragResults.classification,

        sources:
          (ragResults.results || []).map(
            (result) => ({
              id: result.id,

              document:
                result.file_name || null,

              documentType:
                result.document_type || null,

              page:
                result.page_number || null,

              content:
                result.content || null,

              similarity:
                result.similarity ?? null,

              score:
                result.finalScore ?? null
            })
          )
      });
    } catch (error) {
      console.error(
        "Chat error:",
        error
      );

      return res.status(500).json({
        success: false,
        error:
          error.message ||
          "Failed to process chat request."
      });
    }
  }
);

export default router;

