<template>
  <div class="static-bg" :style="{ backgroundImage: `url(${src})` }"></div>
</template>

<script setup>
defineProps({
  src: { type: String, default: '/login-bg.jpg' }
})
</script>

<style scoped>
.static-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 0;
}
</style>