import express from "express";
import multer from "multer";

import { analyzeBill } from "../services/analysis.service.js";

const router = express.Router();

/* =========================================================
   UPLOAD CONFIGURATION
   ========================================================= */

/*
 * Store uploaded files in memory.
 *
 * We do NOT permanently save the medical bill
 * to the server filesystem.
 */

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },

  fileFilter: (req, file, callback) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return callback(null, true);
    }

    return callback(
      new Error(
        "Unsupported file type. Please upload a PDF, JPG, or PNG file."
      )
    );
  },
});

/* =========================================================
   POST /api/analysis
   ========================================================= */

/*
 * Upload a medical bill and receive
 * the complete CareLens analysis.
 *
 * Protection:
 * - Backend rate limit
 * - Maximum 10 MB file size
 * - Maximum 1 uploaded file
 * - PDF / JPG / PNG only
 */

router.post(
  "/",
  (req, res, next) => {
    upload.single("bill")(req, res, (error) => {
      if (!error) {
        return next();
      }

      /* -----------------------------------------------------
         File too large
         ----------------------------------------------------- */

      if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
          return res.status(413).json({
            success: false,
            error:
              "The uploaded file is too large. Please upload a file smaller than 10 MB.",
            code: "FILE_TOO_LARGE",
          });
        }

        if (error.code === "LIMIT_FILE_COUNT") {
          return res.status(400).json({
            success: false,
            error:
              "Only one medical bill can be uploaded at a time.",
            code: "TOO_MANY_FILES",
          });
        }

        if (error.code === "LIMIT_UNEXPECTED_FILE") {
          return res.status(400).json({
            success: false,
            error:
              "Only one medical bill can be uploaded using the 'bill' field.",
            code: "UNEXPECTED_FILE",
          });
        }

        return res.status(400).json({
          success: false,
          error:
            "There was a problem with the uploaded file.",
          code: "UPLOAD_ERROR",
        });
      }

      /* -----------------------------------------------------
         Unsupported file type
         ----------------------------------------------------- */

      return res.status(400).json({
        success: false,
        error:
          error.message ||
          "Unsupported file type. Please upload a PDF, JPG, or PNG file.",
        code: "UNSUPPORTED_FILE_TYPE",
      });
    });
  },

  async (req, res) => {
    try {
      /* -----------------------------------------------------
         Make sure a file was actually uploaded
         ----------------------------------------------------- */

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error:
            "Please upload a medical bill using the 'bill' field.",
          code: "MISSING_FILE",
        });
      }

      /* -----------------------------------------------------
         Analyze bill
         ----------------------------------------------------- */

      const result = await analyzeBill({
        fileBuffer: req.file.buffer,
        mimeType: req.file.mimetype,
        originalFileName: req.file.originalname,
      });

      return res.status(200).json(result);
    } catch (error) {
      console.error("Bill analysis error:", error);

      return res.status(500).json({
        success: false,
        error:
          error.message ||
          "Failed to analyze the medical bill.",
        code: "ANALYSIS_FAILED",
      });
    }
  }
);

export default router;