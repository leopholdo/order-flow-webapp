<template>
  <v-dialog v-model="show" max-width="500px">
    <v-card>
      <v-card-title class="d-flex align-center">
        <div class="d-flex align-center ga-1">
          <v-icon size="small" icon="mdi-cog"></v-icon>

          <span>Configuração</span>
        </div>
        <v-icon-btn 
          icon="mdi-close" 
          class="ml-auto" 
          @click="show = false"
        ></v-icon-btn>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text>
        <p class="font-weight-bold">
          Tema
        </p>
        <v-radio-group v-model="themeSelected">
          <v-radio value="light">
            <template v-slot:label>
              <div class="d-flex align-center ga-1">
                <v-icon icon="mdi-white-balance-sunny"></v-icon>
                Claro
              </div>
            </template>
          </v-radio>

          <v-radio value="dark">
            <template v-slot:label>
              <div class="d-flex align-center ga-1">
                <v-icon icon="mdi-weather-night"></v-icon>
                Escuro
              </div>
            </template>
          </v-radio>
        </v-radio-group>

        <!-- <v-divider></v-divider> -->
        <div 
          v-if="serverInfo"
          class="text-overline text-center" 
          style="font-size: 0.5rem !important;">
          {{ `${serverInfo.environment} - ${serverInfo.database} - ${serverInfo.dataSource}` }}
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { useTheme } from 'vuetify'
import { useServerStore } from '@/stores/server'

const show = defineModel('show')

const theme = useTheme()
const serverStore =  useServerStore()

const themeSelected = ref(theme.global.name.value)
const serverInfo = ref()

watch(themeSelected, (val) => {
  theme.global.name.value = val
  localStorage.setItem('theme', val)
})

onMounted(async () => {
  const savedTheme = localStorage.getItem('theme')

  if(savedTheme)
    themeSelected.value = savedTheme
  else 
    themeSelected.value = theme.global.name.value

  serverInfo.value = await serverStore.getServerInfo();
})

</script>