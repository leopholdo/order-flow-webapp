<template>
  <v-container height="100dvh" max-width="900">
    <OrderList
      :ordersOnHold="false"
      :readonly="false"
    ></OrderList>
  </v-container>
</template>

<script setup>
import OrderList from '@/components/OrderList.vue';
</script>

<style scoped>
/* :deep(.v-container) >>> .v-card { */
:deep(.v-card) {
  display: flex;
  flex: 1 1 100%;
  flex-direction: column;
  height: 100%;
}

:deep(.v-card-text) {
  backface-visibility: hidden;
    overflow-y: auto;
}

</style>