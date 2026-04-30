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
  <div class="cs-wrap" ref="wrapperRef">
    <button type="button" class="cs-trigger" :disabled="disabled" @click="togglePanel">
      <span class="cs-trigger-text" :class="[!modelValue ? 'cs-placeholder' : triggerValueClass]">
        <span class="cs-trigger-name">{{ displayText }}</span>
        <span v-if="modelValue && triggerValueClass" class="cs-trigger-badge">不可用</span>
      </span>
      <svg
        class="cs-arrow"
        :class="{ 'rotate-180': isOpen }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <Teleport to="body">
      <Transition name="dropdown">
        <div v-if="isOpen" class="cs-panel" :style="panelStyle" ref="panelRef">
          <div v-if="filterable" class="cs-search">
            <input
              ref="searchInputRef"
              v-model="searchQuery"
              type="text"
              class="cs-search-input"
              placeholder="搜索..."
              @keydown.enter="selectFirstMatch"
            />
          </div>

          <div class="cs-list" ref="listRef">
            <button
              v-for="option in filteredOptions"
              :key="option"
              type="button"
              class="cs-item"
              :class="[{ selected: option === modelValue }, getOptionClass(option)]"
              :ref="(el) => { if (option === modelValue) selectedItemRef = el }"
              @click="selectOption(option)"
            >
              <span class="cs-item-text">
                <span class="cs-item-name">{{ option }}</span>
                <span v-if="getOptionClass(option)" class="cs-item-badge">不可用</span>
              </span>
              <svg
                v-if="option === modelValue"
                class="cs-check"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </button>
            <div v-if="filteredOptions.length === 0" class="cs-empty">无匹配项</div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, type ComponentPublicInstance } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: string
    options: string[]
    disabled?: boolean
    placeholder?: string
    filterable?: boolean
    optionClass?: (option: string) => string
  }>(),
  {
    placeholder: '请选择',
    filterable: false,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const wrapperRef = ref<HTMLElement>()
const panelRef = ref<HTMLElement>()
const listRef = ref<HTMLElement>()
const searchInputRef = ref<HTMLInputElement>()
const selectedItemRef = ref<Element | ComponentPublicInstance | null>(null)
const isOpen = ref(false)
const searchQuery = ref('')

const displayText = computed(() => props.modelValue || props.placeholder)

const getOptionClass = (option: string): string => {
  return props.optionClass ? props.optionClass(option) : ''
}

const triggerValueClass = computed(() => {
  if (!props.modelValue || !props.optionClass) return ''
  return props.optionClass(props.modelValue)
})

const filteredOptions = computed(() => {
  if (!searchQuery.value) return props.options
  const q = searchQuery.value.toLowerCase()
  return props.options.filter((opt) => opt.toLowerCase().includes(q))
})

const panelStyle = ref<Record<string, string>>({})

const updatePanelPosition = () => {
  if (!wrapperRef.value) return
  const rect = wrapperRef.value.getBoundingClientRect()
  const spaceBelow = window.innerHeight - rect.bottom
  const panelHeight = 260

  if (spaceBelow < panelHeight && rect.top > panelHeight) {
    panelStyle.value = {
      position: 'fixed',
      left: `${rect.left}px`,
      bottom: `${window.innerHeight - rect.top + 4}px`,
      zIndex: '9999',
      width: `${Math.max(rect.width, 220)}px`,
    }
  } else {
    panelStyle.value = {
      position: 'fixed',
      left: `${rect.left}px`,
      top: `${rect.bottom + 4}px`,
      zIndex: '9999',
      width: `${Math.max(rect.width, 220)}px`,
    }
  }
}

const togglePanel = () => {
  if (isOpen.value) {
    isOpen.value = false
    return
  }
  searchQuery.value = ''
  isOpen.value = true
  nextTick(() => {
    updatePanelPosition()
    searchInputRef.value?.focus()
    nextTick(() => {
      const el = selectedItemRef.value
      if (el instanceof Element) el.scrollIntoView({ block: 'center', behavior: 'auto' })
    })
  })
}

const selectOption = (option: string) => {
  emit('update:modelValue', option)
  isOpen.value = false
}

const selectFirstMatch = () => {
  if (filteredOptions.value.length > 0) {
    selectOption(filteredOptions.value[0])
  }
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
</script>

<style scoped>
.cs-wrap {
  @apply relative;
}

/* 触发器 */
.cs-trigger {
  @apply w-full flex items-center gap-1.5 px-3 py-2 text-left text-sm rounded-lg;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
  @apply transition-colors duration-150;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: white;
  outline: none;
}
.cs-trigger:focus {
  border-color: rgba(0, 0, 0, 0.2);
}
html.dark .cs-trigger {
  border-color: rgba(255, 255, 255, 0.08);
  background: #1c1c1e;
  color: #e5e5e5;
}
html.dark .cs-trigger:focus {
  border-color: rgba(255, 255, 255, 0.2);
}

.cs-trigger-text {
  @apply flex-1 min-w-0 flex items-center gap-1;
}
.cs-trigger-name {
  @apply truncate;
}
.cs-placeholder {
  @apply text-gray-400 dark:text-gray-500;
}
.cs-arrow {
  @apply w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-150;
}

/* 不可用标记 — 触发器 */
.cs-trigger-text.font-unavailable .cs-trigger-name {
  color: #ef4444;
}
.cs-trigger-badge {
  @apply flex-shrink-0 text-xs px-1 py-px rounded;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.08);
  font-size: 0.65em;
}

/* 面板 */
.cs-panel {
  @apply rounded-xl shadow-lg shadow-black/5;
  background: rgba(255, 255, 255, 0.85);
  -webkit-backdrop-filter: blur(20px);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 0, 0, 0.06);
}
html.dark .cs-panel {
  background: rgba(44, 44, 46, 0.85);
  border-color: rgba(255, 255, 255, 0.06);
}

.cs-search {
  @apply p-2 border-b border-gray-100 dark:border-gray-700;
}
.cs-search-input {
  @apply w-full px-2.5 py-1.5 text-sm rounded-lg;
  border: 1px solid rgba(0, 0, 0, 0.08);
  outline: none;
}
.cs-search-input:focus {
  border-color: rgba(0, 0, 0, 0.2);
}
html.dark .cs-search-input {
  border-color: rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.2);
  color: #e5e5e5;
}
html.dark .cs-search-input:focus {
  border-color: rgba(255, 255, 255, 0.2);
}

/* 列表 */
.cs-list {
  @apply overflow-y-auto py-1 px-1;
  max-height: 220px;
}

.cs-item {
  @apply w-full flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-left rounded-lg;
  @apply text-gray-700 dark:text-gray-300;
  @apply transition-colors duration-100;
}
.cs-item:hover {
  background: rgba(0, 0, 0, 0.04);
}
html.dark .cs-item:hover {
  background: rgba(255, 255, 255, 0.06);
}
.cs-item.selected {
  @apply text-blue-600 dark:text-blue-400;
  background: rgba(59, 130, 246, 0.06);
}
html.dark .cs-item.selected {
  background: rgba(59, 130, 246, 0.12);
}

.cs-item-text {
  @apply flex-1 min-w-0 flex items-center gap-1;
}
.cs-item-name {
  @apply truncate;
}
.cs-check {
  @apply w-4 h-4 text-blue-500 flex-shrink-0;
}

/* 不可用标记 — 选项 */
.cs-item.font-unavailable .cs-item-name {
  color: #ef4444;
}
.cs-item-badge {
  @apply flex-shrink-0 text-xs px-1 py-px rounded;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.08);
  font-size: 0.65em;
}

.cs-empty {
  @apply px-3 py-4 text-center text-sm text-gray-400 dark:text-gray-500;
}

/* 动画 */
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
