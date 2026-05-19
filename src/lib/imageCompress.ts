// Compress an image File to a JPEG/PNG under a target max dimension and quality.
// Returns a Blob ready for upload.
export async function compressImage(
  file: File,
  opts: { maxDim?: number; quality?: number; mime?: string } = {}
): Promise<Blob> {
  const { maxDim = 1800, quality = 0.82, mime = 'image/jpeg' } = opts;
  if (!file.type.startsWith('image/')) return file;
  // SVG / GIF — return as-is
  if (/svg|gif/.test(file.type)) return file;

  const bitmap = await createBitmap(file);
  const { width, height } = bitmap;
  const scale = Math.min(1, maxDim / Math.max(width, height));
  const w = Math.round(width * scale);
  const h = Math.round(height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bitmap as any, 0, 0, w, h);

  return new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => resolve(b || file), mime, quality);
  });
}

async function createBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if ('createImageBitmap' in window) {
    try { return await createImageBitmap(file); } catch {}
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export function safeFileName(name: string): string {
  const dot = name.lastIndexOf('.');
  const base = (dot > 0 ? name.slice(0, dot) : name).toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 40) || 'image';
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${base}.jpg`;
}
