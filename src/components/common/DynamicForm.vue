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
 * This file is created by FoskyM on 2025/08/02.
 * -->

<template>
  <form v-bind="$attrs">
    <div :class="gridClass">
      <div
        v-for="field in formFields"
        :key="field.key"
        :class="`col-span-${field.colSpan}`"
        class="space-y-1.5"
      >
        <label
          v-if="field.type !== 'checkbox'"
          :for="field.key"
          class="block text-sm font-medium text-gray-600 dark:text-gray-400"
        >
          {{ field.label }}
        </label>

        <CustomSelect
          v-if="field.type === 'select'"
          :modelValue="String(data[field.key])"
          @update:modelValue="data[field.key] = $event"
          :options="field.data ?? []"
          :disabled="field.disabled"
        />

        <DatePicker
          v-else-if="field.type === 'date'"
          :modelValue="String(data[field.key])"
          @update:modelValue="data[field.key] = $event"
          :disabled="field.disabled"
        />

        <TimePicker
          v-else-if="field.type === 'time'"
          :modelValue="String(data[field.key])"
          @update:modelValue="data[field.key] = $event"
          :disabled="field.disabled"
        />

        <div v-else-if="field.type === 'checkbox'" class="flex items-center gap-2.5 pt-1">
          <ToggleSwitch
            :modelValue="!!data[field.key]"
            @update:modelValue="data[field.key] = $event"
            :disabled="!!fieldInfo[field.key].disabled"
          />
          <span class="text-sm text-gray-700 dark:text-gray-300 select-none">
            {{ field.label }}
          </span>
        </div>

        <NumberInput
          v-else-if="field.type === 'number'"
          :modelValue="data[field.key]"
          @update:modelValue="data[field.key] = $event"
          :min="0"
          :max="field.max || Infinity"
          :step="Number(field.step) || 1"
          :disabled="field.disabled"
          :fullWidth="true"
        />

        <input
          v-else
          :type="field.type"
          :step="field.step || undefined"
          :maxlength="field.maxLength || undefined"
          :max="field.max || undefined"
          :id="field.key"
          :disabled="field.disabled"
          @input="field.onInput ? field.onInput($event) : undefined"
          @compositionstart="handleCompositionStart"
          @compositionend="handleCompositionEnd"
          v-model="data[field.key]"
          class="form-input"
        />
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FieldInfoData } from '@/types'
import DatePicker from '@/components/common/DatePicker.vue'
import TimePicker from '@/components/common/TimePicker.vue'
import CustomSelect from '@/components/common/CustomSelect.vue'
import ToggleSwitch from '@/components/common/ToggleSwitch.vue'
import NumberInput from '@/components/common/NumberInput.vue'

const props = withDefaults(
  defineProps<{
    compact?: boolean
  }>(),
  { compact: false },
)

const fieldInfo = defineModel<FieldInfoData>('fields', { required: true })
const data = defineModel<Record<string, any>>('modelValue', { required: true })

const gridClass = computed(() => {
  if (props.compact) {
    return 'grid grid-cols-1 sm:grid-cols-2 gap-4'
  }
  return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'
})

/* IME 组合状态（非响应式，仅用于输入验证中间态） */
let isComposing = false

const validateChineseInput = (event: Event) => {
  if (isComposing) return
  const input = event.target as HTMLInputElement
  if (!/^[\u4e00-\u9fa5]*$/.test(input.value)) {
    input.value = input.value.replace(/[^\u4e00-\u9fa5]/g, '')
  }
}

const handleCompositionStart = () => { isComposing = true }
const handleCompositionEnd = (event: Event) => { isComposing = false; validateChineseInput(event) }

const validateEnglishAndNumberInput = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!/^[A-Za-z0-9]*$/.test(input.value)) {
    input.value = input.value.replace(/[^A-Za-z0-9]/g, '')
  }
}

const validateNumberInput = (event: Event, maxValue: number) => {
  const input = event.target as HTMLInputElement
  if (!/^[0-9]*$/.test(input.value)) {
    input.value = input.value.replace(/[^0-9]/g, '')
  }
  if (parseInt(input.value) > maxValue) {
    input.value = maxValue.toString()
  }
}

interface FormField {
  key: string
  label: string
  type: string
  colSpan: number
  disabled: boolean
  data?: string[]
  step?: string
  maxLength?: number
  max?: number
  onInput?: (event: Event) => void
}

const generateFormFields = (): FormField[] => {
  const fields: FormField[] = []
  for (const key in data.value) {
    /* 跳过 fieldInfo 中未定义的字段（由外部组件单独管理） */
    if (!fieldInfo.value[key]) continue
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
</script>

<style scoped>
.form-input {
  @apply block w-full px-3 py-2 text-sm rounded-lg transition-colors duration-150;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: white;
  outline: none;
}

.form-input:focus {
  border-color: rgba(0, 0, 0, 0.2);
}

html.dark .form-input {
  border-color: rgba(255, 255, 255, 0.08);
  background: #1c1c1e;
  color: #e5e5e5;
}

html.dark .form-input:focus {
  border-color: rgba(255, 255, 255, 0.2);
}
</style>
