<template>
  <v-container class="fill-height" max-width="900">
    <div class="d-flex align-self-baseline w-100">
      <v-row>
        <v-col cols="4">
          <v-card 
            flat 
            :loading="isLoading.activeOrders"
            @click="openOrderList(false)">
            <v-card-title class="d-flex align-center pe-2">
              Pedidos ativos
            </v-card-title>
            <v-card-text class="text-h6 text-end">
              {{ ordersLength }}
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="4">
          <v-card 
            flat 
            :loading="isLoading.ordersOnHold"
            @click="openOrderList(true)">
            <v-card-title class="d-flex align-center pe-2">
              Pedidos em espera
            </v-card-title>
            <v-card-text class="text-h6 text-end">
              {{ ordersOnHoldLength }}
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="4" v-if="averageTime">
          <v-card flat>
            <v-card-title class="d-flex align-center pe-2">
              Tempo médio
            </v-card-title>
            <v-card-text class="text-h6 text-end">
              {{ averageTime }}
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <div class="align-self-baseline w-100 mt-6">
      <NewOrder></NewOrder>
    </div>
  </v-container>

  <v-dialog 
    scrollable
    max-width="900"
    v-model="orderListProps.show">
    <OrderList
      :showCloseBtn="true"
      :readonly="orderListProps.readonly"
      :ordersOnHold="orderListProps.onHold"
      @onClose="orderListProps.show = false"
    ></OrderList>
  </v-dialog>
</template>

<script setup>
import { useOrderStore } from '@/stores/order';
import NewOrder from '@/components/NewOrder.vue';
import OrderList from '@/components/OrderList.vue';

const orderStore = useOrderStore();

const averageTime = computed(() => orderStore.averageTime)
const ordersLength = computed(() => orderStore.orders.length)
const ordersOnHoldLength = computed(() => orderStore.ordersOnHold.length)

const orderListProps = ref({
  show: false,
  onHold: false,
  readonly: false
})

const isLoading = ref({
  activeOrders: true,
  ordersOnHold: true,
})

function openOrderList(onHold = false) {
  orderListProps.value = {
    show: true,
    onHold: onHold,
    readonly: onHold ? false : true
  }
}

onMounted(async () => {
  await orderStore.getOrders()
  isLoading.value.activeOrders = false;

  await orderStore.getOrdersOnHold()
  isLoading.value.ordersOnHold = false;

  orderStore.getTimeWhenOrderCompleted = true;
  await orderStore.getAverageTime()
  await orderStore.connectToHub()
})
</script>

<style scoped>
</style>