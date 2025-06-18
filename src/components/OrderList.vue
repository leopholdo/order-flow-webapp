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
        :mobile="smAndDown"
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
    v-for="snack in activeSnacks"
    :key="snack.id"
    color="#4c5255"
    :timeout="snack.timeout"
    :timer="snack.error ? 'warning' : 'success'"
    v-model="snack.show"
    @mouseover="clearSnackTimeout(snack)"
    @mouseleave="runTimeout(snack)">
    <template #text>
      <span v-html="snack.message"></span>
    </template>

    <template #actions>
      <v-btn 
        class="mr-2"
        variant="tonal"
        size="small"
        prepend-icon="mdi-restore"
        text="Restaurar"
        @click="restoreOrder(snack)"
      ></v-btn>

      <v-btn 
        variant="tonal"
        size="small"
        prepend-icon="mdi-close"
        text="Fechar"
        @click="closeSnack(snack)"
      ></v-btn>
    </template>
  </v-snackbar>
</template>

<script setup>
import { useDisplay } from 'vuetify'
import { useOrderStore } from '@/stores/order';

const { smAndDown } = useDisplay()
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
const activeSnacks = ref([]);

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

  const snack = {
    id: Date.now() + Math.random(), // unique ID
    message: `Pedido número <b>${order.senha}</b> enviado para a cozinha.`,
    order,
    index,
    timeout: 3000,
    show: true,
    timer: null
  };

  activeSnacks.value.push(snack)

  orders.value.splice(index, 1);
    
  runTimeout(snack);
}

function runTimeout(snack) {
  snack.timer = setTimeout(() => {
    if (props.ordersOnHold) {
      orderStore.sendToBoard(snack.order.id);
    } else {
      orderStore.completeOrder(snack.order.id);
    }
    removeSnack(snack.id);
  }, snack.timeout);
}

function clearSnackTimeout(snack) {
  if (snack?.timer) {
    clearTimeout(snack.timer)
    snack.timer = null
  }
}

function queueRemoveOrder(order) {
  listSnack.value.push(order)
  
  const index = orders.value.indexOf(order)

  const snack = {
    id: Date.now() + Math.random(), // unique ID
    message: `Pedido número <b>${order.senha}</b> concluído.`,
    order,
    index,
    timeout: 3000,
    show: true,
    timer: null
  };

  activeSnacks.value.push(snack)

  // remove o pedido da lista (sem mandar pro backend)
  orders.value.splice(index, 1);

  runTimeout(snack);
}

function restoreOrder(snack) {
  // remove o timer que envia a requisição de remoção pro backend
  clearSnackTimeout(snack)

  // restore the order in the main list 
  orders.value.splice(snack.index, 0, snack.order);

  // limpa o snack
  removeSnack(snack.id)
}

function removeSnack(id) {
  const i = activeSnacks.value.findIndex(s => s.id === id);
  if (i !== -1) activeSnacks.value.splice(i, 1);
}


function closeSnack(snack) {
  clearSnackTimeout(snack)
  removeSnack(snack.id)
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