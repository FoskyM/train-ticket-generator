/*
 * Train Ticket Generator 中国铁路火车票生成器.
 * Copyright (C) 2024-present FoskyM<i@fosky.top>
 * https://github.com/FoskyM/train-ticket-generator
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.

 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.

 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 * This file is created by FoskyM on 2025/11/28.
 */

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
