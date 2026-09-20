# 🏥 CareLens

**Making healthcare bills understandable. Making healthcare policies accessible.**

CareLens is an AI-powered Software-as-a-Service platform that acts as a transparency and navigation layer for patients. It turns complex medical bills into clear, plain-language explanations and points users to the policies, sources, and grievance channels relevant to their situation.

> **From a confusing bill to a clear explanation. From uncertainty to informed action.**

---

## Table of Contents

- [Problem Statement](#problem-statement)
- [The Challenge](#the-challenge)
- [Proposed Solution](#proposed-solution)
- [Key Innovation](#key-innovation)
- [Screenshots](#screenshots)
- [Test Bills](#test-bills)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [End-to-End Workflow](#end-to-end-workflow)
- [Chat Workflow](#chat-workflow)
- [Database Design](#database-design)
- [API Reference](#api-reference)
- [Deployment Architecture](#deployment-architecture)
- [Getting Started](#getting-started)
- [Accessibility](#accessibility)
- [Safety and Trust](#safety-and-trust)
- [Expected Impact](#expected-impact)
- [Disclaimer](#disclaimer)

---

## Problem Statement

A medical bill is more than a number. It is a record of treatments, procedures, medicines, services, taxes, insurance deductions, and administrative charges. For many patients and their families, understanding that bill is almost as difficult as understanding the treatment itself.

Complex terminology, unexplained charges, lengthy hospital policies, insurance conditions, and fragmented healthcare regulations create a significant information gap between healthcare providers and patients. This gap is wider for:

- Elderly individuals
- First-time patients
- People with limited digital literacy
- Families managing expenses during stressful situations

Patients often leave hospitals knowing how much they paid, but not what they paid for, why they were charged, or whether the charges align with the policies and information available to them.

## The Challenge

How can we build an accessible technology platform that enables patients to:

1. Understand every component of a medical bill in simple language.
2. Identify and categorize individual charges, procedures, medicines, and services.
3. Calculate and summarize the actual financial breakdown of their treatment.
4. Cross-reference charges with hospital policies, insurance information, and applicable healthcare regulations.
5. Detect potentially unusual, duplicate, unexplained, or inconsistent charges.
6. Flag items that may require clarification from the hospital or insurer.
7. Navigate relevant policies, rules, grievance mechanisms, and official resources without needing to understand complex legal or medical terminology.

The system should inform and empower patients. It must **not** make medical or legal decisions on their behalf.

## Proposed Solution

Users upload a photograph, scan, or digital copy (PDF / JPG / PNG) of their medical bill. Using OCR and document/image recognition, CareLens extracts the following structure:

```
Treatment -> Procedure -> Medicine -> Quantity -> Unit Cost -> Taxes -> Insurance Coverage -> Discounts -> Final Amount
```

An AI-powered analysis engine then converts this information into a clear, human-readable explanation covering:

- What was charged
- Why it might have been charged
- How much was charged
- What was covered by insurance
- What the patient actually paid

The extracted data is compared against a continuously maintained knowledge base of hospital policies, insurance terms, healthcare guidelines, and applicable Indian healthcare regulations and public resources.

When the system identifies something unusual, such as a duplicate charge, an unexplained fee, or an unexpected discrepancy, it does **not** declare the hospital legally at fault. Instead, it provides a transparent notification:

> **Potential discrepancy detected**
> This charge appears inconsistent with the available information.
> You may want to request clarification from the hospital or review the applicable policy.

The user is then directed toward the relevant policy, official information, or appropriate grievance channel.

## Key Innovation

CareLens goes beyond traditional medical-bill OCR by combining:

| Component | Technology | Role |
|---|---|---|
| **Document Intelligence** | Azure Document Intelligence | Extracts tables, text, and structure from any bill format |
| **Generative AI** | NVIDIA NIM (OpenAI-compatible API) | Produces safe, evidence-grounded plain-language explanations |
| **Healthcare Knowledge Retrieval** | NVIDIA Nemotron-3-Embed-1B + Supabase pgvector | Grounds analysis in policies and regulations |
| **Hybrid Ranking** | Custom scoring (vector + keyword + doc-type bonuses) | Surfaces the most relevant evidence |
| **Rule-Based Validation** | Pure JavaScript arithmetic | Detects duplicates and inconsistencies with zero hallucination risk |
| **Safe AI Design** | 26 prompt rules + temperature 0.1 | Prevents overconfident or harmful claims |
| **Patient-Centric UX** | React + Tailwind | Makes results usable for non-experts |

**CareLens = Azure OCR + Deterministic Validation + NVIDIA RAG + NVIDIA LLM → Patient-Friendly Medical Bill Transparency**

---

## Screenshots

**Landing page**

<img width="807" height="671" alt="CareLens landing page" src="https://github.com/user-attachments/assets/e85a88b5-dd3b-480c-8cae-f80f9adb5375" />

**Analyze a bill**

<img width="1076" height="265" alt="CareLens upload screen" src="https://github.com/user-attachments/assets/5bc8daa2-f532-486b-b530-cbcb2398e79a" />

**Result**

<img width="656" height="617" alt="CareLens analysis result" src="https://github.com/user-attachments/assets/14321bbb-6c93-4887-96c5-2f1afd0b820e" />

---

## Test Bills

Want to try CareLens without a real hospital bill? We've prepared a set of **sample test bills** (created with Claude for demo and testing purposes; they contain no real patient data).

📥 **[Download the test bills from Google Drive](https://drive.google.com/drive/folders/1xXbncieEsjObQLBHSwVmZLq0kVrCRah2?usp=sharing)**

Upload any of them on the `/upload` page to see the full analysis pipeline in action.

---

## Tech Stack

### Frontend

| Technology | Version | Role |
|---|---|---|
| **React** | 18.3.1 | UI component framework |
| **Vite** | 5.4.0 | Fast dev server & bundler |
| **React Router DOM** | 6.26.0 | Client-side SPA routing |
| **TailwindCSS** | 3.4.10 | Utility-first styling |
| **Lucide React** | 0.400.0 | Icon library |
| **PostCSS + Autoprefixer** | 8.4 / 10.4 | CSS build pipeline |

**Pages**

| Page | Route | Purpose |
|---|---|---|
| `Landing.jsx` | `/` | Hero section, features, CTA |
| `Upload.jsx` | `/upload` | Drag-and-drop bill upload |
| `Analysis.jsx` | `/analysis/:id` | Extracted data + AI findings |
| `Chat.jsx` | `/chat` | AI chat about policies and bills |
| `Dashboard.jsx` | `/dashboard` | Bill history and overview |
| `Settings.jsx` | `/settings` | User preferences |

### Backend

| Technology | Version | Role |
|---|---|---|
| **Node.js** | 24.x | JavaScript runtime |
| **Express** | 5.1.0 | HTTP server framework |
| **Multer** | 2.0.2 | Multipart file upload handling |
| **CORS** | 2.8.5 | Cross-origin request policy |
| **express-rate-limit** | 8.1.0 | Per-route rate limiting |
| **dotenv** | 17.2.2 | Environment variable management |

### External AI & Cloud Services

| Service | Provider | SDK | Role |
|---|---|---|---|
| **Azure Document Intelligence** | Microsoft Azure | `@azure-rest/ai-document-intelligence ^1.0.0` | OCR + layout extraction |
| **NVIDIA NIM LLM** | NVIDIA | `openai ^5.16.0` (compatible API) | Plain-language bill explanations |
| **NVIDIA Nemotron Embeddings** | NVIDIA | `openai ^5.16.0` (compatible API) | Text → vector embeddings |
| **Supabase (pgvector)** | Supabase | `@supabase/supabase-js ^2.57.0` | Vector DB + knowledge base |

### Deployment

| Tool | Purpose |
|---|---|
| **Vercel** | Production hosting (frontend + backend as serverless) |
| **Docker + Docker Compose** | Local development environment |

---

## Repository Structure

```
carelens/
├── backend/                  # Node.js Express API
│   └── src/
│       ├── server.js         # Entry point + route wiring
│       ├── config/           # Environment config
│       ├── middleware/       # Rate limiters
│       ├── routes/
│       │   ├── analysis.routes.js
│       │   └── chat.routes.js
│       ├── services/
│       │   ├── document.service.js     # Azure OCR + normalization
│       │   ├── analysis.service.js     # Pipeline orchestrator
│       │   ├── validation.service.js   # Deterministic validator
│       │   ├── rag.service.js          # RAG retrieval + scoring
│       │   ├── embeddings.js           # NVIDIA embedding model
│       │   └── supabase.js             # DB client
│       └── utils/
│           └── queryClassifier.js      # Query type classifier
├── carelens-frontend/        # React + Vite SPA
│   └── src/
│       ├── pages/            # Landing, Upload, Analysis, Chat, Dashboard, Settings
│       ├── components/       # Reusable UI components
│       ├── services/         # API client calls
│       └── lib/              # Utility helpers
├── docker-compose.yml        # Local dev orchestration
└── vercel.json               # Production deployment config
```

---

## End-to-End Workflow

```
Upload Bill
    |
    v
OCR and Document Understanding        (Azure Document Intelligence)
    |
    v
Extract Charges and Patient Information   (Normalization)
    |
    v
Deterministic Validation              (Arithmetic checks, no AI)
    |
    v
Cross-reference Policies and Healthcare Rules   (RAG: pgvector + hybrid ranking)
    |
    v
AI Classification and Explanation     (NVIDIA LLM)
    |
    v
Plain-language Findings, Sources and Next Steps
```

### Step 0: Upload

`Upload.jsx` accepts a PDF / JPG / PNG via drag-and-drop or file picker, validates type and size client-side, and sends a `multipart/form-data` `POST /api/analysis`. Multer receives the file buffer on the backend. *(~0–1s)*

### Step 1: Azure Document Intelligence (OCR)

`document.service.js → analyzeDocument()` posts the file to Azure DI using the `prebuilt-layout` model (API version `2024-11-30`). Azure performs OCR on every word/line/paragraph, detects table structure, analyzes page layout, and detects key-value pairs. It returns structured JSON (`pages[]`, `tables[]`, `lines[]`). *(~3–8s)*

### Step 2: Bill Normalization

`document.service.js → normalizeBillResult()`:

- Iterates extracted tables, finds column headers (description, qty, rate, amount, tariff code), and extracts each row as a bill item.
- Falls back to regex text parsing if no tables are detected (pattern: `Item name  QTY  ₹AMOUNT`).
- Extracts the financial summary: subtotal, tax (GST / CGST / SGST / IGST), discount, grand total.
- Extracts metadata: hospital name, patient name, bill number, date, currency.

Output:

```js
{
  vendor, patient, billNumber, billDate,
  items: [{ description, quantity, unitPrice, amount, tariffCode }],
  subtotal, tax, discount, total, currency,
  rawText, tables, pages, metadata
}
```

*(~50–200ms, pure JavaScript)*

### Step 3: Deterministic Validation

`validation.service.js → validateBill()`. **No AI involved.** Pure arithmetic checks:

| # | Check | Rule | Severity |
|---|---|---|---|
| 1 | `ITEM_ARITHMETIC_MISMATCH` | `quantity × unitPrice` vs billed amount differs by > ₹0.01 | Medium |
| 2 | `POSSIBLE_DUPLICATE_CHARGE` | Same `(description + amount)` key appears more than once | Medium |
| 3 | `SUBTOTAL_MISMATCH` | Sum of line items vs declared subtotal differs by > ₹0.01 | **High** |
| 4 | `TOTAL_MISMATCH` | `subtotal + tax − discount` vs declared total differs by > ₹0.01 | **High** |
| 5 | `MISSING_ITEMIZATION` | A total is shown but zero line items were extracted | Flag |

Returns `{ status: "PASS" | "REVIEW_REQUIRED", discrepancyCount, summary: { high, medium, total }, discrepancies: [...] }`. *(~1–5ms)*

### Step 4: RAG Knowledge Base Search

`rag.service.js → searchKnowledgeBase()`. For each bill line item (up to 5), it builds queries such as `"hospital tariff policy <item description>"` and `"tariff code <TARIFF-CODE>"`, plus a general `"hospital billing policy medical bill charges"` query. For each query:

1. **Classify**: `queryClassifier.js` labels it `RATE` (pricing/tariffs), `POLICY` (regulations/rules), or `GENERAL`.
2. **Embed**: `embeddings.js → generateEmbedding()` uses NVIDIA Nemotron-3-Embed-1B to produce a 1024-dimension vector.
3. **Retrieve**: `Supabase.rpc("match_document_chunks")` runs a pgvector cosine-similarity search for the top 30 candidates.
4. **Score (hybrid retrieval)**:

   | Signal | Weight |
   |---|---|
   | `vectorScore` | Cosine similarity (primary) |
   | `keywordScore` | × 0.10 keyword overlap bonus |
   | `documentTypeBonus` | +0.15 if document type matches query type |
   | `tableBonus` | +0.10 if `content_type = "table"` for RATE queries |
   | `exactTermBonus` | +0.20 if exact tariff-code match found |

5. **Filter** by `document_type` for RATE / POLICY queries.
6. **Rank** by `finalScore`, keep top 5 per query.

All results are merged, deduplicated by chunk ID, and re-ranked. The **top 10 chunks** are returned as evidence. *(~3–8s total)*

**Knowledge base contents:** hospital master tariff documents, Indian healthcare regulation PDFs, and insurance policy terms, each stored as chunked text plus a vector embedding.

### Step 5: LLM Explanation Generation

`analysis.service.js → generateExplanation()` builds a prompt containing the normalized bill, the validation results, and up to 10 RAG evidence chunks (with source doc, page, and similarity). The NVIDIA LLM (model set via the `NVIDIA_LLM_MODEL` env var) is called with **temperature 0.1** and **max tokens 2500**.

**26 strict prompt rules** are enforced, including:

- Never say "overcharged"; say "potential discrepancy".
- Never invent policies, tariff codes, or document names.
- Never make legal or medical judgments.
- Clearly separate bill facts / validator findings / evidence / uncertainty.
- All cited documents must come from the supplied RAG evidence.

Structured JSON output:

```json
{
  "overallStatus": "CLEAR | REVIEW_REQUIRED | INSUFFICIENT_EVIDENCE",
  "summary": "Short plain-language summary",
  "explanation": "Detailed explanation",
  "discrepancies": [
    {
      "title": "", "type": "", "severity": "",
      "description": "", "whyItMatters": "",
      "evidence": [{ "document": "", "page": 0, "quote": "" }],
      "suggestedAction": ""
    }
  ],
  "questionsToAskHospital": ["..."]
}
```

*(~3–7s)*

### Step 6: Response to Frontend

```js
{
  success: true,
  file: { name, mimeType, size },
  bill: { /* normalized bill data */ },
  validation: { /* deterministic results */ },
  ragResults: { results: [/* evidence chunks */] },
  analysis: { /* LLM explanation JSON */ }
}
```

`Analysis.jsx` renders:

- ✅ Bill summary card (patient, hospital, date, total)
- 📋 Itemized charges table
- 🚨 Discrepancy alerts (HIGH = red, MEDIUM = yellow)
- 📄 Plain-language explanation
- 📚 Source documents referenced (with page numbers)
- ❓ "Questions to ask your hospital"

### Total Timing

| Stage | Time |
|---|---|
| Upload | ~0–1s |
| **Azure OCR** | **~3–8s** |
| Normalization | ~0.1s |
| Validation | ~0.005s |
| **RAG Search** | **~3–8s** |
| **NVIDIA LLM** | **~3–7s** |
| **Total** | **~10–25s** |

> The biggest time sinks are Azure Document Intelligence and LLM generation, which run sequentially. RAG queries currently run in a loop and are a candidate for parallelization.

---

## Chat Workflow

`Chat.jsx` → `POST /api/chat`

1. The user asks something like *"Why was I charged ₹4,500 for room rent?"*
2. `chat.routes.js` runs the same RAG search on the question.
3. Relevant policy/tariff chunks are retrieved.
4. The NVIDIA LLM generates a contextualized answer and streams tokens back to the frontend. *(~2–5s per message)*

---

## Database Design

Supabase (Postgres + pgvector):

```sql
-- Knowledge base table
documents (
  id            UUID PRIMARY KEY,
  file_name     TEXT,          -- "hospital_tariff_2024.pdf"
  document_type TEXT,          -- "master_tariff" | "regulation"
  page_number   INT,
  content       TEXT,          -- chunk of text (~500 tokens)
  metadata      JSONB,         -- { content_type: "table" | "text" }
  embedding     VECTOR(1024)   -- NVIDIA Nemotron-3 embedding
)

-- Similarity search RPC
match_document_chunks(
  query_embedding VECTOR(1024),
  match_count     INT
)
-- Returns chunks ordered by cosine similarity
```

---

## API Reference

| Endpoint | Method | Rate Limit | Purpose |
|---|---|---|---|
| `/api/health` | GET | None | Backend health check |
| `/api/health/supabase` | GET | None | DB connectivity check |
| `/api/analysis` | POST | ~5 req/min | Bill upload + full analysis |
| `/api/chat` | POST | ~20 req/min | Contextual AI chat |
| `/api/rag/search` | GET / POST | ~10 req/min | Raw knowledge base search |

---

## Deployment Architecture

```
                          ┌──────────────────────────────┐
                          │            Vercel            │
                          │                              │
                          │  ┌────────────┐              │
User Browser ─────────────│─▶│  Frontend  │ React SPA    │
                          │  │  (Vite)    │ /            │
                          │  └────────────┘              │
                          │        │ /api/*              │
                          │        ▼                     │
                          │  ┌────────────┐              │
                          │  │  Backend   │ Express      │
                          │  │  (Node.js) │ Serverless   │
                          │  └────────────┘              │
                          └──────────┬───────────────────┘
                                     │
               ┌─────────────────────┼──────────────────────┐
               ▼                     ▼                      ▼
        ┌──────────────┐   ┌──────────────────┐   ┌──────────────────┐
        │   Supabase   │   │  Azure Document  │   │  NVIDIA NIM API  │
        │  (pgvector)  │   │  Intelligence    │   │  LLM + Embeddings│
        │  Knowledge   │   │  OCR Service     │   │                  │
        │  Base        │   │                  │   │                  │
        └──────────────┘   └──────────────────┘   └──────────────────┘

Local dev: Docker Compose runs backend (:5000) + frontend (:5173)
```

---

## Getting Started

### Prerequisites

- Node.js 24.x
- Docker & Docker Compose (optional, for the containerized setup)
- Accounts / API keys for: **Azure Document Intelligence**, **NVIDIA NIM**, **Supabase**

### Option A: Docker Compose

```bash
git clone <your-repo-url>
cd carelens
cp backend/.env.example backend/.env    # then fill in your keys
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

### Option B: Run manually

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (in a second terminal)
cd carelens-frontend
npm install
npm run dev
```

### Environment variables

Create `backend/.env` with your credentials. The variable names below are illustrative, so match them to `backend/src/config/`:

```env
PORT=5000

# Azure Document Intelligence
AZURE_DI_ENDPOINT=
AZURE_DI_KEY=

# NVIDIA NIM
NVIDIA_API_KEY=
NVIDIA_LLM_MODEL=
NVIDIA_EMBEDDING_MODEL=

# Supabase
SUPABASE_URL=
SUPABASE_KEY=
```

### Try it out

1. Download the [sample test bills](https://drive.google.com/drive/folders/1xXbncieEsjObQLBHSwVmZLq0kVrCRah2?usp=sharing).
2. Open the app and click **Analyze My Bill**.
3. Upload a test bill and review the extracted items, discrepancy flags, and plain-language explanation.

---

## Accessibility

A patient should not need to be a doctor, lawyer, accountant, or technology expert to understand their own healthcare expenses. CareLens is designed to support:

- Elderly patients
- Patients with limited digital literacy
- Family members managing medical expenses
- First-time hospital users
- Patients navigating insurance claims
- Caregivers
- Individuals unfamiliar with healthcare terminology

**Planned enhancements:** multilingual explanations, voice-based interaction, accessibility-focused interfaces, and regional healthcare information.

## Safety and Trust

Healthcare information is sensitive, and incorrect interpretation can have serious consequences. CareLens is an information and navigation system, **not** a medical or legal authority. It empowers; it does not accuse.

The platform is designed to:

- Clearly distinguish extracted facts from AI-generated explanations.
- Provide references to the policies or sources used.
- Identify uncertainty rather than fabricate conclusions.
- Present potential discrepancies as flags requiring human verification, not definitive accusations.
- Encourage users to contact hospitals, insurers, or official grievance mechanisms when necessary.
- Protect sensitive patient and billing information through appropriate security and privacy controls.

## Expected Impact

CareLens aims to reduce the information gap between complex healthcare systems and the people who depend on them.

- Patients know what they paid for.
- Patients understand why they paid it.
- Patients know when something deserves a second look.

By turning complex medical bills and healthcare policies into understandable, evidence-backed information, CareLens helps make healthcare more transparent, accessible, and patient-centric.

---

## Disclaimer

CareLens provides information and navigation support only. All data used are fake, real world testing can't be done as it's a hackathon project

---

*Built for a hackathon. Powered by Azure, NVIDIA, and Supabase. Deployed on Vercel.*
