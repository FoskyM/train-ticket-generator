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
 * This file is created by FoskyM on 2025/11/28.
 * -->

<template>
  <div class="style-config">
    <!-- 头部 -->
    <div
      class="flex items-center justify-between cursor-pointer select-none py-1"
      @click="isExpanded = !isExpanded"
    >
      <div class="flex items-center gap-2">
        <svg
          class="w-4 h-4 text-gray-400 transition-transform duration-200"
          :class="{ 'rotate-90': isExpanded }"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
        <span class="text-sm font-medium text-gray-600 dark:text-gray-400">样式配置</span>
      </div>
      <div class="flex items-center gap-2">
        <span v-if="fontLoadStatusText" class="font-status" :class="fontLoadStatusClass">
          {{ fontLoadStatusText }}
        </span>
      </div>
    </div>

    <!-- 展开区域 -->
    <Transition name="expand">
      <div v-show="isExpanded" class="mt-3 space-y-4">
        <!-- 开关行 -->
        <div class="flex flex-wrap items-center gap-x-6 gap-y-3">
          <label class="flex items-center gap-2.5">
            <ToggleSwitch
              :modelValue="modelValue.showProtrusions !== false"
              @update:modelValue="updateField('showProtrusions', $event)"
            />
            <span class="text-sm text-gray-600 dark:text-gray-400">梯形突出</span>
          </label>

          <label class="flex items-center gap-2.5">
            <ToggleSwitch
              :modelValue="!!modelValue.wearEffect?.enabled"
              @update:modelValue="updateWearEnabled($event)"
            />
            <span class="text-sm text-gray-600 dark:text-gray-400">磨损效果</span>
          </label>

          <div v-if="modelValue.wearEffect?.enabled" class="flex items-center gap-2 flex-1 min-w-[200px]">
            <span class="text-xs text-gray-500 dark:text-gray-500">强度</span>
            <RangeSlider
              :modelValue="modelValue.wearEffect?.intensity ?? 0.7"
              @update:modelValue="updateWearIntensity($event)"
              :min="0" :max="1" :step="0.1"
              class="flex-1"
            />
          </div>
        </div>

        <!-- 背景 + 二维码 -->
        <div class="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div class="flex items-center gap-2 min-w-[220px]">
            <span class="text-xs text-gray-500 dark:text-gray-500 whitespace-nowrap">背景透明度</span>
            <RangeSlider
              :modelValue="modelValue.backgroundOpacity ?? 0.05"
              @update:modelValue="updateField('backgroundOpacity', $event)"
              :min="0" :max="0.3" :step="0.01"
              class="flex-1"
            />
          </div>
          <div class="flex items-center gap-2 flex-1 min-w-[200px]">
            <span class="text-xs text-gray-500 dark:text-gray-500 whitespace-nowrap">二维码内容</span>
            <input
              type="text"
              :value="modelValue.qrContent || ''"
              @input="updateField('qrContent', ($event.target as HTMLInputElement).value)"
              placeholder="默认为项目地址"
              class="qr-input"
            />
          </div>
        </div>

        <!-- 字体配置分组 -->
        <div v-for="(group, gi) in fieldGroups" :key="gi">
          <div :class="fontGridClass">
            <div v-for="field in group.fields" :key="field.key" class="space-y-1.5">
              <label class="block text-xs font-medium text-gray-500 dark:text-gray-500">
                {{ field.label }}
              </label>
              <div class="flex gap-1.5">
                <CustomSelect
                  :modelValue="modelValue.fonts[field.key]?.family || ''"
                  @update:modelValue="updateFontFamily(field.key, $event)"
                  :options="fontList"
                  :optionClass="getFontOptionClass"
                  :filterable="true"
                  class="flex-1 min-w-0"
                />
                <NumberInput
                  :modelValue="modelValue.fonts[field.key]?.size ?? 16"
                  @update:modelValue="updateFontSize(field.key, $event)"
                  :min="field.sizeMin"
                  :max="field.sizeMax"
                  :step="1"
                />
              </div>
            </div>
          </div>
          <hr v-if="gi < fieldGroups.length - 1" class="border-gray-100 dark:border-gray-700/50 mt-4" />
        </div>

        <!-- 底部 -->
        <div class="flex justify-end pt-2 border-t border-gray-100 dark:border-gray-700/50">
          <button @click="resetToDefault" class="reset-btn">重置默认</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { TicketStyleConfig, StyleFieldGroup } from '@/types'
import { FONT_FAMILY_OPTIONS } from '@/constants'
import { getLocalFonts, checkFontAvailable } from '@/utils/font'
import ToggleSwitch from '@/components/common/ToggleSwitch.vue'
import RangeSlider from '@/components/common/RangeSlider.vue'
import CustomSelect from '@/components/common/CustomSelect.vue'
import NumberInput from '@/components/common/NumberInput.vue'

const props = withDefaults(
  defineProps<{
    modelValue: TicketStyleConfig
    defaultConfig: TicketStyleConfig
    fieldGroups: StyleFieldGroup[]
    compact?: boolean
  }>(),
  { compact: false },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: TicketStyleConfig): void
}>()

const fontGridClass = computed(() => {
  if (props.compact) {
    return 'grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3'
  }
  return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-4 gap-y-3'
})

const isExpanded = ref(false)
const localFonts = ref<string[]>([])
const fontLoadStatus = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
const fontsChecked = ref(false)

const fontList = computed(() => {
  const fonts = new Set([...FONT_FAMILY_OPTIONS, ...localFonts.value])
  return Array.from(fonts).sort()
})

/** 判断字体是否可用 */
const isFontAvailable = (family: string): boolean => {
  if (!fontsChecked.value) return true // 还没检测完，先不标红
  return checkFontAvailable(family)
}

/** 给 CustomSelect 的 optionClass */
const getFontOptionClass = (option: string): string => {
  if (!isFontAvailable(option)) return 'font-unavailable'
  return ''
}

const fontLoadStatusText = computed(() => {
  switch (fontLoadStatus.value) {
    case 'loading': return '检测字体中...'
    case 'success': return `已检测 ${fontList.value.length} 个字体`
    case 'error': return '字体检测失败'
    default: return ''
  }
})

const fontLoadStatusClass = computed(() => {
  switch (fontLoadStatus.value) {
    case 'loading': return 'status-loading'
    case 'success': return 'status-success'
    case 'error': return 'status-error'
    default: return 'status-idle'
  }
})

/** 进入页面自动加载字体列表 */
const loadFonts = async () => {
  fontLoadStatus.value = 'loading'
  try {
    const fonts = await getLocalFonts()
    if (fonts.length > 0) {
      localFonts.value = fonts
    }
    fontLoadStatus.value = 'success'
  } catch {
    fontLoadStatus.value = 'error'
  }
  // 标记检测完成，触发可用性判断
  fontsChecked.value = true
}

onMounted(loadFonts)

const updateField = (key: string, value: string | number | boolean) => {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

const updateFontFamily = (key: string, family: string) => {
  emit('update:modelValue', {
    ...props.modelValue,
    fonts: { ...props.modelValue.fonts, [key]: { ...props.modelValue.fonts[key], family } },
  })
}

const updateFontSize = (key: string, size: number) => {
  if (isNaN(size) || size <= 0) return
  emit('update:modelValue', {
    ...props.modelValue,
    fonts: { ...props.modelValue.fonts, [key]: { ...props.modelValue.fonts[key], size } },
  })
}

const updateWearEnabled = (enabled: boolean) => {
  emit('update:modelValue', {
    ...props.modelValue,
    wearEffect: { ...props.modelValue.wearEffect, enabled },
  })
}

const updateWearIntensity = (intensity: number) => {
  emit('update:modelValue', {
    ...props.modelValue,
    wearEffect: { ...props.modelValue.wearEffect, intensity },
  })
}

const resetToDefault = () => {
  emit('update:modelValue', JSON.parse(JSON.stringify(props.defaultConfig)))
}
</script>

<style scoped>
.style-config {
  @apply px-4 py-3 rounded-xl transition-colors;
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.04);
}

html.dark .style-config {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.06);
}

.font-status {
  @apply text-xs;
}
.status-idle {
  @apply text-gray-400;
}
.status-loading {
  @apply text-gray-400;
}
.status-success {
  @apply text-green-600 dark:text-green-400;
}
.status-error {
  @apply text-red-500 dark:text-red-400;
}

.qr-input {
  @apply flex-1 min-w-0 px-3 py-1.5 text-sm rounded-lg transition-colors duration-150;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: white;
  outline: none;
}

.qr-input:focus {
  border-color: rgba(0, 0, 0, 0.2);
}

html.dark .qr-input {
  border-color: rgba(255, 255, 255, 0.08);
  background: #1c1c1e;
  color: #e5e5e5;
}

html.dark .qr-input:focus {
  border-color: rgba(255, 255, 255, 0.2);
}

.reset-btn {
  @apply px-3 py-1.5 text-xs rounded-lg transition-all duration-150 active:scale-[0.97];
  @apply text-gray-500 bg-gray-100 hover:bg-gray-200;
  @apply dark:text-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600;
}

.expand-enter-active, .expand-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}
.expand-enter-from, .expand-leave-to {
  opacity: 0;
  max-height: 0;
}
.expand-enter-to, .expand-leave-from {
  opacity: 1;
  max-height: 2000px;
}
</style>
