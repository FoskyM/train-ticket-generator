<script setup lang="ts">
import { ref, watch } from 'vue'
import TicketReceipt from '@/components/TicketReceipt.vue'
import type { FieldInfoData, TicketData } from './types'

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

let isComposing = false

const validateChineseInput = (event: Event) => {
  if (isComposing) return
  const input = event.target as HTMLInputElement
  const chineseRegex = /^[\u4e00-\u9fa5]*$/
  if (!chineseRegex.test(input.value)) {
    input.value = input.value.replace(/[^\u4e00-\u9fa5]/g, '')
  }
}

const handleCompositionStart = () => {
  isComposing = true
}

const handleCompositionEnd = (event: Event) => {
  isComposing = false
  validateChineseInput(event)
}

const validateEnglishAndNumberInput = (event: Event) => {
  const input = event.target as HTMLInputElement
  const englishAndNumberRegex = /^[A-Za-z0-9]*$/
  if (!englishAndNumberRegex.test(input.value)) {
    input.value = input.value.replace(/[^A-Za-z0-9]/g, '')
  }
}

const validateNumberInput = (event: Event, maxValue: number) => {
  const input = event.target as HTMLInputElement
  const numberRegex = /^[0-9]*$/
  if (!numberRegex.test(input.value)) {
    input.value = input.value.replace(/[^0-9]/g, '')
  }
  if (parseInt(input.value) > maxValue) {
    input.value = maxValue.toString()
  }
}

const generateFormFields = () => {
  const fields: any = []
  for (const key in ticketInfo.value) {
    // const value = ticketInfo.value[key]
    fields.push({
      key,
      label: fieldInfo.value[key].label,
      type: fieldInfo.value[key].type,
      colSpan: fieldInfo.value[key].colSpan,
      disabled: false,
    })
  }
  for (const field of fields) {
    if (field.type === 'select') {
      field.data = fieldInfo.value[field.key].data
    } else if (field.type === 'float') {
      field.type = 'number'
      field.step = '0.01'
    } else if (field.type === 'number') {
      field.step = '1'
    } else if (field.type === 'text') {
      if (fieldInfo.value[field.key].maxLength) {
        field.maxLength = fieldInfo.value[field.key].maxLength
      }
    }

    if (fieldInfo.value[field.key].maxValue) {
      field.max = fieldInfo.value[field.key].maxValue
      field.onInput = (event: Event) =>
        validateNumberInput(event, fieldInfo.value[field.key].maxValue as number)
    }

    if (fieldInfo.value[field.key].onlyChinese) {
      field.onInput = validateChineseInput
    } else if (fieldInfo.value[field.key].onlyEnglishAndNumber) {
      field.onInput = validateEnglishAndNumberInput
    }
  }
  return fields
}

const formFields = generateFormFields()

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
  <div class="container px-5 py-24 mx-auto my-auto h-full">
    <div class="items-center justify-between p-4 rounded-lg bg-white shadow-indigo-50 shadow-md">
      <div class="header mb-4">
        <h2 class="text-2xl font-bold">火车票生成器</h2>
        <p class="text-sm text-gray-500">
          本项目仅供学习交流使用，转载请注明出处，不得用于商业或违法用途。<br />
          图标与车票版式版权归中国铁路及相关集团所有，本项目与其无任何关联。
        </p>
        <div class="text-sm text-gray-500">
          <a
            href="https://github.com/FoskyM/train-ticket-generator"
            target="_blank"
            class="text-indigo-500 underline"
            >train-ticket-generator</a
          >
          © 2024 This project is licensed under AGPLv3. 2024-present copyright by
          <a href="https://fosky.top" target="_blank" class="text-indigo-500 underline">FoskyM</a>.
        </div>
        <div class="github inline-flex pt-2 gap-1">
          <img
            src="https://img.shields.io/github/stars/FoskyM/train-ticket-generator.svg"
            alt="Stars"
          />
          <img
            src="https://img.shields.io/github/forks/FoskyM/train-ticket-generator.svg"
            alt="Forks"
          />
          <img
            src="https://img.shields.io/github/issues/FoskyM/train-ticket-generator.svg"
            alt="Issues"
          />
        </div>
      </div>

      <div>
        <form>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div
              v-for="field in formFields"
              :key="field.key"
              :class="`col-span-${field.colSpan}`"
              class="space-y-2"
            >
              <label :for="field.key" class="block text-sm font-medium text-gray-700">{{
                field.label
              }}</label>
              <template v-if="field.type === 'select'">
                <select
                  v-model="ticketInfo[field.key]"
                  :id="field.key"
                  :disabled="field.disabled"
                  class="mt-1 block w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option v-for="item in field.data" :key="item" :value="item">
                    {{ item }}
                  </option>
                </select>
              </template>
              <template v-else-if="field.type === 'checkbox'">
                <div class="flex items-center">
                  <input
                    :type="field.type"
                    :id="field.key"
                    :disabled="fieldInfo[field.key].disabled"
                    v-model="ticketInfo[field.key]"
                    class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label :for="field.key" class="ml-2 block text-sm text-gray-900 select-none">{{
                    field.label
                  }}</label>
                </div>
              </template>
              <template v-else>
                <input
                  :type="field.type"
                  :step="field.step || null"
                  :maxlength="field.maxLength || null"
                  :max="field.max || null"
                  :id="field.key"
                  :disabled="field.disabled"
                  @input="field.onInput ? field.onInput($event) : null"
                  @compositionstart="handleCompositionStart"
                  @compositionend="handleCompositionEnd"
                  v-model="ticketInfo[field.key]"
                  class="mt-1 block w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </template>
            </div>
          </div>
        </form>
      </div>

      <div class="py-2"></div>

      <div>
        <div class="tab text-sm">
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
      </div>

      <div class="py-2"></div>

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
