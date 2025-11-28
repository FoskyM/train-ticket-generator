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
  <footer class="app-footer">
    <div class="footer-content">
      <span>&copy; 2024-{{ currentYear }}</span>
      <a :href="projectInfo.authorUrl" target="_blank" rel="noopener noreferrer" class="link">
        {{ projectInfo.author }}
      </a>
      <span class="separator">·</span>
      <a :href="projectInfo.repository" target="_blank" rel="noopener noreferrer" class="link">
        {{ projectInfo.name }}
      </a>
      <span class="separator">·</span>
      <a
        :href="`${projectInfo.repository}/blob/main/LICENSE`"
        target="_blank"
        rel="noopener noreferrer"
        class="license"
      >
        {{ projectInfo.license }}
      </a>
      <span class="separator">·</span>
      <a
        :href="`${projectInfo.repository}/commit/${commitHash}`"
        target="_blank"
        rel="noopener noreferrer"
        class="commit-link"
        :title="`提交: ${commitDate}\n构建: ${buildTime}`"
      >
        {{ commitHash }}
      </a>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import changelogData from '@/data/changelog.json'

const commitHash = __GIT_COMMIT_HASH__
const commitDate = computed(() => {
  const date = new Date(__GIT_COMMIT_DATE__)
  return date.toLocaleString('zh-CN')
})
const buildTime = computed(() => {
  const date = new Date(__BUILD_TIME__)
  return date.toLocaleString('zh-CN')
})

const projectInfo = changelogData.project
const currentYear = new Date().getFullYear()
</script>

<style scoped>
.app-footer {
  @apply mt-6 py-3 text-center text-sm text-gray-500;
}

.footer-content {
  @apply flex items-center justify-center gap-1.5 flex-wrap;
}

.link {
  @apply hover:text-indigo-600 transition-colors;
}

.license {
  @apply text-gray-400 hover:text-indigo-600 transition-colors;
}

.separator {
  @apply text-gray-300;
}

.commit-link {
  @apply font-mono text-gray-400 hover:text-indigo-600 transition-colors;
}
</style>
