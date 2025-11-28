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
  <div class="header mb-4">
    <div class="flex items-center justify-between flex-wrap gap-2">
      <h2 class="text-2xl font-bold">火车票生成器</h2>
      <div class="flex items-center gap-2">
        <a
          :href="projectInfo.repository"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
            />
          </svg>
          <span>GitHub</span>
        </a>
        <span class="text-gray-300">|</span>
        <button @click="showChangelog = true" class="version-badge" title="查看更新记录">
          v{{ latestVersion }}
        </button>
      </div>
    </div>
    <p class="text-sm text-gray-500 mt-2">
      {{ projectInfo.description }}。图标与车票版式版权归中国铁路及相关集团所有。
    </p>

    <!-- 更新记录弹窗 -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showChangelog" class="modal-overlay" @click.self="showChangelog = false">
          <div class="modal-content">
            <div class="modal-header">
              <h3>更新记录</h3>
              <button @click="showChangelog = false" class="close-btn">&times;</button>
            </div>
            <div class="modal-body">
              <div v-for="release in changelog" :key="release.version" class="release">
                <div class="release-header">
                  <span class="release-version">v{{ release.version }}</span>
                  <span class="release-date">{{ release.date }}</span>
                </div>
                <ul class="release-changes">
                  <li v-for="(change, index) in release.changes" :key="index">{{ change }}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import changelogData from '@/data/changelog.json'

const projectInfo = changelogData.project
const changelog = changelogData.changelog
const latestVersion = changelog[0]?.version || '0.0.0'
const showChangelog = ref(false)
</script>

<style scoped>
.version-badge {
  @apply text-xs font-mono px-1.5 py-0.5 bg-indigo-100 text-indigo-600 rounded cursor-pointer hover:bg-indigo-200 transition-colors;
}

/* Modal 样式 */
.modal-overlay {
  @apply fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4;
}

.modal-content {
  @apply bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] flex flex-col;
}

.modal-header {
  @apply flex items-center justify-between px-4 py-3 border-b border-gray-200;
}

.modal-header h3 {
  @apply text-lg font-semibold text-gray-800;
}

.close-btn {
  @apply text-2xl text-gray-400 hover:text-gray-600 transition-colors leading-none;
}

.modal-body {
  @apply p-4 overflow-y-auto;
}

.release {
  @apply mb-4 last:mb-0;
}

.release-header {
  @apply flex items-center gap-3 mb-2;
}

.release-version {
  @apply font-mono font-semibold text-indigo-600;
}

.release-date {
  @apply text-sm text-gray-400;
}

.release-changes {
  @apply list-disc list-inside text-sm text-gray-600 space-y-1 pl-2;
}

/* Modal 动画 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.2s ease;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.95);
}
</style>
