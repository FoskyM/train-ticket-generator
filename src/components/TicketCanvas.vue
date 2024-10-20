<template>
  <div class="ticket-container">
    <canvas ref="ticketCanvas" :width="canvasWidth" :height="canvasHeight"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { pinyin } from 'pinyin-pro';
import CRHImage from '@/assets/img/CRH.jpg';

const props = defineProps({
  ticketInfo: {
    type: Object,
    required: true
  }
});

const protrusionHeight = 40;
const protrusionWidth = 10;
const canvasWidth = 876;
const canvasHeight = 539;
const leftOffset = 80;

const ticketCanvas = ref(null);

const maskedId = (idCard) => {
  return idCard.slice(0, 10) + '****' + idCard.slice(14);
};

const drawTextWithSpacing = (ctx, text, x, y, spacing) => {
  for (let i = 0; i < text.length; i++) {
    ctx.fillText(text[i], x, y);
    x += ctx.measureText(text[i]).width + spacing;
  }
};

const getTextWidth = (ctx, text) => {
  return ctx.measureText(text).width;
};

const drawTicket = () => {
  const canvas = ticketCanvas.value;
  const ctx = canvas.getContext('2d');

  const backgroundImage = new Image();
  backgroundImage.src = CRHImage;
  backgroundImage.onload = () => {
    const padding = 20;
    const imgWidth = canvasWidth - 2 * padding;
    const imgHeight = canvasHeight - 2 * padding;
    const centerX = padding;
    const centerY = padding;

    ctx.globalAlpha = 0.08;
    ctx.drawImage(backgroundImage, centerX, centerY, imgWidth, imgHeight);
    ctx.globalAlpha = 1.0;

    drawTicketDetails(ctx);
  };
};

const drawTicketDetails = (ctx) => {
  // 背景
  ctx.fillStyle = 'rgba(173, 216, 230, .5)';
  ctx.beginPath();
  ctx.moveTo(30, 10);
  ctx.arcTo(canvasWidth - 20, 10, canvasWidth - 20, 30, 20);
  ctx.arcTo(canvasWidth - 20, canvasHeight - 20, canvasWidth - 40, canvasHeight - 20, 20);
  ctx.arcTo(20, canvasHeight - 20, 20, canvasHeight - 40, 20);
  ctx.arcTo(20, 10, 40, 10, 20);
  ctx.closePath();
  ctx.fill();

  // 两边凸出的小块（梯形）
  ctx.fillStyle = 'rgba(173, 216, 230, .5)';
  const drawTrapezoid = (x, y, width, height, offset, direction) => {
    ctx.beginPath();
    if (direction === 'left') {
      ctx.moveTo(x, y - height / 2 + offset);
      ctx.lineTo(x + width, y - height / 2);
      ctx.lineTo(x + width, y + height / 2);
      ctx.lineTo(x, y + height / 2 - offset);
    } else {
      ctx.moveTo(x, y - height / 2 + offset);
      ctx.lineTo(x - width, y - height / 2);
      ctx.lineTo(x - width, y + height / 2);
      ctx.lineTo(x, y + height / 2 - offset);
    }
    ctx.closePath();
    ctx.fill();
  };

  drawTrapezoid(10, canvasHeight * 0.2, protrusionWidth, protrusionHeight, 5,  'left');
  drawTrapezoid(canvasWidth - 10, canvasHeight * 0.2, protrusionWidth, protrusionHeight, 5, 'right');
  drawTrapezoid(10, canvasHeight * 0.8, protrusionWidth, protrusionHeight, 5, 'left');
  drawTrapezoid(canvasWidth - 10, canvasHeight * 0.8, protrusionWidth, protrusionHeight, 5, 'right');

  // 下方略深的蓝色区域
  ctx.fillStyle = '#87ceeb';
  ctx.beginPath();
  ctx.moveTo(30, canvasHeight * 0.9);
  ctx.lineTo(canvasWidth - 20, canvasHeight * 0.9);
  ctx.lineTo(canvasWidth - 20, canvasHeight - 20);
  ctx.arcTo(canvasWidth - 20, canvasHeight - 10, canvasWidth - 50, canvasHeight - 10, 20);
  ctx.lineTo(50, canvasHeight - 10);
  ctx.arcTo(20, canvasHeight - 10, 20, canvasHeight - 30, 20);
  ctx.lineTo(20, canvasHeight * 0.9);
  ctx.closePath();
  ctx.fill();

  // 始发站、车次、目的地
  ctx.fillStyle = '#000';
  ctx.font = '45px SimHei';
  const startStation = props.ticketInfo.startStation;
  const endStation = props.ticketInfo.endStation;
  const stationSpacing = 10; // 设置字间隔
  drawTextWithSpacing(ctx, startStation, 110, 80, stationSpacing);
  drawTextWithSpacing(ctx, endStation, canvasWidth / 2 + 120, 80, stationSpacing);

  ctx.font = '30px FangSong';
  let startStationPinyin = pinyin(startStation, { toneType: 'none' }).replace(/ /g, '');
  let endStationPinyin = pinyin(endStation, { toneType: 'none' }).replace(/ /g, '');
  startStationPinyin = startStationPinyin[0].toUpperCase() + startStationPinyin.slice(1);
  endStationPinyin = endStationPinyin[0].toUpperCase() + endStationPinyin.slice(1);
  const startStationPinyinWidth = getTextWidth(ctx, startStationPinyin);
  const endStationPinyinWidth = getTextWidth(ctx, endStationPinyin);

  drawTextWithSpacing(ctx, startStationPinyin, 200 - startStationPinyinWidth / 2, 115, -1)
  drawTextWithSpacing(ctx, endStationPinyin, canvasWidth / 2 + 220 - endStationPinyinWidth / 2, 115, -1)

  ctx.font = '42px Simsun';
  const trainNumber = props.ticketInfo.trainNumber;
  const trainNumberWidth = getTextWidth(ctx, trainNumber) + 2 * trainNumber.length;
  drawTextWithSpacing(ctx, trainNumber, canvasWidth / 2 - trainNumberWidth / 2, 75, 2);
  const arrowStartX = canvasWidth / 2 - 60;
  const arrowStartY = 82;
  const arrowLength = 120;
  const arrowHeight = 5;
  const arrowWidth = 20;

  ctx.beginPath();
  ctx.moveTo(arrowStartX, arrowStartY);
  ctx.lineTo(arrowStartX + arrowLength, arrowStartY);
  ctx.lineTo(arrowStartX + arrowLength - arrowWidth, arrowStartY - arrowHeight);
  ctx.stroke();

  ctx.font = '28px Simsun';
  ctx.fillText('站', 270, 75);
  ctx.fillText('站', canvasWidth - 160, 75);

  // 日期、时间、座位号
  ctx.font = '40px Simhei';
  const date = new Date(props.ticketInfo.date);
  const year = date.getFullYear().toString();
  const month = date.getMonth() + 1 > 9 ? (date.getMonth() + 1).toString() : '0' + (date.getMonth() + 1);
  const day = date.getDate() > 9 ? date.getDate().toString() : '0' + date.getDate();
  drawTextWithSpacing(ctx, year, leftOffset + 10, 170, -2)
  drawTextWithSpacing(ctx, month, leftOffset + 118, 170, -2)
  drawTextWithSpacing(ctx, day, leftOffset + 180, 170, -2)
  drawTextWithSpacing(ctx, props.ticketInfo.time, leftOffset + 248, 170, -2)
  drawTextWithSpacing(ctx, props.ticketInfo.seatCarriage, canvasWidth / 2 + 120, 170, -2)
  drawTextWithSpacing(ctx, props.ticketInfo.seatNumber, canvasWidth / 2 + 175, 170, -2)
  
  ctx.font = '21px FangSong';
  ctx.fillText('年', leftOffset + 90, 164);
  ctx.fillText('月', leftOffset + 155, 164);
  ctx.fillText('日', leftOffset + 218, 164);
  ctx.fillText('开', leftOffset + 345, 164);
  ctx.fillText('车', leftOffset + 515, 164);
  ctx.fillText('号', leftOffset + 590, 164);
  ctx.fillText('元', leftOffset + 122, 210);

  // 票价、额外信息、座位类型
  ctx.font = '40px SimSun';
  ctx.fillText('￥', leftOffset + 15, 215);
  ctx.font = '40px Simhei';
  drawTextWithSpacing(ctx, props.ticketInfo.price, leftOffset + 50, 215, -2)

  ctx.font = '28px SimSun';
  ctx.fillText(props.ticketInfo.extraInfo ?? '', 180, 210);
  const seatType = props.ticketInfo.seatType;
  const seatTypeWidth = getTextWidth(ctx, seatType);

  ctx.fillText(seatType, 650 - seatTypeWidth / 2, 210);
  ctx.font = '20px Arial';
  // 限乘当日当次车
  // ctx.fillText('限乘当日当次车', 40, 200);

  // 仅供报销使用
  ctx.font = '32px SimSun';
  ctx.fillText('仅供报销使用', leftOffset, 330);

  ctx.font = '40px FangSong';

  // 身份证号码和姓名
  const id = maskedId(props.ticketInfo.passengerId);
  const idWidth = getTextWidth(ctx, id);
  drawTextWithSpacing(ctx, id, leftOffset, 370, -3)
  ctx.font = '36px SimSun';
  ctx.fillText(props.ticketInfo.passengerName, leftOffset + idWidth + 10 - 48, 370);

  // 虚线框
  const dashWidth = 440;
  const dashHeight = 70;
  const dashLeft = 108;
  ctx.font = ' 27px FangSong';
  ctx.setLineDash([8, 2]);
  ctx.strokeRect(dashLeft, 380, dashWidth, dashHeight);
  ctx.setLineDash([]);
  // ctx.fillText('买票请到12306 发货请到95306 中国铁路祝您旅途愉快', 50, 310);
  const text1 = '报销凭证 遗失不补';
  const text1Width = getTextWidth(ctx, text1);
  const text2 = '退票改签时须交回车站';
  const text2Width = getTextWidth(ctx, text2);
  ctx.fillText(text1, dashLeft + dashWidth / 2 - text1Width / 2, 408);
  ctx.fillText(text2, dashLeft + dashWidth / 2 - text2Width / 2, 440);

  // 车票ID和售票点
  ctx.font = ' 24px FangSong';
  const bottomOffset = Math.floor(Math.random() * 25) + 10;
  ctx.fillText(props.ticketInfo.id + ' JM', leftOffset, canvasHeight - 50 + bottomOffset);
  // ctx.fillText(props.ticketInfo.ticketOffice, 300, canvasHeight - 28);

  
  // 车票ID后七位
  ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
  ctx.font = 'bold 32px Arial';
  ctx.fillText(props.ticketInfo.id.slice(-7), 80, 50);
};

onMounted(() => {
  drawTicket();
});

watch(() => props.ticketInfo, () => {
  drawTicket();
}, { deep: true });
</script>

<style scoped>
.ticket-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}
</style>