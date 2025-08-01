<template>
  <div class="tab text-sm" v-bind="$attrs">
    <div
      class="tab-item"
      v-for="tab in tabs"
      :key="tab.key"
      @click="activeTab = tab.key"
      :class="{ active: activeTab === tab.key }"
    >
      {{ tab.label }}
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  tabs: Array<{ label: string; key: any }>
}>()

const activeTab = defineModel<any>('modelValue')
</script>
