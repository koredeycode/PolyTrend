<template>
  <div class="chartcontainer">
    <div class="btndiv">
      <button @click="toggleChartType">Switch from {{ chartType }}</button>
    </div>

    <apexchart
      v-if="chartType === 'candlestick'"
      type="candlestick"
      class="chart"
      :options="options"
      :series="series"
    />
    <apexchart
      v-else-if="chartType === 'line'"
      type="line"
      class="chart"
      :options="options"
      :series="lineSeries"
    />
  </div>
</template>

<script>
import { useApi } from '@directus/extensions-sdk';
import { ref, onMounted, watch } from 'vue';
import VueApexCharts from 'vue3-apexcharts';

// Get current date in the format YYYY-MM-DD
function getCurrentDate() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const day = String(currentDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Get the date of one week ago in the format YYYY-MM-DD
function getOneWeekAgo() {
  const currentDate = new Date();
  const oneWeekAgo = new Date(currentDate - 7 * 24 * 60 * 60 * 1000); // 7 days * 24 hours * 60 minutes * 60 seconds * 1000 milliseconds
  const year = oneWeekAgo.getFullYear();
  const month = String(oneWeekAgo.getMonth() + 1).padStart(2, '0');
  const day = String(oneWeekAgo.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default {
  components: {
    apexchart: VueApexCharts,
  },
  props: {
    showHeader: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      default: 'crypto',
    },
    ticker: {
      type: String,
      default: 'BTCUSD',
    },
    multiplier: {
      type: String,
      default: '30',
    },
    timespan: {
      type: String,
      default: 'minute',
    },
    from: {
      type: String,
      default: getOneWeekAgo(),
    },
    to: {
      type: String,
      default: getCurrentDate(),
    },
  },
  data() {
    return {
      options: {
        chart: {
          animations: {
            enabled: true,
            easing: 'easeinout',
            speed: 500, // Animation duration in milliseconds
          },
        },
        title: {
          text: this.ticker,
          align: 'left',
        },

        xaxis: {
          type: 'datetime',
        },
        yaxis: {
          tooltip: {
            enabled: true,
          },
        },
      },
    };
  },
  setup(props) {
    console.log(props);
    const api = useApi();
    const series = ref([{ data: [] }]);
    const lineSeries = ref([{ data: [] }]);
    const chartType = ref('candlestick');

    async function fetchData() {
      try {
        const { data } = await api.post('/polygon-endpoint', {
          type: props.type,
          ticker: props.ticker,
          multiplier: props.multiplier,
          timespan: props.timespan,
          from: props.from,
          to: props.to,
        });
        console.log(data);

        series.value[0].data = data.results.map((item) => {
          return {
            x: new Date(item.t),
            y: [item.o, item.h, item.l, item.c],
          };
        });
        lineSeries.value[0].data = data.results.map((item) => {
          return {
            x: new Date(item.t),
            y: item.c, // Use closing price for line chart
          };
        });
      } catch (error) {
        console.log(error);
        alert(error.response.data.message);
      }
    }
    onMounted(fetchData);

    // Watch for prop changes and refetch data when props change
    watch(
      [
        () => props.ticker,
        () => props.multiplier,
        () => props.timespan,
        () => props.from,
        () => props.to,
      ],
      fetchData,
    );
    function toggleChartType() {
      // Toggle between 'candlestick' and 'line' chart types
      chartType.value =
        chartType.value === 'candlestick' ? 'line' : 'candlestick';
    }

    return { series, lineSeries, toggleChartType, chartType };
  },
};
</script>

<style scoped>
.chartcontainer {
  padding: 0px;
  height: 100%;
  width: 100%;

  display: flex;
  flex-direction: row;
  flex-wrap: wrap;

  overflow: scroll;
}

.btndiv {
  width: 100%;

  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.btndiv button {
  background-color: var(--primary);
  padding: 7px;
  border-radius: 50px;
  color: white;
  text-transform: uppercase;
  font-size: 14px;
  font-weight: 600;
  margin: auto;
}

.chart {
  width: 100%;
}
</style>
