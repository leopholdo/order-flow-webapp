<template>
  <v-card flat>
    <v-card-title class="d-flex align-center pe-2">
      Novo pedido
    </v-card-title>
    <v-divider></v-divider>

    <v-form ref="form" @submit.prevent="createOrder">
      <v-card-text>          
        <v-row class="mt-2 px-2">
          <v-col cols="12" sm="3">
            <v-text-field 
              label="Senha" 
              variant="solo-filled" 
              autocomplete="off"
              :rules="[rules.required]"
              v-model="senha"
            ></v-text-field>
          </v-col>
        </v-row>

        <v-data-table-virtual
          density="compact"
          :mobile="smAndDown"
          style="height: 100%;"
          fixed-header
          hide-default-footer
          :headers="headers"
          :items="items">
          <template v-slot:item.product="{ item, index }">
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
              @update:modelValue="val => handleProductSelect(val, index)"
              :model-value="item.product">
              <template v-slot:item="{ item, props }">
                <v-list-item
                  v-bind="props"
                  :disabled="selectedProductIds.includes(item.raw.id) && item.raw.id !== item.product"
                />
              </template>
            </v-autocomplete>
          </template>

          <template v-slot:item.qtd="{ item, index }">
            <v-number-input 
              hide-details 
              density="comfortable"
              label="Qtd" 
              variant="solo-filled" 
              :min="1"
              v-model="item.qtd"
              @keydown.tab.prevent="handleTab(index)">
            </v-number-input>
          </template>

          <template v-slot:item.action="{ item, index }">
            <v-icon-btn     
              v-if="enableDeleteItemBtn"              
              color="error" 
              icon="mdi-delete" 
              variant="text" 
              size="large"
              @click="removeItem(index)"
            ></v-icon-btn>
          </template>
        </v-data-table-virtual>

        <v-row class="px-4">
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

        <v-row class="px-4">
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
import { useDisplay } from 'vuetify'
import { useOrderStore } from '@/stores/order';
import { useProductStore } from '@/stores/product';
import Snack from '@/components/Snack.vue';

const { smAndDown } = useDisplay()
const orderStore = useOrderStore();
const productStore = useProductStore();

const availableProducts = ref([])
const form = ref();
const snackComponent = ref()
const priority = ref(false);
const takeaway = ref(false);
const onHold = ref(false);
const senha = ref();

const headers = [
  {
    width: '75%',
    align: 'start',
    key: 'product',
    title: 'Produto',
    sortable: false,
  },
  {
    width: '20%',
    align: 'start',
    key: 'qtd',
    title: 'Qtd',
    sortable: false,
  },
  {
    width: '5%',
    align: 'start',
    key: 'action',
    sortable: false,
    title: '',
  },
]
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

const selectedProductIds = computed(() =>
  items.value.map(i => i.product).filter(Boolean)
);

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

function focusWhenAvailable(id, retries = 5) {
  const tryFocus = (attempt = 0) => {
    const el = document.getElementById(id);
    if (el) {
      el.focus();
    } else if (attempt < retries) {
      setTimeout(() => tryFocus(attempt + 1), 5);
    }
  };

  tryFocus();
}

async function handleTab(index) {
  let el = document.getElementById(`product-${index + 1}`)

  if (!el) {
    addNewItem()

    await nextTick();
    focusWhenAvailable(`product-${index + 1}`);
    
    // nextTick(() => {
    //   el = document.getElementById(`product-${index + 1}`)
    //   el.focus();
    // })
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

function handleProductSelect(selectedId, index) {
  const isAlreadySelected = items.value.some((i, iIndex) => i.product === selectedId && iIndex !== index);
  if (!isAlreadySelected) {
    items.value[index].product = selectedId;
  } else {
    snackComponent.value.newSnack("Produto já selecionado!", true)  
  }
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