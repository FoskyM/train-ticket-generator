/*
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
 * This file is created by FoskyM on 2025/11/28.
 */

import * as THREE from 'three'
import { canvasWidth, canvasHeight, protrusionHeight, protrusionWidth } from './renderer2d'

/**
 * 3D 渲染器配置接口
 */
export interface Renderer3DConfig {
  autoRotate: boolean
  rotationSpeed: number
  zoom: number
}

/**
 * 3D 渲染器状态
 */
export interface Renderer3DState {
  renderer: THREE.WebGLRenderer | null
  scene: THREE.Scene | null
  camera: THREE.PerspectiveCamera | null
  ticketGroup: THREE.Group | null
  frontTexture: THREE.CanvasTexture | null
  backTexture: THREE.CanvasTexture | null
  animationFrameId: number | null
  isDragging: boolean
  previousMousePosition: { x: number; y: number }
  targetRotation: { x: number; y: number }
  initialized: boolean
}

/**
 * 创建初始状态
 */
export const createInitialState = (): Renderer3DState => ({
  renderer: null,
  scene: null,
  camera: null,
  ticketGroup: null,
  frontTexture: null,
  backTexture: null,
  animationFrameId: null,
  isDragging: false,
  previousMousePosition: { x: 0, y: 0 },
  targetRotation: { x: -0.2, y: 0.4 },
  initialized: false,
})

/**
 * 默认配置
 */
export const defaultConfig: Renderer3DConfig = {
  autoRotate: true,
  rotationSpeed: 0.5,
  zoom: 1,
}

// 缩放范围常量
export const ZOOM_MIN = 0.5
export const ZOOM_MAX = 2.0
export const ZOOM_STEP = 0.1

// 旋转速度范围常量
export const ROTATION_SPEED_MIN = 0.1
export const ROTATION_SPEED_MAX = 2.0
export const ROTATION_SPEED_STEP = 0.1

/**
 * 初始化 Three.js 场景
 */
export const initThreeJS = (
  container: HTMLDivElement,
  frontCanvas: HTMLCanvasElement,
  backCanvas: HTMLCanvasElement,
  state: Renderer3DState,
  config: Renderer3DConfig,
): boolean => {
  if (state.initialized) return false

  const width = container.clientWidth
  const height = container.clientHeight

  // 确保容器有尺寸
  if (width === 0 || height === 0) return false

  state.initialized = true

  // 创建场景
  state.scene = new THREE.Scene()

  // 创建相机
  state.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
  updateCameraZoom(state, config.zoom)

  // 创建渲染器
  state.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  state.renderer.setSize(width, height)
  state.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  state.renderer.setClearColor(0x000000, 0)
  container.appendChild(state.renderer.domElement)

  // 创建车票几何体和材质
  createTicketMesh(state, frontCanvas, backCanvas)

  // 添加环境光
  const ambientLight = new THREE.AmbientLight(0xffffff, 1)
  state.scene.add(ambientLight)

  return true
}

/**
 * 更新相机缩放
 */
export const updateCameraZoom = (state: Renderer3DState, zoom: number) => {
  if (state.camera) {
    // 基础距离为 5，zoom=1 时相机在 z=5
    // zoom 越大，相机越近，物体看起来越大
    state.camera.position.z = 5 / zoom
  }
}

/**
 * 创建车票网格
 */
const createTicketMesh = (
  state: Renderer3DState,
  frontCanvas: HTMLCanvasElement,
  backCanvas: HTMLCanvasElement,
) => {
  if (!state.scene) return

  // 创建车票形状的几何体
  const ticketWidth3D = 3.5
  const ticketHeight3D = ticketWidth3D * (canvasHeight / canvasWidth)
  const ticketDepth = 0.025 // 厚度

  // 将 2D canvas 尺寸映射到 3D 尺寸
  const scaleX = ticketWidth3D / canvasWidth
  const scaleY = ticketHeight3D / canvasHeight

  // 2D 参数（与 canvas 绘制一致）
  const rectX = 20
  const rectY = 10
  const rectW = canvasWidth - 40
  const rectH = canvasHeight - 20
  const radius = 20
  const trapHeight = protrusionHeight
  const trapWidth = protrusionWidth
  const trapOffset = 5

  // 梯形位置（canvas 坐标系，y 轴向下）
  const trapY1 = canvasHeight * 0.2
  const trapY2 = canvasHeight * 0.8

  // 创建车票形状（THREE.Shape 使用标准坐标系，y 轴向上，所以需要翻转 y）
  const shape = new THREE.Shape()

  // 辅助函数：将 canvas 坐标转换为 shape 坐标（以中心为原点）
  const toShapeX = (x: number) => (x - canvasWidth / 2) * scaleX
  const toShapeY = (y: number) => (canvasHeight / 2 - y) * scaleY

  // 从左上角开始绘制圆角矩形（顺时针）
  const left = rectX
  const right = rectX + rectW
  const top = rectY
  const bottom = rectY + rectH

  // 开始路径：左上角圆角之后
  shape.moveTo(toShapeX(left + radius), toShapeY(top))

  // 上边 -> 右上角圆角
  shape.lineTo(toShapeX(right - radius), toShapeY(top))
  shape.quadraticCurveTo(toShapeX(right), toShapeY(top), toShapeX(right), toShapeY(top + radius))

  // 右边：需要在 trapY1 和 trapY2 处添加梯形突出
  shape.lineTo(toShapeX(right), toShapeY(trapY1 - trapHeight / 2))
  // 右上梯形
  shape.lineTo(toShapeX(right + trapWidth), toShapeY(trapY1 - trapHeight / 2 + trapOffset))
  shape.lineTo(toShapeX(right + trapWidth), toShapeY(trapY1 + trapHeight / 2 - trapOffset))
  shape.lineTo(toShapeX(right), toShapeY(trapY1 + trapHeight / 2))
  // 右下梯形
  shape.lineTo(toShapeX(right), toShapeY(trapY2 - trapHeight / 2))
  shape.lineTo(toShapeX(right + trapWidth), toShapeY(trapY2 - trapHeight / 2 + trapOffset))
  shape.lineTo(toShapeX(right + trapWidth), toShapeY(trapY2 + trapHeight / 2 - trapOffset))
  shape.lineTo(toShapeX(right), toShapeY(trapY2 + trapHeight / 2))

  // 右边 -> 右下角圆角
  shape.lineTo(toShapeX(right), toShapeY(bottom - radius))
  shape.quadraticCurveTo(
    toShapeX(right),
    toShapeY(bottom),
    toShapeX(right - radius),
    toShapeY(bottom),
  )

  // 下边 -> 左下角圆角
  shape.lineTo(toShapeX(left + radius), toShapeY(bottom))
  shape.quadraticCurveTo(
    toShapeX(left),
    toShapeY(bottom),
    toShapeX(left),
    toShapeY(bottom - radius),
  )

  // 左边：需要在 trapY2 和 trapY1 处添加梯形突出（逆序）
  shape.lineTo(toShapeX(left), toShapeY(trapY2 + trapHeight / 2))
  // 左下梯形
  shape.lineTo(toShapeX(left - trapWidth), toShapeY(trapY2 + trapHeight / 2 - trapOffset))
  shape.lineTo(toShapeX(left - trapWidth), toShapeY(trapY2 - trapHeight / 2 + trapOffset))
  shape.lineTo(toShapeX(left), toShapeY(trapY2 - trapHeight / 2))
  // 左上梯形
  shape.lineTo(toShapeX(left), toShapeY(trapY1 + trapHeight / 2))
  shape.lineTo(toShapeX(left - trapWidth), toShapeY(trapY1 + trapHeight / 2 - trapOffset))
  shape.lineTo(toShapeX(left - trapWidth), toShapeY(trapY1 - trapHeight / 2 + trapOffset))
  shape.lineTo(toShapeX(left), toShapeY(trapY1 - trapHeight / 2))

  // 左边 -> 左上角圆角
  shape.lineTo(toShapeX(left), toShapeY(top + radius))
  shape.quadraticCurveTo(toShapeX(left), toShapeY(top), toShapeX(left + radius), toShapeY(top))

  // 创建贴图
  state.frontTexture = new THREE.CanvasTexture(frontCanvas)
  state.frontTexture.colorSpace = THREE.SRGBColorSpace
  state.backTexture = new THREE.CanvasTexture(backCanvas)
  state.backTexture.colorSpace = THREE.SRGBColorSpace

  // 创建正面材质
  const frontMaterial = new THREE.MeshBasicMaterial({
    map: state.frontTexture,
    transparent: true,
    side: THREE.FrontSide,
    depthWrite: true,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  })

  // 创建背面材质（需要水平翻转贴图）
  state.backTexture.wrapS = THREE.RepeatWrapping
  state.backTexture.repeat.x = -1
  state.backTexture.offset.x = 1

  const backMaterial = new THREE.MeshBasicMaterial({
    map: state.backTexture,
    transparent: true,
    side: THREE.FrontSide,
    depthWrite: true,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  })

  // 侧边材质
  const edgeMaterial = new THREE.MeshBasicMaterial({
    color: 0xadd8e6,
    transparent: true,
    opacity: 0.9,
    side: THREE.DoubleSide,
  })

  // 创建组来包含所有部分
  state.ticketGroup = new THREE.Group()

  // UV 计算辅助函数
  const calculateUV = (positions: Float32Array, uvs: Float32Array, flipX: boolean = false) => {
    for (let i = 0; i < positions.length / 3; i++) {
      const x = positions[i * 3]
      const y = positions[i * 3 + 1]
      const canvasX = x / scaleX + canvasWidth / 2
      const canvasY = canvasHeight / 2 - y / scaleY
      uvs[i * 2] = flipX ? 1 - canvasX / canvasWidth : canvasX / canvasWidth
      uvs[i * 2 + 1] = 1 - canvasY / canvasHeight
    }
  }

  // 1. 正面
  const frontGeometry = new THREE.ShapeGeometry(shape)
  const frontPositions = frontGeometry.getAttribute('position').array as Float32Array
  const frontUvs = frontGeometry.getAttribute('uv').array as Float32Array
  calculateUV(frontPositions, frontUvs)
  frontGeometry.getAttribute('uv').needsUpdate = true
  const frontMesh = new THREE.Mesh(frontGeometry, frontMaterial)
  frontMesh.position.z = ticketDepth / 2
  state.ticketGroup.add(frontMesh)

  // 2. 背面
  const backGeometry = new THREE.ShapeGeometry(shape)
  const backPositions = backGeometry.getAttribute('position').array as Float32Array
  const backUvs = backGeometry.getAttribute('uv').array as Float32Array
  calculateUV(backPositions, backUvs, true)
  backGeometry.getAttribute('uv').needsUpdate = true
  const backMesh = new THREE.Mesh(backGeometry, backMaterial)
  backMesh.position.z = -ticketDepth / 2
  backMesh.rotation.y = Math.PI
  state.ticketGroup.add(backMesh)

  // 3. 侧边 - 使用 ExtrudeGeometry 但只保留侧面三角形
  const edgeGeometry = new THREE.ExtrudeGeometry(shape, {
    depth: ticketDepth,
    bevelEnabled: false,
  })
  edgeGeometry.translate(0, 0, -ticketDepth / 2)

  // 过滤掉正面和背面的三角形，只保留侧边
  const edgeNormals = edgeGeometry.getAttribute('normal').array as Float32Array
  const edgeIndex = edgeGeometry.index

  if (edgeIndex) {
    const indices = edgeIndex.array as Uint16Array | Uint32Array
    const newIndices: number[] = []

    for (let i = 0; i < indices.length; i += 3) {
      const idx0 = indices[i]
      const idx1 = indices[i + 1]
      const idx2 = indices[i + 2]

      const nz0 = Math.abs(edgeNormals[idx0 * 3 + 2])
      const nz1 = Math.abs(edgeNormals[idx1 * 3 + 2])
      const nz2 = Math.abs(edgeNormals[idx2 * 3 + 2])

      if (nz0 < 0.5 && nz1 < 0.5 && nz2 < 0.5) {
        newIndices.push(idx0, idx1, idx2)
      }
    }

    edgeGeometry.setIndex(newIndices)
  }

  const edgeMesh = new THREE.Mesh(edgeGeometry, edgeMaterial)
  state.ticketGroup.add(edgeMesh)

  state.scene.add(state.ticketGroup)
}

/**
 * 更新贴图
 */
export const updateTextures = (state: Renderer3DState) => {
  if (state.frontTexture) {
    state.frontTexture.needsUpdate = true
  }
  if (state.backTexture) {
    state.backTexture.needsUpdate = true
  }
}

/**
 * 处理窗口大小变化
 */
export const onWindowResize = (container: HTMLDivElement, state: Renderer3DState) => {
  if (!state.camera || !state.renderer) return
  const width = container.clientWidth
  const height = container.clientHeight
  state.camera.aspect = width / height
  state.camera.updateProjectionMatrix()
  state.renderer.setSize(width, height)
}

/**
 * 鼠标/触摸事件处理
 */
export const onMouseDown = (event: MouseEvent, state: Renderer3DState) => {
  state.isDragging = true
  state.previousMousePosition = { x: event.clientX, y: event.clientY }
}

export const onMouseMove = (event: MouseEvent, state: Renderer3DState) => {
  if (!state.isDragging) return
  const deltaX = event.clientX - state.previousMousePosition.x
  const deltaY = event.clientY - state.previousMousePosition.y
  state.targetRotation.y += deltaX * 0.01
  state.targetRotation.x += deltaY * 0.01
  state.targetRotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, state.targetRotation.x))
  state.previousMousePosition = { x: event.clientX, y: event.clientY }
}

export const onMouseUp = (state: Renderer3DState) => {
  state.isDragging = false
}

export const onTouchStart = (event: TouchEvent, state: Renderer3DState) => {
  if (event.touches.length === 1) {
    state.isDragging = true
    state.previousMousePosition = { x: event.touches[0].clientX, y: event.touches[0].clientY }
    event.preventDefault()
  }
}

export const onTouchMove = (event: TouchEvent, state: Renderer3DState) => {
  if (!state.isDragging || event.touches.length !== 1) return
  event.preventDefault()
  const deltaX = event.touches[0].clientX - state.previousMousePosition.x
  const deltaY = event.touches[0].clientY - state.previousMousePosition.y
  state.targetRotation.y += deltaX * 0.01
  state.targetRotation.x += deltaY * 0.01
  state.targetRotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, state.targetRotation.x))
  state.previousMousePosition = { x: event.touches[0].clientX, y: event.touches[0].clientY }
}

export const onTouchEnd = (state: Renderer3DState) => {
  state.isDragging = false
}

/**
 * 滚轮缩放处理
 */
export const onWheel = (
  event: WheelEvent,
  state: Renderer3DState,
  config: Renderer3DConfig,
  updateConfig: (config: Partial<Renderer3DConfig>) => void,
) => {
  event.preventDefault()
  const delta = event.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP
  const newZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, config.zoom + delta))
  if (newZoom !== config.zoom) {
    updateConfig({ zoom: newZoom })
    updateCameraZoom(state, newZoom)
  }
}

/**
 * 重置旋转角度
 */
export const resetRotation = (state: Renderer3DState) => {
  state.targetRotation = { x: -0.2, y: 0.4 }
}

/**
 * 动画循环
 */
export const animate = (state: Renderer3DState, config: Renderer3DConfig) => {
  state.animationFrameId = requestAnimationFrame(() => animate(state, config))

  if (state.ticketGroup) {
    // 自动旋转，速度根据配置调整
    if (config.autoRotate && !state.isDragging) {
      state.targetRotation.y += 0.005 * config.rotationSpeed
    }

    // 平滑过渡到目标旋转
    state.ticketGroup.rotation.x += (state.targetRotation.x - state.ticketGroup.rotation.x) * 0.1
    state.ticketGroup.rotation.y += (state.targetRotation.y - state.ticketGroup.rotation.y) * 0.1
  }

  if (state.renderer && state.scene && state.camera) {
    state.renderer.render(state.scene, state.camera)
  }
}

/**
 * 销毁 Three.js 资源
 */
export const disposeThreeJS = (container: HTMLDivElement | null, state: Renderer3DState) => {
  if (state.animationFrameId) {
    cancelAnimationFrame(state.animationFrameId)
    state.animationFrameId = null
  }

  if (state.ticketGroup) {
    state.ticketGroup.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose()
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose())
        } else {
          child.material.dispose()
        }
      }
    })
  }

  state.frontTexture?.dispose()
  state.backTexture?.dispose()
  state.renderer?.dispose()

  if (state.renderer && container) {
    container.removeChild(state.renderer.domElement)
  }

  // 重置状态
  state.renderer = null
  state.scene = null
  state.camera = null
  state.ticketGroup = null
  state.frontTexture = null
  state.backTexture = null
  state.initialized = false
}

/**
 * 绑定事件监听器
 */
export const bindEvents = (
  container: HTMLDivElement,
  state: Renderer3DState,
  config: Renderer3DConfig,
  updateConfig: (config: Partial<Renderer3DConfig>) => void,
  setAutoRotate: (value: boolean) => void,
) => {
  const handleMouseDown = (e: MouseEvent) => {
    onMouseDown(e, state)
    setAutoRotate(false)
  }
  const handleMouseMove = (e: MouseEvent) => onMouseMove(e, state)
  const handleMouseUp = () => onMouseUp(state)
  const handleTouchStart = (e: TouchEvent) => {
    onTouchStart(e, state)
    setAutoRotate(false)
  }
  const handleTouchMove = (e: TouchEvent) => onTouchMove(e, state)
  const handleTouchEnd = () => onTouchEnd(state)
  const handleWheel = (e: WheelEvent) => onWheel(e, state, config, updateConfig)
  const handleResize = () => onWindowResize(container, state)

  container.addEventListener('mousedown', handleMouseDown)
  container.addEventListener('mousemove', handleMouseMove)
  container.addEventListener('mouseup', handleMouseUp)
  container.addEventListener('mouseleave', handleMouseUp)
  container.addEventListener('touchstart', handleTouchStart, { passive: false })
  container.addEventListener('touchmove', handleTouchMove, { passive: false })
  container.addEventListener('touchend', handleTouchEnd)
  container.addEventListener('wheel', handleWheel, { passive: false })
  window.addEventListener('resize', handleResize)

  // 返回清理函数
  return () => {
    container.removeEventListener('mousedown', handleMouseDown)
    container.removeEventListener('mousemove', handleMouseMove)
    container.removeEventListener('mouseup', handleMouseUp)
    container.removeEventListener('mouseleave', handleMouseUp)
    container.removeEventListener('touchstart', handleTouchStart)
    container.removeEventListener('touchmove', handleTouchMove)
    container.removeEventListener('touchend', handleTouchEnd)
    container.removeEventListener('wheel', handleWheel)
    window.removeEventListener('resize', handleResize)
  }
}
