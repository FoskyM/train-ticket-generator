<template>
  <Tabs v-model="activeTab" :tabs="tabs" />

  <div
    v-show="activeTab == 'ticket2D'"
    class="flex flex-col md:flex-row gap-4 justify-between w-full py-4"
    :style="{ minHeight: canvasHeight }"
  >
    <div class="ticket-container">
      <div class="canvas-aspect">
        <canvas ref="ticketCanvas" :width="canvasWidth" :height="canvasHeight"></canvas>
      </div>
    </div>
    <div class="ticket-container">
      <div class="canvas-aspect">
        <canvas ref="ticketBackCanvas" :width="canvasWidth" :height="canvasHeight"></canvas>
      </div>
    </div>
  </div>
  <div v-show="activeTab == 'ticket3D'">
    <h2 class="text-2xl">3D 渲染仍在开发中，敬请期待！</h2>
    <!-- <div class="ticket-container">
      <canvas ref="ticket3DCanvas" :width="canvasWidth" :height="canvasHeight"></canvas>
    </div> -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { pinyin } from 'pinyin-pro'
import QRCode from 'qrcode'
import type { TicketStyleConfig, StyleFieldGroup } from '@/types'
import {
  drawCustomText,
  getTextWidth,
  drawParagraph,
  drawTrapezoid,
  drawRoundRect,
  drawDiagonalPattern,
  type TrapezoidConfig,
} from '@/utils/canvas'
import { buildFontString } from '@/utils/font'
import { maskedId, getStationSpacing } from '@/utils/common'
import CRHImage from '@/assets/img/CRH.jpg'
import Tabs from '@/components/common/Tabs.vue'

const props = defineProps<{
  ticketInfo: Record<string, any>
  styleConfig?: TicketStyleConfig
}>()

/**
 * 报销凭证默认样式配置
 */
const defaultStyleConfig: TicketStyleConfig = {
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
}

/**
 * 样式配置字段分组
 */
const styleFieldGroups: StyleFieldGroup[] = [
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
]

// 暴露配置供外部使用
defineExpose({
  defaultStyleConfig,
  styleFieldGroups,
})

// 合并默认配置和传入配置
const mergedConfig = computed<TicketStyleConfig>(() => {
  if (!props.styleConfig) return defaultStyleConfig
  return {
    ...defaultStyleConfig,
    ...props.styleConfig,
    fonts: {
      ...defaultStyleConfig.fonts,
      ...props.styleConfig.fonts,
    },
    wearEffect: {
      ...defaultStyleConfig.wearEffect,
      ...props.styleConfig.wearEffect,
    },
  }
})

const tabs = ref([
  { label: '2D', key: 'ticket2D' },
  { label: '3D', key: 'ticket3D' },
])

const activeTab = ref('ticket2D')

const protrusionHeight = 40
const protrusionWidth = 10
const canvasWidth = 876
const canvasHeight = 539
const leftOffset = 80
let topOffset = 20

const ticketCanvas = ref<HTMLCanvasElement>()
const ticketBackCanvas = ref<HTMLCanvasElement>()

const destroyCanvas = () => {
  const canvas = ticketCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  ctx?.clearRect(0, 0, canvas.width, canvas.height)
}

const drawTicket = () => {
  destroyCanvas()
  const canvas = ticketCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const backgroundImage = new Image()
  backgroundImage.src = CRHImage
  backgroundImage.onload = () => {
    const paddingX = 40
    const paddingY = 100
    const imgWidth = canvasWidth - 2 * paddingX
    const imgHeight = canvasHeight - 2 * paddingY
    const centerX = paddingX
    const centerY = paddingY

    ctx.globalAlpha = 0.05
    ctx.drawImage(backgroundImage, centerX, centerY, imgWidth, imgHeight)
    ctx.globalAlpha = 1.0

    drawTicketDetails(canvas, ctx)
  }
}

const drawTicketDetails = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
  const fonts = mergedConfig.value.fonts
  const wearEffect = mergedConfig.value.wearEffect

  // 封装带磨损效果的文本绘制
  const drawText = (
    text: string,
    x: number,
    y: number,
    spacing: number = 0,
    color: number[] = [0, 0, 0],
  ) => {
    drawCustomText(ctx, text, x, y, spacing, color, wearEffect)
  }

  // 圆角矩形
  drawRoundRect(ctx, 20, 10, canvasWidth - 40, canvasHeight - 20, 20, 'rgba(173, 216, 230, .2)')

  // 两边凸出的梯形小块
  ctx.fillStyle = 'rgba(173, 216, 230, .2)'
  drawTrapezoid(ctx, 10, canvasHeight * 0.2, protrusionWidth, protrusionHeight, 5, 'left')
  drawTrapezoid(
    ctx,
    canvasWidth - 10,
    canvasHeight * 0.2,
    protrusionWidth,
    protrusionHeight,
    5,
    'right',
  )
  drawTrapezoid(ctx, 10, canvasHeight * 0.8, protrusionWidth, protrusionHeight, 5, 'left')
  drawTrapezoid(
    ctx,
    canvasWidth - 10,
    canvasHeight * 0.8,
    protrusionWidth,
    protrusionHeight,
    5,
    'right',
  )

  // 斜线纹理 - 使用优化后的裁剪方案，确保不超出圆角边界且覆盖梯形
  const trapezoids: TrapezoidConfig[] = [
    { x: 10, y: canvasHeight * 0.2, width: protrusionWidth, height: protrusionHeight, offset: 5, direction: 'left' },
    { x: canvasWidth - 10, y: canvasHeight * 0.2, width: protrusionWidth, height: protrusionHeight, offset: 5, direction: 'right' },
    { x: 10, y: canvasHeight * 0.8, width: protrusionWidth, height: protrusionHeight, offset: 5, direction: 'left' },
    { x: canvasWidth - 10, y: canvasHeight * 0.8, width: protrusionWidth, height: protrusionHeight, offset: 5, direction: 'right' },
  ]

  drawDiagonalPattern(
    ctx,
    canvasWidth,
    canvasHeight,
    20,           // rectX
    10,           // rectY
    canvasWidth - 40,  // rectWidth
    canvasHeight - 20, // rectHeight
    20,           // radius
    trapezoids,
    'rgba(173, 216, 230, .5)', // strokeStyle
    1,            // lineWidth
    5,            // spacing
  )

  // 下方略深的蓝色区域
  ctx.fillStyle = '#94cae0'
  ctx.beginPath()
  ctx.moveTo(30, canvasHeight * 0.9)
  ctx.lineTo(canvasWidth - 20, canvasHeight * 0.9)
  ctx.lineTo(canvasWidth - 20, canvasHeight - 20)
  ctx.arcTo(canvasWidth - 20, canvasHeight - 10, canvasWidth - 50, canvasHeight - 10, 20)
  ctx.lineTo(50, canvasHeight - 10)
  ctx.arcTo(20, canvasHeight - 10, 20, canvasHeight - 30, 20)
  ctx.lineTo(20, canvasHeight * 0.9)
  ctx.closePath()
  ctx.fill()

  // 创建水印 CR
  const watermarkCanvas = document.createElement('canvas')
  watermarkCanvas.width = 16 // 调整宽度
  watermarkCanvas.height = 18 // 调整高度
  const watermarkCtx = watermarkCanvas.getContext('2d') as CanvasRenderingContext2D
  watermarkCtx.font = '8px Arial'
  watermarkCtx.fillStyle = '#94cae0'
  watermarkCtx.fillText('CR', 5, 12) // 调整文本位置

  const pattern = ctx.createPattern(watermarkCanvas, 'repeat') as CanvasPattern
  ctx.fillStyle = pattern
  ctx.fillRect(20, canvasHeight * 0.88, canvasWidth - 40, 20)

  ctx.fillStyle = '#000'
  // 检票口
  ctx.font = buildFontString(fonts.checkGate.family, fonts.checkGate.size)
  if (props.ticketInfo.checkGate !== '') {
    const checkGateText = '检票:' + props.ticketInfo.checkGate
    const checkGateWidth = getTextWidth(ctx, checkGateText)
    drawText(checkGateText, canvasWidth - checkGateWidth - 100, 60)
    topOffset = 35
  } else {
    topOffset = 20
  }

  // 始发站、车次、目的地
  const startStation = props.ticketInfo.startStation
  const endStation = props.ticketInfo.endStation
  ctx.font = buildFontString(fonts.station.family, fonts.station.size)
  let left = 110
  if (startStation.length == 5) left = 70
  drawText(startStation, left, topOffset + 80, getStationSpacing(startStation))
  left = canvasWidth / 2 + 120
  if (endStation.length == 5) left = canvasWidth / 2 + 80
  drawText(endStation, left, topOffset + 80, getStationSpacing(endStation))

  ctx.font = buildFontString(fonts.stationPinyin.family, fonts.stationPinyin.size)
  let startStationPinyin = pinyin(startStation, { toneType: 'none' }).replace(/ /g, '')
  let endStationPinyin = pinyin(endStation, { toneType: 'none' }).replace(/ /g, '')
  if (startStationPinyin)
    startStationPinyin = startStationPinyin[0].toUpperCase() + startStationPinyin.slice(1)
  if (endStationPinyin)
    endStationPinyin = endStationPinyin[0].toUpperCase() + endStationPinyin.slice(1)
  const startStationPinyinWidth = getTextWidth(ctx, startStationPinyin)
  const endStationPinyinWidth = getTextWidth(ctx, endStationPinyin)

  drawText(startStationPinyin, 200 - startStationPinyinWidth / 2, topOffset + 115, -1)
  drawText(
    endStationPinyin,
    canvasWidth / 2 + 220 - endStationPinyinWidth / 2,
    topOffset + 115,
    -1,
  )

  ctx.font = buildFontString(fonts.trainNumber.family, fonts.trainNumber.size)
  const trainNumber = props.ticketInfo.trainNumber
  const trainNumberWidth = getTextWidth(ctx, trainNumber) + 2 * trainNumber.length
  drawText(trainNumber, canvasWidth / 2 - trainNumberWidth / 2, topOffset + 75, 2)
  const arrowStartX = canvasWidth / 2 - 60
  const arrowStartY = topOffset + 82
  const arrowLength = 120
  const arrowHeight = 5
  const arrowWidth = 20

  ctx.beginPath()
  ctx.moveTo(arrowStartX, arrowStartY)
  ctx.lineTo(arrowStartX + arrowLength, arrowStartY)
  ctx.lineTo(arrowStartX + arrowLength - arrowWidth, arrowStartY - arrowHeight)
  ctx.stroke()

  ctx.font = buildFontString(fonts.seatInfo.family, fonts.seatInfo.size)
  drawText('站', 270, topOffset + 75)
  drawText('站', canvasWidth - 160, topOffset + 75)

  // 日期、时间
  ctx.font = buildFontString(fonts.date.family, fonts.date.size)
  const date = new Date(props.ticketInfo.date)
  const year = date.getFullYear().toString()
  const month =
    date.getMonth() + 1 > 9 ? (date.getMonth() + 1).toString() : '0' + (date.getMonth() + 1)
  const day = date.getDate() > 9 ? date.getDate().toString() : '0' + date.getDate()
  drawText(year, leftOffset + 10, topOffset + 170, -2)
  drawText(month, leftOffset + 118, topOffset + 170, -2)
  drawText(day, leftOffset + 180, topOffset + 170, -2)
  drawText(props.ticketInfo.time, leftOffset + 248, topOffset + 170, -2)

  // 座位号、车厢号、座位类型
  const seatCarriage = props.ticketInfo.seatCarriage.toString().padStart(2, '0')
  let seatNumber = props.ticketInfo.seatNumber.toString().padStart(3, '0')
  drawText(seatCarriage, canvasWidth / 2 + 120, topOffset + 170, -2)
  // 如果最后一位是字母，进行处理
  if (isNaN(parseInt(seatNumber.slice(-1)))) {
    const seatNumberLast = seatNumber.slice(-1)
    seatNumber = seatNumber.slice(0, -1)
    drawText(seatNumber, canvasWidth / 2 + 182, topOffset + 170, -3)
    ctx.font = buildFontString(fonts.seatInfo.family, fonts.seatInfo.size - 8)
    drawText(seatNumberLast, canvasWidth / 2 + 182 + 38, topOffset + 167, -3)
  } else {
    drawText(seatNumber, canvasWidth / 2 + 182, topOffset + 170, -3)
  }

  ctx.font = buildFontString(fonts.seatInfo.family, fonts.seatInfo.size)
  // drawText(props.ticketInfo.extraInfo ?? '', 180, topOffset + 210);
  const seatType =
    props.ticketInfo.seatTypeCustom == ''
      ? props.ticketInfo.seatType
      : props.ticketInfo.seatTypeCustom
  const seatTypeWidth = getTextWidth(ctx, seatType)
  drawText(seatType, 650 - seatTypeWidth / 2, topOffset + 210)

  ctx.font = buildFontString(fonts.label.family, fonts.label.size)
  drawText('年', leftOffset + 90, topOffset + 164)
  drawText('月', leftOffset + 155, topOffset + 164)
  drawText('日', leftOffset + 218, topOffset + 164)
  drawText('开', leftOffset + 345, topOffset + 164)
  drawText('车', leftOffset + 515, topOffset + 164)
  drawText('号', leftOffset + 594, topOffset + 164)

  // 票价、额外信息
  ctx.font = buildFontString(fonts.price.family, fonts.price.size)
  drawText('￥', leftOffset + 15, topOffset + 215)
  const price = (props.ticketInfo.price || 0).toFixed(1).toString()
  const priceWidth = getTextWidth(ctx, price)
  drawText(price, leftOffset + 50, topOffset + 215, -2)
  ctx.font = buildFontString(fonts.label.family, fonts.label.size)
  drawText('元', leftOffset + 42 + priceWidth, topOffset + 210)
  ctx.font = buildFontString(fonts.seatInfo.family, fonts.seatInfo.size + 4)
  if (props.ticketInfo.isStudent) {
    const studentText = '学'
    const studentWidth = getTextWidth(ctx, studentText)
    drawText(studentText, canvasWidth / 2 - studentWidth - 60, topOffset + 210)

    ctx.beginPath()
    ctx.arc(canvasWidth / 2 - studentWidth / 2 - 60, topOffset + 198, 17, 0, 2 * Math.PI)
    ctx.stroke()

    const discountText = '惠'
    const discountWidth = getTextWidth(ctx, discountText)
    drawText(discountText, canvasWidth / 2 - discountWidth - 10, topOffset + 210)

    ctx.beginPath()
    ctx.arc(canvasWidth / 2 - discountWidth / 2 - 10, topOffset + 198, 17, 0, 2 * Math.PI)
    ctx.stroke()
  } else if (props.ticketInfo.isDiscount) {
    const discountText = '惠'
    const discountWidth = getTextWidth(ctx, discountText)
    drawText(discountText, canvasWidth / 2 - discountWidth - 20, topOffset + 210)

    ctx.beginPath()
    ctx.arc(canvasWidth / 2 - discountWidth / 2 - 20, topOffset + 198, 17, 0, 2 * Math.PI)
    ctx.stroke()
  }

  // 仅供报销使用
  ctx.font = buildFontString(fonts.seatInfo.family, fonts.seatInfo.size + 4)
  drawText('仅供报销使用', leftOffset, 330)

  ctx.font = buildFontString(fonts.passenger.family, fonts.passenger.size)

  // 身份证号码和姓名
  const id = maskedId(props.ticketInfo.passengerId)
  const idWidth = getTextWidth(ctx, id)
  drawText(id, leftOffset, 370, -3)
  ctx.font = buildFontString(fonts.passenger.family, fonts.passenger.size - 4)
  drawText(props.ticketInfo.passengerName, leftOffset + idWidth + 10 - 48, 370)

  // 虚线框
  const dashWidth = 440
  const dashHeight = 70
  const dashLeft = 108
  ctx.font = buildFontString(fonts.notice.family, fonts.notice.size)
  ctx.setLineDash([8, 2])
  ctx.strokeRect(dashLeft, 380, dashWidth, dashHeight)
  ctx.setLineDash([])
  // ctx.fillText('买票请到12306 发货请到95306 中国铁路祝您旅途愉快', 50, 310);
  const text1 = '报销凭证 遗失不补'
  const text1Width = getTextWidth(ctx, text1)
  const text2 = '退票改签时须交回车站'
  const text2Width = getTextWidth(ctx, text2)
  drawText(text1, dashLeft + dashWidth / 2 - text1Width / 2, 408)
  drawText(text2, dashLeft + dashWidth / 2 - text2Width / 2, 440)

  // 二维码，暂时使用 GitHub 链接，车票二维码貌似是一个加密串
  const qrCodeText = 'https://github.com/FoskyM/train-ticket-generator'
  const qrCodeWidth = 120
  const qrCodeOptions = {
    width: qrCodeWidth,
    margin: 0,
    color: {
      dark: '#000000b0', // 二维码颜色
      light: '#FFFFFF00', // 背景透明
    },
  }
  QRCode.toDataURL(qrCodeText, qrCodeOptions, (err, url) => {
    if (err) throw err
    const qrImage = new Image()
    qrImage.src = url
    qrImage.onload = () => {
      ctx.drawImage(qrImage, dashLeft + dashWidth + 60, 330, qrCodeWidth, qrCodeWidth)
    }
  })

  // 车票ID和售票点
  ctx.font = buildFontString(fonts.ticketId.family, fonts.ticketId.size)
  const bottomOffset = Math.floor(Math.random() * 25) + 10
  drawText(props.ticketInfo.id + ' JM', leftOffset, canvasHeight - 50 + bottomOffset)
  // ctx.fillText(props.ticketInfo.ticketOffice, 300, canvasHeight - 28);

  // 左上角红色 ID
  ctx.fillStyle = 'rgba(255, 0, 0, 0.5)'
  ctx.font = buildFontString(fonts.redId.family, fonts.redId.size)
  ctx.fillText(props.ticketInfo.redId, 80, 65)
}

const drawTicketBack = () => {
  const canvas = ticketBackCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  const fonts = mergedConfig.value.fonts
  const wearEffect = mergedConfig.value.wearEffect

  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // 圆角矩形
  drawRoundRect(ctx, 20, 10, canvasWidth - 40, canvasHeight - 20, 20, 'rgba(0, 0, 0, .9)')
  // 两边凸出的梯形小块
  drawTrapezoid(ctx, 10, canvasHeight * 0.2, protrusionWidth, protrusionHeight, 5, 'left')
  drawTrapezoid(
    ctx,
    canvasWidth - 10,
    canvasHeight * 0.2,
    protrusionWidth,
    protrusionHeight,
    5,
    'right',
  )
  drawTrapezoid(ctx, 10, canvasHeight * 0.8, protrusionWidth, protrusionHeight, 5, 'left')
  drawTrapezoid(
    ctx,
    canvasWidth - 10,
    canvasHeight * 0.8,
    protrusionWidth,
    protrusionHeight,
    5,
    'right',
  )

  ctx.font = buildFontString(fonts.backTitle.family, fonts.backTitle.size)
  const text = '报销凭证使用须知'
  const textWidth = getTextWidth(ctx, text)
  const color = [180, 180, 180]
  drawCustomText(ctx, text, canvasWidth / 2 - textWidth / 2, 80, 0, color, wearEffect)

  ctx.font = buildFontString(fonts.backContent.family, fonts.backContent.size)
  const paragraph =
    '☆购票后如需报销凭证的，应在开车前或乘车日期之日起180日以内(含当日)，持购票时所使用的有效身份证件原件到车站售票窗口、自动售票机领取。☆退票后如需退票费报销凭证，应在办理之日起180天以内(含当日)，持购票时所使用的有效身份证件原件到车站退票窗口领取。☆报销凭证开具后请妥善保管，丢失后将无法办理补办申领手续。☆已领取报销凭证的车票办理改签、退票或退款手续时，须交回报销凭证方可办理。☆报销凭证不能作为乘车凭证使用。☆未尽事宜见《国铁集团铁路旅客运输规程》等有关规定和车站公告。跨境旅客事宜见铁路跨境旅客相关运输组织规则和车站公告。'

  const paragraphs = paragraph
    .split('☆')
    .filter((p) => p !== '')
    .map((p) => '☆' + p)
  drawParagraph(ctx, paragraphs, 40, 45, 140, 35, canvasWidth - 90, -1, color, wearEffect)
}

onMounted(() => {
  drawTicket()
  drawTicketBack()
})

watch(
  [() => props.ticketInfo, () => props.styleConfig],
  () => {
    drawTicket()
    drawTicketBack()
  },
  { deep: true },
)
</script>

<style scoped>
.ticket-container {
  @apply flex justify-center items-center w-full;
}
.canvas-aspect {
  width: 100%;
  aspect-ratio: 876 / 539;
  position: relative;
}
.canvas-aspect canvas {
  width: 100%;
  height: 100%;
  display: block;
  position: absolute;
  left: 0;
  top: 0;
}
</style>
