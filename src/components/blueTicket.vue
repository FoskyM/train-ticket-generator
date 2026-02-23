<template>
<!-- 蓝票（实名车票） -->
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
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { pinyin } from 'pinyin-pro'
import QRCode from 'qrcode'
import {
  drawCustomText,
  getTextWidth,
  drawParagraph,
  drawTrapezoid,
  drawRoundRect,
} from '@/utils/canvas'
import { maskedId, getStationSpacing } from '@/utils/common'
import CRHImage from '@/assets/img/blueTicket.png'
import Tabs from '@/components/common/Tabs.vue'

const props = defineProps({
  ticketInfo: {
    type: Object,
    required: true,
  },
})

const activeTab = ref('ticket2D')

const protrusionHeight = 40
const protrusionWidth = 10
const canvasWidth = 856
const canvasHeight = 540
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
    const paddingX = canvasWidth
    const paddingY = canvasHeight
    const imgWidth = canvasWidth - 2 * paddingX
    const imgHeight = canvasHeight - 2 * paddingY
    const centerX = paddingX
    const centerY = paddingY

    ctx.globalAlpha = 1.0
    ctx.drawImage(backgroundImage, centerX, centerY, imgWidth, imgHeight)

    drawTicketDetails(canvas, ctx)
  }
}

const drawTicketDetails = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
  // 票面信息绘制

  // 左上角红色 ID
  ctx.fillStyle = 'rgba(255, 0, 0, 0.5)'
  ctx.font = ' 42px Arial'
  ctx.fillText(props.ticketInfo.redId, 80, 70)

  // 检票口
  ctx.font = '32px SimSun'
  if (props.ticketInfo.checkGate !== '') {
    const checkGateText = '检票:' + props.ticketInfo.checkGate
    const checkGateWidth = getTextWidth(ctx, checkGateText)
    drawCustomText(ctx, checkGateText, canvasWidth - checkGateWidth - 100, 65)
    topOffset = 45
  } else {
    topOffset = 35
  }

  // 始发站、车次、目的地
  const startStation = props.ticketInfo.startStation
  const endStation = props.ticketInfo.endStation
  ctx.font = '45px SimHei'
  let left = 110
  if (startStation.length == 5) left = 70
  drawCustomText(ctx, startStation, left, topOffset + 80, getStationSpacing(startStation))
  left = canvasWidth / 2 + 120
  if (endStation.length == 5) left = canvasWidth / 2 + 80
  drawCustomText(ctx, endStation, left, topOffset + 80, getStationSpacing(endStation))

  ctx.font = '30px FangSong'
  let startStationPinyin = pinyin(startStation, { toneType: 'none' }).replace(/ /g, '')
  let endStationPinyin = pinyin(endStation, { toneType: 'none' }).replace(/ /g, '')
  if (startStationPinyin)
    startStationPinyin = startStationPinyin[0].toUpperCase() + startStationPinyin.slice(1)
  if (endStationPinyin)
    endStationPinyin = endStationPinyin[0].toUpperCase() + endStationPinyin.slice(1)
  const startStationPinyinWidth = getTextWidth(ctx, startStationPinyin)
  const endStationPinyinWidth = getTextWidth(ctx, endStationPinyin)

  drawCustomText(ctx, startStationPinyin, 200 - startStationPinyinWidth / 2, topOffset + 115, -1)
  drawCustomText(ctx, endStationPinyin, canvasWidth / 2 + 220 - endStationPinyinWidth / 2, topOffset + 115, -1)

  ctx.font = '42px Simsun'
  const trainNumber = props.ticketInfo.trainNumber
  const trainNumberWidth = getTextWidth(ctx, trainNumber) + 2 * trainNumber.length
  drawCustomText(ctx, trainNumber, canvasWidth / 2 - trainNumberWidth / 2, topOffset + 85, 2)
  const arrowStartX = canvasWidth / 2 - 63
  const arrowStartY = topOffset + 100
  const arrowLength = 126
  const arrowHeight = 5
  const arrowWidth = 15

  ctx.beginPath()
  ctx.moveTo(arrowStartX, arrowStartY)
  ctx.lineTo(arrowStartX + arrowLength, arrowStartY)
  ctx.lineTo(arrowStartX + arrowLength - arrowWidth, arrowStartY - arrowHeight)
  ctx.stroke()

  ctx.font = '30px Simsun'
  drawCustomText(ctx, '站', 270, topOffset + 76)
  drawCustomText(ctx, '站', canvasWidth - 160, topOffset + 76)

  // 日期、时间
  ctx.font = '40px Simhei'
  const date = new Date(props.ticketInfo.date)
  const year = date.getFullYear().toString()
  const month =
    date.getMonth() + 1 > 9 ? (date.getMonth() + 1).toString() : '0' + (date.getMonth() + 1)
  const day = date.getDate() > 9 ? date.getDate().toString() : '0' + date.getDate()
  drawCustomText(ctx, year, leftOffset + 10, topOffset + 160, -2)
  drawCustomText(ctx, month, leftOffset + 118, topOffset + 160, -2)
  drawCustomText(ctx, day, leftOffset + 180, topOffset + 160, -2)
  drawCustomText(ctx, props.ticketInfo.time, leftOffset + 248, topOffset + 160, -2)

  // 座位号、车厢号、座位类型
  const seatCarriage = props.ticketInfo.seatCarriage.toString().padStart(2, '0')
  let seatNumber = props.ticketInfo.seatNumber.toString().padStart(3, '0')
  drawCustomText(ctx, seatCarriage, canvasWidth / 2 + 120, topOffset + 160, -2)
  // 如果最后一位是字母，进行处理
  if (seatNumber === '000') {
    ctx.font = '32px FangSong GB2312'
    drawCustomText(ctx, '无座', canvasWidth / 2 + 182, topOffset + 157, -3)
  }
  else if (isNaN(parseInt(seatNumber.slice(-1)))) {
    const seatNumberLast = seatNumber.slice(-1)
    seatNumber = seatNumber.slice(0, -1)
    drawCustomText(ctx, seatNumber, canvasWidth / 2 + 182, topOffset + 160, -3)
    ctx.font = '32px SimSun'
    drawCustomText(ctx, seatNumberLast, canvasWidth / 2 + 182 + 38, topOffset + 157, -3)
  } 
    else {
    drawCustomText(ctx, seatNumber, canvasWidth / 2 + 182, topOffset + 160, -3)
  }

  ctx.font = '28px FangSong GB2312'
  const seatType = props.ticketInfo.seatType
  const seatTypeWidth = getTextWidth(ctx, seatType)
  drawCustomText(ctx, seatType, 650 - seatTypeWidth / 2, topOffset + 200)

  ctx.font = '21px SimSun'
  drawCustomText(ctx, '年', leftOffset + 90, topOffset + 153)
  drawCustomText(ctx, '月', leftOffset + 155, topOffset + 153)
  drawCustomText(ctx, '日', leftOffset + 218, topOffset + 153)
  drawCustomText(ctx, '开', leftOffset + 345, topOffset + 153)
  drawCustomText(ctx, '车', leftOffset + 515, topOffset + 153)
  if(seatNumber !== '000'){
  drawCustomText(ctx, '号', leftOffset + 594, topOffset + 153)
  }

  // 票价、额外信息
  ctx.font = '40px SimSun'
  drawCustomText(ctx, '¥', leftOffset + 15, topOffset + 205)
  ctx.font = '40px Simhei'
  const price = (props.ticketInfo.price || 0).toFixed(1).toString()
  const priceWidth = getTextWidth(ctx, price)
  drawCustomText(ctx, price, leftOffset + 50, topOffset + 205, -2)
  ctx.font = '21px FangSong'
  drawCustomText(ctx, '元', leftOffset + 42 + priceWidth, topOffset + 200)
  ctx.font = '32px SimSun'
  if (props.ticketInfo.isStudent) {
    const studentText = '学'
    const studentWidth = getTextWidth(ctx, studentText)
    drawCustomText(ctx, studentText, canvasWidth / 2 - studentWidth - 60, topOffset + 200)

    ctx.beginPath()
    ctx.arc(canvasWidth / 2 - studentWidth / 2 - 60, topOffset + 188, 17, 0, 2 * Math.PI)
    ctx.stroke()
  } 
  if (props.ticketInfo.isChild) {
    const childText = '孩'
    const childWidth = getTextWidth(ctx, childText)
    drawCustomText(ctx, childText, canvasWidth / 2 - childWidth - 60, topOffset + 200)

    ctx.beginPath()
    ctx.arc(canvasWidth / 2 - childWidth / 2 - 60, topOffset + 188, 17, 0, 2 * Math.PI)
    ctx.stroke()
  } 
  if (props.ticketInfo.isDiscount) {
    const discountText = '惠'
    const discountWidth = getTextWidth(ctx, discountText)
    drawCustomText(ctx, discountText, canvasWidth / 2 - discountWidth - 20, topOffset + 200)

    ctx.beginPath()
    ctx.arc(canvasWidth / 2 - discountWidth / 2 - 20, topOffset + 188, 17, 0, 2 * Math.PI)
    ctx.stroke()
  }

  ctx.font = '20px Times New Roman'

  // 仅供报销使用
  ctx.font = '32px SimSun'
  drawCustomText(ctx, '限乘当日当次车', leftOffset, 290)

  // 仅供纪念使用
  drawCustomText(ctx, '仅供纪念使用', 340, 330)

  ctx.font = '40px Maxim Sans Regular'
  // 身份证号码和姓名
  const id = maskedId(props.ticketInfo.passengerId)
  const idWidth = getTextWidth(ctx, id)
  drawCustomText(ctx, id, leftOffset, 380, -3)
  ctx.font = '36px SimSun'
  drawCustomText(ctx, props.ticketInfo.passengerName, leftOffset + idWidth + 10 - 48, 380)

  // 虚线框
  const dashWidth = 490
  const dashHeight = 74
  const dashLeft = 108
  ctx.font = ' 28px SimSun'
  ctx.setLineDash([13.3, 4.4])
  ctx.strokeRect(dashLeft, 394, dashWidth, dashHeight)
  ctx.setLineDash([])
  const text1 = '买票请到12306 发货请到95306'
  const text1Width = getTextWidth(ctx, text1)
  const text2 = '中国铁路祝您旅途愉快'
  const text2Width = getTextWidth(ctx, text2)
  drawCustomText(ctx, text1, dashLeft + dashWidth / 2 - text1Width / 2, 424)
  drawCustomText(ctx, text2, dashLeft + dashWidth / 2 - text2Width / 2, 459)

  // 二维码，真实车票二维码使用AES加密
  const qrCodeText = props.ticketInfo.qrCodeId
  const qrCodeWidth = 140
  const qrCodeOptions = {
    width: qrCodeWidth,
    errorCorrectionLevel: 'H',
    maskPattern: 5,
    margin: 0,
    color: {
      dark: '#000000b0', // 二维码颜色
      light: '#FFFFFF00', // 背景透明
    },
  }
  QRCode.toDataURL(qrCodeText, qrCodeOptions as any, (err, url) => {
    if (err) throw err
    const qrImage = new Image()
    qrImage.src = url
    qrImage.onload = () => {
      ctx.drawImage(qrImage, dashLeft + dashWidth + 68, 328, qrCodeWidth, qrCodeWidth)
    }
  })

  // 车票ID和售票点
  ctx.font = ' 30px FangSong'
  const TicketID = props.ticketInfo.id
  const IDWidth = getTextWidth(ctx, TicketID)
  const bottomOffset = 15
  drawCustomText(ctx, props.ticketInfo.id, leftOffset, canvasHeight - 50 + bottomOffset)
    ctx.font = ' 30px FangSong GB2312'
  drawCustomText(ctx, props.ticketInfo.ticketOffice + '售', leftOffset + IDWidth + 30, canvasHeight - 50 + bottomOffset)

}

const drawTicketBack = () => {
  const canvas = ticketBackCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

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

  // 乘车须知
  ctx.font = '35px FangSong GB2312'
  const text = '乘车须知：'
  const textWidth = getTextWidth(ctx, text)
  const color = [180, 180, 180]
  drawCustomText(ctx, text, 100, 80, 0, color)

  ctx.font = '25px SimSun'
  const paragraph =
    '☆正在开发中，敬请期待！'

  const paragraphs = paragraph
    .split('☆')
    .filter((p) => p !== '')
    .map((p) => '☆' + p)
  drawParagraph(ctx, paragraphs, 40, 40, 140, 35, canvasWidth - 90, -1, color)
}

onMounted(() => {
  drawTicket()
  drawTicketBack()
})

watch(
  () => props.ticketInfo,
  () => {
    drawTicket()
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
