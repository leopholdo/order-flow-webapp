<template>
  <v-card flat>
    <v-card-title class="d-flex align-center pe-2">
      Novo pedido
    </v-card-title>
    <v-divider></v-divider>

    <v-form ref="form" @submit.prevent="createOrder">
      <v-card-text>          
        <v-row class="mt-2">
          <v-col cols="3">
            <v-text-field 
              label="Senha" 
              variant="solo-filled" 
              autocomplete="off"
              :rules="[rules.required]"
              v-model="senha"
            ></v-text-field>
          </v-col>

          <!-- <v-col cols="9">
            <v-row class="justify-end">
              <v-col cols="auto">
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
          </v-col> -->
        </v-row>

        <v-table density="compact">
          <thead>
            <tr>
              <th class="text-left pl-0" style="width:70%">
                Produto
              </th>
              <th class="text-left" style="width:26%">
                Qtd
              </th>
              <th style="width:5%" v-if="enableDeleteItemBtn"></th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(item, index) in items" :key="items.length" >
              <td class="pl-0 pb-2">
                <v-autocomplete
                  hide-details 
                  auto-select-first
                  density="comfortable"
                  autocomplete="off"
                  label="Produto"
                  variant="solo-filled"
                  :disabled="isLoading.product"
                  :loading="isLoading.product"
                  :id="`product-${index}`" 
                  :items="availableProducts"
                  item-title="name"
                  item-value="id"
                  v-model="item.product"
                ></v-autocomplete>
              </td>

              <td class="pb-2">
                <v-number-input 
                  hide-details 
                  density="comfortable"
                  label="Qtd" 
                  variant="solo-filled" 
                  :min="1"
                  v-model="item.qtd"
                  @keydown.tab.prevent="handleTab(index)">
                </v-number-input>
              </td>

              <td 
                v-if="enableDeleteItemBtn" 
                class="text-end pr-0 pb-2">
                <v-icon-btn                   
                  color="error" 
                  icon="mdi-delete" 
                  variant="text" 
                  size="large"
                  @click="removeItem(index)"
                ></v-icon-btn>
              </td>
            </tr>
          </tbody>
        </v-table>

        <v-row>
          <v-col cols="auto">
            <v-btn
              color="warning"
              variant="tonal"
              size="small"
              @click="addNewItem">
              + Novo item
            </v-btn>
          </v-col>
        </v-row>   

        <v-row>
          <v-col cols="9">
            <v-row >
              <v-col cols="auto">
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
import { nextTick, computed } from 'vue';
import { useOrderStore } from '@/stores/order';
import { useProductStore } from '@/stores/product';
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
const items = ref([
  {
    product: null,
    qtd: 1
  }
])

const isLoading = ref({
  product: true,
  btnSubmit: false
});

const enableDeleteItemBtn = computed(() => {
  return items.value.length > 1
})

const rules = {
  required(value) {
    if(value) return true
    return 'Campo obrigatório'
  }
}

function addNewItem() {
  items.value.push({
    product: null,
    qtd: 1
  })
}

function handleTab(index) {
  let el = document.getElementById(`product-${index + 1}`)

  if (!el) {
    addNewItem()

    nextTick(() => {
      el = document.getElementById(`product-${index + 1}`)
      el.focus();
    })
  } else {
    el.focus();
  }
}

async function clearOrder() {
  await form.value.reset();

  items.value = [{
    name: null,
    qtd: 1
  }]

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

function removeItem(index) {
  items.value.splice(index, 1);
}

onMounted(async () => {
  availableProducts.value = await productStore.getProducts();
  isLoading.value.product = false;
})
</script>

<style scoped>
.v-table >>> div > table {
  border-spacing: 0 0.5rem;
}
</style>