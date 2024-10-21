const drawCustomText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  spacing: number = 0,
  color: number[] = [0, 0, 0]
) => {
  const colorStr = `${color[0]}, ${color[1]}, ${color[2]}`;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const charWidth = ctx.measureText(char).width;

    // 将字分成多个小块
    const numSegments = 200;
    const segmentWidth = charWidth / numSegments;
    const fontSize = parseInt(ctx.font, 10);
    const extraSpace = 5; // 额外的空间，防止裁切

    for (let j = 0; j < numSegments; j++) {
      const segmentX = x + j * segmentWidth;
      const alpha = Math.random() * 0.7 + 0.3; // 随机透明度

      ctx.save();
      ctx.beginPath();
      ctx.rect(
        segmentX,
        y - fontSize - extraSpace,
        segmentWidth,
        fontSize + extraSpace * 2
      );
      ctx.clip();

      ctx.fillStyle = `rgba(${colorStr}, ${alpha})`;
      ctx.fillText(char, x, y);

      ctx.restore();
    }

    x += charWidth + spacing;
  }
};

const drawParagraph = (
  ctx: CanvasRenderingContext2D,
  paragraphs: string[],
  indent: number,
  x: number,
  y: number,
  lineSapce: number,
  maxWidth: number,
  spacing: number = 0,
  color: number[] = [0, 0, 0]
) => {
  paragraphs.forEach((paragraph) => {
    let words = paragraph.split('');
    let line = '';
    let isFirstLine = true;

    for (let n = 0; n < words.length; n++) {
      let testLine = line + words[n];
      let testWidth =
        ctx.measureText(testLine).width + (isFirstLine ? indent : 0);

      if (testWidth > maxWidth && line !== '') {
        let textSpacing = spacing;
        const isSymbol = /[，、,.\)!]/.test(words[n]);
        for (let i = 0; i < 2; i++) {
          if (isSymbol) {
            line = line.slice(0, -1);
            n--;
            textSpacing += 0.6;
          }
        }
        drawCustomText(
          ctx,
          line,
          x + (isFirstLine ? indent : 0),
          y,
          textSpacing,
          color
        );
        line = words[n];
        y += lineSapce;
        isFirstLine = false;
      } else {
        line = testLine;
      }
    }
    drawCustomText(
      ctx,
      line,
      x + (isFirstLine ? indent : 0),
      y,
      spacing,
      color
    );
    y += lineSapce;
  });
};

const drawTrapezoid = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  offset: number,
  direction: string
) => {
  ctx.beginPath();
  if (direction === 'left') {
    ctx.moveTo(x, y - height / 2 + offset);
    ctx.lineTo(x + width, y - height / 2);
    ctx.lineTo(x + width, y + height / 2);
    ctx.lineTo(x, y + height / 2 - offset);
  } else {
    ctx.moveTo(x, y - height / 2 + offset);
    ctx.lineTo(x - width, y - height / 2);
    ctx.lineTo(x - width, y + height / 2);
    ctx.lineTo(x, y + height / 2 - offset);
  }
  ctx.closePath();
  ctx.fill();
};

const drawRoundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fillStyle: string
) => {
  ctx.fillStyle = fillStyle;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
  ctx.fill();
};

const getTextWidth = (ctx: CanvasRenderingContext2D, text: string) => {
  return ctx.measureText(text).width;
};

export { drawCustomText, drawParagraph, getTextWidth, drawTrapezoid, drawRoundRect };
