"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";

export default function ImageCropper({ image, onCropComplete, onCancel, aspect = 1 }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropChange = (crop) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom) => {
    setZoom(zoom);
  };

  const onCropCompleteInternal = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleDone = async () => {
    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels);
      onCropComplete(croppedImage);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[2rem] overflow-hidden shadow-2xl w-full max-w-xl flex flex-col">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800">Crop Image</h3>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="relative h-[400px] bg-slate-900">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={onCropChange}
            onCropComplete={onCropCompleteInternal}
            onZoomChange={onZoomChange}
          />
        </div>

        <div className="p-6 flex flex-col gap-6">
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Zoom Level</span>
              <span className="text-sm font-bold text-[#00A99D]">{Math.round(((zoom - 1) / (3 - 1)) * 100)}%</span>
            </div>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              style={{
                background: `linear-gradient(to right, #00A99D 0%, #00A99D ${((zoom - 1) / (3 - 1)) * 100}%, #f1f5f9 ${((zoom - 1) / (3 - 1)) * 100}%, #f1f5f9 100%)`
              }}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer transition-all duration-200"
            />
          </div>

          <div className="flex justify-end gap-3 mt-2">
            <button
              onClick={onCancel}
              className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              onClick={handleDone}
              className="px-10 py-3 rounded-xl bg-[#00A99D] text-white font-bold hover:bg-[#008c82] transition-all shadow-lg shadow-teal-500/20 active:scale-95"
            >
              Apply Crop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return null;
  }

  // Use actual crop dimensions to maintain quality and aspect ratio
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Canvas is empty"));
        return;
      }
      // Create a file from the blob
      const file = new File([blob], "cropped-image.jpg", { type: "image/jpeg" });
      resolve(file);
    }, "image/jpeg", 0.9);
  });
}

const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });
