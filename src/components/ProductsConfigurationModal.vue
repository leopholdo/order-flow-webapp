<template>
  <v-dialog v-model="show" max-width="500px">
    <v-card>
      <v-card-title class="d-flex align-center">
        <div class="d-flex align-center ga-1">
          <v-icon size="small" icon="mdi-cog"></v-icon>

          <span>Configurar visibilidade</span>
        </div>
        <v-icon-btn 
          icon="mdi-close" 
          class="ml-auto" 
          @click="show = false"
        ></v-icon-btn>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text>
        <p>
          Selecione os itens que deseja exibir na área de agrupamento de produtos:
        </p>

        <v-checkbox 
          hide-details
          v-for="item in props.products"
          :key="item.id"
          :label="item.name"
          :value="item.id"
          density="comfortable"
          v-model="selectedProducts"
          @update:modelValue="onChangeSelectedProducts"
        ></v-checkbox>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>

const show = defineModel('show')
const hiddenProducts = defineModel('hiddenProducts')

const props = defineProps(['products'])

const selectedProducts = ref([])

function onChangeSelectedProducts(val) {
  hiddenProducts.value = props.products.filter(p => !val.includes(p.id)).map(p => p.id)

  nextTick(() => {
    localStorage.setItem('hiddenProducts', JSON.stringify(hiddenProducts.value))
  })
}

onMounted(() => {
  nextTick(() => {
    selectedProducts.value = props.products.filter(p => !hiddenProducts.value.includes(p.id)).map(p => p.id)
  })
})

</script>