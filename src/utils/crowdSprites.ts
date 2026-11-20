export interface ProcessedSprite {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  aspect: number;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

function isNearWhite(r: number, g: number, b: number, threshold: number): boolean {
  return r >= threshold && g >= threshold && b >= threshold;
}

/**
 * Flood-fills exterior near-white background pixels to transparent while keeping
 * interior white clothing/skin fills 100% opaque.
 * For waist-up pedestrian cells (openBottom = true), we seed only top, left, right,
 * and exterior bottom corners up to the first dark ink pixel so white shirts touching
 * the bottom edge are never hollowed out.
 */
function stripExteriorWhite(
  imgData: ImageData,
  width: number,
  height: number,
  openBottom: boolean
): void {
  const data = imgData.data;
  const total = width * height;
  const visited = new Uint8Array(total);
  const queue = new Int32Array(total);
  let head = 0;
  let tail = 0;
  const threshold = 232;

  const tryPush = (x: number, y: number) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const idx = y * width + x;
    if (visited[idx]) return;
    const p = idx * 4;
    if (data[p + 3] === 0 || isNearWhite(data[p], data[p + 1], data[p + 2], threshold)) {
      visited[idx] = 1;
      queue[tail++] = idx;
    }
  };

  // Top edge
  for (let x = 0; x < width; x++) {
    tryPush(x, 0);
  }
  // Left and right edges
  for (let y = 0; y < height; y++) {
    tryPush(0, y);
    tryPush(width - 1, y);
  }

  if (!openBottom) {
    // Full-body character: all 4 edges safe to seed
    for (let x = 0; x < width; x++) {
      tryPush(x, height - 1);
    }
  } else {
    // Waist-up pedestrian: seed bottom row only from outer margins inward until dark ink
    const bottomY = height - 1;
    for (let x = 0; x < width; x++) {
      const p = (bottomY * width + x) * 4;
      if (isNearWhite(data[p], data[p + 1], data[p + 2], threshold)) {
        tryPush(x, bottomY);
      } else {
        break;
      }
    }
    for (let x = width - 1; x >= 0; x--) {
      const p = (bottomY * width + x) * 4;
      if (isNearWhite(data[p], data[p + 1], data[p + 2], threshold)) {
        tryPush(x, bottomY);
      } else {
        break;
      }
    }
  }

  while (head < tail) {
    const idx = queue[head++];
    const p = idx * 4;
    data[p + 3] = 0;

    const x = idx % width;
    const y = (idx - x) / width;

    if (x > 0) tryPush(x - 1, y);
    if (x + 1 < width) tryPush(x + 1, y);
    if (y > 0) tryPush(x, y - 1);
    if (y + 1 < height) tryPush(x, y + 1);
  }

  // Soft 1-pixel anti-alias cleanup on fringe pixels adjacent to transparent background
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      if (visited[idx]) continue;
      const p = idx * 4;
      const lum = (data[p] + data[p + 1] + data[p + 2]) / 3;
      if (lum > 205) {
        const touchesBg =
          visited[idx - 1] ||
          visited[idx + 1] ||
          visited[idx - width] ||
          visited[idx + width];
        if (touchesBg) {
          // Smooth fade for anti-aliased light halo pixels next to black ink
          const alphaScale = Math.max(0, Math.min(1, (242 - lum) / 42));
          data[p + 3] = Math.round(data[p + 3] * alphaScale);
        }
      }
    }
  }
}

function trimTransparentBounds(source: HTMLCanvasElement): ProcessedSprite | null {
  const ctx = source.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  const { width, height } = source;
  const data = ctx.getImageData(0, 0, width, height).data;

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const a = data[(y * width + x) * 4 + 3];
      if (a > 20) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX <= minX || maxY <= minY) return null;

  const trimW = maxX - minX + 1;
  const trimH = maxY - minY + 1;
  const trimmed = document.createElement('canvas');
  trimmed.width = trimW;
  trimmed.height = trimH;
  const tCtx = trimmed.getContext('2d');
  if (!tCtx) return null;
  tCtx.drawImage(source, minX, minY, trimW, trimH, 0, 0, trimW, trimH);

  return {
    canvas: trimmed,
    width: trimW,
    height: trimH,
    aspect: trimW / trimH,
  };
}

export async function processCharacterToTransparentUrl(src: string): Promise<string> {
  const img = await loadImage(src);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return src;

  ctx.drawImage(img, 0, 0);
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  stripExteriorWhite(imgData, canvas.width, canvas.height, false);
  ctx.putImageData(imgData, 0, 0);

  const trimmed = trimTransparentBounds(canvas);
  return trimmed ? trimmed.canvas.toDataURL('image/png') : canvas.toDataURL('image/png');
}

export async function processCrowdSpriteSheet(
  src: string,
  cols = 5,
  rows = 3
): Promise<ProcessedSprite[]> {
  const img = await loadImage(src);
  const cellW = Math.floor(img.naturalWidth / cols);
  const cellH = Math.floor(img.naturalHeight / rows);

  if (cellW < 24 || cellH < 24) {
    throw new Error('Crowd sprite sheet dimensions are too small for a 5x3 grid.');
  }

  const sprites: ProcessedSprite[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const sx = col * cellW;
      const sy = row * cellH;

      const cellCanvas = document.createElement('canvas');
      cellCanvas.width = cellW;
      cellCanvas.height = cellH;
      const ctx = cellCanvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) continue;

      ctx.drawImage(img, sx, sy, cellW, cellH, 0, 0, cellW, cellH);
      const imgData = ctx.getImageData(0, 0, cellW, cellH);
      stripExteriorWhite(imgData, cellW, cellH, true);
      ctx.putImageData(imgData, 0, 0);

      const trimmed = trimTransparentBounds(cellCanvas);
      if (trimmed && trimmed.width > 20 && trimmed.height > 20) {
        sprites.push(trimmed);
      }
    }
  }

  return sprites;
}
