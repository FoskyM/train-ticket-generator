<template>
  <div class="style-config-form">
    <!-- 头部：标题和操作按钮 -->
    <div
      class="flex items-center justify-between cursor-pointer select-none"
      @click="isExpanded = !isExpanded"
    >
      <div class="flex items-center gap-2">
        <svg
          class="w-4 h-4 text-gray-500 transition-transform duration-200"
          :class="{ 'rotate-90': isExpanded }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
        <h3 class="text-sm font-medium text-gray-700">样式配置</h3>
      </div>
      <button
        @click.stop="loadLocalFonts"
        :disabled="isLoadingFonts"
        :class="fontLoadButtonClass"
        class="px-2 py-0.5 text-xs rounded transition-colors"
      >
        {{ fontLoadButtonText }}
      </button>
    </div>

    <!-- 展开内容区域 -->
    <Transition name="expand">
      <div v-show="isExpanded" class="mt-3 sm:mt-3 space-y-3 sm:space-y-3">
        <!-- 磨损效果配置 -->
        <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              :checked="modelValue.wearEffect?.enabled"
              @change="updateWearEnabled(($event.target as HTMLInputElement).checked)"
              class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <span class="text-sm text-gray-700">磨损效果</span>
          </label>
          <div
            v-if="modelValue.wearEffect?.enabled"
            class="flex items-center gap-2 flex-1 min-w-[180px]"
          >
            <span class="text-sm text-gray-500">强度</span>
            <input
              type="range"
              :value="modelValue.wearEffect?.intensity ?? 0.7"
              @input="updateWearIntensity(Number(($event.target as HTMLInputElement).value))"
              min="0"
              max="1"
              step="0.1"
              class="flex-1 max-w-32 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <span class="text-sm text-gray-500 w-8 text-right">
              {{ ((modelValue.wearEffect?.intensity ?? 0.7) * 100).toFixed(0) }}%
            </span>
          </div>
        </div>

        <!-- 字体配置分组 -->
        <div v-for="(group, groupIndex) in fieldGroups" :key="groupIndex">
          <div
            class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-4 gap-y-3 sm:gap-y-2"
          >
            <div v-for="field in group.fields" :key="field.key">
              <label class="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-1">{{
                field.label
              }}</label>
              <div class="flex gap-2 sm:gap-1">
                <select
                  :value="modelValue.fonts[field.key]?.family"
                  @change="updateFontFamily(field.key, ($event.target as HTMLSelectElement).value)"
                  class="flex-1 min-w-0 px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option v-for="font in fontList" :key="font" :value="font">
                    {{ font }}
                  </option>
                </select>
                <input
                  type="number"
                  :value="modelValue.fonts[field.key]?.size"
                  @input="
                    updateFontSize(field.key, Number(($event.target as HTMLInputElement).value))
                  "
                  :min="field.sizeMin"
                  :max="field.sizeMax"
                  class="w-14 sm:w-12 px-1 py-1 text-center border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:ext-sm"
                />
              </div>
            </div>
          </div>
          <!-- 分组分隔线 -->
          <hr v-if="groupIndex < fieldGroups.length - 1" class="border-gray-200 mt-3" />
        </div>

        <!-- 底部操作 -->
        <div class="flex justify-end pt-2 border-t border-gray-200">
          <button
            @click="resetToDefault"
            class="px-2 py-1 text-xs text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            重置默认
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { TicketStyleConfig, StyleFieldGroup } from '@/types'
import { FONT_FAMILY_OPTIONS } from '@/constants'
import { getLocalFonts } from '@/utils/font'

const props = defineProps<{
  modelValue: TicketStyleConfig
  defaultConfig: TicketStyleConfig
  fieldGroups: StyleFieldGroup[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: TicketStyleConfig): void
}>()

const isExpanded = ref(false)
const isLoadingFonts = ref(false)
const localFonts = ref<string[]>([])
const fontLoadStatus = ref<'idle' | 'loading' | 'success' | 'error'>('idle')

const fontList = computed(() => {
  const fonts = new Set([...FONT_FAMILY_OPTIONS, ...localFonts.value])
  return Array.from(fonts).sort()
})

const fontLoadButtonText = computed(() => {
  switch (fontLoadStatus.value) {
    case 'loading':
      return '加载中...'
    case 'success':
      return `已加载 ${localFonts.value.length} 个字体`
    case 'error':
      return '加载失败，点击重试'
    default:
      return '加载本地字体'
  }
})

const fontLoadButtonClass = computed(() => {
  switch (fontLoadStatus.value) {
    case 'loading':
      return 'text-gray-400 bg-gray-100 cursor-wait'
    case 'success':
      return 'text-green-600 bg-green-50 hover:bg-green-100'
    case 'error':
      return 'text-red-600 bg-red-50 hover:bg-red-100'
    default:
      return 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100'
  }
})

const loadLocalFonts = async () => {
  isLoadingFonts.value = true
  fontLoadStatus.value = 'loading'
  try {
    const fonts = await getLocalFonts()
    if (fonts.length > 0) {
      localFonts.value = fonts
      fontLoadStatus.value = 'success'
    } else {
      fontLoadStatus.value = 'error'
    }
  } catch {
    fontLoadStatus.value = 'error'
  } finally {
    isLoadingFonts.value = false
  }
}

const updateFontFamily = (key: string, family: string) => {
  const newConfig: TicketStyleConfig = {
    ...props.modelValue,
    fonts: {
      ...props.modelValue.fonts,
      [key]: {
        ...props.modelValue.fonts[key],
        family,
      },
    },
  }
  emit('update:modelValue', newConfig)
}

const updateFontSize = (key: string, size: number) => {
  if (isNaN(size) || size <= 0) return
  const newConfig: TicketStyleConfig = {
    ...props.modelValue,
    fonts: {
      ...props.modelValue.fonts,
      [key]: {
        ...props.modelValue.fonts[key],
        size,
      },
    },
  }
  emit('update:modelValue', newConfig)
}

const updateWearEnabled = (enabled: boolean) => {
  const newConfig: TicketStyleConfig = {
    ...props.modelValue,
    wearEffect: {
      ...props.modelValue.wearEffect,
      enabled,
    },
  }
  emit('update:modelValue', newConfig)
}

const updateWearIntensity = (intensity: number) => {
  const newConfig: TicketStyleConfig = {
    ...props.modelValue,
    wearEffect: {
      ...props.modelValue.wearEffect,
      intensity,
    },
  }
  emit('update:modelValue', newConfig)
}

const resetToDefault = () => {
  emit('update:modelValue', JSON.parse(JSON.stringify(props.defaultConfig)))
}
</script>

<style scoped>
.style-config-form {
  @apply px-4 py-3 bg-gray-50 rounded-lg border border-gray-200;
}

/* 展开/收起动画 */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.2s ease-out;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 1000px;
}
</style>
