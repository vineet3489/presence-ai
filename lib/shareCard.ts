const CARD_W = 1080;
const CARD_H = 1920;

export interface ShareCardInput {
  personaLabel: string;
  narrative: string;
  photoBase64: string | null;
  photoMediaType: 'image/jpeg' | 'image/png';
  swipeAfter: number;
  replyAfter: number;
  swipeBefore?: number | null;
  replyBefore?: number | null;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Image failed to load'));
    img.src = src;
  });
}

function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const scale = Math.max(w / img.width, h / img.height);
  const sw = w / scale;
  const sh = h / scale;
  const sx = (img.width - sw) / 2;
  const sy = (img.height - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(test).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawStatBlock(
  ctx: CanvasRenderingContext2D,
  cx: number,
  y: number,
  label: string,
  before: number | null | undefined,
  after: number,
  color: string
) {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  if (before != null && Math.round(before) !== Math.round(after)) {
    ctx.font = '600 24px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = 'rgba(226,232,240,0.55)';
    ctx.fillText(`was ${Math.round(before)}%`, cx, y - 46);
  }

  ctx.font = '800 68px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = color;
  ctx.fillText(`${Math.round(after)}%`, cx, y);

  ctx.font = '700 24px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = 'rgba(226,232,240,0.8)';
  ctx.fillText(label, cx, y + 36);
}

export async function renderShareCard(data: ShareCardInput): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  const bg = ctx.createLinearGradient(0, 0, 0, CARD_H);
  bg.addColorStop(0, '#0f0a1f');
  bg.addColorStop(0.55, '#020617');
  bg.addColorStop(1, '#020617');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  try {
    ctx.save();
    ctx.filter = 'blur(90px)';
    ctx.fillStyle = 'rgba(139, 92, 246, 0.35)';
    ctx.beginPath();
    ctx.ellipse(CARD_W / 2, 260, 340, 220, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } catch {
    // canvas filter unsupported in some engines — skip the glow, not fatal
  }

  const photoPad = 64;
  const photoTop = 150;
  const photoW = CARD_W - photoPad * 2;
  const photoH = 1040;

  ctx.save();
  roundRectPath(ctx, photoPad, photoTop, photoW, photoH, 48);
  ctx.clip();

  if (data.photoBase64) {
    try {
      const img = await loadImage(`data:${data.photoMediaType};base64,${data.photoBase64}`);
      drawCover(ctx, img, photoPad, photoTop, photoW, photoH);
    } catch {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(photoPad, photoTop, photoW, photoH);
    }
  } else {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(photoPad, photoTop, photoW, photoH);
  }

  const overlay = ctx.createLinearGradient(0, photoTop + photoH * 0.4, 0, photoTop + photoH);
  overlay.addColorStop(0, 'rgba(2,6,23,0)');
  overlay.addColorStop(1, 'rgba(2,6,23,0.92)');
  ctx.fillStyle = overlay;
  ctx.fillRect(photoPad, photoTop, photoW, photoH);
  ctx.restore();

  ctx.save();
  roundRectPath(ctx, photoPad, photoTop, photoW, photoH, 48);
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(167, 139, 250, 0.35)';
  ctx.stroke();
  ctx.restore();

  ctx.font = '600 28px system-ui, -apple-system, sans-serif';
  const badgeText = `${data.personaLabel} is viewing your profile…`;
  const badgeW = ctx.measureText(badgeText).width + 56;
  const badgeX = (CARD_W - badgeW) / 2;
  const badgeY = photoTop + 36;
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  roundRectPath(ctx, badgeX, badgeY, badgeW, 60, 30);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(badgeText, CARD_W / 2, badgeY + 30);

  const statsY = photoTop + photoH - 260;
  drawStatBlock(ctx, CARD_W / 2 - 180, statsY, 'SWIPE', data.swipeBefore, data.swipeAfter, '#34d399');
  drawStatBlock(ctx, CARD_W / 2 + 180, statsY, 'REPLY', data.replyBefore, data.replyAfter, '#38bdf8');

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.font = 'italic 400 30px system-ui, -apple-system, sans-serif';
  const narrativeLines = wrapText(ctx, `“${data.narrative}”`, photoW - 96).slice(0, 4);
  const lineHeight = 42;
  const boxH = 48 + narrativeLines.length * lineHeight;
  const boxY = photoTop + photoH - boxH - 36;
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  roundRectPath(ctx, photoPad + 24, boxY, photoW - 48, boxH, 24);
  ctx.fill();
  ctx.fillStyle = '#f1f5f9';
  narrativeLines.forEach((line, i) => {
    ctx.fillText(line, photoPad + 48, boxY + 40 + i * lineHeight);
  });

  ctx.textAlign = 'center';
  ctx.font = '800 46px system-ui, -apple-system, sans-serif';
  const grad = ctx.createLinearGradient(CARD_W / 2 - 180, 0, CARD_W / 2 + 180, 0);
  grad.addColorStop(0, '#a78bfa');
  grad.addColorStop(0.5, '#818cf8');
  grad.addColorStop(1, '#38bdf8');
  ctx.fillStyle = grad;
  ctx.fillText('PresenceAI', CARD_W / 2, photoTop + photoH + 96);

  ctx.font = '600 30px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('Run your free Perception Check → mypresence.in', CARD_W / 2, photoTop + photoH + 148);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Failed to export image'))), 'image/png', 0.95);
  });
}
