<template>
  <div id="chart">
    <apexchart 
      ref="chartRef"
      :type="props.type" 
      height="350" 
      :options="mergedChartOptions" 
      :series="props.data"
    ></apexchart>
  </div>
</template>

<script setup>
import merge from 'lodash.merge'

const props = defineProps({
  type: {
    type: String,
    default: 'bar',
    validator: (value) => ['bar', 'line', 'heatmap'].includes(value)
  },
  categories: {
    type: Array
  },
  data: {
    type: Array
  },
  chartOptions: {
    type: Object
  }
})

const chartRef = ref()

const chartOptions = ref({
  chart: {
    "foreColor": "#fff",
    height: 350,
    type: props?.type ?? '',
    zoom: {
      enabled: false
    }
  },
  theme: {
    mode: "dark"
  },
  stroke: {
    curve: 'straight'
  },
  grid: {
    row: {
      colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
      opacity: 0.5
    },
  },
  xaxis: {
    categories: props.categories,
  },
  plotOptions: {
    bar: {
      borderRadius: 10,
      dataLabels: {
        position: 'center',
      },
    }
  },
  dataLabels: {
    enabled: true,
    style: {
      fontSize: '12px',
    }
  },
  yaxis: {
    axisBorder: {
      show: true
    },
    axisTicks: {
      show: true,
    },
    labels: {
      show: true,
    }
  }
})

const mergedChartOptions = computed(() => {
  return merge(JSON.parse(JSON.stringify(chartOptions.value)), props.chartOptions)
})

watch(() => props.data, (newVal) => {
  if (chartRef.value) {
    chartRef.value.updateSeries(newVal)
  }
})

watch(() => props.categories, (newVal) => {
  if (chartRef.value) {
    chartRef.value.updateOptions({
      xaxis: {
        categories: newVal
      }
    })
  }
})
</script>