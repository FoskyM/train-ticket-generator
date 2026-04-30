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
  <div class="num-input" :class="{ disabled, full: fullWidth }">
    <button type="button" class="num-btn" :disabled="disabled || atMin" @click="decrement">
      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M20 12H4" />
      </svg>
    </button>
    <input
      ref="inputRef"
      type="text"
      inputmode="numeric"
      :value="displayValue"
      :disabled="disabled"
      class="num-field"
      @focus="onFocus"
      @blur="onBlur"
      @keydown="onKeydown"
      @input="onInput"
    />
    <button type="button" class="num-btn" :disabled="disabled || atMax" @click="increment">
      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2.5"
          d="M12 4v16m8-8H4"
        />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: number | string
    min?: number
    max?: number
    step?: number
    disabled?: boolean
    fullWidth?: boolean
  }>(),
  { min: 0, max: Infinity, step: 1, disabled: false, fullWidth: false },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | string): void
}>()

const inputRef = ref<HTMLInputElement>()

const numValue = computed(() => {
  const n = Number(props.modelValue)
  return isNaN(n) ? props.min : n
})

const displayValue = computed(() => {
  if (props.step < 1) return numValue.value.toFixed(2)
  return String(numValue.value)
})

const atMin = computed(() => numValue.value <= props.min)
const atMax = computed(() => numValue.value >= props.max)

const clamp = (v: number): number => Math.min(props.max, Math.max(props.min, v))

const emitValue = (v: number) => {
  const clamped = clamp(v)
  /* 如果原始 modelValue 是 string，emit string 保持类型一致 */
  if (typeof props.modelValue === 'string') {
    emit('update:modelValue', String(clamped))
  } else {
    emit('update:modelValue', clamped)
  }
}

const increment = () => emitValue(numValue.value + props.step)
const decrement = () => emitValue(numValue.value - props.step)

const onFocus = (e: FocusEvent) => {
  ;(e.target as HTMLInputElement).select()
}

const onBlur = (e: FocusEvent) => {
  const v = Number((e.target as HTMLInputElement).value)
  if (isNaN(v)) {
    emitValue(numValue.value)
  } else {
    emitValue(v)
  }
}

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'ArrowUp') {
    e.preventDefault()
    increment()
  }
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    decrement()
  }
  if (e.key === 'Enter') {
    ;(e.target as HTMLInputElement).blur()
  }
}

const onInput = (e: Event) => {
  const input = e.target as HTMLInputElement
  input.value = input.value.replace(/[^0-9.]/g, '')
}
</script>

<style scoped>
.num-input {
  @apply inline-flex items-center rounded-lg overflow-hidden;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: white;
}

.num-input.full {
  @apply flex w-full;
}
.num-input.full .num-field {
  @apply flex-1 w-auto;
}

html.dark .num-input {
  border-color: rgba(255, 255, 255, 0.08);
  background: #1c1c1e;
}

.num-input.disabled {
  @apply opacity-50 pointer-events-none;
}

.num-btn {
  @apply flex items-center justify-center w-8 h-9 transition-colors duration-100 flex-shrink-0;
  @apply text-gray-500 hover:bg-black/5 active:bg-black/10;
  @apply dark:text-gray-400 dark:hover:bg-white/5 dark:active:bg-white/10;
  @apply disabled:opacity-30 disabled:pointer-events-none;
}

.num-field {
  @apply w-10 h-9 text-center text-sm bg-transparent outline-none tabular-nums;
  @apply text-gray-800 dark:text-gray-200;
  border-left: 1px solid rgba(0, 0, 0, 0.05);
  border-right: 1px solid rgba(0, 0, 0, 0.05);
}

html.dark .num-field {
  border-color: rgba(255, 255, 255, 0.05);
}
</style>
