<template>
  <Loading v-if="isLoading" />
  <Error v-else-if="isError" :error="error" />
  <template v-else>
    <div
      class="bg-white mt-3 py-2 px-3 w-full rounded shadow flex justify-between items-center"
    >
      <div class="text-lg font-semibold">Grafiki hasabat</div>
      <div class="flex flex-wrap gap-3">
        <!-- Chart Type -->
        <a-select v-model:value="chartType" style="width: 120px">
          <a-select-option value="line">Çyzykly</a-select-option>
          <a-select-option value="bar">Diagrammaly</a-select-option>
        </a-select>

        <!-- Group By -->
        <a-select v-model:value="groupBy" style="width: 140px">
          <a-select-option value="daily">Gündelik</a-select-option>
          <a-select-option value="weekly">Hepdelik</a-select-option>
          <a-select-option value="monthly">Aýlyk</a-select-option>
        </a-select>

        <!-- Refresh -->
        <a-button @click="refetch" type="primary"> Amala aşyr </a-button>
      </div>
    </div>
    <div
      class="bg-white mt-3 py-2 px-3 w-full rounded shadow flex justify-between items-center"
    >
      <v-chart
        v-if="chartOption"
        :option="chartOption"
        autoresize
        style="height: 450px"
      />
    </div>
  </template>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useQueryClient } from '@tanstack/vue-query';
import VChart from 'vue-echarts';
import * as echarts from 'echarts';
import dayjs from 'dayjs';
import chroma from 'chroma-js';

import { LineChart, BarChart } from 'echarts/charts';

import {
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components';

import { CanvasRenderer } from 'echarts/renderers';
import { useGetValuesChart } from '../Home/useValue';

import isoWeek from 'dayjs/plugin/isoWeek';
import Loading from '../../components/Loading.vue';
import Error from '../../components/Error.vue';
dayjs.extend(isoWeek);
// register echarts
echarts.use([
  LineChart,
  BarChart,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  CanvasRenderer,
]);

// =========================
// 🔧 STATE
// =========================
const chartType = ref('line');
const groupBy = ref('daily');

const queryClient = useQueryClient();

// =========================
// 📡 QUERY
// =========================
const queryKey = computed(() => ({
  chart: chartType.value,
  groupBy: groupBy.value,
}));

const query = computed(() => ['values-chart', chartType.value, groupBy.value]);

const { data, isLoading, isError, error, refetch } = useGetValuesChart(
  queryKey,
  query
);

// =========================
// 🎨 COLORS
// =========================
function generateColors(count) {
  return chroma.scale('Spectral').mode('lab').colors(count);
}

// =========================
// 📊 CHART OPTION
// =========================
function parseDateByGroup(raw, groupBy) {
  if (groupBy === 'weekly') {
    // handle ISO week or fallback
    return dayjs(raw).startOf('isoWeek');
  }

  if (groupBy === 'monthly') {
    return dayjs(raw).startOf('month');
  }

  return dayjs(raw); // daily
}
const chartOption = computed(() => {
  if (!data.value) return null;

  const labels = data.value.labels || [];
  const datasets = data.value.datasets || [];
  const colors = generateColors(datasets.length);
  const group = data.value.groupBy;

  return {
    backgroundColor: 'transparent',

    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const date = dayjs(params[0].value[0]).format(
          group === 'monthly'
            ? 'YYYY-MM'
            : group === 'weekly'
              ? '[Week] WW YYYY'
              : 'DD MMM YYYY'
        );

        let result = `${date}<br/>`;
        params.forEach((p) => {
          result += `${p.marker} ${p.seriesName}: ${p.value[1]}<br/>`;
        });
        return result;
      },
    },

    legend: {
      top: 0,
      left: 'center',
    },

    grid: {
      left: '3%',
      right: '4%',
      bottom: 70,
      containLabel: true,
    },

    // ✅ FIXED TIME AXIS
    xAxis: {
      type: 'time',
      axisLabel: {
        rotate: -45,
        formatter: (value) =>
          dayjs(value).format(
            group === 'monthly'
              ? 'YYYY-MM'
              : group === 'weekly'
                ? '[W]WW'
                : 'DD MMM'
          ),
      },
    },

    yAxis: {
      type: 'value',
      name: 'Maglumat sany',
    },

    series: datasets.map((ds, index) => ({
      name: ds.label || 'Unknown',
      type: data.value.chart === 'bar' ? 'bar' : 'line',

      // ✅ CORE FIX (time-safe)
      data: ds.data.map((val, i) => {
        const date = parseDateByGroup(labels[i], group);
        return [date.valueOf(), val];
      }),

      smooth: data.value.chart === 'line',

      itemStyle: {
        color: colors[index],
      },

      lineStyle: {
        color: colors[index],
        width: 2,
      },

      // ❌ REMOVE AREA BACKGROUND
      areaStyle: undefined,

      // optional: cleaner points
      symbol: 'circle',
      symbolSize: 6,
    })),

    dataZoom: [{ type: 'slider', start: 0, end: 100 }, { type: 'inside' }],
  };
});
// =========================
// 🔌 SOCKET LIVE UPDATE
// =========================
function refetchChart() {
  queryClient.invalidateQueries({ queryKey: query.value });
}

function onCreated() {
  refetchChart();
}
function onUpdated() {
  refetchChart();
}
function onDeleted() {
  refetchChart();
}
function onImported() {
  refetchChart();
}

onMounted(() => {
  document.title = 'Başlyk | Diagrammalar';

  window.addEventListener('table:created', onCreated);
  window.addEventListener('table:updated', onUpdated);
  window.addEventListener('table:deleted', onDeleted);
  window.addEventListener('table:bulkCreated', onImported);
});

onUnmounted(() => {
  window.removeEventListener('table:created', onCreated);
  window.removeEventListener('table:updated', onUpdated);
  window.removeEventListener('table:deleted', onDeleted);
  window.removeEventListener('table:bulkCreated', onImported);
});
</script>

<style scoped>
/* optional smooth animation */
:deep(canvas) {
  transition: all 0.3s ease;
}
</style>
