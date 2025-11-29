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
 * This file is created by FoskyM on 2025/11/29.
 */

/**
 * 双面打印
 * @param frontCanvas 正面 Canvas
 * @param backCanvas 背面 Canvas
 */
export function printDuplex(
  frontCanvas: HTMLCanvasElement,
  backCanvas: HTMLCanvasElement,
): void {
  // 获取 canvas 图片数据
  const frontDataUrl = frontCanvas.toDataURL('image/png')
  const backDataUrl = backCanvas.toDataURL('image/png')

  // 创建打印窗口
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    alert('无法打开打印窗口，请检查浏览器是否阻止了弹出窗口')
    return
  }

  // 写入打印内容
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>打印车票</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: sans-serif;
        }
        .page {
          width: 100%;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          page-break-after: always;
        }
        .page:last-child {
          page-break-after: auto;
        }
        .page img {
          max-width: 90%;
          max-height: 90%;
          object-fit: contain;
        }
        .print-info {
          position: fixed;
          top: 10px;
          left: 10px;
          font-size: 12px;
          color: #666;
        }
        @media print {
          .print-info {
            display: none;
          }
          .page {
            height: 100vh;
          }
        }
        @media screen {
          .page {
            border-bottom: 1px dashed #ccc;
            min-height: 50vh;
            height: auto;
            padding: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="print-info">提示：请在打印设置中启用"双面打印"（沿短边翻转）</div>
      <div class="page">
        <img src="${frontDataUrl}" alt="正面" />
      </div>
      <div class="page">
        <img src="${backDataUrl}" alt="背面" />
      </div>
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 300);
        };
      <\/script>
    </body>
    </html>
  `)
  printWindow.document.close()
}
