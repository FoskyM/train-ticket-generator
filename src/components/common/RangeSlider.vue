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
 * This file is created by FoskyM on 2026/04/30.
 * -->

<template>
  <div class="slider-wrap">
    <div
      class="slider-track"
      ref="trackRef"
      @mousedown="onTrackClick"
      @touchstart.prevent="onTouchStart"
    >
      <div class="slider-fill" :style="{ width: percent + '%' }" />
      <div
        class="slider-thumb"
        :style="{ left: percent + '%' }"
        @mousedown.stop="onThumbDown"
        @touchstart.stop.prevent="onTouchStart"
      />
    </div>
    <span v-if="showValue" class="slider-value">{{ displayValue }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: number
    min?: number
    max?: number
    step?: number
    showValue?: boolean
    formatValue?: (v: number) => string
  }>(),
  { min: 0, max: 1, step: 0.01, showValue: true },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
}>()

const trackRef = ref<HTMLElement>()

const percent = computed(() => {
  return ((props.modelValue - props.min) / (props.max - props.min)) * 100
})

const displayValue = computed(() => {
  if (props.formatValue) return props.formatValue(props.modelValue)
  return `${Math.round(props.modelValue * 100)}%`
})

const clampToStep = (val: number): number => {
  const clamped = Math.min(props.max, Math.max(props.min, val))
  const steps = Math.round((clamped - props.min) / props.step)
  return +(props.min + steps * props.step).toFixed(10)
}

const updateFromX = (clientX: number) => {
  if (!trackRef.value) return
  const rect = trackRef.value.getBoundingClientRect()
  const ratio = (clientX - rect.left) / rect.width
  const val = props.min + ratio * (props.max - props.min)
  emit('update:modelValue', clampToStep(val))
}

const onTrackClick = (e: MouseEvent) => {
  updateFromX(e.clientX)
  onThumbDown()
}

const onThumbDown = () => {
  const onMove = (ev: MouseEvent) => updateFromX(ev.clientX)
  const onUp = () => {
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
  }
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
}

const onTouchStart = (e: TouchEvent) => {
  if (e.touches.length !== 1) return
  updateFromX(e.touches[0].clientX)
  const onMove = (ev: TouchEvent) => {
    if (ev.touches.length === 1) updateFromX(ev.touches[0].clientX)
  }
  const onEnd = () => {
    document.removeEventListener('touchmove', onMove)
    document.removeEventListener('touchend', onEnd)
  }
  document.addEventListener('touchmove', onMove, { passive: true })
  document.addEventListener('touchend', onEnd)
}
</script>

<style scoped>
.slider-wrap {
  @apply flex items-center gap-2;
}

.slider-track {
  @apply relative flex-1 h-1.5 rounded-full cursor-pointer;
  background: rgba(120, 120, 128, 0.16);
  min-width: 80px;
}

html.dark .slider-track {
  background: rgba(120, 120, 128, 0.36);
}

.slider-fill {
  @apply absolute left-0 top-0 h-full rounded-full;
  background: #007aff;
}

html.dark .slider-fill {
  background: #0a84ff;
}

.slider-thumb {
  @apply absolute top-1/2 -translate-y-1/2 rounded-full bg-white;
  width: 18px;
  height: 18px;
  margin-left: -9px;
  box-shadow:
    0 1px 4px rgba(0, 0, 0, 0.15),
    0 0 0 0.5px rgba(0, 0, 0, 0.04);
  transition: box-shadow 0.15s ease;
  touch-action: none;
}

.slider-thumb:hover {
  box-shadow:
    0 1px 6px rgba(0, 0, 0, 0.2),
    0 0 0 0.5px rgba(0, 0, 0, 0.06);
}

.slider-value {
  @apply text-xs tabular-nums text-gray-500 dark:text-gray-400 w-10 text-right flex-shrink-0;
}
</style>
