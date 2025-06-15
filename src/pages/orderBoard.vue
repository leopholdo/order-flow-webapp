<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-row dense>
          <v-col 
            cols="2" 
            v-for="item in groupedProducts" 
            :key="item.product">
            <v-card>
              <div
                style="height: 5px;"
                :style="{'background-color': item.color}"
              ></div>
              <v-card-title class="text-center">
                {{ item.product }}
              </v-card-title>
              <v-card-text>
                <h3 class="text-center">
                  {{ item.qtd }}
                </h3>
              </v-card-text>
            </v-card> 
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="12">
        <v-row>
          <v-col 
            v-for="order in orders" 
            :key="order.senha" 
            cols="12" sm="6" md="4" lg="3">
            <v-card width="100%" class="border-sm" :class="{'border-error': order.timer > 1800 }">
              <div 
                v-if="order.priority"
                class="priority"
              ></div>

              <div 
                v-if="order.takeaway"
                class="takeaway"
              ></div>

              <v-card-title class="d-flex align-center pe-3">
                <span class="text-h5 font-weight-bold">
                  {{ order.senha }}
                </span>

                <v-spacer></v-spacer>

                <div class="d-flex ga-2">
                  <v-icon 
                    v-if="order.takeaway"
                    color="light-green-darken-1">
                    mdi-shopping
                  </v-icon>

                  <v-icon 
                    v-if="order.priority"
                    color="error">
                    mdi-alert
                  </v-icon>
                </div>
              </v-card-title>

              <v-card-subtitle>
                <v-fade-transition group>
                  <div v-if="order.timer" :class="{'text-red': order.timer > 1800 }">
                    {{ formatTime(order.timer) }}
                  </div>
                  <div v-else>
                    {{ setTimer(order) }}
                  </div>
                </v-fade-transition>
              </v-card-subtitle>

              <v-card-text>
                <ul>
                  <li 
                    v-for="item in order.orderProducts" 
                    :key="item"                     
                    style="list-style-type: none;">
                    <div class="d-flex align-center ga-1">
                      <!-- <div 
                        style="height: 15px; width: 3px;"
                        :style="{'background-color': item.product.color}"
                      ></div> -->
                      <span :style="{'color': item.product.color}">
                        &#9654;
                        <!-- &#9632; -->
                      </span>
                      <span>
                        {{ 
                          item.qtd + 'x ' + item.product.name 
                        }}
                      </span>
                    </div>
                  </li>
                </ul>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { useOrderStore } from '@/stores/order.js'
import { useProductStore } from '@/stores/product'

import notificationSound from '@/assets/notification-1.mp3'

const orderStore = useOrderStore()
const productStore = useProductStore()

const allProducts = ref([])

const orders = computed(() => orderStore.orders)

const groupedProducts = computed(() => {
  return allProducts.value.map(prod => {
    // Sum quantities of this product across all orders
    const qtd = orders.value.reduce((total, order) => {
      const match = order.orderProducts.find(op => op.product.id === prod.id);
      return total + (match ? match.qtd : 0);
    }, 0);

    return {
      product: prod.name,
      color: prod.color,
      qtd
    };
  }).sort((a, b) => b.qtd - a.qtd); // Sort by quantity descending
});

watch(() => orderStore.newOrderReceived, (val) => {
  if(val)
  {
    const audio = new Audio(notificationSound);
    audio.play();
  }
});

onMounted(async () => {
  await orderStore.getOrders()
  await orderStore.connectToHub()

  orders.value.forEach(o => {
    setTimer(o)
  })
})

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

const calculateElapsedTime = (timestamp) => {
  const now = new Date()
  const orderTime = new Date(timestamp)
  const diffInSeconds = Math.floor((now - orderTime) / 1000)

  return diffInSeconds
}

const setTimer = (order) => {
  let timer = calculateElapsedTime(order.creationDateTime)

  setInterval(() => {  
    order.timer = timer++
  }, 1000)
}

onMounted(async () => {
  allProducts.value = await productStore.getProducts()
})
</script>

<style scoped>
.priority {
  height: 8px; 
  background-color: #e27679;
}
.takeaway {
  height: 8px; 
  background-color: #7cb342;
}

li {
  font-size: 1.1rem;
}
</style>