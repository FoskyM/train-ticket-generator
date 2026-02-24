<template>
<!-- 红票（报销凭证） -->
  <div
    v-show="activeTab == 'ticket2D'"
    class="flex flex-col md:flex-row gap-4 justify-between w-full py-4"
    :style="{ minHeight: canvasHeight}"
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
import redTicket from '@/assets/img/redTicket.png'
import redTicketBack from '@/assets/img/redTicketBack.png'
import Tabs from '@/components/common/Tabs.vue'

const props = defineProps({
  ticketInfo: {
    type: Object,
    required: true,
  },
})

const activeTab = ref('ticket2D')

const canvasWidth = 900
const canvasHeight = 600
const leftOffset = 75
let topOffset = 50

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
  backgroundImage.src = redTicket
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
  ctx.font = ' 44px Calibrib'
  ctx.fillText(props.ticketInfo.redId, 80, 95)

  // 检票口
  ctx.font = '34px SimSun'
  if (props.ticketInfo.checkGate !== '') {
    const checkGateText = '检票:' + props.ticketInfo.checkGate
    const checkGateWidth = getTextWidth(ctx, checkGateText)
    drawCustomText(ctx, checkGateText, canvasWidth - checkGateWidth - 100, 85)
  } 
  
  // 始发站、车次、目的地
  const startStation = props.ticketInfo.startStation
  const endStation = props.ticketInfo.endStation
  ctx.font = '50px SimHei'
  let left = 95
  if (startStation.length == 5) left = 50
  drawCustomText(ctx, startStation, left, topOffset + 90, getStationSpacing(startStation))
  left = canvasWidth / 2 + 120
  if (endStation.length == 5) left = canvasWidth / 2 + 80
  drawCustomText(ctx, endStation, left, topOffset + 90, getStationSpacing(endStation))

  ctx.font = '34px FangSong_GB2312'
  let startStationPinyin = pinyin(startStation, { toneType: 'none' }).replace(/ /g, '')
  let endStationPinyin = pinyin(endStation, { toneType: 'none' }).replace(/ /g, '')
  if (startStationPinyin)
    startStationPinyin = startStationPinyin[0].toUpperCase() + startStationPinyin.slice(1)
  if (endStationPinyin)
    endStationPinyin = endStationPinyin[0].toUpperCase() + endStationPinyin.slice(1)
  const startStationPinyinWidth = getTextWidth(ctx, startStationPinyin)
  const endStationPinyinWidth = getTextWidth(ctx, endStationPinyin)

  drawCustomText(ctx, startStationPinyin, 200 - startStationPinyinWidth / 2, topOffset + 130, -1)
  drawCustomText(ctx, endStationPinyin, canvasWidth / 2 + 220 - endStationPinyinWidth / 2, topOffset + 130, -1)

  ctx.font = '44px Times New Roman'
  const trainNumber = props.ticketInfo.trainNumber
  const trainNumberWidth = getTextWidth(ctx, trainNumber) + 2 * trainNumber.length
  drawCustomText(ctx, trainNumber, canvasWidth / 2 - trainNumberWidth / 2, topOffset + 92, 2)
  ctx.font = '44px Bold SimSun'
  const arrowStartX = canvasWidth / 2 - 63
  const arrowStartY = topOffset + 105
  const arrowLength = 126
  const arrowHeight = 5
  const arrowWidth = 15

  ctx.beginPath()
  ctx.moveTo(arrowStartX, arrowStartY)
  ctx.lineTo(arrowStartX + arrowLength, arrowStartY)
  ctx.lineTo(arrowStartX + arrowLength - arrowWidth, arrowStartY - arrowHeight)
  ctx.stroke()

  ctx.font = '34px Bold SimSun'
  drawCustomText(ctx, '站', 275, topOffset + 85)
  drawCustomText(ctx, '站', canvasWidth - 145, topOffset + 85)

  // 日期、时间
  ctx.font = '34px bxpz Regular'
  const date = new Date(props.ticketInfo.date)
  const year = date.getFullYear().toString()
  const month =
    date.getMonth() + 1 > 9 ? (date.getMonth() + 1).toString() : '0' + (date.getMonth() + 1)
  const day = date.getDate() > 9 ? date.getDate().toString() : '0' + date.getDate()
  drawCustomText(ctx, year, leftOffset - 2, topOffset + 177, -2)
  drawCustomText(ctx, month, leftOffset + 112, topOffset + 177, -2)
  drawCustomText(ctx, day, leftOffset + 181, topOffset + 177, -2)
  drawCustomText(ctx, props.ticketInfo.time, leftOffset + 253, topOffset + 177, -2)

  // 座位号、车厢号、座位类型
  const seatCarriage = props.ticketInfo.seatCarriage.toString().padStart(2, '0')
  const bedBerth = props.ticketInfo.berth
  let seatNumber = props.ticketInfo.seatNumber.toString().padStart(3, '0')
  drawCustomText(ctx, seatCarriage, canvasWidth / 2 + 107, topOffset + 177, -2)
  // 如果最后一位是字母，进行处理
  if (seatNumber === '000') {
    ctx.font = '34px Bold SimSun'
    drawCustomText(ctx, '无座', canvasWidth / 2 + 175, topOffset + 180, -3)
  }
  else if (isNaN(parseInt(seatNumber.slice(-1)))) {
    const seatNumberLast = seatNumber.slice(-1)
    seatNumber = seatNumber.slice(0, -1)
    drawCustomText(ctx, seatNumber, canvasWidth / 2 + 175, topOffset + 177, -3)
    ctx.font = '36px Times New Roman'
    drawCustomText(ctx, seatNumberLast, canvasWidth / 2 + 175 + 40, topOffset + 178, -3)
    ctx.font = '24px SimSun'
    drawCustomText(ctx, '号', leftOffset + 613, topOffset + 175)
  } 
  else if((seatNumber !== '000')&&(bedBerth !== '')){
    drawCustomText(ctx, seatNumber, canvasWidth / 2 + 177, topOffset + 177, -3)
    ctx.font = '34px SimSun'
    drawCustomText(ctx, '号' + bedBerth, canvasWidth / 2 + 180 + 60, topOffset + 180, -3)
  }
  else {
    drawCustomText(ctx, seatNumber, canvasWidth / 2 + 175, topOffset + 177, -3)
    ctx.font = '24px SimSun'
    drawCustomText(ctx, '号', leftOffset + 613, topOffset + 175)
  }

  ctx.font = '32px Bold SimSun'
  const seatType = props.ticketInfo.seatType
  const seatTypeWidth = getTextWidth(ctx, seatType)
  drawCustomText(ctx, seatType, 650 - seatTypeWidth / 2, topOffset + 225)

  ctx.font = '24px SimSun'
  drawCustomText(ctx, '年', leftOffset + 83, topOffset + 175)
  drawCustomText(ctx, '月', leftOffset + 156, topOffset + 175)
  drawCustomText(ctx, '日', leftOffset + 223, topOffset + 175)
  drawCustomText(ctx, '开', leftOffset + 357, topOffset + 175)
  drawCustomText(ctx, '车', leftOffset + 523, topOffset + 175)

  // 票价、额外信息
  ctx.font = '28px bxpz Regular'
  drawCustomText(ctx, '￥', leftOffset + 7, topOffset + 226)
  ctx.font = '34px bxpz Regular'
  const price = (props.ticketInfo.price || 0).toFixed(1).toString()
  const priceWidth = getTextWidth(ctx, price)
  drawCustomText(ctx, price, leftOffset + 38, topOffset + 227, -2)
  ctx.font = '24px FangSong GB2312'
  drawCustomText(ctx, '元', leftOffset + 35 + priceWidth, topOffset + 225)
  ctx.font = '34px SimSun'
  if (props.ticketInfo.isStudent) {
    const studentText = '学'
    const studentWidth = getTextWidth(ctx, studentText)
    drawCustomText(ctx, studentText, canvasWidth / 2 - studentWidth - 45, topOffset + 225)
  } 
  if (props.ticketInfo.isChild) {
    const childText = '孩'
    const childWidth = getTextWidth(ctx, childText)
    drawCustomText(ctx, childText, canvasWidth / 2 - childWidth - 45, topOffset + 225)
  } 
  if (props.ticketInfo.isDiscount) {
    const discountText = '折'
    const discountWidth = getTextWidth(ctx, discountText)
    drawCustomText(ctx, discountText, canvasWidth / 2 - discountWidth + 5, topOffset + 225)
  }

  ctx.font = '22px Times New Roman'

  // 仅供报销使用
  ctx.font = '34px SimSun'
  drawCustomText(ctx, '仅供报销使用', leftOffset, 365)

  // 仅供纪念使用
  drawCustomText(ctx, '仅供纪念使用', 340, 325)

  // 退票费
  if (props.ticketInfo.isRefund) {
    drawCustomText(ctx, '退票费', leftOffset, 323)
  }

  ctx.font = '34px bxpz Regular'
  // 身份证号码和姓名
  const id = maskedId(props.ticketInfo.passengerId)
  const idWidth = getTextWidth(ctx, id)
  drawCustomText(ctx, id, leftOffset, 405, -3)
  ctx.font = '38px SimSun'
  drawCustomText(ctx, props.ticketInfo.passengerName, leftOffset + idWidth + 10 - 53, 408)

  // 虚线框
  const dashWidth = 500
  const dashHeight = 80
  const dashLeft = 95
  ctx.font = ' 28px SimSun'
  ctx.setLineDash([16, 4])
  ctx.strokeRect(dashLeft, 425, dashWidth, dashHeight)
  ctx.setLineDash([])
  const text1 = '报销凭证 遗失不补'
  const text1Width = getTextWidth(ctx, text1)
  const text2 = '退票改签时须交回车站'
  const text2Width = getTextWidth(ctx, text2)
  drawCustomText(ctx, text1, dashLeft + dashWidth / 2 - text1Width / 2, 455)
  drawCustomText(ctx, text2, dashLeft + dashWidth / 2 - text2Width / 2, 493)

  // 二维码，真实车票二维码使用AES加密
  const qrCodeText = props.ticketInfo.qrCodeId
  const qrCodeWidth = 180
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
      ctx.drawImage(qrImage, dashLeft + dashWidth + 65, 365, qrCodeWidth, qrCodeWidth)
    }
  })

  // 车票ID和售票点
  ctx.font = ' 32px FangSong'
  const TicketID = props.ticketInfo.id
  const IDWidth = getTextWidth(ctx, TicketID)
  const bottomOffset = 5
  drawCustomText(ctx, props.ticketInfo.id + ' JM', leftOffset, canvasHeight - 68 + bottomOffset)

}

const drawTicketBack = () => {
  const canvas = ticketBackCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

  ctx.fillStyle = '#f2f2f2'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // 矩形
  // drawRoundRect(ctx, 20, 10, canvasWidth - 40, canvasHeight - 20, 0, 'rgba(255, 255, 255, 1)')

  // 乘车须知
  ctx.font = '35px SimSun'
  const text = '乘车须知：'
  const textWidth = getTextWidth(ctx, text)
  const color = [0, 0, 0]
  drawCustomText(ctx, text, 40, 80, 0, color)

  ctx.font = '25px SimSun'
  const paragraph =
    '☆正在开发中，敬请期待！'

  const paragraphs = paragraph
    .split('☆')
    .filter((p) => p !== '')
    .map((p) => '☆' + p)
  drawParagraph(ctx, paragraphs, 40, 45, 140, 35, canvasWidth - 90, -1, color)

  // 黑框
  const dashWidth = 900
  const dashHeight = 40
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 520, dashWidth, dashHeight)




  //背面直接插图
  // const backgroundImage = new Image()
  // backgroundImage.src = redTicketBack
  // backgroundImage.onload = () => {
  //   const paddingX = canvasWidth
  //   const paddingY = canvasHeight
  //   const imgWidth = canvasWidth - 2 * paddingX
  //   const imgHeight = canvasHeight - 2 * paddingY
  //   const centerX = paddingX
  //   const centerY = paddingY
  //   ctx.drawImage(backgroundImage, centerX, centerY, imgWidth, imgHeight)
  // }


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
