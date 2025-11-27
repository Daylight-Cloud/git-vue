<template>
  <vue-particles id="tsparticles" :options="particlesOpts" />
</template>

<script setup>
import { ref } from 'vue'
const particlesOpts = ref({
  fpsLimit: 60,
  particles: {
    number: { value: 60, density: { enable: true, area: 800 } },
    color: { value: ['#667eea', '#764ba2'] },
    shape: { type: 'circle' },
    opacity: { value: 0.5, random: true },
    size: { value: 3, random: true },
    move: { enable: true, speed: 1, direction: 'none', outModes: 'out' },
  },
  interactivity: { detect: 'canvas', events: { onHover: { enable: true, mode: 'grab' } } },
  detectRetina: true,
})
</script>