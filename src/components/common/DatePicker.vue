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
  <div class="date-picker-wrapper" ref="wrapperRef">
    <button type="button" class="date-picker-trigger" :disabled="disabled" @click="togglePanel">
      <span :class="{ 'text-gray-400 dark:text-gray-500': !modelValue }">
        {{ displayText }}
      </span>
      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    </button>

    <Teleport to="body">
      <Transition name="dropdown">
        <div v-if="isOpen" class="date-picker-panel" :style="panelStyle" ref="panelRef">
          <!-- 年月导航 -->
          <div class="panel-header">
            <button type="button" @click="prevMonth" class="nav-btn">&lt;</button>
            <div class="flex items-center gap-1">
              <button
                type="button"
                @click="
                  () => {
                    showYearSelect = !showYearSelect
                    showMonthSelect = false
                  }
                "
                class="header-btn"
              >
                {{ currentYear }}年
              </button>
              <button
                type="button"
                @click="
                  () => {
                    showMonthSelect = !showMonthSelect
                    showYearSelect = false
                  }
                "
                class="header-btn"
              >
                {{ currentMonth + 1 }}月
              </button>
            </div>
            <button type="button" @click="nextMonth" class="nav-btn">&gt;</button>
          </div>

          <!-- 年份选择 -->
          <div v-if="showYearSelect" class="year-month-grid">
            <button
              v-for="y in yearRange"
              :key="y"
              type="button"
              class="ym-btn"
              :class="{ active: y === currentYear }"
              @click="
                () => {
                  currentYear = y
                  showYearSelect = false
                }
              "
            >
              {{ y }}
            </button>
          </div>

          <!-- 月份选择 -->
          <div v-else-if="showMonthSelect" class="year-month-grid month-grid">
            <button
              v-for="m in 12"
              :key="m"
              type="button"
              class="ym-btn"
              :class="{ active: m - 1 === currentMonth }"
              @click="
                () => {
                  currentMonth = m - 1
                  showMonthSelect = false
                }
              "
            >
              {{ m }}月
            </button>
          </div>

          <!-- 日历网格 -->
          <template v-else>
            <div class="weekday-row">
              <span v-for="d in weekdays" :key="d">{{ d }}</span>
            </div>
            <div class="day-grid">
              <button
                v-for="(day, idx) in calendarDays"
                :key="idx"
                type="button"
                class="day-btn"
                :class="{
                  'other-month': !day.currentMonth,
                  today: day.isToday,
                  selected: day.isSelected,
                }"
                @click="selectDate(day)"
              >
                {{ day.day }}
              </button>
            </div>
          </template>

          <!-- 底部快捷操作 -->
          <div class="panel-footer">
            <button type="button" class="today-btn" @click="selectToday">今天</button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps<{
  modelValue: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const wrapperRef = ref<HTMLElement>()
const panelRef = ref<HTMLElement>()
const isOpen = ref(false)
const showYearSelect = ref(false)
const showMonthSelect = ref(false)

const now = new Date()
const currentYear = ref(now.getFullYear())
const currentMonth = ref(now.getMonth())

const weekdays = ['日', '一', '二', '三', '四', '五', '六']

const displayText = computed(() => {
  if (!props.modelValue) return '请选择日期'
  return props.modelValue
})

const yearRange = computed(() => {
  const years: number[] = []
  for (let y = currentYear.value - 6; y <= currentYear.value + 5; y++) {
    years.push(y)
  }
  return years
})

interface CalendarDay {
  day: number
  month: number
  year: number
  currentMonth: boolean
  isToday: boolean
  isSelected: boolean
}

const calendarDays = computed<CalendarDay[]>(() => {
  const days: CalendarDay[] = []
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const startWeekday = firstDay.getDay()
  const daysInMonth = new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
  const prevMonthDays = new Date(currentYear.value, currentMonth.value, 0).getDate()

  const today = new Date()
  const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate())

  // 上月补位
  for (let i = startWeekday - 1; i >= 0; i--) {
    const d = prevMonthDays - i
    const m = currentMonth.value - 1
    const y = m < 0 ? currentYear.value - 1 : currentYear.value
    const actualM = m < 0 ? 11 : m
    days.push({
      day: d,
      month: actualM,
      year: y,
      currentMonth: false,
      isToday: formatDate(y, actualM, d) === todayStr,
      isSelected: formatDate(y, actualM, d) === props.modelValue,
    })
  }

  // 当月
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({
      day: d,
      month: currentMonth.value,
      year: currentYear.value,
      currentMonth: true,
      isToday: formatDate(currentYear.value, currentMonth.value, d) === todayStr,
      isSelected: formatDate(currentYear.value, currentMonth.value, d) === props.modelValue,
    })
  }

  // 下月补位
  const remaining = 42 - days.length
  for (let d = 1; d <= remaining; d++) {
    const m = currentMonth.value + 1
    const y = m > 11 ? currentYear.value + 1 : currentYear.value
    const actualM = m > 11 ? 0 : m
    days.push({
      day: d,
      month: actualM,
      year: y,
      currentMonth: false,
      isToday: formatDate(y, actualM, d) === todayStr,
      isSelected: formatDate(y, actualM, d) === props.modelValue,
    })
  }

  return days
})

const formatDate = (y: number, m: number, d: number): string => {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

const panelStyle = ref<Record<string, string>>({})

const updatePanelPosition = () => {
  if (!wrapperRef.value) return
  const rect = wrapperRef.value.getBoundingClientRect()
  const spaceBelow = window.innerHeight - rect.bottom
  const panelHeight = 340

  if (spaceBelow < panelHeight && rect.top > panelHeight) {
    panelStyle.value = {
      position: 'fixed',
      left: `${rect.left}px`,
      bottom: `${window.innerHeight - rect.top + 4}px`,
      zIndex: '9999',
      width: `${Math.max(rect.width, 280)}px`,
    }
  } else {
    panelStyle.value = {
      position: 'fixed',
      left: `${rect.left}px`,
      top: `${rect.bottom + 4}px`,
      zIndex: '9999',
      width: `${Math.max(rect.width, 280)}px`,
    }
  }
}

const togglePanel = () => {
  if (isOpen.value) {
    isOpen.value = false
    return
  }
  // 初始化到当前选中日期
  if (props.modelValue) {
    const parts = props.modelValue.split('-')
    currentYear.value = parseInt(parts[0])
    currentMonth.value = parseInt(parts[1]) - 1
  }
  showYearSelect.value = false
  showMonthSelect.value = false
  isOpen.value = true
  nextTick(updatePanelPosition)
}

const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

const selectDate = (day: CalendarDay) => {
  emit('update:modelValue', formatDate(day.year, day.month, day.day))
  isOpen.value = false
}

const selectToday = () => {
  const today = new Date()
  emit('update:modelValue', formatDate(today.getFullYear(), today.getMonth(), today.getDate()))
  isOpen.value = false
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

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      const parts = val.split('-')
      currentYear.value = parseInt(parts[0])
      currentMonth.value = parseInt(parts[1]) - 1
    }
  },
)
</script>

<style scoped>
.date-picker-wrapper {
  @apply relative;
}

.date-picker-trigger {
  @apply w-full flex items-center justify-between px-3 py-2 text-left text-sm rounded-lg;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
  @apply transition-colors duration-150;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: white;
  outline: none;
}

.date-picker-trigger:focus {
  border-color: rgba(0, 0, 0, 0.2);
}

html.dark .date-picker-trigger {
  border-color: rgba(255, 255, 255, 0.08);
  background: #1c1c1e;
  color: #e5e5e5;
}

html.dark .date-picker-trigger:focus {
  border-color: rgba(255, 255, 255, 0.2);
}

.date-picker-panel {
  @apply bg-white/80 backdrop-blur-xl rounded-xl shadow-lg shadow-black/5 border border-gray-200/60 p-4;
  @apply dark:bg-gray-800/80 dark:backdrop-blur-xl dark:border-gray-700/60;
}

.panel-header {
  @apply flex items-center justify-between mb-2;
}

.nav-btn {
  @apply w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 text-sm;
  @apply dark:text-gray-400 dark:hover:bg-gray-700;
}

.header-btn {
  @apply px-2 py-0.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg;
  @apply dark:text-gray-300 dark:hover:bg-gray-700;
}

.weekday-row {
  @apply grid grid-cols-7 text-center text-xs text-gray-500 dark:text-gray-400 mb-1;
}

.day-grid {
  @apply grid grid-cols-7 gap-0.5;
}

.day-btn {
  @apply w-full aspect-square flex items-center justify-center text-sm rounded-lg;
  @apply hover:bg-blue-50 dark:hover:bg-blue-900/30;
  @apply text-gray-700 dark:text-gray-300;
}

.day-btn.other-month {
  @apply text-gray-300 dark:text-gray-600;
}

.day-btn.today {
  @apply font-bold text-blue-600 dark:text-blue-400;
}

.day-btn.selected {
  @apply bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500;
}

.year-month-grid {
  @apply grid grid-cols-4 gap-1 py-2;
}

.month-grid {
  @apply grid-cols-3;
}

.ym-btn {
  @apply px-2 py-1.5 text-sm rounded text-gray-700 hover:bg-gray-100;
  @apply dark:text-gray-300 dark:hover:bg-gray-700;
}

.ym-btn.active {
  @apply bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600;
}

.panel-footer {
  @apply flex justify-center mt-2 pt-2 border-t border-gray-100 dark:border-gray-700;
}

.today-btn {
  @apply text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300;
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
