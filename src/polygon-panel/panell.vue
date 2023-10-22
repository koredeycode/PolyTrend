<template>
  <div class="chartcontainer">
    <div v-if="isLoading" class="is-loading">Loading ...</div>
    <div v-else-if="errorMessage" class="error">{{ errorMessage }}</div>
    <div v-else class="chartdiv">
      <div class="btndiv">
        <div>
          <h3>{{ this.ticker }}</h3>
          <h4>{{ `${this.from} to ${this.to}` }}</h4>
        </div>
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
        v-else-if="chartType === 'area'"
        type="area"
        class="chart"
        :options="areaOptions"
        :series="areaSeries"
      />
    </div>
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
          text: `Interval: ${this.multiplier} ${this.timespan}(s)`,
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
      areaOptions: {
        chart: {
          id: 'area-datetime',
          type: 'area',
          zoom: {
            autoScaleYaxis: true,
          },
        },
        title: {
          text: `Interval: ${this.multiplier} ${this.timespan}(s)`,
          align: 'left',
        },
        dataLabels: {
          enabled: false,
        },
        markers: {
          size: 0,
          style: 'hollow',
        },
        xaxis: {
          type: 'datetime',
        },
        tooltip: {
          x: {
            format: 'dd MMM yyyy',
          },
        },
        fill: {
          type: 'gradient',
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.7,
            opacityTo: 0.9,
            stops: [0, 100],
          },
        },
      },
    };
  },
  setup(props) {
    console.log('Component props:', props);
    const api = useApi();
    const series = ref([{ data: [] }]);
    const areaSeries = ref([{ data: [] }]);
    const chartType = ref('candlestick');
    const isLoading = ref(true);
    const errorMessage = ref();

    async function fetchData() {
      console.log('Fetching data with props:', props);
      isLoading.value = true;
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
        areaSeries.value[0].data = data.results.map((item) => {
          return {
            x: new Date(item.t),
            y: item.c, // Use closing price for area chart
          };
        });
      } catch (error) {
        console.log(error);
        alert(error.response.data?.message);
        errorMessage.value =
          error.response.data?.message || 'Internal Server Error';
      } finally {
        isLoading.value = false;
      }
    }
    onMounted(fetchData);

    // Watch for prop changes and refetch data when props change
    // watch(
    //   [
    //     () => props.ticker,
    //     () => props.multiplier,
    //     () => props.timespan,
    //     () => props.from,
    //     () => props.to,
    //   ],
    //   fetchData,
    // );
    watch(
      () => [
        props.ticker,
        props.multiplier,
        props.timespan,
        props.from,
        props.to,
      ],
      (newValues, oldValues) => {
        console.log('Props changed:', newValues, oldValues);
        fetchData(); // Try fetching data whenever props change
      },
    );

    function toggleChartType() {
      // Toggle between 'candlestick' and 'area' chart types
      chartType.value =
        chartType.value === 'candlestick' ? 'area' : 'candlestick';
    }

    return {
      series,
      areaSeries,
      toggleChartType,
      chartType,
      isLoading,
      errorMessage,
    };
  },
};
</script>

<style scoped>
.chartcontainer {
  padding: 3px;
  height: 100%;
  width: 100%;

  overflow: scroll;
}

.chartdiv {
  width: 100%;

  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 1rem;
}

.btndiv {
  margin: 1rem;
  width: 100%;

  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  --v-button-color: var(--foreground-normal);
  --v-button-color-hover: var(--foreground-normal);
  --v-button-color-active: var(--foreground-normal);
  --v-button-background-color: var(--border-subdued);
  --v-button-background-color-hover: var(--background-normal-alt);
  --v-button-background-color-active: var(--background-normal-alt);
}

.btndiv h3 {
  /* color: var(--v-button-color); */
  color: var(--brand);
  font-weight: bold;
  font-size: x-large;

  margin-bottom: 0.25rem;
}
.btndiv h4 {
  color: var(--v-button-color);
}

.btndiv button {
  position: relative;
  display: flex;
  align-items: center;
  width: var(--v-button-width);
  min-width: var(--v-button-min-width);
  height: var(--v-button-height);
  padding: 0 19px;
  color: var(--v-button-color);
  font-weight: var(--v-button-font-weight);
  font-size: var(--v-button-font-size);
  line-height: var(--v-button-line-height);
  text-decoration: none;
  background-color: var(--v-button-background-color);
  border: var(--border-width) solid var(--v-button-background-color);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: var(--fast) var(--transition);
}

.chart {
  width: 100%;
}

.is-loading,
.error {
  width: 100%;
  height: 100%;

  position: absolute;
  left: 50%;
  top: 50%;
}
</style>
