<template>
  <v-container max-width="900">
    <v-card>
      <v-form ref="form" @submit.prevent="id != null ? updateProduct() : createProduct()">
        <v-card-title>
          Produtos
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text>
          <v-row>
            <v-col cols="12" sm="5">
              <v-text-field 
                id="name-field"
                hide-details="auto"          
                label="Nome" 
                variant="solo-filled" 
                autocomplete="off"
                :rules="[rules.required]"
                v-model="name"
              ></v-text-field>
            </v-col>

            <v-col cols="12" sm="3">
              <v-text-field   
                hide-details="auto"          
                label="Valor" 
                prefix="R$"
                type="number" min="1" step="any"
                variant="solo-filled" 
                autocomplete="off"
                :rules="[rules.required]"
                v-model="price"
              ></v-text-field>
            </v-col>

            <v-col cols="12" sm="3" v-if="id != null">
              <v-switch 
                hide-details
                color="success" 
                :label="`Status: ${isActive ? 'Ativo' : 'Inativo'}`" 
                v-model="isActive" 
              ></v-switch>
            </v-col>

            <v-col cols="12" sm="3">
              <v-color-input 
                show-swatches
                autocomplete="off"
                label="Cor de destaque" 
                variant="solo-filled"
                :rules="[rules.isValidColor]"
                v-model="color">
                <template v-slot:append-inner>
                  <v-icon :color="color">
                    mdi-palette
                  </v-icon>
                </template>
              </v-color-input>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="px-4 pb-4"> 
          <v-row dense>
            <v-col v-if="id != null" cols="12" sm="2">
              <v-btn 
                width="100%"
                color="error" 
                variant="tonal"
                @click="clearForm">
                Cancelar
              </v-btn>
            </v-col>
            <v-col v-if="id != null" cols="12" sm="2">
              <v-btn 
                width="100%"
                color="primary" 
                variant="tonal"
                type="submit"
                :loading="isLoading.btnUpdate">
                Alterar
              </v-btn>
            </v-col>
            <v-col v-else cols="12" sm="2">
              <v-btn 
                width="100%"
                color="success" 
                variant="tonal"
                type="submit"
                :loading="isLoading.btnSubmit">
                Salvar
              </v-btn>
            </v-col>
          </v-row>
        </v-card-actions>
      </v-form>
    </v-card>

    <v-card class="mt-7">
      <v-card-text>
        <v-skeleton-loader
          v-if="isLoading.list"
          type="heading, list-item, list-item, list-item"
        ></v-skeleton-loader>

        <v-data-table-virtual
          v-else
          :headers="productListHeaders"
          :items="productList" 
          hide-default-footer>
          <template v-slot:item.name="{ item }">
            <div class="d-flex h-100 align-center">
              <div 
                class="item-color-border"
                :style="{'background-color': item.color}">
              </div>
              {{ item.name }}
            </div>
          </template>

          <template v-slot:item.price="{ item }">
            {{ toBrlCurrency(item.price) }}
          </template>

          <template v-slot:item.isActive="{ item }">
            {{ item.isActive ? 'Ativo' : 'Inativo' }}
          </template>

          <template v-slot:item.action="{ item }">
            <v-icon-btn 
              v-if="id == null"
              title="Editar"
              icon="mdi-pencil" 
              variant="text"
              @click="editProduct(item)"
            ></v-icon-btn>
          </template>
        </v-data-table-virtual>
      </v-card-text>
    </v-card>

    <Snack
      ref="snackComponent"
    ></Snack>
  </v-container>
</template>

<script setup>
import { useProductStore } from '@/stores/product'
import Snack from '@/components/Snack.vue';

const productStore = useProductStore();

const form = ref()
const snackComponent = ref()

const id = ref()
const name = ref('')
const price = ref()
const color = ref()
const isActive = ref()
const productList = ref([])

const productListHeaders = [
  {
    align: 'start',
    key: 'name',
    title: 'Nome',
  },
  {
    align: 'start',
    key: 'price',
    title: 'Valor',
  },
  {
    align: 'start',
    key: 'isActive',
    title: 'Status',
  },
  {
    align: 'start',
    key: 'action',
    sortable: false,
    title: '',
  },
]
const isLoading = ref({
  list: true,
  btnSubmit: false,
  btnUpdate: false
})

const rules = {
  required(value) {
    if(value) return true
    return 'Campo obrigatório'
  },
  isValidColor(value) {
    const s = new Option().style;
    s.color = value;
    return (s.color !== '' || !value) ? true : 'Cor inválida';
  }
}

function toBrlCurrency(value) {
  const formatBRL = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });

  return formatBRL.format(value);
}

async function getProducts() {
  return await productStore.getProducts()
  .then((response) => {
    productList.value = response;
  }).catch(error => {
    snackComponent.value.newSnack(error.toString(), true)  
  })
}

function clearForm() {
  id.value = null
  form.value.reset();
}

function editProduct(product) {
  id.value = product.id,
  name.value = product.name,
  price.value = product.price,
  color.value = product.color,
  isActive.value = product.isActive

  document.getElementById('name-field').focus()
}

async function updateProduct() {
  const { valid } = await form.value.validate();
  if(!valid) return;

  isLoading.value.btnUpdate = true;
  
  productStore.updateProduct({
    id: id.value,
    name: name.value,
    price: price.value,
    color: color.value,
    isActive: isActive.value
  }).then(async () => {
    await getProducts();

    clearForm();

    snackComponent.value.newSnack('Produto alterado com sucesso!', false)

  }).catch(error => {
    snackComponent.value.newSnack(error.toString(), true)

  }).finally(() => {
    isLoading.value.btnUpdate = false;
  })
}

async function createProduct() {
  const { valid } = await form.value.validate();
  if(!valid) return;

  isLoading.value.btnSubmit = true;
  
  productStore.createProduct({
    name: name.value,
    price: price.value,
    color: color.value
  }).then(async () => {
    await getProducts();
    
    clearForm();
    
    snackComponent.value.newSnack('Produto criado com sucesso!', false)

  }).catch(error => {
    snackComponent.value.newSnack(error.toString(), true)

  }).finally(() => {
    isLoading.value.btnSubmit = false;
  })
}

onMounted(async () => {
  isLoading.value.list = true;
  await getProducts()
  isLoading.value.list = false;
})
</script>

<style scoped>
.item-color-border {
  height:60%; 
  width: 4px;
  padding: 0px !important;
  margin-left: -8px;
  margin-right: 5px;
  border-radius: 5px;
}

:deep(.v-color-input) {
  .v-input__prepend {
    display: none !important;
  }
}
</style>