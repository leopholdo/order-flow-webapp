<template>
  <v-card max-width="900">
    <v-card-title class="d-flex align-center pe-2">
      {{ props.ordersOnHold ? 'Pedidos em espera' : 'Pedidos ativos'}}
    
      <v-spacer></v-spacer>

      <v-text-field
        flat hide-details
        clearable single-line
        max-width="180"
        class="me-2"
        v-model="search"
        density="compact"
        label="Senha"
        prepend-inner-icon="mdi-magnify"
        variant="solo-filled"
        autocomplete="off"
      ></v-text-field>      

      <v-icon-btn 
        v-if="props.showCloseBtn"
        icon="mdi-close" 
        variant="text"
        @click="emits('onClose')"
      ></v-icon-btn>
    </v-card-title>

    <v-divider></v-divider>

    <v-card-text>  
      <v-data-table-virtual
        style="height: 100%"
        fixed-header
        hide-default-footer
        v-model:search="search"
        :filter-keys="['senha']"
        :headers="headers"
        :items="orders">
        <template v-slot:item.creationDateTime="{ item }">
          {{ formatTime(item.creationDateTime) }}
        </template>

        <template v-slot:item.items="{ item }">
          <ul>
            <li v-for="(obj, index) in item.orderProducts" :key="index" style="list-style-type: none;">
              {{ 
                `${obj.qtd}x `
              }}
              <span class="font-weight-bold">{{ obj.product.name }}</span>
            </li>
          </ul>
        </template>

        <template v-slot:item.takeaway="{ item }">
          <v-tooltip 
            v-if="item.takeaway"
            text="Pedido para viagem" 
            location="top">
            <template v-slot:activator="{ props }">
              <v-icon 
                v-bind="props"
                color="light-green-darken-1">
                mdi-shopping
              </v-icon>
            </template>
          </v-tooltip>

          
        </template>

        <template  
          v-if="!props.readonly"
          v-slot:item.action="{ item }">
          <div class="text-end">
            <v-icon-btn 
              v-if="props.ordersOnHold"
              title="Enviar para a cozinha"
              color="cyan" 
              icon="mdi-cube-send" 
              variant="tonal"
              @click="sendToBoard(item)"
            ></v-icon-btn>

            <v-icon-btn 
              v-else
              title="Concluir pedido"
              color="success" 
              icon="mdi-check" 
              variant="tonal"
              @click="queueRemoveOrder(item)"
            ></v-icon-btn>
          </div>
        </template>
      </v-data-table-virtual>
    </v-card-text>
  </v-card>

  <v-snackbar 
    v-if="activeSnack"
    color="#4c5255"
    :timeout="activeSnack.timeout"
    :timer="activeSnack.error ? 'warning' : 'success'"
    v-model="activeSnack.show"
    @mouseover="clearSnackTimeout(activeSnack.timer)"
    @mouseleave="runTimeout">
    <template #text>
      <span v-html="activeSnack.message"></span>
      <!-- <span>Pedido número </span>
      <span class="font-weight-bold">{{ activeSnack.order.senha }}</span>
      <span> {{ props.ordersOnHold ? ' enviado para a cozinha' : ' concluído' }}</span> -->
    </template>

    <template #actions>
      <v-btn 
        class="mr-2"
        variant="tonal"
        size="small"
        prepend-icon="mdi-restore"
        text="Restaurar"
        @click="restoreOrder"
      ></v-btn>

      <v-btn 
        variant="tonal"
        size="small"
        prepend-icon="mdi-close"
        text="Fechar"
        @click="activeSnack.show = false"
      ></v-btn>
    </template>
  </v-snackbar>
</template>

<script setup>
import { useOrderStore } from '@/stores/order';

const orderStore = useOrderStore();

const emits = defineEmits(['onClose']);
const props = defineProps({
  showCloseBtn: {
    type: Boolean,
    default: false
  },
  readonly: {
    type: Boolean,
    default: false
  },
  ordersOnHold: {
    type: Boolean,
    default: true
  }
})

const search = ref();

const listSnack = ref([])
const activeSnack = ref()

const orders = computed(() => props.ordersOnHold ? orderStore.ordersOnHold : orderStore.orders)
const headers = [
  {
    align: 'start',
    key: 'senha',
    title: 'Senha',
  },
  {
    align: 'start',
    key: 'creationDateTime',
    title: 'Horário de entrada',
  },
  {
    align: 'start',
    key: 'items',
    title: 'Itens',
    sortable: false,
  },
  {
    align: 'start',
    key: 'takeaway',
    sortable: false,
    title: '',
  },
  {
    align: 'start',
    key: 'action',
    sortable: false,
    title: '',
  },
]

onMounted(async () => {
  if(props.ordersOnHold) {
    await orderStore.getOrdersOnHold()
  } else {
    await orderStore.getOrders()
  }

  await orderStore.connectToHub()
})

function formatTime(datetime) {
  if(!datetime) return

  return new Date(datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

async function sendToBoard(order) {
  // let response = await orderStore.sendToBoard(order.senha);
  listSnack.value.push(order)
  
  const index = orders.value.indexOf(order)

  // if(!response.ok) {
  //   activeSnack.value = {
  //     message: 'Ocorreu um erro erro desconhecido. Por favor, acione um administrador.',
  //     error: true,
  //     order: order,
  //     timeout: 2000,
  //     show: true
  //   };

  //   return;
  // }

  activeSnack.value = {
    message: `Pedido número <b>${order.senha}</b> enviado para a cozinha.`,
    order: order,
    timeout: 3000,
    show: true
  };

  orders.value.splice(index, 1);
    
  runTimeout();
}

function runTimeout() {
  activeSnack.value.timer = setTimeout(() => {
    if(props.ordersOnHold) {
      orderStore.sendToBoard(activeSnack.value.order.senha);
    }
    else {
      orderStore.completeOrder(activeSnack.value.order.senha);
    }
    activeSnack.value = null;
  }, activeSnack.value.timeout)
}

function clearSnackTimeout(timer) {
  console.log(timer);
  clearTimeout(timer)
}

function queueRemoveOrder(order) {
  listSnack.value.push(order)
  
  const index = orders.value.indexOf(order)

  activeSnack.value = {
    message: `Pedido número <b>${order.senha}</b> concluído.`,
    order: order,
    index: index,
    timeout: 3000,
    show: true
  };

  // remove o pedido da lista (sem mandar pro backend)
  orders.value.splice(index, 1);

  runTimeout();
}

function restoreOrder() {
  // remove o timer que envia a requisição de remoção pro backend
  clearSnackTimeout(activeSnack.value.timeout)

  // restore the order in the main list 
  orders.value.splice(activeSnack.value.index, 0, activeSnack.value.order);

  // limpa o snack
  activeSnack.value = null;
}
</script>

<style scoped>
.v-data-table >>> div > table > tbody > tr > td {
  /* vertical-align: baseline !important; */
}

.v-data-table >>> div > table > tbody > tr:nth-child(even) {
  background: rgb(var(--v-theme-background), 0.4);
}

.v-data-table >>> .v-table__wrapper {
  margin-bottom: 20px;
}
</style>