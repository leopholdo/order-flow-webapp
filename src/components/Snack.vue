<template>
  <v-snackbar 
    @update:modelValue="onCloseSnack"
    color="#4c5255"
    :timeout="activeSnack.timeout"
    :timer="activeSnack.error ? 'warning' : 'success'"
    :text="activeSnack.message"
    v-model="activeSnack.show">
    <template v-slot:actions>
      <v-icon-btn 
        icon="mdi-close" 
        variant="text"
        @click="onCloseSnack"
      ></v-icon-btn>
    </template>
  </v-snackbar>
</template>

<script setup>
const snackList = ref([]);
const activeSnack = ref({
  show: false,
  error: false,
  timeout: '2000',
  message: '',
})

function newSnack(message, error = false, timeout = '2000') {
  const snack = {
    show: true,
    error: error,
    timeout: timeout,
    message: message
  }

  snackList.value.push(snack)

  if(snackList.value.length === 1) {
    activeSnack.value = snack
  } 
}

function onCloseSnack() {
  snackList.value.shift()
  activeSnack.value.show = false 

  if(snackList.value.length > 0) {
    nextTick(() => {
      activeSnack.value = snackList.value[0]
    })
  }
}

defineExpose({
  newSnack
})
</script>