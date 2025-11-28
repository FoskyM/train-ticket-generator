/**
 * 生成字体字符串
 */
export const buildFontString = (family: string, size: number, weight?: string | number): string => {
  const weightStr = weight ? `${weight} ` : ''
  return `${weightStr}${size}px ${family}`
}

/**
 * 获取系统本地字体列表
 * 使用 Local Font Access API (需要浏览器支持)
 */
export const getLocalFonts = async (): Promise<string[]> => {
  try {
    // @ts-expect-error Local Font Access API
    if (window.queryLocalFonts) {
      // @ts-expect-error Local Font Access API
      const fonts = await window.queryLocalFonts()
      const fontFamilies = new Set<string>()
      for (const font of fonts) {
        fontFamilies.add(font.family)
      }
      return Array.from(fontFamilies).sort()
    }
  } catch (e) {
    console.warn('无法获取本地字体列表:', e)
  }
  return []
}
