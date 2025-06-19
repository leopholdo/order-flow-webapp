<template>
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
        hide-details auto-select-first
        class="my-2"
        density="comfortable"
        autocomplete="off"
        label="Produto"
        variant="solo-filled"
        item-title="name"
        item-value="id"
        :disabled="props.isLoading.product"
        :loading="props.isLoading.product"
        :id="`product-${index}`" 
        :items="props.availableProducts"                 
        :model-value="item.product"
        @update:modelValue="val => handleProductSelect(val, index)">
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

  <v-row class="px-4 mt-1">
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
</template>

<script setup>
import { useDisplay } from 'vuetify'

const { smAndDown } = useDisplay()

const props = defineProps({
  isLoading: {
    type: Object,
    default: null
  },
  availableProducts: {
    type: Object,
    default: null
  }
})
const items = defineModel('items')

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

const selectedProductIds = computed(() =>
  items.value.map(i => i.product).filter(Boolean)
);

const enableDeleteItemBtn = computed(() => {
  return items.value.length > 1
})

function removeItem(index) {
  items.value.splice(index, 1);
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

function handleProductSelect(selectedId, index) {
  const isAlreadySelected = items.value.some((i, iIndex) => i.product === selectedId && iIndex !== index);
  if (!isAlreadySelected) {
    items.value[index].product = selectedId;
  } 
}

async function handleTab(index) {
  let el = document.getElementById(`product-${index + 1}`)

  if (!el) {
    addNewItem()

    await nextTick();
    focusWhenAvailable(`product-${index + 1}`);
  } else {
    el.focus();
  }
}

onMounted(() => {
  if(!items.value.length) {
    items.value.push({
      product: null,
      qtd: 1
    })
  }
})
</script>