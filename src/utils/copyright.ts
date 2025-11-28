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

import changelogData from '@/data/changelog.json'

const project = changelogData.project
const latestVersion = changelogData.changelog[0]?.version || '0.0.0'

/**
 * 在控制台输出版权信息（一次性输出，保留样式）
 */
export function printConsoleCopyright(): void {
  const buildTime = new Date(__BUILD_TIME__).toLocaleString('zh-CN')
  const separator = '─'.repeat(60)

  // 样式定义
  const styles = {
    title: 'color: #6366f1; font-weight: bold; font-size: 16px;',
    separator: 'color: #e2e8f0;',
    info: 'color: #64748b; font-size: 12px;',
    link: 'color: #3b82f6; font-size: 12px;',
    license: 'color: #10b981; font-size: 12px;',
    warning: 'color: #f59e0b; font-weight: bold; font-size: 12px;',
  }

  console.log(
    `%c🚂 ${project.name} v${latestVersion}
%c${separator}
%c📝 ${project.description}
%c👤 作者: ${project.author} (${project.authorUrl})
%c🔗 仓库: ${project.repository}
%c🏠 项目主页: ${project.homepage}
%c📜 许可证: ${project.license}
%c🔨 构建: ${__GIT_COMMIT_HASH__} @ ${buildTime}
%c${separator}
%c⚠️ 警告: 本项目使用 AGPL-3.0 许可证，如需使用请遵守开源协议！
%c${separator}`,
    styles.title,
    styles.separator,
    styles.info,
    styles.info,
    styles.link,
    styles.link,
    styles.license,
    styles.info,
    styles.separator,
    styles.warning,
    styles.separator,
  )
}

/**
 * 添加 DOM 版权水印（隐藏元素）
 */
export function addHiddenCopyrightMark(): void {
  const copyrightDiv = document.createElement('div')
  copyrightDiv.id = '__copyright_mark__'
  copyrightDiv.style.cssText =
    'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);'
  copyrightDiv.innerHTML = `
    <!--
      ${project.name} v${latestVersion}
      Copyright (c) 2024-${new Date().getFullYear()} ${project.author}
      Licensed under ${project.license}
      Repository: ${project.repository}
      Homepage: ${project.homepage}

      This software is protected by copyright law.
      Unauthorized reproduction or distribution is prohibited.
    -->
    <span data-author="${project.author}"></span>
    <span data-license="${project.license}"></span>
    <span data-repository="${project.repository}"></span>
    <span data-version="${latestVersion}"></span>
    <span data-build="${__GIT_COMMIT_HASH__}"></span>
  `
  document.body.appendChild(copyrightDiv)
}

/**
 * 监控 DevTools 打开状态
 */
export function monitorDevTools(): void {
  let devToolsOpen = false
  const threshold = 160

  const checkDevTools = () => {
    const widthThreshold = window.outerWidth - window.innerWidth > threshold
    const heightThreshold = window.outerHeight - window.innerHeight > threshold

    if (widthThreshold || heightThreshold) {
      if (!devToolsOpen) {
        devToolsOpen = true
        console.clear()
        printConsoleCopyright()

        console.log(
          `%c🔍 检测到开发者工具已打开
%c欢迎查看源代码！如果觉得有用，请给个 Star ⭐
%c${project.repository}`,
          'color: #6366f1; font-weight: bold; font-size: 14px;',
          'color: #64748b; font-size: 12px;',
          'color: #3b82f6; font-size: 12px;',
        )
      }
    } else {
      devToolsOpen = false
    }
  }

  // 定期检查
  setInterval(checkDevTools, 1000)

  // 也通过 resize 事件检查
  window.addEventListener('resize', checkDevTools)
}

/**
 * 在页面可见性变化时输出信息
 */
export function setupVisibilityChangeHandler(): void {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      console.log(
        '%c👋 欢迎回来！' + project.name + ' v' + latestVersion,
        'color: #6366f1; font-weight: bold;',
      )
    }
  })
}

/**
 * 生成带水印的图片
 */
export function addWatermarkToCanvas(
  canvas: HTMLCanvasElement,
  options: {
    text?: string
    opacity?: number
    fontSize?: number
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  } = {},
): void {
  const {
    text = `${project.name} | ${project.author}`,
    opacity = 0.15,
    fontSize = 10,
    position = 'bottom-right',
  } = options

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.save()
  ctx.globalAlpha = opacity
  ctx.font = `${fontSize}px Arial, sans-serif`
  ctx.fillStyle = '#000000'

  const textWidth = ctx.measureText(text).width
  const padding = 8

  let x: number, y: number
  switch (position) {
    case 'top-left':
      x = padding
      y = fontSize + padding
      break
    case 'top-right':
      x = canvas.width - textWidth - padding
      y = fontSize + padding
      break
    case 'bottom-left':
      x = padding
      y = canvas.height - padding
      break
    case 'bottom-right':
    default:
      x = canvas.width - textWidth - padding
      y = canvas.height - padding
      break
  }

  ctx.fillText(text, x, y)
  ctx.restore()
}

/**
 * 初始化所有版权保护措施
 */
export function initCopyrightInfo(): void {
  // 控制台输出
  printConsoleCopyright()

  // 添加隐藏版权标记
  addHiddenCopyrightMark()

  // 监控 DevTools
  monitorDevTools()

  // 设置页面可见性变化处理
  setupVisibilityChangeHandler()
}
