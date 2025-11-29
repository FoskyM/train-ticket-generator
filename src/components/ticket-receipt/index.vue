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
 * This file is created by FoskyM on 2024/10/20 & renamed on 2025/11/28.
 * -->

<template>
  <Tabs v-model="activeTab" :tabs="tabs" />

  <div v-show="activeTab == 'ticket2D'" class="ticket-2d-wrapper py-4">
    <!-- 2D 控制栏 -->
    <div class="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mb-4">
      <button
        @click="printTicket"
        class="px-3 py-1 text-sm text-white bg-indigo-500 border border-indigo-500 rounded-md hover:bg-indigo-600 transition-colors"
      >
        打印（双面）
      </button>
    </div>

    <div
      class="flex flex-col md:flex-row gap-4 justify-between w-full"
      :style="{ minHeight: canvasHeight + 'px' }"
    >
      <div class="ticket-container" @click="openFullscreen('front')">
        <div class="canvas-aspect">
          <canvas ref="ticketCanvas" :width="canvasWidth" :height="canvasHeight"></canvas>
          <div class="fullscreen-hint">
            <span>点击全屏查看</span>
          </div>
        </div>
      </div>
      <div class="ticket-container" @click="openFullscreen('back')">
        <div class="canvas-aspect">
          <canvas ref="ticketBackCanvas" :width="canvasWidth" :height="canvasHeight"></canvas>
          <div class="fullscreen-hint">
            <span>点击全屏查看</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-show="activeTab == 'ticket3D'" class="ticket-3d-wrapper py-4">
    <!-- 3D 控制栏 -->
    <div class="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-4">
      <!-- 自动旋转 -->
      <label class="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          v-model="config3D.autoRotate"
          class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
        />
        <span class="text-sm text-gray-700">自动旋转</span>
      </label>

      <!-- 旋转速度 -->
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-500">速度</span>
        <input
          type="range"
          v-model.number="config3D.rotationSpeed"
          :min="ROTATION_SPEED_MIN"
          :max="ROTATION_SPEED_MAX"
          :step="ROTATION_SPEED_STEP"
          class="w-20 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
        />
        <span class="text-sm text-gray-500 w-8">{{ config3D.rotationSpeed.toFixed(1) }}x</span>
      </div>

      <!-- 缩放 -->
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-500">缩放</span>
        <button
          @click="zoomOut"
          :disabled="config3D.zoom <= ZOOM_MIN"
          class="w-6 h-6 flex items-center justify-center text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          -
        </button>
        <span class="text-sm text-gray-600 w-12 text-center"
          >{{ (config3D.zoom * 100).toFixed(0) }}%</span
        >
        <button
          @click="zoomIn"
          :disabled="config3D.zoom >= ZOOM_MAX"
          class="w-6 h-6 flex items-center justify-center text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          +
        </button>
      </div>

      <!-- 重置按钮 -->
      <button
        @click="resetView"
        class="px-3 py-1 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
      >
        重置视角
      </button>

      <!-- 全屏按钮 -->
      <button
        @click="openFullscreen('3d')"
        class="px-3 py-1 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
      >
        全屏
      </button>
    </div>

    <!-- Three.js 渲染容器 -->
    <div ref="threeContainer" class="ticket-3d-container"></div>

    <p class="text-center text-sm text-gray-500 mt-4">拖拽旋转 / 滚轮缩放</p>

    <!-- 隐藏的 canvas 用于生成贴图 -->
    <canvas
      ref="ticketCanvas3D"
      :width="canvasWidth"
      :height="canvasHeight"
      class="hidden"
    ></canvas>
    <canvas
      ref="ticketBackCanvas3D"
      :width="canvasWidth"
      :height="canvasHeight"
      class="hidden"
    ></canvas>
  </div>

  <!-- 全屏弹窗 -->
  <Teleport to="body">
    <Transition name="fullscreen">
      <div v-if="fullscreenMode" class="fullscreen-overlay" @click.self="closeFullscreen">
        <div class="fullscreen-content">
          <!-- 关闭按钮 -->
          <button @click="closeFullscreen" class="fullscreen-close">&times;</button>

          <!-- 2D 全屏内容 -->
          <template v-if="fullscreenMode === 'front' || fullscreenMode === 'back'">
            <div class="fullscreen-canvas-wrapper">
              <canvas
                ref="fullscreenCanvas"
                :width="canvasWidth"
                :height="canvasHeight"
              ></canvas>
            </div>
          </template>

          <!-- 3D 全屏内容 -->
          <template v-if="fullscreenMode === '3d'">
            <div ref="fullscreenThreeContainer" class="fullscreen-3d-container"></div>
          </template>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch, computed, nextTick } from 'vue'
import type { TicketStyleConfig, StyleFieldGroup } from '@/types'
import Tabs from '@/components/common/Tabs.vue'

// 2D 渲染器
import {
  canvasWidth,
  canvasHeight,
  drawTicket,
  drawTicketBack,
  drawTicket3D,
  drawTicketBack3D,
} from './renderer2d'

// 打印工具
import { printDuplex } from '@/utils/print'

// 3D 渲染器
import {
  createInitialState,
  defaultConfig,
  initThreeJS,
  updateTextures,
  updateCameraZoom,
  resetRotation,
  animate,
  disposeThreeJS,
  bindEvents,
  ZOOM_MIN,
  ZOOM_MAX,
  ZOOM_STEP,
  ROTATION_SPEED_MIN,
  ROTATION_SPEED_MAX,
  ROTATION_SPEED_STEP,
  type Renderer3DConfig,
} from './renderer3d'

/**
 * 防抖函数
 */
const debounce = <T extends (...args: any[]) => void>(fn: T, delay: number) => {
  let timer: ReturnType<typeof setTimeout> | null = null
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

const props = defineProps<{
  ticketInfo: Record<string, any>
  styleConfig?: TicketStyleConfig
}>()

/**
 * 报销凭证默认样式配置
 */
const defaultStyleConfig: TicketStyleConfig = {
  fonts: {
    station: { family: 'SimHei', size: 45 },
    stationPinyin: { family: 'FangSong', size: 30 },
    trainNumber: { family: 'SimSun', size: 42 },
    date: { family: 'SimHei', size: 40 },
    seatInfo: { family: 'SimSun', size: 28 },
    price: { family: 'SimHei', size: 40 },
    passenger: { family: 'FangSong', size: 40 },
    label: { family: 'FangSong', size: 21 },
    notice: { family: 'FangSong', size: 27 },
    ticketId: { family: 'FangSong', size: 24 },
    redId: { family: 'Arial', size: 42 },
    checkGate: { family: 'SimSun', size: 24 },
    backTitle: { family: 'SimHei', size: 40 },
    backContent: { family: 'SimSun', size: 25 },
  },
  wearEffect: {
    enabled: true,
    intensity: 0.7,
  },
}

/**
 * 样式配置字段分组
 */
const styleFieldGroups: StyleFieldGroup[] = [
  {
    fields: [
      { label: '站名', key: 'station', sizeMin: 20, sizeMax: 60 },
      { label: '站名拼音', key: 'stationPinyin', sizeMin: 16, sizeMax: 40 },
      { label: '车次', key: 'trainNumber', sizeMin: 20, sizeMax: 60 },
      { label: '日期时间', key: 'date', sizeMin: 20, sizeMax: 50 },
      { label: '座位信息', key: 'seatInfo', sizeMin: 16, sizeMax: 40 },
      { label: '票价', key: 'price', sizeMin: 20, sizeMax: 50 },
      { label: '乘客信息', key: 'passenger', sizeMin: 20, sizeMax: 50 },
    ],
  },
  {
    fields: [
      { label: '标签文字', key: 'label', sizeMin: 14, sizeMax: 30 },
      { label: '报销提示', key: 'notice', sizeMin: 16, sizeMax: 36 },
      { label: '票据ID', key: 'ticketId', sizeMin: 14, sizeMax: 32 },
      { label: '红色ID', key: 'redId', sizeMin: 20, sizeMax: 50 },
      { label: '检票口', key: 'checkGate', sizeMin: 14, sizeMax: 32 },
    ],
  },
  {
    fields: [
      { label: '背面标题', key: 'backTitle', sizeMin: 24, sizeMax: 50 },
      { label: '背面内容', key: 'backContent', sizeMin: 16, sizeMax: 32 },
    ],
  },
]

// 暴露配置供外部使用
defineExpose({
  defaultStyleConfig,
  styleFieldGroups,
})

// 合并默认配置和传入配置
const mergedConfig = computed<TicketStyleConfig>(() => {
  if (!props.styleConfig) return defaultStyleConfig
  return {
    ...defaultStyleConfig,
    ...props.styleConfig,
    fonts: {
      ...defaultStyleConfig.fonts,
      ...props.styleConfig.fonts,
    },
    wearEffect: {
      ...defaultStyleConfig.wearEffect,
      ...props.styleConfig.wearEffect,
    },
  }
})

// Tab 状态
const tabs = ref([
  { label: '2D', key: 'ticket2D' },
  { label: '3D', key: 'ticket3D' },
])
const activeTab = ref('ticket2D')

// Canvas 引用
const ticketCanvas = ref<HTMLCanvasElement>()
const ticketBackCanvas = ref<HTMLCanvasElement>()
const ticketCanvas3D = ref<HTMLCanvasElement>()
const ticketBackCanvas3D = ref<HTMLCanvasElement>()
const threeContainer = ref<HTMLDivElement>()

// 全屏相关
const fullscreenMode = ref<'front' | 'back' | '3d' | null>(null)
const fullscreenCanvas = ref<HTMLCanvasElement>()
const fullscreenThreeContainer = ref<HTMLDivElement>()
const fullscreenState3D = createInitialState()
let fullscreenCleanupEvents: (() => void) | null = null

// 3D 状态和配置
const state3D = createInitialState()
const config3D = reactive<Renderer3DConfig>({ ...defaultConfig })

// 事件清理函数
let cleanupEvents: (() => void) | null = null

/**
 * 更新 3D 配置
 */
const updateConfig = (updates: Partial<Renderer3DConfig>) => {
  Object.assign(config3D, updates)
}

/**
 * 设置自动旋转
 */
const setAutoRotate = (value: boolean) => {
  config3D.autoRotate = value
}

/**
 * 缩放控制
 */
const zoomIn = () => {
  const newZoom = Math.min(ZOOM_MAX, config3D.zoom + ZOOM_STEP)
  config3D.zoom = newZoom
  updateCameraZoom(state3D, newZoom)
}

const zoomOut = () => {
  const newZoom = Math.max(ZOOM_MIN, config3D.zoom - ZOOM_STEP)
  config3D.zoom = newZoom
  updateCameraZoom(state3D, newZoom)
}

/**
 * 重置视角
 */
const resetView = () => {
  resetRotation(state3D)
  config3D.zoom = 1
  updateCameraZoom(state3D, 1)
}

/**
 * 打开全屏
 */
const openFullscreen = (mode: 'front' | 'back' | '3d') => {
  fullscreenMode.value = mode

  nextTick(() => {
    if (mode === 'front' || mode === 'back') {
      // 2D 全屏：复制 canvas 内容
      if (fullscreenCanvas.value) {
        const sourceCanvas = mode === 'front' ? ticketCanvas.value : ticketBackCanvas.value
        if (sourceCanvas) {
          const ctx = fullscreenCanvas.value.getContext('2d')
          if (ctx) {
            ctx.clearRect(0, 0, canvasWidth, canvasHeight)
            ctx.drawImage(sourceCanvas, 0, 0)
          }
        }
      }
    } else if (mode === '3d') {
      // 3D 全屏：初始化新的 Three.js 场景
      if (fullscreenThreeContainer.value && ticketCanvas3D.value && ticketBackCanvas3D.value) {
        const success = initThreeJS(
          fullscreenThreeContainer.value,
          ticketCanvas3D.value,
          ticketBackCanvas3D.value,
          fullscreenState3D,
          config3D,
        )
        if (success) {
          fullscreenCleanupEvents = bindEvents(
            fullscreenThreeContainer.value,
            fullscreenState3D,
            config3D,
            updateConfig,
            setAutoRotate,
          )
          animate(fullscreenState3D, config3D)
        }
      }
    }
  })

  // 禁止背景滚动
  document.body.style.overflow = 'hidden'
}

/**
 * 关闭全屏
 */
const closeFullscreen = () => {
  // 清理全屏 3D 资源
  if (fullscreenMode.value === '3d') {
    fullscreenCleanupEvents?.()
    fullscreenCleanupEvents = null
    disposeThreeJS(fullscreenThreeContainer.value ?? null, fullscreenState3D)
  }

  fullscreenMode.value = null
  document.body.style.overflow = ''
}

// ESC 键关闭全屏
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && fullscreenMode.value) {
    closeFullscreen()
  }
}

/**
 * 打印车票（双面打印）
 */
const printTicket = () => {
  if (!ticketCanvas.value || !ticketBackCanvas.value) return
  printDuplex(ticketCanvas.value, ticketBackCanvas.value)
}

/**
 * 初始化 3D 场景
 */
const init3DScene = () => {
  if (!threeContainer.value || !ticketCanvas3D.value || !ticketBackCanvas3D.value) return
  if (state3D.initialized) return

  const success = initThreeJS(
    threeContainer.value,
    ticketCanvas3D.value,
    ticketBackCanvas3D.value,
    state3D,
    config3D,
  )

  if (success) {
    // 绑定事件
    cleanupEvents = bindEvents(threeContainer.value, state3D, config3D, updateConfig, setAutoRotate)
    // 开始动画
    animate(state3D, config3D)
  }
}

/**
 * 重绘所有 Canvas（内部实现）
 */
const redrawAllInternal = () => {
  const config = mergedConfig.value

  // 2D Canvas
  if (ticketCanvas.value) {
    drawTicket(ticketCanvas.value, props.ticketInfo, config)
  }
  if (ticketBackCanvas.value) {
    drawTicketBack(ticketBackCanvas.value, config)
  }

  // 3D Canvas 贴图
  if (ticketCanvas3D.value) {
    drawTicket3D(ticketCanvas3D.value, props.ticketInfo, config, () => {
      updateTextures(state3D)
    })
  }
  if (ticketBackCanvas3D.value) {
    drawTicketBack3D(ticketBackCanvas3D.value, config, () => {
      updateTextures(state3D)
    })
  }
}

/**
 * 防抖版重绘函数（用于 watch）
 */
const redrawAllDebounced = debounce(redrawAllInternal, 100)

/**
 * 立即重绘（用于初次渲染）
 */
const redrawAll = () => {
  redrawAllInternal()
}

// 生命周期
onMounted(() => {
  redrawAll()
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  cleanupEvents?.()
  disposeThreeJS(threeContainer.value ?? null, state3D)
  window.removeEventListener('keydown', handleKeydown)

  // 清理全屏资源
  if (fullscreenMode.value === '3d') {
    fullscreenCleanupEvents?.()
    disposeThreeJS(fullscreenThreeContainer.value ?? null, fullscreenState3D)
  }
})

// 监听 tab 切换，在切换到 3D 时初始化 Three.js
watch(
  activeTab,
  (newTab) => {
    if (newTab === 'ticket3D' && !state3D.initialized) {
      nextTick(() => {
        init3DScene()
      })
    }
  },
  { immediate: true },
)

// 监听数据变化，重绘 Canvas（防抖）
watch(
  [() => props.ticketInfo, () => props.styleConfig],
  () => {
    redrawAllDebounced()
  },
  { deep: true },
)
</script>

<style scoped>
.ticket-container {
  @apply flex justify-center items-center w-full cursor-pointer;
}

.canvas-aspect {
  width: 100%;
  aspect-ratio: 876 / 539;
  position: relative;
}

.canvas-aspect canvas {
  width: 100%;
  height: 100%;
  display: block;
  position: absolute;
  left: 0;
  top: 0;
}

/* 全屏提示 */
.fullscreen-hint {
  @apply absolute inset-0 flex items-center justify-center;
  @apply bg-black/0 text-white text-sm opacity-0 transition-all duration-200;
  @apply pointer-events-none;
}

.canvas-aspect:hover .fullscreen-hint {
  @apply bg-black/30 opacity-100;
}

/* 3D 样式 */
.ticket-3d-wrapper {
  @apply flex flex-col items-center;
}

.ticket-3d-container {
  width: 100%;
  max-width: 700px;
  aspect-ratio: 4 / 3;
  cursor: grab;
  touch-action: none;
}

/* 大屏适配 */
@media (min-width: 1024px) {
  .ticket-3d-container {
    max-width: 800px;
  }
}

@media (min-width: 1280px) {
  .ticket-3d-container {
    max-width: 900px;
  }
}

@media (min-width: 1536px) {
  .ticket-3d-container {
    max-width: 1000px;
  }
}

.ticket-3d-container:active {
  cursor: grabbing;
}

.ticket-3d-container canvas {
  display: block;
}

/* 全屏弹窗 */
.fullscreen-overlay {
  @apply fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4;
}

.fullscreen-content {
  @apply relative w-full h-full flex items-center justify-center;
}

.fullscreen-close {
  @apply absolute top-4 right-4 z-10;
  @apply w-10 h-10 flex items-center justify-center;
  @apply text-3xl text-white/70 hover:text-white transition-colors;
  @apply bg-white/10 hover:bg-white/20 rounded-full;
}

.fullscreen-canvas-wrapper {
  @apply flex items-center justify-center;
  width: 100%;
  height: 100%;
}

.fullscreen-canvas-wrapper canvas {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.fullscreen-3d-container {
  width: 100%;
  height: 100%;
  cursor: grab;
  touch-action: none;
}

.fullscreen-3d-container:active {
  cursor: grabbing;
}

/* 全屏动画 */
.fullscreen-enter-active,
.fullscreen-leave-active {
  transition: opacity 0.2s ease;
}

.fullscreen-enter-from,
.fullscreen-leave-to {
  opacity: 0;
}
</style>
