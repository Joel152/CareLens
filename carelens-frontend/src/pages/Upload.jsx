import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  FileUp,
  Loader2,
  X,
} from "lucide-react";

import AppLayout from "../components/layout/AppLayout.jsx";
import PageContainer from "../components/layout/PageContainer.jsx";
import Button from "../components/ui/Button.jsx";
import { analyzeBill } from "../services/api.js";
import { saveAnalysis } from "../lib/store.js";

/* =========================================================
   CONSTANTS
   ========================================================= */

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

const ALLOWED_EXTENSIONS = [
  ".pdf",
  ".jpg",
  ".jpeg",
  ".png",
];

/* =========================================================
   HELPERS
   ========================================================= */

function formatFileSize(bytes) {
  if (!Number.isFinite(bytes)) {
    return "Unknown size";
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isAllowedFileType(file) {
  if (!file) {
    return false;
  }

  if (ALLOWED_FILE_TYPES.includes(file.type)) {
    return true;
  }

  const fileName =
    file.name?.toLowerCase() ?? "";

  return ALLOWED_EXTENSIONS.some(
    (extension) =>
      fileName.endsWith(extension)
  );
}

function validateFile(file) {
  if (!file) {
    return {
      code: "MISSING_FILE",
      message:
        "Please select a medical bill first.",
    };
  }

  if (!isAllowedFileType(file)) {
    return {
      code: "UNSUPPORTED_FILE_TYPE",
      message:
        "Unsupported file type. Please upload a PDF, JPG, or PNG file.",
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      code: "FILE_TOO_LARGE",
      message:
        "This file is too large. Please choose a file smaller than 10 MB.",
    };
  }

  return null;
}

function getAnalysisErrorMessage(error) {
  switch (error?.code) {
    case "MISSING_FILE":
      return "Please select a medical bill first.";

    case "FILE_TOO_LARGE":
      return "This file is too large. Please choose a file smaller than 10 MB.";

    case "UNSUPPORTED_FILE_TYPE":
      return "Unsupported file type. Please upload a PDF, JPG, or PNG file.";

    case "RATE_LIMITED":
      return "Too many analysis requests. Please wait a few minutes before trying again.";

    case "ANALYSIS_FAILED":
      return (
        error?.message ??
        "CareLens could not complete the analysis. Please try again."
      );

    case "SERVICE_UNAVAILABLE":
      return "The CareLens service is temporarily unavailable. Please try again shortly.";

    case "network_error":
      return "Could not reach the CareLens server. Please check your internet connection and try again.";

    case "aborted":
      return "Analysis was cancelled.";

    default:
      return (
        error?.message ??
        "Something went wrong while analyzing the bill. Please try again."
      );
  }
}

/* =========================================================
   UPLOAD PAGE
   ========================================================= */

export default function Upload() {
  const navigate = useNavigate();

  const inputRef = useRef(null);
  const abortRef = useRef(null);

  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  /* -------------------------------------------------------
     File selection
     ------------------------------------------------------- */

  function handleFileChange(event) {
    const selectedFile =
      event.target.files?.[0] ?? null;

    setError(null);

    if (!selectedFile) {
      setFile(null);
      return;
    }

    const validationError =
      validateFile(selectedFile);

    if (validationError) {
      setFile(null);
      setError(validationError.message);

      /*
       * Clear the input so selecting the same invalid
       * file again still triggers onChange.
       */
      if (inputRef.current) {
        inputRef.current.value = "";
      }

      return;
    }

    setFile(selectedFile);
  }

  /* -------------------------------------------------------
     Remove selected file
     ------------------------------------------------------- */

  function removeFile() {
    if (busy) {
      return;
    }

    setFile(null);
    setError(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  /* -------------------------------------------------------
     Submit
     ------------------------------------------------------- */

  async function submit() {
    if (busy) {
      return;
    }

    const validationError =
      validateFile(file);

    if (validationError) {
      setError(validationError.message);
      return;
    }

    setBusy(true);
    setError(null);

    const controller =
      new AbortController();

    abortRef.current = controller;

    try {
      const result = await analyzeBill(
        file,
        {
          signal: controller.signal,
        }
      );

      const saved = saveAnalysis(result);

      if (!saved) {
        throw new Error(
          "The analysis was completed, but it could not be saved. Please try again."
        );
      }

      navigate("/analysis");
    } catch (error) {
      setError(
        getAnalysisErrorMessage(error)
      );
    } finally {
      abortRef.current = null;
      setBusy(false);
    }
  }

  /* -------------------------------------------------------
     Cancel analysis
     ------------------------------------------------------- */

  function cancelAnalysis() {
    if (!busy) {
      return;
    }

    abortRef.current?.abort();
  }

  /* -------------------------------------------------------
     Render
     ------------------------------------------------------- */

  return (
    <AppLayout
      title="Analyze a bill"
      description="PDF, JPG or PNG · Maximum 10 MB"
    >
      <PageContainer width="narrow">
        {/* =================================================
            ERROR MESSAGE
            ================================================= */}

        {error ? (
          <div
            className="mb-5 flex items-start gap-3 rounded-md border border-alert-line bg-alert-soft px-4 py-3"
            role="alert"
          >
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0 text-alert"
              strokeWidth={2}
              aria-hidden="true"
            />

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ink">
                Upload problem
              </p>

              <p className="mt-0.5 text-[13px] leading-relaxed text-slate-muted">
                {error}
              </p>
            </div>

            {!busy ? (
              <button
                type="button"
                onClick={() =>
                  setError(null)
                }
                className="rounded-md p-1 text-slate-muted hover:bg-white hover:text-ink"
                aria-label="Dismiss error"
              >
                <X
                  size={16}
                  aria-hidden="true"
                />
              </button>
            ) : null}
          </div>
        ) : null}

        {/* =================================================
            UPLOAD CARD
            ================================================= */}

        <div className="card px-6 py-8 text-center">
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            className="sr-only"
            id="bill-file"
            onChange={handleFileChange}
            disabled={busy}
          />

          {/* Upload icon */}

          <FileUp
            size={30}
            strokeWidth={1.8}
            className="mx-auto text-accent"
            aria-hidden="true"
          />

          {/* =================================================
              SELECTED FILE
              ================================================= */}

          {file ? (
            <div className="mx-auto mt-4 max-w-md rounded-md border border-slate-line bg-slate-soft px-4 py-3 text-left">
              <div className="flex items-start gap-3">
                <CheckCircle2
                  size={18}
                  className="mt-0.5 shrink-0 text-verified"
                  strokeWidth={2}
                  aria-hidden="true"
                />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">
                    {file.name}
                  </p>

                  <p className="mt-0.5 text-[12px] text-slate-muted">
                    {formatFileSize(
                      file.size
                    )}
                  </p>
                </div>

                {!busy ? (
                  <button
                    type="button"
                    onClick={removeFile}
                    className="rounded-md p-1 text-slate-muted hover:bg-white hover:text-ink"
                    aria-label="Remove selected file"
                  >
                    <X
                      size={16}
                      aria-hidden="true"
                    />
                  </button>
                ) : null}
              </div>
            </div>
          ) : (
            <>
              <p className="mt-3 text-sm font-medium text-ink">
                Choose a medical bill
              </p>

              <p className="mt-1 text-[13px] text-slate-muted">
                Upload a PDF, JPG or PNG file to
                analyze its charges.
              </p>
            </>
          )}

          {/* =================================================
              BUTTONS
              ================================================= */}

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Button
              variant="secondary"
              onClick={() =>
                inputRef.current?.click()
              }
              disabled={busy}
            >
              {file
                ? "Choose another file"
                : "Choose file"}
            </Button>

            <Button
              onClick={submit}
              disabled={!file || busy}
            >
              {busy ? (
                <Loader2
                  size={15}
                  className="animate-spin"
                  aria-hidden="true"
                />
              ) : null}

              {busy
                ? "Analyzing…"
                : "Analyze bill"}
            </Button>

            {busy ? (
              <Button
                variant="quiet"
                onClick={cancelAnalysis}
              >
                Cancel
              </Button>
            ) : null}
          </div>

          {/* =================================================
              FILE REQUIREMENTS
              ================================================= */}

          <p className="mt-4 text-[12px] text-slate-muted">
            PDF, JPG or PNG · Maximum file size:
            10 MB
          </p>

          {/* =================================================
              ANALYSIS STATUS
              ================================================= */}

          {busy ? (
            <div
              className="mt-5 rounded-md border border-slate-line bg-slate-soft px-4 py-3"
              role="status"
              aria-live="polite"
            >
              <p className="text-[13px] font-medium text-ink">
                CareLens is analyzing your bill…
              </p>

              <p className="mt-1 text-[12px] leading-relaxed text-slate-muted">
                Reading the bill, checking the
                calculations, and comparing
                relevant documentation. This can
                take a minute.
              </p>
            </div>
          ) : null}
        </div>
      </PageContainer>
    </AppLayout>
  );
}