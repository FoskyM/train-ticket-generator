<!-- *
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
 * This file is created by FoskyM on 2024/10/20.
 * -->

<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'

import type { FieldInfoData, TicketData, TicketStyleConfig, TicketConfig } from '@/types'

import DynamicForm from '@/components/common/DynamicForm.vue'
import InfoHead from '@/components/common/InfoHead.vue'
import StyleConfigForm from '@/components/common/StyleConfigForm.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import DonateButton from '@/components/common/DonateButton.vue'
import CustomSelect from '@/components/common/CustomSelect.vue'
import TicketPreview from '@/components/common/TicketPreview.vue'
import BadgeGroup from '@/components/common/BadgeGroup.vue'
import type { BadgeOption } from '@/components/common/BadgeGroup.vue'

import { receiptConfig } from '@/configs/receipt'

// 票据配置映射
const ticketConfigMap: Record<string, TicketConfig> = {
  receipt: receiptConfig,
}

const ticketTypeOptions = [
  '蓝票(报销凭证)',
  '蓝票(5代磁介质实名车票)',
  '蓝票(4代磁介质非实名车票)',
  '红票(3代软质车票)',
  '红票(2代软质一维码车票)',
  '纸板票(1代纸板火车票)',
]

const ticketTypeKeyMap: Record<string, string> = {
  '蓝票(报销凭证)': 'receipt',
  '蓝票(5代磁介质实名车票)': 'ticket5g',
  '蓝票(4代磁介质非实名车票)': 'ticket4g',
  '红票(3代软质车票)': 'ticket3g',
  '红票(2代软质一维码车票)': 'ticket2g',
  '纸板票(1代纸板火车票)': 'ticket1g',
}

const selectedTicketType = ref('')
const activeKey = computed(() => ticketTypeKeyMap[selectedTicketType.value] || '')
const currentConfig = computed<TicketConfig | null>(() => ticketConfigMap[activeKey.value] || null)

// 样式配置
const styleConfig = ref<TicketStyleConfig | null>(null)
const defaultStyleConfig = computed(() => currentConfig.value?.defaultStyleConfig ?? null)
const styleFieldGroups = computed(() => currentConfig.value?.styleFieldGroups ?? [])

const mergedStyleConfig = computed<TicketStyleConfig | null>(() => {
  const cfg = currentConfig.value
  if (!cfg) return null
  const def = cfg.defaultStyleConfig
  if (!styleConfig.value) return def
  return {
    ...def,
    ...styleConfig.value,
    fonts: { ...def.fonts, ...styleConfig.value.fonts },
    wearEffect: { ...def.wearEffect, ...styleConfig.value.wearEffect },
    showProtrusions: styleConfig.value.showProtrusions ?? def.showProtrusions,
    backgroundOpacity: styleConfig.value.backgroundOpacity ?? def.backgroundOpacity,
    qrContent: styleConfig.value.qrContent ?? def.qrContent,
  }
})

watch(activeKey, () => {
  if (currentConfig.value) {
    styleConfig.value = JSON.parse(JSON.stringify(currentConfig.value.defaultStyleConfig))
  } else {
    styleConfig.value = null
  }
})

// 响应式布局
const isSideLayout = ref(false)
const checkLayout = () => {
  const w = window.innerWidth
  isSideLayout.value = w >= 1024 && w < 1536
}

onMounted(() => {
  checkLayout()
  window.addEventListener('resize', checkLayout)
})
onUnmounted(() => {
  window.removeEventListener('resize', checkLayout)
})

// Badge 选择组选项
const identityOptions: BadgeOption[] = [
  { label: '成人', value: 'adult' },
  { label: '学生', value: 'student' },
  { label: '儿童', value: 'child' },
  { label: '军人', value: 'military' },
  { label: '残疾', value: 'disabled' },
]

const discountOptions = computed<BadgeOption[]>(() => [
  { label: '优惠', value: 'discount', disabled: ticketInfo.value.identity === 'student' },
])

const payMethodOptions: BadgeOption[] = [
  { label: '微信', value: '微' },
  { label: '支付宝', value: '支' },
  { label: '现金', value: '现' },
  { label: '银行卡', value: '银' },
]

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
  identity: 'adult',
  isDiscount: true,
  payMethod: '',
})

// 身份联动：学生 → 自动勾选优惠且锁定
watch(
  () => ticketInfo.value.identity,
  (val) => {
    if (val === 'student') {
      ticketInfo.value.isDiscount = true
    }
  },
)

// 优惠 badge（多选数组）→ 同步到 isDiscount 布尔值
const discountSelection = computed<string[]>({
  get: () => (ticketInfo.value.isDiscount ? ['discount'] : []),
  set: (val: string[]) => {
    // 学生身份下不允许取消优惠
    if (ticketInfo.value.identity === 'student') {
      ticketInfo.value.isDiscount = true
      return
    }
    ticketInfo.value.isDiscount = val.includes('discount')
  },
})
</script>

<template>
  <div class="app-root">
    <div class="app-card">
      <InfoHead />

      <div class="app-layout" :class="{ 'side-layout': isSideLayout }">
        <!-- 表单区 -->
        <div class="form-panel">
          <DynamicForm
            class="mb-4"
            v-model="ticketInfo"
            v-model:fields="fieldInfo"
            :compact="isSideLayout"
          />

          <!-- Badge 选择组 -->
          <div class="badge-section">
            <BadgeGroup
              label="身份"
              :options="identityOptions"
              :modelValue="ticketInfo.identity ?? ''"
              @update:modelValue="ticketInfo.identity = $event as string"
            />
            <BadgeGroup
              label="其它"
              :options="discountOptions"
              v-model="discountSelection"
              :multiple="true"
            />
            <BadgeGroup
              label="支付"
              :options="payMethodOptions"
              :modelValue="ticketInfo.payMethod ?? ''"
              @update:modelValue="ticketInfo.payMethod = $event as string"
              :allowCustom="true"
              :maxCustomLength="1"
              customPlaceholder="其它"
            />
          </div>

          <!-- 票据类型 -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              票据类型
            </label>
            <CustomSelect
              v-model="selectedTicketType"
              :options="ticketTypeOptions"
              placeholder="请选择车票类型"
            />
          </div>

          <!-- 样式配置 -->
          <StyleConfigForm
            v-if="styleConfig && defaultStyleConfig"
            v-model="styleConfig"
            :defaultConfig="defaultStyleConfig"
            :fieldGroups="styleFieldGroups"
            :compact="isSideLayout"
            class="mb-4"
          />
        </div>

        <!-- 预览区 -->
        <div class="preview-panel">
          <div class="preview-inner">
            <TicketPreview
              v-if="currentConfig && mergedStyleConfig"
              :ticketInfo="ticketInfo"
              :styleConfig="mergedStyleConfig"
              :drawFront="currentConfig.drawFront"
              :drawBack="currentConfig.drawBack"
              :canvasWidth="currentConfig.canvasWidth"
              :canvasHeight="currentConfig.canvasHeight"
              :vertical="isSideLayout"
              :key="activeKey"
            />
            <div v-else-if="activeKey === ''" class="empty-state">
              <p class="text-gray-400 dark:text-gray-500">请选择车票类型</p>
            </div>
            <div v-else class="empty-state">
              <p class="text-gray-400 dark:text-gray-500">该车票类型仍在开发中</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <AppFooter />
    <DonateButton />
  </div>
</template>

<style scoped>
.app-root {
  @apply px-3 py-5 md:py-8 lg:py-10 mx-auto h-fit;
  max-width: 1800px;
}

.app-card {
  @apply p-5 md:p-7 rounded-2xl bg-white dark:bg-gray-900/80;
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.03),
    0 2px 4px rgba(0, 0, 0, 0.04),
    0 12px 24px rgba(0, 0, 0, 0.06);
}

html.dark .app-card {
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.05),
    0 2px 8px rgba(0, 0, 0, 0.3);
}

.app-layout {
  @apply flex flex-col gap-6;
}

.app-layout.side-layout {
  @apply flex-row;
}

.form-panel {
  @apply w-full;
}

@media (max-width: 1023px) {
  .form-panel {
    max-height: 50vh;
    overflow-y: auto;
    padding-right: 2px;
  }
}

.side-layout .form-panel {
  @apply w-1/2 flex-shrink-0;
  max-height: none;
  overflow-y: visible;
}

.preview-panel {
  @apply w-full min-w-0;
}
.side-layout .preview-panel {
  @apply flex-1;
}

.side-layout .preview-inner {
  @apply sticky top-4;
}

.badge-section {
  @apply flex flex-wrap gap-x-6 gap-y-2 mb-4 py-3 px-4 rounded-xl;
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.04);
}

html.dark .badge-section {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.06);
}

.empty-state {
  @apply flex items-center justify-center py-20 rounded-xl;
  border: 2px dashed rgba(0, 0, 0, 0.08);
}

html.dark .empty-state {
  border-color: rgba(255, 255, 255, 0.08);
}
</style>
