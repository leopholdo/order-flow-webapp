<template>
  <v-container>
    <v-row>
      <v-col cols="6">
        <p style="font-size: 2rem;">
          Dashboard
        </p>
        <div class="d-flex align-center ga-1">
          <span style="font-size: 0.9rem; line-height: 1.5rem;">
            {{ dateRange.start?.toLocaleDateString() }} - {{ dateRange.end?.toLocaleDateString() }}
          </span>

          <v-menu
            v-model="showDateModal"
            :close-on-content-click="false"
            location="end">
            <template v-slot:activator="{ props }">
              <v-icon-btn 
                :rotate="showDateModal ? 180 : 0"
                size="small"
                variant="text"
                icon="mdi-chevron-down"
                v-bind="props">
              </v-icon-btn>
            </template>

            <v-form ref="formDate" @submit.prevent="changeReportDate">
              <v-card min-width="200px">
                <v-card-title>
                  Período
                </v-card-title>

                <v-card-text>
                  <v-row>
                    <v-col cols="12">
                      <v-date-input
                        prepend-icon=""
                        prepend-inner-icon="mdi-calendar"
                        hide-details="auto"
                        density="comfortable"
                        label="Data inicial" 
                        variant="solo-filled" 
                        autocomplete="off"
                        :rules="[rules.required]"
                        v-model="dateRange.start"
                      ></v-date-input>
                    </v-col>

                    <v-col cols="12">
                      <v-date-input
                        prepend-icon=""
                        prepend-inner-icon="mdi-calendar"
                        hide-details="auto"
                        density="comfortable"
                        label="Data final" 
                        variant="solo-filled" 
                        autocomplete="off"
                        :rules="[rules.required]"
                        v-model="dateRange.end"
                      ></v-date-input>
                    </v-col>
                  </v-row>
                </v-card-text>
                <v-card-actions>
                  <v-btn 
                    block
                    color="success" 
                    variant="tonal"
                    type="submit"
                    :loading="isLoading.filterBtn">
                    Filtrar
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-form>
          </v-menu>
        </div>
      </v-col>
      <v-col cols="6">
        <v-row>
          <v-slide-x-transition group>
            <v-col cols="12" sm="6" v-if="totalQtd">
              <v-card title="Pedidos">
                <v-card-text class="text-h6 text-end">
                  {{ totalQtd }}
                </v-card-text>
              </v-card>
            </v-col>
          
            <v-col cols="12" sm="6" v-if="totalRevenue">
              <v-card title="Faturamento">
                <v-card-text class="text-h6 text-end">
                  {{ 
                    new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(totalRevenue) 
                  }}
                </v-card-text>
              </v-card>
            </v-col>
          </v-slide-x-transition>
        </v-row>
      </v-col>
    </v-row>

    <v-row v-if="isLoading.cards">
      <v-col cols="12" md="6" v-for="i in 4">
        <v-skeleton-loader type="subtitle, card"></v-skeleton-loader>
      </v-col>
    </v-row>
    <v-slide-x-transition group>
      <v-row v-if="!isLoading.cards">
        <v-col cols="12" md="6" key="1">
          <v-card title="Renda total por dia">
            <Charts
              v-if="revenueByDay"
              type="bar"
              :key="2"
              :chartOptions="revenueByDayChartOptions"
              :data="revenueByDay.data"
              :categories="revenueByDay.categories"
            ></Charts>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" key="2">
          <v-card title="Renda total por produto">
            <Charts
              v-if="revenueByProduct"
              :key="1"
              type="bar"
              :chartOptions="revenueByProductChartOptions"
              :data="revenueByProduct.data"
              :categories="revenueByProduct.categories"
            ></Charts>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" key="2">
          <v-card title="Pedidos por hora">
            <Charts
              v-if="ordersByHour"
              :key="3"
              type="heatmap"
              :chartOptions="ordersByHourOptions"
              :categories="ordersByHour.categories"
              :data="ordersByHour.data"
            ></Charts>
          </v-card>
        </v-col>
      </v-row>
    </v-slide-x-transition>
  </v-container>
</template>

<script setup>
import { useReportStore } from '@/stores/report';
import merge from 'lodash.merge'
import Charts from '@/components/Charts.vue'

const reportStore = useReportStore();

const isLoading = ref({
  filterBtn: false,
  cards: true
})

const formDate = ref()
const showDateModal = ref(false)
const dateRange = ref({
  start: null,
  end: null
})

const totalQtd = ref()
const totalRevenue = ref()
const revenueByDay = ref()
const revenueByProduct = ref()
const ordersByHour = ref()

const rules = {
  required(value) {
    if(value) return true
    return 'Campo obrigatório'
  }
}

const revenueByDayChartOptions = {
  dataLabels: {
    formatter: function (val) {
      return 'R$' + val;
    }
  },
  yaxis: {
    labels: {
      show: true,
      formatter: function (val) {
        return 'R$' + val;
      }
    }
  }
}

const ordersByHourOptions = {
  plotOptions: {
    heatmap: {
      colorScale: {
        ranges: [
          { from: 0, to: 0, name: 'Nulo', color: '#343a3f' },
          { from: 1, to: 2, name: 'Baixo', color: '#a5d6a7' },
          { from: 3, to: 8, name: 'Médio', color: '#66bb6a' },
          { from: 9, to: 20, name: 'Alto', color: '#2e7d32' }
        ]
      }
    }
    // heatmap: {
    //   distributed: true,
    // }
  },
  theme: {
    palette: 'palette1'
  },
  xaxis: {
    title: { text: 'Hora' }    
  },
  yaxis: {
    title: { text: 'Data' }
  },
  tooltip: {
    y: {
      formatter: (val) => `Pedidos: ${val}`
    }
  }
}

const revenueByProductChartOptions = merge(
  JSON.parse(JSON.stringify(revenueByDayChartOptions)),
  {
    tooltip: {
      custom: function ({ series, seriesIndex, dataPointIndex, w }) {
        const data = w.config.series[seriesIndex].data[dataPointIndex];
        return `
          <div style="padding:8px;">
            <strong>${data.x}</strong><br/>
            Total: R$${data.y}<br/>
            Quantidade: ${data.qtd}
          </div>
        `;
      }
    }
  }
)

async function changeReportDate() {
  const { valid } = await formDate.value.validate();
  if(!valid) return;

  isLoading.value.filterBtn = true;

  await getReports();

  isLoading.value.filterBtn = false;
  showDateModal.value = false
}

async function getReports() {
  isLoading.value.cards = true;

  const reports = await reportStore.getReports(
    dateRange.value.start.toISOString().split('T')[0], 
    dateRange.value.end.toISOString().split('T')[0]
  )

  totalQtd.value = reports.ordersAndRevenueByRangeDto.orders
  totalRevenue.value = reports.ordersAndRevenueByRangeDto.total

  revenueByDay.value = {
    categories: reports.revenueByDay.map(r => new Date(r.date).toLocaleDateString('pt-BR')),
    data: [{
      name: 'Total',
      data: reports.revenueByDay.map(x => x.totalRevenue)
    }]
  }

  revenueByProduct.value = {
    categories: reports.productSales.map(r => r.product),
    data: [
      {
        name: "Total",
        data: reports.productSales.map(item => ({
          x: item.product,
          y: item.total,
          qtd: item.qtd
        }))
      }
    ]
  }  

  let categories = Array.from(
    new Set(reports.ordersByHour.map(item => `${item.hour}h`))
  ).sort((a, b) => parseInt(a) - parseInt(b))

  // Orders by hour
  const groupedByDate = {}
reports.ordersByHour.forEach(item => {
  const formattedDate = new Date(item.date).toLocaleDateString()
  if (!groupedByDate[formattedDate]) {
    groupedByDate[formattedDate] = {}
  }

  // Store y value using hour as key for fast lookup
  groupedByDate[formattedDate][`${item.hour}h`] = item.orderCount
})



  let data = Object.entries(groupedByDate).map(([date, hourMap]) => ({
    name: date,
    data: categories.map(hour => ({
      x: hour,
      y: hourMap[hour] ?? 0
    }))
  }))

  ordersByHour.value = {
    categories,
    data
  }

  console.log(ordersByHour.value);

  isLoading.value.cards = false;
}

onMounted(() => {
  const now = new Date();

  const oneMonthAgo = new Date(now);
  oneMonthAgo.setMonth(now.getMonth() - 1);

  dateRange.value.end = now;
  dateRange.value.start = oneMonthAgo;

  nextTick(() => {
    getReports();
  })
})
</script>

<style>
.loader {
  border: 16px solid #f3f3f3; /* Light grey */
  border-top: 16px solid #3498db; /* Blue */
  border-radius: 50%;
  width: 120px;
  height: 120px;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>