<template>
  <NavigationDrawer/>

  <v-main>
    <router-view />
  </v-main>

  <!-- <AppFooter /> -->
</template>

<script setup>
import NavigationDrawer from '@/components/NavigationDrawer.vue';
</script>