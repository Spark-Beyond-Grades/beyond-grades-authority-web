export const CROP_UPLOAD_ACCEPT = "image/*,application/pdf";

export function getCropUploadKind(file) {
  if (!file) return null;

  const type = file.type?.toLowerCase() || "";
  const name = file.name?.toLowerCase() || "";

  if (type.startsWith("image/")) return "image";
  if (type === "application/pdf" || name.endsWith(".pdf")) return "pdf";

  return null;
}

export async function createCropImageFromFile(file) {
  const kind = getCropUploadKind(file);

  if (kind === "image") {
    return readFileAsDataUrl(file);
  }

  if (kind === "pdf") {
    return renderFirstPdfPageAsDataUrl(file);
  }

  throw new Error("Please upload an image or PDF file.");
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read the selected file."));
    reader.readAsDataURL(file);
  });
}

async function renderFirstPdfPageAsDataUrl(file) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjs.getDocument({ data, disableWorker: true }).promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 1 });
  const scale = Math.min(2, 2400 / Math.max(viewport.width, viewport.height));
  const scaledViewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Could not prepare the PDF for cropping.");
  }

  canvas.width = scaledViewport.width;
  canvas.height = scaledViewport.height;

  await page.render({ canvasContext: context, viewport: scaledViewport }).promise;

  return canvas.toDataURL("image/png");
}
