<script setup lang="ts">
import { ref, watch } from 'vue'

import type { FieldInfoData, TicketData } from '@/types'

import DynamicForm from '@/components/common/DynamicForm.vue'
import Tabs from '@/components/common/Tabs.vue'
import InfoHead from '@/components/common/InfoHead.vue'

import TicketReceipt from '@/components/TicketReceipt.vue'

const tabs = ref([
  { label: '蓝票(报销凭证)', key: 'receipt' },
  { label: '蓝票(5代磁介质实名车票)', key: 'ticket5g' },
  { label: '蓝票(4代磁介质非实名车票)', key: 'ticket4g' },
  { label: '红票(3代软质车票)', key: 'ticket3g' },
  { label: '红票(2代软质一维码车票)', key: 'ticket2g' },
  { label: '纸板票(1代纸板火车票)', key: 'ticket1g' },
])

const activeTab = ref('')

const seatTypeList = ref(['商务座', '一等座', '二等座', '无座', '硬座', '硬卧', '软卧'])

const fieldInfo = ref<FieldInfoData>({
  id: { label: '火车票 ID', type: 'text', colSpan: 2, onlyEnglishAndNumber: true, maxLength: 21 },
  redId: { label: '红色 ID', type: 'text', colSpan: 2, onlyEnglishAndNumber: true, maxLength: 11 },
  ticketOffice: { label: '售票点', type: 'text', colSpan: 1, onlyChinese: true },
  startStation: { label: '出发地', type: 'text', colSpan: 1, maxLength: 5, onlyChinese: true },
  endStation: { label: '目的地', type: 'text', colSpan: 1, maxLength: 5, onlyChinese: true },
  trainNumber: {
    label: '车次',
    type: 'text',
    colSpan: 1,
    maxLength: 6,
    onlyEnglishAndNumber: true,
  },
  date: { label: '日期', type: 'date', colSpan: 1 },
  time: { label: '时间', type: 'time', colSpan: 1 },
  price: { label: '价格', type: 'float', colSpan: 1, maxValue: 50000 },
  seatType: {
    label: '座位类型',
    type: 'select',
    data: seatTypeList,
    colSpan: 1,
  },
  seatCarriage: { label: '车厢号', type: 'number', colSpan: 1, maxValue: 99 },
  seatNumber: {
    label: '座位号',
    type: 'text',
    colSpan: 1,
    maxLength: 3,
    onlyEnglishAndNumber: true,
  },
  passengerName: { label: '乘客姓名', type: 'text', colSpan: 1, maxLength: 12, onlyChinese: true },
  passengerId: { label: '身份证号', type: 'text', colSpan: 1, maxLength: 18 },

  seatTypeCustom: {
    label: '自定义座位类型',
    type: 'text',
    colSpan: 1,
    maxLength: 12,
    onlyChinese: true,
  },
  checkGate: { label: '检票口', type: 'text', colSpan: 1, maxLength: 12 },
  isStudent: { label: '学生票', type: 'checkbox', colSpan: 1 },
  isDiscount: { label: '优惠票', type: 'checkbox', colSpan: 1 },
})

const ticketInfo = ref<TicketData>({
  id: '32537301731021L088888',
  redId: 'Z160L088888',
  ticketOffice: '杭州东',
  startStation: '杭州东',
  endStation: '北京南',
  trainNumber: 'G176',
  date: '2024-10-21',
  time: '18:57',
  price: 623.0,
  seatType: '二等座',
  seatCarriage: '08',
  seatNumber: '08F',
  passengerName: '傅四霁',
  passengerId: '330102200401011234',

  seatTypeCustom: '二等座始发改签',
  checkGate: '18B',
  isStudent: false,
  isDiscount: true,
})

watch(
  () => ticketInfo.value.isStudent,
  (value) => {
    if (value) {
      ticketInfo.value.isDiscount = true
      fieldInfo.value.isDiscount.disabled = true
    } else {
      fieldInfo.value.isDiscount.disabled = false
    }
  },
  { deep: true },
)
</script>

<template>
  <div class="container px-5 py-5 md:py-16 xl:py-24 mx-auto my-auto h-fit">
    <div class="items-center justify-between p-4 rounded-lg bg-white shadow-indigo-50 shadow-md">
      <InfoHead />

      <DynamicForm class="mb-4" v-model="ticketInfo" v-model:fields="fieldInfo" />

      <Tabs class="mb-4 text-sm" v-model="activeTab" :tabs="tabs" />

      <div>
        <div class="ticket-container py-4">
          <TicketReceipt :ticketInfo="ticketInfo" v-if="activeTab == 'receipt'" />
          <template v-else-if="activeTab == ''">
            <h2 class="text-2xl">请选择车票类型</h2>
          </template>
          <template v-else>
            <h2 class="text-2xl">其它车票仍在开发中，敬请期待！</h2>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
