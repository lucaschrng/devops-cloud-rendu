<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner';
import 'vue-sonner/style.css'; // vue-sonner v2 requires this import
import Navbar from '@/components/layout/Navbar.vue';
import { useRoute } from 'vue-router';
import { computed } from 'vue';

const route = useRoute();

// Hide navbar on login and signup pages
const showNavbar = computed(() => {
  return !['Login', 'Signup'].includes(route.name?.toString() || '');
});
</script>

<template>
  <div class="min-h-screen bg-background">
    <Navbar v-if="showNavbar" />
    <main :class="{ 'py-6': showNavbar }">
      <router-view />
    </main>
    <Toaster class="pointer-events-auto" />
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
