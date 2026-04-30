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
 * This file is created by FoskyM.
 * -->

<template>
  <div v-if="promotions.length" class="promotion-bar">
    <div class="promotion-track">
      <a
        v-for="(item, i) in promotions"
        :key="i"
        :href="item.url"
        target="_blank"
        rel="noopener noreferrer"
        class="promo-card"
        :style="cardStyle(item.color)"
      >
        <img
          v-if="item.icon"
          :src="item.icon"
          :alt="item.name"
          class="promo-icon"
          loading="lazy"
          @error="onImgError"
        />
        <div class="promo-text">
          <span class="promo-name">{{ item.name }}</span>
          <span class="promo-desc">{{ item.description }}</span>
        </div>
        <svg class="promo-arrow" viewBox="0 0 20 20" fill="currentColor">
          <path
            fill-rule="evenodd"
            d="M5.22 14.78a.75.75 0 010-1.06l7.22-7.22H8.75a.75.75 0 010-1.5h5.5a.75.75 0 01.75.75v5.5a.75.75 0 01-1.5 0V6.56l-7.22 7.22a.75.75 0 01-1.06 0z"
            clip-rule="evenodd"
          />
        </svg>
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import promotionsData from '@/data/promotions.json'

interface PromotionItem {
  name: string
  description: string
  url: string
  icon?: string
  color?: string
}

const promotions: PromotionItem[] = promotionsData

const cardStyle = (color?: string) => {
  const c = color || '#6366F1'
  return {
    '--card-color': c,
    '--card-bg': `${c}08`,
    '--card-bg-hover': `${c}12`,
    '--card-border': `${c}18`,
    '--card-border-hover': `${c}30`,
  }
}

const onImgError = (e: Event) => {
  ;(e.target as HTMLImageElement).style.display = 'none'
}
</script>

<style scoped>
.promotion-bar {
  @apply mb-4;
}

.promotion-track {
  @apply flex flex-wrap gap-2;
  user-select: none;
}

.promo-card {
  @apply flex items-start gap-2 px-3 py-1.5 rounded-lg no-underline;
  @apply transition-all duration-200 ease-out;
  min-width: 170px;
  max-width: 260px;
  flex: 1 1 170px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
}

.promo-card:hover {
  background: var(--card-bg-hover);
  border-color: var(--card-border-hover);
  transform: translateY(-1px);
}

.promo-card:active {
  transform: translateY(0);
}

.promo-icon {
  @apply w-6 h-6 rounded object-cover flex-shrink-0;
}

.promo-text {
  @apply flex flex-col min-w-0;
}

.promo-name {
  @apply text-xs font-medium text-gray-700 dark:text-gray-200 truncate leading-tight;
}

.promo-desc {
  @apply text-gray-400 dark:text-gray-500;
  font-size: 10.5px;
  line-height: 1.35;
  min-height: 2lh;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.promo-arrow {
  @apply w-3 h-3 flex-shrink-0 ml-auto;
  color: var(--card-color);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.promo-card:hover .promo-arrow {
  opacity: 0.6;
}
</style>
