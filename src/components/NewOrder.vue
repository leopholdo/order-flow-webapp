<template>
  <v-card flat>
    <v-card-title class="d-flex align-center pe-2">
      Novo pedido

      <v-menu transition="scale-transition">
        <template v-slot:activator="{ props }">
          <v-icon-btn
            class="ml-auto" 
            variant="plain"
            icon="mdi-cog"
            v-bind="props"
          ></v-icon-btn>
        </template>

        <div>
          <v-list 
            density="compact"
            v-model:selected="visualizationMode"
            @update:selected="onChangeVisualizationMode">
            <v-list-subheader>
              Configurar visualização
            </v-list-subheader>
              
            <v-list-item
              prepend-icon="mdi-list-box"
              title="Lista"
              value="list"
            ></v-list-item>

            <v-list-item
              prepend-icon="mdi-view-grid"
              title="Blocos"
              value="block"
            ></v-list-item>
          </v-list>
        </div>
      </v-menu>
    </v-card-title>

    <v-divider></v-divider>

    <v-form ref="form" @submit.prevent="createOrder">
      <v-card-text>     
        <NewOrderProductsList
          v-if="visualizationMode.includes('list')"
          :isLoading="isLoading"
          :availableProducts="availableProducts"
          v-model:items="items"
        ></NewOrderProductsList>

        <NewOrderProductsBlock
          v-else
          ref="productsBlockRef"
          :availableProducts="availableProducts"
          v-model:items="items"
        ></NewOrderProductsBlock>

        <v-row>
          <v-col cols="12" sm="3">
            <v-text-field
              hide-details 
              label="Senha" 
              variant="solo-filled" 
              autocomplete="off"
              type="number"
              :min="1"
              :rules="[rules.required]"
              v-model="senha">
            </v-text-field>
          </v-col>
          <v-col cols="auto" class="ml-auto">
            <v-switch 
              hide-details
              color="success" 
              label="Pegar depois" 
              v-model="onHold" 
            ></v-switch>
          </v-col>

          <v-col cols="auto">
            <v-switch 
              hide-details
              color="success" 
              label="Para viagem" 
              v-model="takeaway" 
            ></v-switch>
          </v-col>

          <v-col cols="auto">
            <v-switch 
              hide-details
              color="success" 
              label="Prioridade" 
              v-model="priority" 
            ></v-switch>
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="d-flex justify-end px-4 pb-4">
        <v-btn 
          color="error" 
          variant="tonal" 
          @click="clearOrder">
          Limpar pedido
        </v-btn>

        <v-btn 
          color="success" 
          variant="tonal" 
          type="submit"
          :loading="isLoading.btnSubmit">
          Concluir
        </v-btn>
      </v-card-actions>
    </v-form>      
  </v-card>

  <Snack
    ref="snackComponent"
  ></Snack>
</template>

<script setup>
import { nextTick } from 'vue';
import { useOrderStore } from '@/stores/order';
import { useProductStore } from '@/stores/product';
import NewOrderProductsList from './NewOrderProductsList.vue';
import NewOrderProductsBlock from './NewOrderProductsBlock.vue';
import Snack from '@/components/Snack.vue';

const orderStore = useOrderStore();
const productStore = useProductStore();

const availableProducts = ref([])
const form = ref();
const snackComponent = ref()
const priority = ref(false);
const takeaway = ref(false);
const onHold = ref(false);
const senha = ref();
const visualizationMode = ref(['block'])
const productsBlockRef = ref()

const items = ref([])

const isLoading = ref({
  product: true,
  btnSubmit: false
});

const rules = {
  required(value) {
    if(value) return true
    return 'Campo obrigatório'
  }
}

function onChangeVisualizationMode(val) {
  localStorage.setItem('visualizationMode', val[0])
}

async function clearOrder() {
  await form.value.reset();

  items.value = []
  
  if(productsBlockRef.value) {
    productsBlockRef.value.onClear()
  }else {
    items.value = [{
      name: null,
      qtd: 1
    }]
  }

  onHold.value = false;
  takeaway.value = false;
  priority.value = false;
}

async function createOrder() {
  const { valid } = await form.value.validate();
  if(!valid) return;

  const orderItems = items.value.filter(i => i.product != null)
  if(!orderItems.length) {
    snackComponent.value.newSnack('É necessário adicionar pelo menos um produto ao pedido.', true)  

    return;
  }

  isLoading.value.btnSubmit = true;

  const orderProducts = orderItems.map(o => {
    return {
      qtd: o.qtd,
      productId: o.product
    }
  })

  const payload = {
    senha: senha.value,
    onHold: onHold.value,
    takeaway: takeaway.value,
    priority: priority.value,
    orderProducts: orderProducts
  }

  orderStore.createOrder(payload)
    .then(() => {
      snackComponent.value.newSnack(`Pedido nº${senha.value} criado com sucesso!`, false)  
      clearOrder();
    })
    .catch(error => {
      snackComponent.value.newSnack(error.toString(), true)  
    })
    .finally(() => {
      isLoading.value.btnSubmit = false;
    })
}

onMounted(async () => {
  availableProducts.value = await productStore.getProducts();
  isLoading.value.product = false;

  const visualizationModeStored = localStorage.getItem('visualizationMode')
  if(visualizationModeStored) {
    visualizationMode.value = [visualizationModeStored]
  } 
})
</script>

<style scoped>
:deep(.v-data-table-headers--mobile) {
  display: none !important;
}
</style>