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
  <div class="ticket-preview">
    <!-- 统一工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="toolbar-tab"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>
      <div class="toolbar-right">
        <template v-if="activeTab === 'ticket2D'">
          <button type="button" class="toolbar-btn" @click="printTicket" title="双面打印">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            <span class="hidden sm:inline">打印</span>
          </button>
        </template>
        <template v-if="activeTab === 'ticket3D'">
          <label class="toolbar-toggle">
            <input type="checkbox" v-model="config3D.autoRotate" />
            <span>旋转</span>
          </label>
          <div class="toolbar-zoom">
            <button
              type="button"
              @click="zoomOut"
              :disabled="config3D.zoom <= ZOOM_MIN"
              class="zoom-btn"
            >
              -
            </button>
            <span class="zoom-label">{{ (config3D.zoom * 100).toFixed(0) }}%</span>
            <button
              type="button"
              @click="zoomIn"
              :disabled="config3D.zoom >= ZOOM_MAX"
              class="zoom-btn"
            >
              +
            </button>
          </div>
          <button type="button" class="toolbar-btn" @click="resetView" title="重置视角">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
          <button type="button" class="toolbar-btn" @click="openFullscreen('3d')" title="全屏">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
          </button>
        </template>
      </div>
    </div>

    <!-- 2D 视图 -->
    <div v-show="activeTab === 'ticket2D'" class="ticket-2d-area">
      <div class="canvas-pair" :class="vertical ? 'flex-col' : 'flex-col md:flex-row'">
        <div class="ticket-canvas-wrap" @click="openFullscreen('front')">
          <div class="canvas-aspect" :style="{ aspectRatio: canvasWidth + '/' + canvasHeight }">
            <canvas ref="ticketCanvas" :width="canvasWidth" :height="canvasHeight"></canvas>
            <div class="canvas-overlay"><span>点击查看</span></div>
          </div>
          <p class="canvas-label">正面</p>
        </div>
        <div class="ticket-canvas-wrap" @click="openFullscreen('back')">
          <div class="canvas-aspect" :style="{ aspectRatio: canvasWidth + '/' + canvasHeight }">
            <canvas ref="ticketBackCanvas" :width="canvasWidth" :height="canvasHeight"></canvas>
            <div class="canvas-overlay"><span>点击查看</span></div>
          </div>
          <p class="canvas-label">背面</p>
        </div>
      </div>
    </div>

    <!-- 3D 视图 -->
    <div v-show="activeTab === 'ticket3D'" class="ticket-3d-area">
      <div ref="threeContainer" class="three-container"></div>
      <p class="text-center text-xs text-gray-400 dark:text-gray-500 mt-2">拖拽旋转 / 滚轮缩放</p>
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
      <Transition name="fade">
        <div v-if="fullscreenMode" class="fs-overlay" @click.self="closeFullscreen">
          <div class="fs-content">
            <button @click="closeFullscreen" class="fs-close">&times;</button>
            <template v-if="fullscreenMode === 'front' || fullscreenMode === 'back'">
              <div class="fs-canvas-wrap">
                <canvas ref="fullscreenCanvas" :width="canvasWidth" :height="canvasHeight"></canvas>
              </div>
            </template>
            <template v-if="fullscreenMode === '3d'">
              <div ref="fullscreenThreeContainer" class="fs-three"></div>
            </template>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch, nextTick } from 'vue'
import type { TicketStyleConfig, TicketData, DrawFrontFn, DrawBackFn } from '@/types'
import { printDuplex } from '@/utils/print'
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
  type Renderer3DConfig,
} from '@/components/ticket-receipt/renderer3d'

const debounce = <T extends (...args: any[]) => void>(fn: T, delay: number) => {
  let timer: ReturnType<typeof setTimeout> | null = null
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

const props = withDefaults(
  defineProps<{
    ticketInfo: TicketData
    styleConfig: TicketStyleConfig
    drawFront: DrawFrontFn
    drawBack: DrawBackFn
    canvasWidth: number
    canvasHeight: number
    vertical?: boolean
  }>(),
  { vertical: false },
)

const tabs = [
  { label: '2D', key: 'ticket2D' },
  { label: '3D', key: 'ticket3D' },
]
const activeTab = ref('ticket2D')

const ticketCanvas = ref<HTMLCanvasElement>()
const ticketBackCanvas = ref<HTMLCanvasElement>()
const ticketCanvas3D = ref<HTMLCanvasElement>()
const ticketBackCanvas3D = ref<HTMLCanvasElement>()
const threeContainer = ref<HTMLDivElement>()

const fullscreenMode = ref<'front' | 'back' | '3d' | null>(null)
const fullscreenCanvas = ref<HTMLCanvasElement>()
const fullscreenThreeContainer = ref<HTMLDivElement>()
const fullscreenState3D = createInitialState()
let fullscreenCleanupEvents: (() => void) | null = null

const state3D = createInitialState()
const config3D = reactive<Renderer3DConfig>({ ...defaultConfig, showProtrusions: true })
let cleanupEvents: (() => void) | null = null

const updateConfig = (updates: Partial<Renderer3DConfig>) => Object.assign(config3D, updates)
const setAutoRotate = (v: boolean) => {
  config3D.autoRotate = v
}

const zoomIn = () => {
  const z = Math.min(ZOOM_MAX, config3D.zoom + ZOOM_STEP)
  config3D.zoom = z
  updateCameraZoom(state3D, z)
}
const zoomOut = () => {
  const z = Math.max(ZOOM_MIN, config3D.zoom - ZOOM_STEP)
  config3D.zoom = z
  updateCameraZoom(state3D, z)
}
const resetView = () => {
  resetRotation(state3D)
  config3D.zoom = 1
  updateCameraZoom(state3D, 1)
}

const openFullscreen = (mode: 'front' | 'back' | '3d') => {
  fullscreenMode.value = mode
  nextTick(() => {
    if (mode === 'front' || mode === 'back') {
      if (fullscreenCanvas.value) {
        const src = mode === 'front' ? ticketCanvas.value : ticketBackCanvas.value
        if (src) {
          const ctx = fullscreenCanvas.value.getContext('2d')
          if (ctx) {
            ctx.clearRect(0, 0, props.canvasWidth, props.canvasHeight)
            ctx.drawImage(src, 0, 0)
          }
        }
      }
    } else if (mode === '3d') {
      if (fullscreenThreeContainer.value && ticketCanvas3D.value && ticketBackCanvas3D.value) {
        const ok = initThreeJS(
          fullscreenThreeContainer.value,
          ticketCanvas3D.value,
          ticketBackCanvas3D.value,
          fullscreenState3D,
          config3D,
        )
        if (ok) {
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
  document.body.style.overflow = 'hidden'
}

const closeFullscreen = () => {
  if (fullscreenMode.value === '3d') {
    fullscreenCleanupEvents?.()
    fullscreenCleanupEvents = null
    disposeThreeJS(fullscreenThreeContainer.value ?? null, fullscreenState3D)
  }
  fullscreenMode.value = null
  document.body.style.overflow = ''
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && fullscreenMode.value) closeFullscreen()
}

const printTicket = () => {
  if (ticketCanvas.value && ticketBackCanvas.value)
    printDuplex(ticketCanvas.value, ticketBackCanvas.value)
}

const init3DScene = () => {
  if (
    !threeContainer.value ||
    !ticketCanvas3D.value ||
    !ticketBackCanvas3D.value ||
    state3D.initialized
  )
    return
  const ok = initThreeJS(
    threeContainer.value,
    ticketCanvas3D.value,
    ticketBackCanvas3D.value,
    state3D,
    config3D,
  )
  if (ok) {
    cleanupEvents = bindEvents(threeContainer.value, state3D, config3D, updateConfig, setAutoRotate)
    animate(state3D, config3D)
  }
}

const redrawAll = () => {
  const c = props.styleConfig
  if (ticketCanvas.value) props.drawFront(ticketCanvas.value, props.ticketInfo, c)
  if (ticketBackCanvas.value) props.drawBack(ticketBackCanvas.value, c)
  if (ticketCanvas3D.value)
    props.drawFront(ticketCanvas3D.value, props.ticketInfo, c, () => updateTextures(state3D))
  if (ticketBackCanvas3D.value)
    props.drawBack(ticketBackCanvas3D.value, c, () => updateTextures(state3D))
}

const redrawDebounced = debounce(redrawAll, 100)

onMounted(() => {
  redrawAll()
  window.addEventListener('keydown', handleKeydown)
})
onUnmounted(() => {
  cleanupEvents?.()
  disposeThreeJS(threeContainer.value ?? null, state3D)
  window.removeEventListener('keydown', handleKeydown)
  if (fullscreenMode.value === '3d') {
    fullscreenCleanupEvents?.()
    disposeThreeJS(fullscreenThreeContainer.value ?? null, fullscreenState3D)
  }
})

watch(
  activeTab,
  (t) => {
    if (t === 'ticket3D' && !state3D.initialized) nextTick(init3DScene)
  },
  { immediate: true },
)

watch(
  [() => props.ticketInfo, () => props.styleConfig],
  () => {
    const sp = props.styleConfig?.showProtrusions ?? true
    if (config3D.showProtrusions !== sp) {
      config3D.showProtrusions = sp
      if (state3D.initialized && threeContainer.value) {
        cleanupEvents?.()
        disposeThreeJS(threeContainer.value, state3D)
        nextTick(init3DScene)
      }
    }
    redrawDebounced()
  },
  { deep: true },
)
</script>

<style scoped>
.ticket-preview {
  @apply flex flex-col;
}

/* 工具栏 */
.toolbar {
  @apply flex items-center justify-between gap-2 px-3 py-2 rounded-xl mb-3;
  background: rgba(0, 0, 0, 0.03);
}
html.dark .toolbar {
  background: rgba(255, 255, 255, 0.04);
}
.toolbar-left {
  @apply flex items-center gap-0.5 p-0.5 rounded-lg;
  background: rgba(0, 0, 0, 0.04);
}
html.dark .toolbar-left {
  background: rgba(255, 255, 255, 0.06);
}
.toolbar-right {
  @apply flex items-center gap-1.5;
}
.toolbar-tab {
  @apply px-3 py-1 text-xs font-medium rounded-md transition-all duration-150;
  @apply text-gray-500 dark:text-gray-400;
}
.toolbar-tab.active {
  @apply text-gray-900 bg-white shadow-sm dark:text-gray-100 dark:bg-gray-700;
}
.toolbar-btn {
  @apply flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg transition-all duration-150 active:scale-[0.97];
  @apply text-gray-600 hover:bg-black/5 dark:text-gray-300 dark:hover:bg-white/5;
}
.toolbar-toggle {
  @apply flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 cursor-pointer;
}
.toolbar-toggle input {
  @apply w-3.5 h-3.5 rounded transition-colors;
  accent-color: #007aff;
}
.toolbar-zoom {
  @apply flex items-center gap-0.5;
}
.zoom-btn {
  @apply w-6 h-6 flex items-center justify-center text-xs rounded-lg transition-all duration-150 active:scale-[0.95];
  @apply text-gray-600 bg-white/80 border border-gray-200/60 hover:bg-gray-100;
  @apply dark:text-gray-300 dark:bg-gray-700/80 dark:border-gray-600/60 dark:hover:bg-gray-600;
  @apply disabled:opacity-40 disabled:cursor-not-allowed;
}
.zoom-label {
  @apply text-xs tabular-nums text-gray-500 dark:text-gray-400 w-9 text-center;
}

/* 2D 区域 */
.ticket-2d-area {
  @apply py-2;
}
.canvas-pair {
  @apply flex gap-3 w-full;
}
.ticket-canvas-wrap {
  @apply flex-1 min-w-0 cursor-pointer;
}
.canvas-aspect {
  @apply relative w-full rounded-xl overflow-hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}
.canvas-aspect canvas {
  @apply absolute inset-0 w-full h-full block;
}
.canvas-overlay {
  @apply absolute inset-0 flex items-center justify-center rounded-xl;
  @apply bg-black/0 text-white text-xs opacity-0 transition-all duration-200 pointer-events-none;
}
.canvas-aspect:hover .canvas-overlay {
  @apply bg-black/25 opacity-100 backdrop-blur-sm;
}
.canvas-label {
  @apply text-center text-xs text-gray-400 dark:text-gray-500 mt-1.5;
}

/* 3D 区域 */
.ticket-3d-area {
  @apply flex flex-col items-center py-2;
}
.three-container {
  @apply w-full rounded-xl overflow-hidden;
  max-width: 800px;
  aspect-ratio: 4 / 3;
  cursor: grab;
  touch-action: none;
}
.three-container:active {
  cursor: grabbing;
}
.three-container canvas {
  display: block;
}

/* 全屏 */
.fs-overlay {
  @apply fixed inset-0 z-50 flex items-center justify-center p-6;
  background: rgba(0, 0, 0, 0.6);
  -webkit-backdrop-filter: blur(20px);
  backdrop-filter: blur(20px);
}
.fs-content {
  @apply relative w-full h-full flex items-center justify-center;
}
.fs-close {
  @apply absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center;
  @apply text-2xl text-white/70 hover:text-white rounded-full transition-all duration-150 active:scale-[0.95];
  background: rgba(255, 255, 255, 0.1);
}
.fs-close:hover {
  background: rgba(255, 255, 255, 0.2);
}
.fs-canvas-wrap {
  @apply flex items-center justify-center w-full h-full;
}
.fs-canvas-wrap canvas {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
.fs-three {
  @apply w-full h-full;
  cursor: grab;
  touch-action: none;
}
.fs-three:active {
  cursor: grabbing;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
