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
 * This file is created by FoskyM on 2025/11/28.
 * -->

<template>
  <!-- 悬浮按钮容器 -->
  <div class="donate-fab-wrapper">
    <!-- Tooltip 横幅 -->
    <Transition name="tooltip">
      <div v-if="showTooltip" class="donate-tooltip">
        点击赞赏一下我~
        <span class="tooltip-arrow"></span>
      </div>
    </Transition>

    <!-- 悬浮按钮 -->
    <button class="donate-fab" @click="handleClick" title="赞赏支持">
      <span class="fab-icon">☕</span>
      <span class="fab-ping"></span>
    </button>
  </div>

  <!-- 赞赏弹窗 -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="showModal" class="donate-overlay" @click.self="showModal = false">
        <div class="donate-modal">
          <div class="donate-header">
            <h3>赞赏支持</h3>
            <button @click="showModal = false" class="close-btn">&times;</button>
          </div>
          <div class="donate-body">
            <p class="donate-desc">如果这个项目对你有帮助，可以请作者喝杯咖啡 ☕</p>
            <div class="qrcode-container">
              <img :src="donateQrCode" alt="赞赏码" class="qrcode-img" />
            </div>
            <p class="donate-tip">微信扫一扫，感谢您的支持！</p>
            <div class="donate-footer-links">
              <a :href="projectInfo.repository" target="_blank" rel="noopener noreferrer">
                ⭐ 也欢迎给项目点个 Star
              </a>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import changelogData from '@/data/changelog.json'

import donateQrCodeImg from '@/assets/img/donate.jpg'
const donateQrCode = donateQrCodeImg

const projectInfo = changelogData.project
const showModal = ref(false)
const showTooltip = ref(false)

const handleClick = () => {
  showTooltip.value = false
  showModal.value = true
}

// 页面加载时显示 tooltip
onMounted(() => {
  setTimeout(() => {
    showTooltip.value = true

    // 5秒后自动隐藏
    setTimeout(() => {
      showTooltip.value = false
    }, 5000)
  }, 1500)
})
</script>

<style scoped>
/* 悬浮按钮容器 */
.donate-fab-wrapper {
  @apply fixed z-40 bottom-6 right-6;
}

/* 悬浮按钮 */
.donate-fab {
  @apply relative w-12 h-12 rounded-full bg-indigo-500 text-white shadow-md;
  @apply flex items-center justify-center cursor-pointer transition-all;
  @apply hover:bg-indigo-600 hover:scale-110 hover:shadow-lg;
  @apply focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2;
}

.fab-icon {
  @apply text-xl relative z-10;
}

/* 闪动效果 */
.fab-ping {
  @apply absolute inset-0 rounded-full bg-indigo-400 opacity-75;
  animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes ping {
  0% {
    transform: scale(1);
    opacity: 0.6;
  }
  75%,
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

/* Tooltip 横幅 */
.donate-tooltip {
  @apply absolute right-16 top-1/2 -translate-y-1/2;
  @apply bg-gray-800 text-white text-sm px-3 py-2 rounded-md shadow-lg whitespace-nowrap;
}

.tooltip-arrow {
  @apply absolute top-1/2 -translate-y-1/2 right-0 translate-x-full;
  @apply border-8 border-transparent border-l-gray-800;
}

/* Tooltip 动画 */
.tooltip-enter-active,
.tooltip-leave-active {
  transition: all 0.3s ease;
}

.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
  transform: translateX(10px) translateY(-50%);
}

/* 弹窗遮罩 */
.donate-overlay {
  @apply fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4;
}

/* 弹窗内容 */
.donate-modal {
  @apply bg-white rounded-lg shadow-xl max-w-sm w-full overflow-hidden;
}

.donate-header {
  @apply flex items-center justify-between px-4 py-3 border-b border-gray-200;
}

.donate-header h3 {
  @apply text-lg font-semibold text-gray-800;
}

.close-btn {
  @apply text-2xl text-gray-400 hover:text-gray-600 transition-colors leading-none;
}

.donate-body {
  @apply p-4 text-center;
}

.donate-desc {
  @apply text-gray-600 mb-4;
}

.qrcode-container {
  @apply flex justify-center mb-4;
}

.qrcode-img {
  @apply w-56 h-56 rounded-lg border border-gray-200;
}

.donate-tip {
  @apply text-sm text-gray-400 mb-4;
}

.donate-footer-links {
  @apply pt-3 border-t border-gray-100;
}

.donate-footer-links a {
  @apply text-sm text-indigo-500 hover:text-indigo-600 transition-colors;
}

/* 弹窗动画 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .donate-modal,
.modal-leave-active .donate-modal {
  transition: transform 0.2s ease;
}

.modal-enter-from .donate-modal,
.modal-leave-to .donate-modal {
  transform: scale(0.95);
}
</style>
