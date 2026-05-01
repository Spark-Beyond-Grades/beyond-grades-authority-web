import test from "node:test";
import assert from "node:assert/strict";

import {
  CROP_UPLOAD_ACCEPT,
  configurePdfJsForMainThreadWorker,
  getCropUploadKind,
} from "./cropUploadFile.mjs";

test("accepts image files for crop upload", () => {
  assert.equal(getCropUploadKind({ type: "image/png", name: "poster.png" }), "image");
  assert.equal(getCropUploadKind({ type: "image/jpeg", name: "logo.jpg" }), "image");
});

test("accepts PDF files for crop upload", () => {
  assert.equal(getCropUploadKind({ type: "application/pdf", name: "poster.pdf" }), "pdf");
  assert.equal(getCropUploadKind({ type: "", name: "fallback.PDF" }), "pdf");
});

test("rejects unsupported crop upload files", () => {
  assert.equal(getCropUploadKind({ type: "text/csv", name: "poster.csv" }), null);
  assert.equal(getCropUploadKind(null), null);
});

test("uses one accept value for both image and PDF inputs", () => {
  assert.equal(CROP_UPLOAD_ACCEPT, "image/*,application/pdf");
});

test("configures PDF.js fake worker before rendering PDFs", () => {
  const workerModule = { WorkerMessageHandler: {} };
  const pdfjs = { GlobalWorkerOptions: { workerSrc: "" } };

  configurePdfJsForMainThreadWorker(pdfjs, workerModule);

  assert.equal(globalThis.pdfjsWorker, workerModule);
  assert.equal(pdfjs.GlobalWorkerOptions.workerSrc, "");

  delete globalThis.pdfjsWorker;
});
