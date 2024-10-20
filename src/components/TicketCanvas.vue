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

const drawCustomText = (ctx, text, x, y, spacing = 0) => {
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const charWidth = ctx.measureText(char).width;

    // 将字分成多个小块
    const numSegments = 200;
    const segmentWidth = charWidth / numSegments;
    const fontSize = parseInt(ctx.font, 10);
    const extraSpace = 5; // 额外的空间，防止裁切

    for (let j = 0; j < numSegments; j++) {
      const segmentX = x + j * segmentWidth;
      const alpha = Math.random() * 0.7 + 0.3; // 随机透明度

      ctx.save();
      ctx.beginPath();
      ctx.rect(segmentX, y - fontSize - extraSpace, segmentWidth, fontSize + extraSpace * 2);
      ctx.clip();

      ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
      ctx.fillText(char, x, y);

      ctx.restore();
    }

    x += charWidth + spacing;
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

    drawTicketDetails(canvas, ctx);
  };
};

const drawTicketDetails = (canvas, ctx) => {
  
  // 圆角矩形
  ctx.fillStyle = 'rgba(173, 216, 230, .5)';
  ctx.beginPath();
  ctx.moveTo(30, 10);
  ctx.arcTo(canvasWidth - 20, 10, canvasWidth - 20, 30, 20);
  ctx.arcTo(canvasWidth - 20, canvasHeight - 20, canvasWidth - 40, canvasHeight - 20, 20);
  ctx.arcTo(20, canvasHeight - 20, 20, canvasHeight - 40, 20);
  ctx.arcTo(20, 10, 40, 10, 20);
  ctx.closePath();
  ctx.fill();

  // 两边凸出的梯形小块
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

  // 设置线条样式
  ctx.strokeStyle = 'rgba(173, 216, 230, .5)'; // 颜色略比底色深
  ctx.lineWidth = 1;

  const angle = - Math.PI / 6;

  // 绘制多个60度的斜线
  const spacing = 5; // 斜线之间的间距
  let bottomStartX = 0;
  for (let i = 20; i < canvas.width - 20; i += spacing) {
    const startX = i;
    const startY = 10;
    let endX = startX + canvas.height * Math.tan(angle);
    let endY = canvas.height - 10;

    if (endX < 20) {
      endX = 20 + 1;
      endY = startY + (startX - 30) / Math.tan(-angle);
    }
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY); // 终点计算
    ctx.stroke();

    bottomStartX = endX;
  }

  for (let i = bottomStartX + 5; i < canvas.width - 20; i += spacing) {
    const startX = i;
    const startY = canvas.height - 10;
    let endX = startX + canvas.height * Math.tan(-angle);
    let endY = 10;

    if (endX > canvas.width - 20) {
      endX = canvas.width - 20;
      endY = canvas.height - 10 - (canvas.width - 30 - startX) / Math.tan(-angle);
    }
    
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY); // 终点计算
    ctx.stroke();
  }

  ctx.strokeStyle = '#000';

  // 下方略深的蓝色区域
  ctx.fillStyle = '#94cae0';
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
  drawCustomText(ctx, startStation, 110, 80, stationSpacing);
  drawCustomText(ctx, endStation, canvasWidth / 2 + 120, 80, stationSpacing);

  ctx.font = '30px FangSong';
  let startStationPinyin = pinyin(startStation, { toneType: 'none' }).replace(/ /g, '');
  let endStationPinyin = pinyin(endStation, { toneType: 'none' }).replace(/ /g, '');
  startStationPinyin = startStationPinyin[0].toUpperCase() + startStationPinyin.slice(1);
  endStationPinyin = endStationPinyin[0].toUpperCase() + endStationPinyin.slice(1);
  const startStationPinyinWidth = getTextWidth(ctx, startStationPinyin);
  const endStationPinyinWidth = getTextWidth(ctx, endStationPinyin);

  drawCustomText(ctx, startStationPinyin, 200 - startStationPinyinWidth / 2, 115, -1)
  drawCustomText(ctx, endStationPinyin, canvasWidth / 2 + 220 - endStationPinyinWidth / 2, 115, -1)

  ctx.font = '42px Simsun';
  const trainNumber = props.ticketInfo.trainNumber;
  const trainNumberWidth = getTextWidth(ctx, trainNumber) + 2 * trainNumber.length;
  drawCustomText(ctx, trainNumber, canvasWidth / 2 - trainNumberWidth / 2, 75, 2);
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
  drawCustomText(ctx, '站', 270, 75);
  drawCustomText(ctx, '站', canvasWidth - 160, 75);

  // 日期、时间、座位号
  ctx.font = '40px Simhei';
  const date = new Date(props.ticketInfo.date);
  const year = date.getFullYear().toString();
  const month = date.getMonth() + 1 > 9 ? (date.getMonth() + 1).toString() : '0' + (date.getMonth() + 1);
  const day = date.getDate() > 9 ? date.getDate().toString() : '0' + date.getDate();
  drawCustomText(ctx, year, leftOffset + 10, 170, -2)
  drawCustomText(ctx, month, leftOffset + 118, 170, -2)
  drawCustomText(ctx, day, leftOffset + 180, 170, -2)
  drawCustomText(ctx, props.ticketInfo.time, leftOffset + 248, 170, -2)
  drawCustomText(ctx, props.ticketInfo.seatCarriage, canvasWidth / 2 + 120, 170, -2)
  drawCustomText(ctx, props.ticketInfo.seatNumber, canvasWidth / 2 + 175, 170, -2)
  
  ctx.font = '21px FangSong';
  drawCustomText(ctx, '年', leftOffset + 90, 164);
  drawCustomText(ctx, '月', leftOffset + 155, 164);
  drawCustomText(ctx, '日', leftOffset + 218, 164);
  drawCustomText(ctx, '开', leftOffset + 345, 164);
  drawCustomText(ctx, '车', leftOffset + 515, 164);
  drawCustomText(ctx, '号', leftOffset + 590, 164);
  drawCustomText(ctx, '元', leftOffset + 122, 210);

  // 票价、额外信息、座位类型
  ctx.font = '40px SimSun';
  drawCustomText(ctx, '￥', leftOffset + 15, 215);
  ctx.font = '40px Simhei';
  drawCustomText(ctx, props.ticketInfo.price, leftOffset + 50, 215, -2)

  ctx.font = '28px SimSun';
  drawCustomText(ctx, props.ticketInfo.extraInfo ?? '', 180, 210);
  const seatType = props.ticketInfo.seatType;
  const seatTypeWidth = getTextWidth(ctx, seatType);

  drawCustomText(ctx, seatType, 650 - seatTypeWidth / 2, 210);
  ctx.font = '20px Arial';
  // 限乘当日当次车
  // ctx.fillText('限乘当日当次车', 40, 200);

  // 仅供报销使用
  ctx.font = '32px SimSun';
  drawCustomText(ctx, '仅供报销使用', leftOffset, 330);

  ctx.font = '40px FangSong';

  // 身份证号码和姓名
  const id = maskedId(props.ticketInfo.passengerId);
  const idWidth = getTextWidth(ctx, id);
  drawCustomText(ctx, id, leftOffset, 370, -3)
  ctx.font = '36px SimSun';
  drawCustomText(ctx, props.ticketInfo.passengerName, leftOffset + idWidth + 10 - 48, 370);

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
  drawCustomText(ctx, text1, dashLeft + dashWidth / 2 - text1Width / 2, 408);
  drawCustomText(ctx, text2, dashLeft + dashWidth / 2 - text2Width / 2, 440);

  // 车票ID和售票点
  ctx.font = ' 24px FangSong';
  const bottomOffset = Math.floor(Math.random() * 25) + 10;
  drawCustomText(ctx, props.ticketInfo.id + ' JM', leftOffset, canvasHeight - 50 + bottomOffset);
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