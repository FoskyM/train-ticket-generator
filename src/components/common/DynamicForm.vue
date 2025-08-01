<template>
  <form v-bind="$attrs">
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
            v-model="data[field.key]"
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
              v-model="data[field.key]"
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
            v-model="data[field.key]"
            class="mt-1 block w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </template>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import type { FieldInfoData } from '@/types'

const fieldInfo = defineModel<FieldInfoData>('fields', { required: true })
const data = defineModel<Record<string, any>>('modelValue', { required: true })

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
  for (const key in data.value) {
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
</script>
