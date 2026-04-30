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
  <button
    type="button"
    role="switch"
    :aria-checked="modelValue"
    :disabled="disabled"
    class="toggle"
    :class="{ on: modelValue, disabled }"
    @click="toggle"
  >
    <span class="toggle-thumb" />
  </button>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: boolean
    disabled?: boolean
  }>(),
  { disabled: false },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const toggle = () => {
  if (!props.disabled) emit('update:modelValue', !props.modelValue)
}
</script>

<style scoped>
.toggle {
  @apply relative inline-flex items-center flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out;
  width: 40px;
  height: 24px;
  background-color: rgba(120, 120, 128, 0.16);
}

.toggle.on {
  background-color: #007aff;
}

.toggle.disabled {
  @apply opacity-50 cursor-not-allowed;
}

.toggle-thumb {
  @apply inline-block rounded-full bg-white transition-transform duration-200 ease-in-out;
  width: 20px;
  height: 20px;
  margin: 2px;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.15),
    0 0 0 0.5px rgba(0, 0, 0, 0.04);
}

.toggle.on .toggle-thumb {
  transform: translateX(16px);
}

html.dark .toggle {
  background-color: rgba(120, 120, 128, 0.32);
}

html.dark .toggle.on {
  background-color: #0a84ff;
}
</style>
