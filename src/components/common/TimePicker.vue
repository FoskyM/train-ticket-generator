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
 * This file is created by FoskyM on 2026/04/27.
 * -->

<template>
  <div class="time-picker-wrapper" ref="wrapperRef">
    <button type="button" class="time-picker-trigger" :disabled="disabled" @click="togglePanel">
      <span :class="{ 'text-gray-400 dark:text-gray-500': !modelValue }">
        {{ modelValue || '请选择时间' }}
      </span>
      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </button>

    <Teleport to="body">
      <Transition name="dropdown">
        <div v-if="isOpen" class="time-picker-panel" :style="panelStyle" ref="panelRef">
          <div class="time-columns">
            <!-- 小时列 -->
            <div class="time-column" ref="hourColumnRef">
              <div class="column-label">时</div>
              <div class="column-scroll">
                <button
                  v-for="h in 24"
                  :key="h - 1"
                  type="button"
                  class="time-item"
                  :class="{ selected: selectedHour === h - 1 }"
                  :ref="(el) => { if (selectedHour === h - 1) hourActiveRef = el }"
                  @click="selectedHour = h - 1; emitValue()"
                >
                  {{ String(h - 1).padStart(2, '0') }}
                </button>
              </div>
            </div>

            <!-- 分隔符 -->
            <div class="time-separator">:</div>

            <!-- 分钟列 -->
            <div class="time-column" ref="minuteColumnRef">
              <div class="column-label">分</div>
              <div class="column-scroll">
                <button
                  v-for="m in 60"
                  :key="m - 1"
                  type="button"
                  class="time-item"
                  :class="{ selected: selectedMinute === m - 1 }"
                  :ref="(el) => { if (selectedMinute === m - 1) minuteActiveRef = el }"
                  @click="selectedMinute = m - 1; emitValue()"
                >
                  {{ String(m - 1).padStart(2, '0') }}
                </button>
              </div>
            </div>
          </div>

          <!-- 底部操作 -->
          <div class="panel-footer">
            <button type="button" class="now-btn" @click="selectNow">此刻</button>
            <button type="button" class="confirm-btn" @click="isOpen = false">确定</button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch, type ComponentPublicInstance } from 'vue'

const props = defineProps<{
  modelValue: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const wrapperRef = ref<HTMLElement>()
const panelRef = ref<HTMLElement>()
const hourColumnRef = ref<HTMLElement>()
const minuteColumnRef = ref<HTMLElement>()
const hourActiveRef = ref<Element | ComponentPublicInstance | null>(null)
const minuteActiveRef = ref<Element | ComponentPublicInstance | null>(null)
const isOpen = ref(false)

const selectedHour = ref(0)
const selectedMinute = ref(0)

// 解析初始值
const parseTime = (val: string) => {
  if (!val) return
  const parts = val.split(':')
  if (parts.length >= 2) {
    selectedHour.value = parseInt(parts[0]) || 0
    selectedMinute.value = parseInt(parts[1]) || 0
  }
}

parseTime(props.modelValue)

const emitValue = () => {
  const h = String(selectedHour.value).padStart(2, '0')
  const m = String(selectedMinute.value).padStart(2, '0')
  emit('update:modelValue', `${h}:${m}`)
}

const panelStyle = ref<Record<string, string>>({})

const updatePanelPosition = () => {
  if (!wrapperRef.value) return
  const rect = wrapperRef.value.getBoundingClientRect()
  const spaceBelow = window.innerHeight - rect.bottom
  const panelHeight = 280

  if (spaceBelow < panelHeight && rect.top > panelHeight) {
    panelStyle.value = {
      position: 'fixed',
      left: `${rect.left}px`,
      bottom: `${window.innerHeight - rect.top + 4}px`,
      zIndex: '9999',
      width: `${Math.max(rect.width, 200)}px`,
    }
  } else {
    panelStyle.value = {
      position: 'fixed',
      left: `${rect.left}px`,
      top: `${rect.bottom + 4}px`,
      zIndex: '9999',
      width: `${Math.max(rect.width, 200)}px`,
    }
  }
}

const scrollToSelected = () => {
  nextTick(() => {
    const hEl = hourActiveRef.value
    const mEl = minuteActiveRef.value
    if (hEl instanceof Element) hEl.scrollIntoView({ block: 'center', behavior: 'auto' })
    if (mEl instanceof Element) mEl.scrollIntoView({ block: 'center', behavior: 'auto' })
  })
}

const togglePanel = () => {
  if (isOpen.value) {
    isOpen.value = false
    return
  }
  parseTime(props.modelValue)
  isOpen.value = true
  nextTick(() => {
    updatePanelPosition()
    scrollToSelected()
  })
}

const selectNow = () => {
  const now = new Date()
  selectedHour.value = now.getHours()
  selectedMinute.value = now.getMinutes()
  emitValue()
  nextTick(scrollToSelected)
}

const onClickOutside = (e: MouseEvent) => {
  if (wrapperRef.value?.contains(e.target as Node) || panelRef.value?.contains(e.target as Node)) {
    return
  }
  isOpen.value = false
}

onMounted(() => {
  document.addEventListener('mousedown', onClickOutside)
  window.addEventListener('scroll', updatePanelPosition, true)
  window.addEventListener('resize', updatePanelPosition)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', onClickOutside)
  window.removeEventListener('scroll', updatePanelPosition, true)
  window.removeEventListener('resize', updatePanelPosition)
})

watch(() => props.modelValue, parseTime)
</script>

<style scoped>
.time-picker-wrapper {
  @apply relative;
}

.time-picker-trigger {
  @apply w-full flex items-center justify-between px-3 py-2 text-left text-sm rounded-lg;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
  @apply transition-colors duration-150;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: white;
  outline: none;
}

.time-picker-trigger:focus {
  border-color: rgba(0, 0, 0, 0.2);
}

html.dark .time-picker-trigger {
  border-color: rgba(255, 255, 255, 0.08);
  background: #1c1c1e;
  color: #e5e5e5;
}

html.dark .time-picker-trigger:focus {
  border-color: rgba(255, 255, 255, 0.2);
}

.time-picker-panel {
  @apply bg-white/80 backdrop-blur-xl rounded-xl shadow-lg shadow-black/5 border border-gray-200/60 p-4;
  @apply dark:bg-gray-800/80 dark:backdrop-blur-xl dark:border-gray-700/60;
}

.time-columns {
  @apply flex items-start justify-center gap-1;
}

.time-column {
  @apply flex flex-col items-center;
}

.column-label {
  @apply text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium;
}

.column-scroll {
  @apply overflow-y-auto;
  height: 200px;
  width: 60px;
  scrollbar-width: thin;
}

.column-scroll::-webkit-scrollbar {
  width: 4px;
}

.column-scroll::-webkit-scrollbar-thumb {
  @apply bg-gray-300 dark:bg-gray-600 rounded;
}

.time-item {
  @apply w-full py-1 text-center text-sm rounded;
  @apply text-gray-700 hover:bg-gray-100;
  @apply dark:text-gray-300 dark:hover:bg-gray-700;
}

.time-item.selected {
  @apply bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500;
}

.time-separator {
  @apply text-lg font-bold text-gray-400 dark:text-gray-500 mt-6;
}

.panel-footer {
  @apply flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-gray-700;
}

.now-btn {
  @apply text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300;
}

.confirm-btn {
  @apply px-3 py-0.5 text-xs text-white bg-blue-500 rounded hover:bg-blue-600;
  @apply dark:bg-blue-600 dark:hover:bg-blue-500;
}

/* 下拉动画 */
.dropdown-enter-active,
.dropdown-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
