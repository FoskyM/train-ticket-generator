import type { WearEffectConfig } from '@/types'

// 磨损纹理缓存，避免重复生成
const wearTextureCache = new Map<string, HTMLCanvasElement>()

/**
 * 生成磨损纹理蒙版
 * 使用离屏Canvas预生成，大幅提升性能
 * @param intensity 磨损强度 0-1，值越大磨损越明显
 */
const createWearTexture = (
  width: number,
  height: number,
  cacheKey: string,
  intensity: number = 0.7,
): HTMLCanvasElement => {
  // 检查缓存
  const cached = wearTextureCache.get(cacheKey)
  if (cached && cached.width >= width && cached.height >= height) {
    return cached
  }

  const textureCanvas = document.createElement('canvas')
  textureCanvas.width = Math.max(width, 100)
  textureCanvas.height = Math.max(height, 50)
  const textureCtx = textureCanvas.getContext('2d')!

  // 使用ImageData直接操作像素，比逐个绘制矩形更快
  const imageData = textureCtx.createImageData(textureCanvas.width, textureCanvas.height)
  const data = imageData.data

  // 根据强度计算透明度范围
  // intensity=0 时，alpha 范围为 1-1（无磨损）
  // intensity=1 时，alpha 范围为 0.3-1（最大磨损）
  const minAlpha = 1 - intensity * 0.7
  const alphaRange = 1 - minAlpha

  // 生成随机透明度纹理
  for (let i = 0; i < data.length; i += 4) {
    const alpha = Math.floor((Math.random() * alphaRange + minAlpha) * 255)
    data[i] = 255 // R
    data[i + 1] = 255 // G
    data[i + 2] = 255 // B
    data[i + 3] = alpha // A
  }

  textureCtx.putImageData(imageData, 0, 0)

  // 缓存纹理
  wearTextureCache.set(cacheKey, textureCanvas)

  return textureCanvas
}

/**
 * 清除磨损纹理缓存（当强度改变时需要重新生成）
 */
const clearWearTextureCache = () => {
  wearTextureCache.clear()
}

/**
 * 优化后的磨损文字绘制
 * 使用离屏Canvas + globalCompositeOperation，性能提升约50-100倍
 */
const drawCustomText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  spacing: number = 0,
  color: number[] = [0, 0, 0],
  wearEffect?: WearEffectConfig,
) => {
  if (!text) return

  const fontSize = parseInt(ctx.font, 10) || 16
  const extraSpace = 5

  // 计算文本总宽度
  let totalWidth = 0
  for (let i = 0; i < text.length; i++) {
    totalWidth += ctx.measureText(text[i]).width + (i < text.length - 1 ? spacing : 0)
  }

  const canvasWidth = Math.ceil(totalWidth) + 10
  const canvasHeight = fontSize + extraSpace * 2 + 10

  // 创建离屏Canvas绘制文本
  const offscreenCanvas = document.createElement('canvas')
  offscreenCanvas.width = canvasWidth
  offscreenCanvas.height = canvasHeight
  const offCtx = offscreenCanvas.getContext('2d')!

  // 复制字体设置
  offCtx.font = ctx.font
  offCtx.textBaseline = ctx.textBaseline
  offCtx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`

  // 在离屏Canvas上绘制文本
  let offsetX = 5
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    offCtx.fillText(char, offsetX, fontSize + extraSpace)
    offsetX += ctx.measureText(char).width + spacing
  }

  // 应用磨损效果（如果启用）
  if (wearEffect?.enabled && wearEffect.intensity > 0) {
    const cacheKey = `wear_${canvasWidth}_${canvasHeight}_${wearEffect.intensity.toFixed(2)}`
    const wearTexture = createWearTexture(canvasWidth, canvasHeight, cacheKey, wearEffect.intensity)

    // 应用磨损效果：使用destination-in混合模式
    offCtx.globalCompositeOperation = 'destination-in'
    offCtx.drawImage(wearTexture, 0, 0, canvasWidth, canvasHeight)
    offCtx.globalCompositeOperation = 'source-over'
  }

  // 绘制到主Canvas
  ctx.drawImage(offscreenCanvas, x - 5, y - fontSize - extraSpace)
}

const drawParagraph = (
  ctx: CanvasRenderingContext2D,
  paragraphs: string[],
  indent: number,
  x: number,
  y: number,
  lineSpace: number,
  maxWidth: number,
  spacing: number = 0,
  color: number[] = [0, 0, 0],
  wearEffect?: WearEffectConfig,
) => {
  paragraphs.forEach((paragraph) => {
    const words = paragraph.split('')
    let line = ''
    let isFirstLine = true

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n]
      const testWidth = ctx.measureText(testLine).width + (isFirstLine ? indent : 0)

      if (testWidth > maxWidth && line !== '') {
        let textSpacing = spacing
        const isSymbol = /[，、,.\)!]/.test(words[n])
        for (let i = 0; i < 2; i++) {
          if (isSymbol) {
            line = line.slice(0, -1)
            n--
            textSpacing += 0.6
          }
        }
        drawCustomText(ctx, line, x + (isFirstLine ? indent : 0), y, textSpacing, color, wearEffect)
        line = words[n]
        y += lineSpace
        isFirstLine = false
      } else {
        line = testLine
      }
    }
    drawCustomText(ctx, line, x + (isFirstLine ? indent : 0), y, spacing, color, wearEffect)
    y += lineSpace
  })
}

const drawTrapezoid = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  offset: number,
  direction: string,
) => {
  ctx.beginPath()
  if (direction === 'left') {
    ctx.moveTo(x, y - height / 2 + offset)
    ctx.lineTo(x + width, y - height / 2)
    ctx.lineTo(x + width, y + height / 2)
    ctx.lineTo(x, y + height / 2 - offset)
  } else {
    ctx.moveTo(x, y - height / 2 + offset)
    ctx.lineTo(x - width, y - height / 2)
    ctx.lineTo(x - width, y + height / 2)
    ctx.lineTo(x, y + height / 2 - offset)
  }
  ctx.closePath()
  ctx.fill()
}

const drawRoundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fillStyle: string,
) => {
  ctx.fillStyle = fillStyle
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + width, y, x + width, y + height, radius)
  ctx.arcTo(x + width, y + height, x, y + height, radius)
  ctx.arcTo(x, y + height, x, y, radius)
  ctx.arcTo(x, y, x + width, y, radius)
  ctx.closePath()
  ctx.fill()
}

const getTextWidth = (ctx: CanvasRenderingContext2D, text: string) => {
  return ctx.measureText(text).width
}

/**
 * 梯形配置接口
 */
interface TrapezoidConfig {
  x: number
  y: number
  width: number
  height: number
  offset: number
  direction: 'left' | 'right'
}

/**
 * 创建包含圆角矩形和梯形的复合裁剪路径
 * 用于斜线纹理的精确裁剪
 */
const createTicketClipPath = (
  ctx: CanvasRenderingContext2D,
  rectX: number,
  rectY: number,
  rectWidth: number,
  rectHeight: number,
  radius: number,
  trapezoids: TrapezoidConfig[],
) => {
  ctx.beginPath()

  // 绘制圆角矩形路径
  ctx.moveTo(rectX + radius, rectY)
  ctx.arcTo(rectX + rectWidth, rectY, rectX + rectWidth, rectY + rectHeight, radius)
  ctx.arcTo(rectX + rectWidth, rectY + rectHeight, rectX, rectY + rectHeight, radius)
  ctx.arcTo(rectX, rectY + rectHeight, rectX, rectY, radius)
  ctx.arcTo(rectX, rectY, rectX + rectWidth, rectY, radius)
  ctx.closePath()

  // 添加梯形路径
  trapezoids.forEach((trap) => {
    ctx.moveTo(trap.direction === 'left' ? trap.x : trap.x, trap.y - trap.height / 2 + trap.offset)
    if (trap.direction === 'left') {
      ctx.lineTo(trap.x + trap.width, trap.y - trap.height / 2)
      ctx.lineTo(trap.x + trap.width, trap.y + trap.height / 2)
      ctx.lineTo(trap.x, trap.y + trap.height / 2 - trap.offset)
    } else {
      ctx.lineTo(trap.x - trap.width, trap.y - trap.height / 2)
      ctx.lineTo(trap.x - trap.width, trap.y + trap.height / 2)
      ctx.lineTo(trap.x, trap.y + trap.height / 2 - trap.offset)
    }
    ctx.closePath()
  })
}

/**
 * 绘制带裁剪的斜线纹理
 * 使用离屏Canvas预渲染纹理，然后通过裁剪路径应用
 */
const drawDiagonalPattern = (
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  rectX: number,
  rectY: number,
  rectWidth: number,
  rectHeight: number,
  radius: number,
  trapezoids: TrapezoidConfig[],
  strokeStyle: string = 'rgba(173, 216, 230, .5)',
  lineWidth: number = 1,
  spacing: number = 5,
) => {
  // 创建离屏Canvas绘制斜线纹理
  const patternCanvas = document.createElement('canvas')
  patternCanvas.width = canvasWidth
  patternCanvas.height = canvasHeight
  const patternCtx = patternCanvas.getContext('2d')!

  patternCtx.strokeStyle = strokeStyle
  patternCtx.lineWidth = lineWidth

  const angle = Math.PI / 6 // 30度角

  // 计算需要绘制的斜线范围，确保覆盖整个区域
  const maxDimension = Math.max(canvasWidth, canvasHeight) * 2

  // 绘制从右上到左下的斜线
  patternCtx.beginPath()
  for (let i = -maxDimension; i < maxDimension; i += spacing) {
    const startX = canvasWidth - i
    const startY = 0
    const endX = startX - canvasHeight / Math.tan(angle)
    const endY = canvasHeight

    patternCtx.moveTo(startX, startY)
    patternCtx.lineTo(endX, endY)
  }
  patternCtx.stroke()

  // 保存主Canvas状态
  ctx.save()

  // 创建裁剪路径
  createTicketClipPath(ctx, rectX, rectY, rectWidth, rectHeight, radius, trapezoids)
  ctx.clip()

  // 将纹理绘制到主Canvas
  ctx.drawImage(patternCanvas, 0, 0)

  // 恢复状态
  ctx.restore()
}

export {
  drawCustomText,
  drawParagraph,
  getTextWidth,
  drawTrapezoid,
  drawRoundRect,
  drawDiagonalPattern,
  clearWearTextureCache,
  type TrapezoidConfig,
}
