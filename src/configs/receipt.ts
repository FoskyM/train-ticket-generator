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

import type { TicketConfig } from '@/types'
import {
  canvasWidth,
  canvasHeight,
  drawTicket,
  drawTicketBack,
} from '@/components/ticket-receipt/renderer2d'

/**
 * 蓝票（报销凭证）配置
 */
export const receiptConfig: TicketConfig = {
  canvasWidth,
  canvasHeight,
  drawFront: drawTicket,
  drawBack: drawTicketBack,
  defaultStyleConfig: {
    fonts: {
      station: { family: 'SimHei', size: 45 },
      stationPinyin: { family: 'FangSong', size: 30 },
      trainNumber: { family: 'SimSun', size: 42 },
      date: { family: 'SimHei', size: 40 },
      seatInfo: { family: 'SimSun', size: 28 },
      price: { family: 'SimHei', size: 40 },
      passenger: { family: 'FangSong', size: 40 },
      label: { family: 'FangSong', size: 21 },
      notice: { family: 'FangSong', size: 27 },
      ticketId: { family: 'FangSong', size: 24 },
      redId: { family: 'Arial', size: 42 },
      checkGate: { family: 'SimSun', size: 24 },
      backTitle: { family: 'SimHei', size: 40 },
      backContent: { family: 'SimSun', size: 25 },
    },
    wearEffect: {
      enabled: true,
      intensity: 0.7,
    },
    showProtrusions: true,
    backgroundOpacity: 0.05,
    qrContent: '',
  },
  styleFieldGroups: [
    {
      fields: [
        { label: '站名', key: 'station', sizeMin: 20, sizeMax: 60 },
        { label: '站名拼音', key: 'stationPinyin', sizeMin: 16, sizeMax: 40 },
        { label: '车次', key: 'trainNumber', sizeMin: 20, sizeMax: 60 },
        { label: '日期时间', key: 'date', sizeMin: 20, sizeMax: 50 },
        { label: '座位信息', key: 'seatInfo', sizeMin: 16, sizeMax: 40 },
        { label: '票价', key: 'price', sizeMin: 20, sizeMax: 50 },
        { label: '乘客信息', key: 'passenger', sizeMin: 20, sizeMax: 50 },
      ],
    },
    {
      fields: [
        { label: '标签文字', key: 'label', sizeMin: 14, sizeMax: 30 },
        { label: '报销提示', key: 'notice', sizeMin: 16, sizeMax: 36 },
        { label: '票据ID', key: 'ticketId', sizeMin: 14, sizeMax: 32 },
        { label: '红色ID', key: 'redId', sizeMin: 20, sizeMax: 50 },
        { label: '检票口', key: 'checkGate', sizeMin: 14, sizeMax: 32 },
      ],
    },
    {
      fields: [
        { label: '背面标题', key: 'backTitle', sizeMin: 24, sizeMax: 50 },
        { label: '背面内容', key: 'backContent', sizeMin: 16, sizeMax: 32 },
      ],
    },
  ],
}
