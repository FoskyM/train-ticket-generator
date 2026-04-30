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
  <div class="badge-group">
    <span class="badge-label">{{ label }}</span>
    <div class="badge-list">
      <button
        v-for="opt in options"
        :key="opt.value"
        type="button"
        class="badge"
        :class="{
          active: isActive(opt.value),
          disabled: opt.disabled,
        }"
        :disabled="opt.disabled"
        @click="toggle(opt.value)"
      >
        {{ opt.label }}
      </button>
      <!-- 自定义输入 -->
      <div v-if="allowCustom" class="badge-custom" :class="{ active: isCustomActive }">
        <input
          ref="customInputRef"
          type="text"
          :value="customInputValue"
          :maxlength="maxCustomLength"
          :placeholder="customPlaceholder"
          class="badge-custom-input"
          @input="onCustomInput"
          @focus="onCustomFocus"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

export interface BadgeOption {
  label: string
  value: string
  disabled?: boolean
}

const props = withDefaults(
  defineProps<{
    label: string
    options: BadgeOption[]
    modelValue: string | string[]
    multiple?: boolean
    allowDeselect?: boolean
    /** 是否允许自定义文本输入 */
    allowCustom?: boolean
    /** 自定义输入最大字符数 */
    maxCustomLength?: number
    /** 自定义输入占位符 */
    customPlaceholder?: string
  }>(),
  {
    multiple: false,
    allowDeselect: true,
    allowCustom: false,
    maxCustomLength: 1,
    customPlaceholder: '自定义',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | string[]): void
}>()

const customInputRef = ref<HTMLInputElement>()

/** 所有预设选项的 value 集合 */
const presetValues = computed(() => new Set(props.options.map((o) => o.value)))

/** 当前值是否是自定义输入的（不在预设选项中且非空） */
const isCustomActive = computed(() => {
  if (props.multiple) return false
  const val = props.modelValue as string
  return val !== '' && !presetValues.value.has(val)
})

/** 自定义输入框显示的值 */
const customInputValue = computed(() => {
  if (isCustomActive.value) return props.modelValue as string
  return ''
})

const isActive = (val: string): boolean => {
  if (props.multiple) {
    return Array.isArray(props.modelValue) && props.modelValue.includes(val)
  }
  return props.modelValue === val
}

const toggle = (val: string) => {
  if (props.multiple) {
    const arr = Array.isArray(props.modelValue) ? [...props.modelValue] : []
    const idx = arr.indexOf(val)
    if (idx >= 0) {
      arr.splice(idx, 1)
    } else {
      arr.push(val)
    }
    emit('update:modelValue', arr)
  } else {
    if (props.modelValue === val && props.allowDeselect) {
      emit('update:modelValue', '')
    } else {
      emit('update:modelValue', val)
    }
  }
}

const onCustomInput = (e: Event) => {
  const input = e.target as HTMLInputElement
  const val = input.value.slice(0, props.maxCustomLength)
  input.value = val
  emit('update:modelValue', val)
}

const onCustomFocus = () => {
  /* 聚焦自定义输入时，如果当前选中的是预设值，清空让用户输入 */
  if (!isCustomActive.value && props.modelValue) {
    emit('update:modelValue', '')
  }
}
</script>

<style scoped>
.badge-group {
  @apply flex items-center gap-2 flex-wrap;
}

.badge-label {
  @apply text-xs text-gray-500 dark:text-gray-400 flex-shrink-0;
}

.badge-list {
  @apply flex items-center gap-1 flex-wrap;
}

.badge {
  @apply px-2.5 py-1 text-xs rounded-lg transition-all duration-150 select-none;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: rgba(0, 0, 0, 0.02);
  color: #6b7280;
}

.badge:hover:not(.disabled) {
  background: rgba(0, 0, 0, 0.05);
}

.badge:active:not(.disabled) {
  transform: scale(0.96);
}

.badge.active {
  background: rgba(59, 130, 246, 0.08);
  border-color: rgba(59, 130, 246, 0.3);
  color: #2563eb;
}

.badge.disabled {
  @apply opacity-40 cursor-not-allowed;
}

/* 自定义输入 badge */
.badge-custom {
  @apply inline-flex items-center rounded-lg transition-all duration-150;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: rgba(0, 0, 0, 0.02);
}

.badge-custom.active {
  background: rgba(59, 130, 246, 0.08);
  border-color: rgba(59, 130, 246, 0.3);
}

.badge-custom-input {
  @apply w-12 px-1.5 py-1 text-xs text-center bg-transparent outline-none;
  color: #6b7280;
}

.badge-custom.active .badge-custom-input {
  color: #2563eb;
}

html.dark .badge {
  border-color: rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.03);
  color: #9ca3af;
}

html.dark .badge:hover:not(.disabled) {
  background: rgba(255, 255, 255, 0.06);
}

html.dark .badge.active {
  background: rgba(96, 165, 250, 0.12);
  border-color: rgba(96, 165, 250, 0.3);
  color: #60a5fa;
}

html.dark .badge-custom {
  border-color: rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.03);
}

html.dark .badge-custom.active {
  background: rgba(96, 165, 250, 0.12);
  border-color: rgba(96, 165, 250, 0.3);
}

html.dark .badge-custom-input {
  color: #9ca3af;
}

html.dark .badge-custom.active .badge-custom-input {
  color: #60a5fa;
}
</style>
