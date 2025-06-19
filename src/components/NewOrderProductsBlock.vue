<template>
  <v-row>
    <v-col 
      cols="6" sm="3"
      v-for="item in products"
      :key="item.id">
      <v-card
        class="product-card"
        :class="{'selected': item.qtd > 0}"
        height="90px"
        @click="addItem(item)">
        <div
          style="height: 5px;"
          :style="{'background-color': item.color}"
        ></div>
        <v-card-text class="h-100 pa-2">
          <div class="d-flex flex-column h-100">
            <h3 class="text-center break-words" style="font-size: 1rem; line-height: 1rem;">
              {{ item.name }}
            </h3>

            <div class="d-flex align-center justify-center mt-auto">
              <v-icon-btn
                variant="text"
                color="error"
                icon="mdi-minus"
                @click.stop="removeItem(item)"
              ></v-icon-btn>
              <h2>
                {{ item.qtd }}
              </h2>
              <v-icon-btn
                variant="text"
                color="success"
                icon="mdi-plus"
              ></v-icon-btn>
            </div>
          </div>
        </v-card-text>
      </v-card> 
    </v-col>
  </v-row> 
</template>

<script setup>
const props = defineProps({
  availableProducts: {
    type: Object,
    default: null
  }
})
const items = defineModel('items')

const products = computed(() => {
  return props.availableProducts.map(p => {
    p.qtd = 0
    return p
  })
})

function addItem(item) {
  item.qtd++
  const itemProduct = items.value.find(p => p.product === item.id)
  if(itemProduct) {
    itemProduct.qtd++;
  } 
  else {
    items.value.push({
      product: item.id,
      qtd: 1
    })
  }
}

function removeItem(item) {
  if(item.qtd <= 0) return;

  item.qtd--;

  const index = items.value.findIndex(p => p.product === item.id)
  if(items.value[index].qtd > 1) {
    items.value[index].qtd--;
  } 
  else {
    items.value.splice(index, 1);
  }
}

function onClear() {
  products.value.forEach(p => {
    p.qtd = 0
  });
}

onMounted(() => {
  items.value = items.value.filter(i => i.product)

  nextTick(() => {
    if(items.value.length > 0) {
      items.value.forEach(el => {
        products.value.find(p => p.id === el.product).qtd = el.qtd
      });
    }
  })
})

defineExpose({
  onClear
})
</script>

<style scoped>
:deep(.v-data-table-headers--mobile) {
  display: none !important;
}

.selected {
  box-shadow: 0 0 5px 3px rgba(76, 175, 80, 0.4) !important;
}

.break-words {
  hyphens: auto;
  word-break: break-word;
  overflow-wrap: break-word;
}
</style>