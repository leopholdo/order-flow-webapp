<template>
  <v-hover v-slot="{ isHovering, props }" v-if="hide">
    <div class="hide-area pa-2" v-bind="props">
        <v-slide-x-transition>
          <v-icon-btn 
            v-if="isHovering"
            icon="mdi-chevron-double-right"
            @click="toggleNavbar">
          </v-icon-btn>
        </v-slide-x-transition>
      </div>
  </v-hover>
  <v-navigation-drawer
    floating 
    disable-resize-watcher
    expand-on-hover
    :rail="rail"    
    :mobile-breakpoint="0"
    :temporary="hide"
    :persistent="false"
    v-model="drawer">
    <div class="d-flex flex-column h-100">
      <v-list 
        nav mandatory
        density="compact">
        <v-list-item
          link
          prepend-icon="mdi-chevron-double-left"
          title="Ocultar"
          @click.stop="toggleNavbar"
        ></v-list-item>
      </v-list>

      <v-divider></v-divider>

      <v-list 
        density="compact" nav
        v-model:selected="activeRoute">
        <v-list-item
          prepend-icon="mdi-store"
          title="Produtos"
          value="/products"
          to="/products"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-invoice-list"
          title="Pedidos"
          value="/order"
          to="/order"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-bulletin-board"
          title="Board"
          value="/orderBoard"
          to="/orderBoard"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-invoice-text-check-outline"
          title="Despacho"
          value="/orderdispatch"
          to="/orderdispatch"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-chart-bar"
          title="Dashboard"
          value="/dashboard"
          to="/dashboard"
        ></v-list-item>
      </v-list>

      <v-spacer></v-spacer>

      <v-list 
        nav mandatory
        density="compact">
        <v-list-item
          link
          prepend-icon="mdi-cog"
          title="Tema"
          @click.stop="showConfigurationModal = true"
        ></v-list-item>
      </v-list>
    </div>
  </v-navigation-drawer>

  <ConfigurationModal
    v-model:show="showConfigurationModal"
  ></ConfigurationModal>
</template>

<script setup>
import ConfigurationModal from './ConfigurationModal.vue';

import { useRouter } from 'vue-router'
import { useTheme } from 'vuetify'

  const router = useRouter();
  const theme = useTheme()

  const activeRoute = ref([router.currentRoute.value.path])
  const drawer = ref(true)
  const rail = ref(true)
  const hide = ref(false)

  const showConfigurationModal = ref(false)

  function toggleNavbar() {
    drawer.value = !drawer.value;
    rail.value = !rail.value;
    hide.value = !hide.value;
  }

  function toggleTheme () {
    theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
  }
</script>

<style>
.hide-area {
  position: absolute;
  height: 100vh;
  width: 100px;
  top: 0;
  left: 0;
  z-index: 2;
}
</style>