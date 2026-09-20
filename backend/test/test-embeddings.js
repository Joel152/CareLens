import { generateEmbedding } from "../src/services/embeddings.js";

const text = "Private room rate is ₹5,000 per day.";

try {
  console.log("Generating embedding...");

  const embedding = await generateEmbedding(text);

  console.log("Embedding generated successfully!");
  console.log("Dimensions:", embedding.length);
  console.log("First 10 values:", embedding.slice(0, 10));

} catch (error) {
  console.error("Embedding test failed:");
  console.error(error);
}