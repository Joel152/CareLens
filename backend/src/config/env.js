import dotenv from "dotenv";

dotenv.config();

const requiredEnv = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NVIDIA_API_KEY",
  "AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT",
  "AZURE_DOCUMENT_INTELLIGENCE_KEY"
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(
      `Missing required environment variable: ${key}`
    );
  }
}

export const env = {
  port: process.env.PORT || 5000,

  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceRoleKey:
    process.env.SUPABASE_SERVICE_ROLE_KEY,

  nvidiaApiKey: process.env.NVIDIA_API_KEY,

  azureDocumentIntelligenceEndpoint:
    process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT,

  azureDocumentIntelligenceKey:
    process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY
};