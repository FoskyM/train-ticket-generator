<script setup lang="ts">
import { ref, watch } from 'vue'

import type { FieldInfoData, TicketData } from '@/types'

import DynamicForm from '@/components/common/DynamicForm.vue'
import Tabs from '@/components/common/Tabs.vue'
import InfoHead from '@/components/common/InfoHead.vue'
import Footer from '@/components/common/Footer.vue'

import blueReceipt from '@/components/blueReceipt.vue'
import blueTicket from '@/components/blueTicket.vue'
import redReceipt from '@/components/redReceipt.vue'
import redTicket from '@/components/redTicket.vue'

const tabs = ref([
  { label: '蓝票（报销凭证）', key: 'blueReceipt' },
  { label: '蓝票（实名车票）', key: 'blueTicket' },
  { label: '红票（报销凭证）', key: 'redReceipt' },
  { label: '红票（实名车票）', key: 'redTicket' },
])

const activeTab = ref('')

const fieldInfo = ref<FieldInfoData>({
  redId: { label: '上票号', type: 'text', colSpan: 2, onlyEnglishAndNumber: true, maxLength: 11 },
  id: { label: '下票号', type: 'text', colSpan: 2, onlyEnglishAndNumber: true, maxLength: 21 },
  startStation: { label: '出发地', type: 'text', colSpan: 1, maxLength: 5, onlyChinese: true },
  endStation: { label: '目的地', type: 'text', colSpan: 1, maxLength: 5, onlyChinese: true },
  checkGate: { label: '检票口', type: 'text', colSpan: 1, maxLength: 12 },
  ticketOffice: { label: '售票点', type: 'text', colSpan: 1, onlyChinese: true },
  trainNumber: {
    label: '车次',
    type: 'text',
    colSpan: 1,
    maxLength: 6,
    onlyEnglishAndNumber: true,
  },
  price: { label: '价格', type: 'float', colSpan: 1, maxValue: 50000 },
  date: { label: '日期', type: 'date', colSpan: 1 },
  time: { label: '时间', type: 'time', colSpan: 1 },
  seatCarriage: { label: '车厢号', type: 'number', colSpan: 1, maxValue: 99 },
  seatNumber: {
    label: '座位号',
    type: 'text',
    colSpan: 1,
    maxLength: 3,
    onlyEnglishAndNumber: true,
  },
  passengerName: { label: '姓名', type: 'text', colSpan: 1, maxLength: 12, onlyChinese: true },
  passengerId: { label: '身份证号', type: 'text', colSpan: 1, maxLength: 18 },
  seatType: { label: '席别', type: 'text', colSpan: 1, maxLength: 5, onlyChinese: true },
  berth: { label: '铺位', type: 'text', colSpan: 1, maxLength: 3, onlyChinese: true },
  qrCodeId: { label: '二维码内容', type: 'text', colSpan: 1, maxLength: 144 },
  isChild: { label: '儿童票', type: 'checkbox', colSpan: 1 },
  isStudent: { label: '学生票', type: 'checkbox', colSpan: 1 },
  isNet: { label: '网络售票', type: 'checkbox', colSpan: 1 },
  isDiscount: { label: '优惠票', type: 'checkbox', colSpan: 1 },
  isRefund: { label: '退票费', type: 'checkbox', colSpan: 1 },
})

const ticketInfo = ref<TicketData>({
  redId: '01X073561',
  id: '21077000060721X073561',
  checkGate: '1',
  ticketOffice: '武昌',
  startStation: '东方红',
  endStation: '卫星',
  trainNumber: '6224',
  price: 11.5,
  date: '2025-07-23',
  time: '06:50',
  seatCarriage: '01',
  seatNumber: '058',
  passengerName: '冷藏箱',
  passengerId: '330100200501011234',
  seatType: '新空调硬座',
  berth: '',
  qrCodeId: 'https://github.com/BI7AQU/train-ticket-generator',
  isChild: false,
  isStudent: false,
  isNet: true,
  isDiscount: true,
  isRefund: false,
  
})

watch(
  () => ticketInfo.value.isStudent,
  (value) => {
    if (value) {
      ticketInfo.value.isDiscount = true
      fieldInfo.value.isDiscount.disabled = true
      ticketInfo.value.isChild = false
      fieldInfo.value.isChild.disabled = true
    } else {
      fieldInfo.value.isDiscount.disabled = false
      fieldInfo.value.isChild.disabled = false
    }
  },
  { deep: true },
)
watch(
  () => ticketInfo.value.isChild,
  (value) => {
    if (value) {
      ticketInfo.value.isStudent = false
      fieldInfo.value.isStudent.disabled = true
    } else {
      fieldInfo.value.isStudent.disabled = false
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
          <blueReceipt :ticketInfo="ticketInfo" v-if="activeTab == 'blueReceipt'" />
          <blueTicket :ticketInfo="ticketInfo" v-if="activeTab == 'blueTicket'" />
          <redReceipt :ticketInfo="ticketInfo" v-if="activeTab == 'redReceipt'" />
          <redTicket :ticketInfo="ticketInfo" v-if="activeTab == 'redTicket'" />
          <template v-else-if="activeTab == ''">
            <h2 class="text-2xl">请选择车票类型！</h2>
          </template>
        </div>
      </div> 
    </div>
    <Footer />
  </div>
</template>

<style scoped></style>
