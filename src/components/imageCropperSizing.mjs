export function getFitZoom(imageSize, cropAspect) {
  const imageWidth = imageSize?.width || imageSize?.naturalWidth;
  const imageHeight = imageSize?.height || imageSize?.naturalHeight;

  if (!imageWidth || !imageHeight || !cropAspect) {
    return 1;
  }

  const imageAspect = imageWidth / imageHeight;
  const zoom = imageAspect > cropAspect
    ? cropAspect / imageAspect
    : imageAspect / cropAspect;

  return Number(Math.min(1, Math.max(zoom, 0.1)).toFixed(5));
}
