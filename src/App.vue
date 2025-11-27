<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AdminLayout from './components/AdminLayout.vue'
import UserLayout from './components/UserLayout.vue'

const route = useRoute()

const layoutComponent = computed(() => {
  const layout = route.meta?.layout
  if (layout === 'admin') return AdminLayout
  if (layout === 'user') return UserLayout
  return null
})
</script>

<template>
  <router-view v-slot="{ Component }">
    <template v-if="!layoutComponent">
      <component :is="Component" />
    </template>
    <template v-else>
      <component :is="layoutComponent">
        <component :is="Component" />
      </component>
    </template>
  </router-view>
</template>
