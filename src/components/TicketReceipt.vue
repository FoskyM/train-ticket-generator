<template>
  <div class="tab">
    <div
      class="tab-item"
      v-for="tab in tabs"
      :key="tab.key"
      @click="activeTab = tab.key"
      :class="{ active: activeTab === tab.key }"
    >
      {{ tab.label }}
    </div>
  </div>

  <div v-show="activeTab == 'ticket2D'">
    <div class="ticket-container">
      <canvas ref="ticketCanvas" :width="canvasWidth" :height="canvasHeight"></canvas>
    </div>
    <div class="ticket-container">
      <canvas ref="ticketBackCanvas" :width="canvasWidth" :height="canvasHeight"></canvas>
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
import CRHImage from '@/assets/img/CRH.jpg'

const props = defineProps({
  ticketInfo: {
    type: Object,
    required: true,
  },
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

  // 斜线纹理部分，需要改进，斜线不要超出圆角、梯形小块应有斜线

  // 设置线条样式
  ctx.strokeStyle = 'rgba(173, 216, 230, .5)'
  ctx.lineWidth = 1

  const angle = -Math.PI / 6
  const spacing = 5 // 斜线之间的间距
  let bottomStartX = 0
  for (let i = 20; i < canvas.width - 20; i += spacing) {
    const startX = i
    const startY = 10
    let endX = startX + canvas.height * Math.tan(angle)
    let endY = canvas.height - 10

    if (endX < 20) {
      endX = 20 + 1
      endY = startY + (startX - 30) / Math.tan(-angle)
    }
    ctx.beginPath()
    ctx.moveTo(startX, startY)
    ctx.lineTo(endX, endY) // 终点计算
    ctx.stroke()

    bottomStartX = endX
  }

  for (let i = bottomStartX + 5; i < canvas.width - 20; i += spacing) {
    const startX = i
    const startY = canvas.height - 10
    let endX = startX + canvas.height * Math.tan(-angle)
    let endY = 10

    if (endX > canvas.width - 20) {
      endX = canvas.width - 20
      endY = canvas.height - 10 - (canvas.width - 30 - startX) / Math.tan(-angle)
    }

    ctx.beginPath()
    ctx.moveTo(startX, startY)
    ctx.lineTo(endX, endY) // 终点计算
    ctx.stroke()
  }

  ctx.strokeStyle = '#000'

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
  ctx.font = '24px SimSun'
  if (props.ticketInfo.checkGate !== '') {
    const checkGateText = '检票:' + props.ticketInfo.checkGate
    const checkGateWidth = getTextWidth(ctx, checkGateText)
    drawCustomText(ctx, checkGateText, canvasWidth - checkGateWidth - 100, 60)
    topOffset = 35
  } else {
    topOffset = 20
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
  drawCustomText(
    ctx,
    endStationPinyin,
    canvasWidth / 2 + 220 - endStationPinyinWidth / 2,
    topOffset + 115,
    -1,
  )

  ctx.font = '42px Simsun'
  const trainNumber = props.ticketInfo.trainNumber
  const trainNumberWidth = getTextWidth(ctx, trainNumber) + 2 * trainNumber.length
  drawCustomText(ctx, trainNumber, canvasWidth / 2 - trainNumberWidth / 2, topOffset + 75, 2)
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

  ctx.font = '28px Simsun'
  drawCustomText(ctx, '站', 270, topOffset + 75)
  drawCustomText(ctx, '站', canvasWidth - 160, topOffset + 75)

  // 日期、时间
  ctx.font = '40px Simhei'
  const date = new Date(props.ticketInfo.date)
  const year = date.getFullYear().toString()
  const month =
    date.getMonth() + 1 > 9 ? (date.getMonth() + 1).toString() : '0' + (date.getMonth() + 1)
  const day = date.getDate() > 9 ? date.getDate().toString() : '0' + date.getDate()
  drawCustomText(ctx, year, leftOffset + 10, topOffset + 170, -2)
  drawCustomText(ctx, month, leftOffset + 118, topOffset + 170, -2)
  drawCustomText(ctx, day, leftOffset + 180, topOffset + 170, -2)
  drawCustomText(ctx, props.ticketInfo.time, leftOffset + 248, topOffset + 170, -2)

  // 座位号、车厢号、座位类型
  const seatCarriage = props.ticketInfo.seatCarriage.padStart(2, '0')
  let seatNumber = props.ticketInfo.seatNumber.padStart(3, '0')
  drawCustomText(ctx, seatCarriage, canvasWidth / 2 + 120, topOffset + 170, -2)
  // 如果最后一位是字母，进行处理
  if (isNaN(parseInt(seatNumber.slice(-1)))) {
    const seatNumberLast = seatNumber.slice(-1)
    seatNumber = seatNumber.slice(0, -1)
    drawCustomText(ctx, seatNumber, canvasWidth / 2 + 182, topOffset + 170, -3)
    ctx.font = '32px SimSun'
    drawCustomText(ctx, seatNumberLast, canvasWidth / 2 + 182 + 38, topOffset + 167, -3)
  } else {
    drawCustomText(ctx, seatNumber, canvasWidth / 2 + 182, topOffset + 170, -3)
  }

  ctx.font = '28px SimSun'
  // drawCustomText(ctx, props.ticketInfo.extraInfo ?? '', 180, topOffset + 210);
  const seatType =
    props.ticketInfo.seatTypeCustom == ''
      ? props.ticketInfo.seatType
      : props.ticketInfo.seatTypeCustom
  const seatTypeWidth = getTextWidth(ctx, seatType)
  drawCustomText(ctx, seatType, 650 - seatTypeWidth / 2, topOffset + 210)

  ctx.font = '21px FangSong'
  drawCustomText(ctx, '年', leftOffset + 90, topOffset + 164)
  drawCustomText(ctx, '月', leftOffset + 155, topOffset + 164)
  drawCustomText(ctx, '日', leftOffset + 218, topOffset + 164)
  drawCustomText(ctx, '开', leftOffset + 345, topOffset + 164)
  drawCustomText(ctx, '车', leftOffset + 515, topOffset + 164)
  drawCustomText(ctx, '号', leftOffset + 594, topOffset + 164)

  // 票价、额外信息
  ctx.font = '40px SimSun'
  drawCustomText(ctx, '￥', leftOffset + 15, topOffset + 215)
  ctx.font = '40px Simhei'
  const price = (props.ticketInfo.price || 0).toFixed(1).toString()
  const priceWidth = getTextWidth(ctx, price)
  drawCustomText(ctx, price, leftOffset + 50, topOffset + 215, -2)
  ctx.font = '21px FangSong'
  drawCustomText(ctx, '元', leftOffset + 42 + priceWidth, topOffset + 210)
  ctx.font = '32px SimSun'
  if (props.ticketInfo.isStudent) {
    const studentText = '学'
    const studentWidth = getTextWidth(ctx, studentText)
    drawCustomText(ctx, studentText, canvasWidth / 2 - studentWidth - 60, topOffset + 210)

    ctx.beginPath()
    ctx.arc(canvasWidth / 2 - studentWidth / 2 - 60, topOffset + 198, 17, 0, 2 * Math.PI)
    ctx.stroke()

    const discountText = '惠'
    const discountWidth = getTextWidth(ctx, discountText)
    drawCustomText(ctx, discountText, canvasWidth / 2 - discountWidth - 10, topOffset + 210)

    ctx.beginPath()
    ctx.arc(canvasWidth / 2 - discountWidth / 2 - 10, topOffset + 198, 17, 0, 2 * Math.PI)
    ctx.stroke()
  } else if (props.ticketInfo.isDiscount) {
    const discountText = '惠'
    const discountWidth = getTextWidth(ctx, discountText)
    drawCustomText(ctx, discountText, canvasWidth / 2 - discountWidth - 20, topOffset + 210)

    ctx.beginPath()
    ctx.arc(canvasWidth / 2 - discountWidth / 2 - 20, topOffset + 198, 17, 0, 2 * Math.PI)
    ctx.stroke()
  }

  ctx.font = '20px Arial'
  // 限乘当日当次车
  // ctx.fillText('限乘当日当次车', 40, 200);

  // 仅供报销使用
  ctx.font = '32px SimSun'
  drawCustomText(ctx, '仅供报销使用', leftOffset, 330)

  ctx.font = '40px FangSong'

  // 身份证号码和姓名
  const id = maskedId(props.ticketInfo.passengerId)
  const idWidth = getTextWidth(ctx, id)
  drawCustomText(ctx, id, leftOffset, 370, -3)
  ctx.font = '36px SimSun'
  drawCustomText(ctx, props.ticketInfo.passengerName, leftOffset + idWidth + 10 - 48, 370)

  // 虚线框
  const dashWidth = 440
  const dashHeight = 70
  const dashLeft = 108
  ctx.font = ' 27px FangSong'
  ctx.setLineDash([8, 2])
  ctx.strokeRect(dashLeft, 380, dashWidth, dashHeight)
  ctx.setLineDash([])
  // ctx.fillText('买票请到12306 发货请到95306 中国铁路祝您旅途愉快', 50, 310);
  const text1 = '报销凭证 遗失不补'
  const text1Width = getTextWidth(ctx, text1)
  const text2 = '退票改签时须交回车站'
  const text2Width = getTextWidth(ctx, text2)
  drawCustomText(ctx, text1, dashLeft + dashWidth / 2 - text1Width / 2, 408)
  drawCustomText(ctx, text2, dashLeft + dashWidth / 2 - text2Width / 2, 440)

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
  ctx.font = ' 24px FangSong'
  const bottomOffset = Math.floor(Math.random() * 25) + 10
  drawCustomText(ctx, props.ticketInfo.id + ' JM', leftOffset, canvasHeight - 50 + bottomOffset)
  // ctx.fillText(props.ticketInfo.ticketOffice, 300, canvasHeight - 28);

  // 左上角红色 ID
  ctx.fillStyle = 'rgba(255, 0, 0, 0.5)'
  ctx.font = ' 42px Arial'
  ctx.fillText(props.ticketInfo.redId, 80, 65)
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

  ctx.font = '40px SimHei'
  const text = '报销凭证使用须知'
  const textWidth = getTextWidth(ctx, text)
  const color = [180, 180, 180]
  drawCustomText(ctx, text, canvasWidth / 2 - textWidth / 2, 80, 0, color)

  ctx.font = '25px SimSun'
  const paragraph =
    '☆购票后如需报销凭证的，应在开车前或乘车日期之日起180日以内(含当日)，持购票时所使用的有效身份证件原件到车站售票窗口、自动售票机领取。☆退票后如需退票费报销凭证，应在办理之日起180天以内(含当日)，持购票时所使用的有效身份证件原件到车站退票窗口领取。☆报销凭证开具后请妥善保管，丢失后将无法办理补办申领手续。☆已领取报销凭证的车票办理改签、退票或退款手续时，须交回报销凭证方可办理。☆报销凭证不能作为乘车凭证使用。☆未尽事宜见《国铁集团铁路旅客运输规程》等有关规定和车站公告。跨境旅客事宜见铁路跨境旅客相关运输组织规则和车站公告。'

  const paragraphs = paragraph
    .split('☆')
    .filter((p) => p !== '')
    .map((p) => '☆' + p)
  drawParagraph(ctx, paragraphs, 40, 45, 140, 35, canvasWidth - 90, -1, color)
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
  @apply flex justify-center items-center p-4;
}
</style>
