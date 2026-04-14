<template>
  <Loading v-if="isLoading" />
  <Error v-else-if="isError" :error="error" />
  <template v-else>
    <div
      class="bg-white mt-3 py-2 px-3 w-full rounded shadow flex justify-between items-center"
    >
      <div class="text-lg font-semibold">Grafiki hasabat</div>
      <div class="flex flex-wrap gap-3">
        <a-select v-model:value="range" style="width: 140px">
          <a-select-option value="all">Şu wagta çenli</a-select-option>
          <a-select-option value="week">Hepdelik</a-select-option>
          <a-select-option value="month">Aýlyk</a-select-option>
          <a-select-option value="3month">3 aýlyk</a-select-option>
          <a-select-option value="year">Ýyllyk</a-select-option>
        </a-select>

        <a-button type="primary" @click="isModalOpen = true">
          + Grafiki seljerme döret
        </a-button>
      </div>
    </div>
    <div class="mt-3 w-full rounded shadow flex justify-between items-center">
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 w-full">
        <div
          v-for="chart in charts"
          :key="chart.id"
          class="relative group bg-white rounded-xl shadow p-3 hover:shadow-lg transition flex flex-col"
        >
          <!-- DELETE -->
          <button
            class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition bg-red-500 text-white px-2 py-1 text-xs rounded"
            @click="handleDelete(chart.id)"
          >
            Delete
          </button>

          <!-- TITLE -->
          <div class="font-medium mb-2 truncate">
            {{ chart.name }}
          </div>

          <!-- CHART -->
          <div class="h-64 overflow-hidden">
            <VChart
              :option="buildOption(chart)"
              autoresize
              class="w-full h-full"
            />
          </div>
        </div>
      </div>
    </div>
  </template>
  <div class="p-4 space-y-4">
    <!-- HEADER -->

    <!-- GRID -->

    <!-- MODAL -->
    <a-modal
      v-model:open="isModalOpen"
      title="Grafiki seljerme döret"
      @ok="handleCreate"
      :confirm-loading="isCreating"
    >
      <a-form layout="vertical">
        <!-- NAME -->
        <a-form-item label="Seljermäniň ady">
          <a-input v-model:value="form.name" />
        </a-form-item>

        <!-- TYPE -->
        <a-form-item label="Type">
          <a-select v-model:value="form.type">
            <a-select-option value="bar">Diagramma(bar)</a-select-option>
            <a-select-option value="line">Çyzykly(line)</a-select-option>
            <a-select-option value="pie">Bölekli(pie)</a-select-option>
          </a-select>
        </a-form-item>

        <!-- X AXIS / CATEGORY -->
        <a-form-item label="Kategoriya / X oky">
          <a-select v-model:value="form.xFieldId" show-search>
            <a-select-option v-for="f in fields" :key="f.id" :value="f.id">
              {{ f.name }} ({{ f.type }})
            </a-select-option>
          </a-select>
        </a-form-item>

        <!-- Y AXIS -->
        <a-form-item v-if="form.type !== 'pie'" label="Y Oky ">
          <a-select v-model:value="form.yFieldId" show-search>
            <a-select-option
              v-for="f in fields.filter(
                (f) => f.type === 'number' || f.type === 'date'
              )"
              :key="f.id"
              :value="f.id"
            >
              {{ f.name }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <!-- AGGREGATION -->
        <a-form-item label="Amal">
          <a-select v-model:value="form.aggregation">
            <a-select-option value="count">Mukdary(count)</a-select-option>
            <a-select-option value="sum">Jemi(sum)</a-select-option>
            <a-select-option value="avg">Ortaça baha(avg)</a-select-option>
            <a-select-option value="min">Minimum(min)</a-select-option>
            <a-select-option value="max">Maksimum(max)</a-select-option>
          </a-select>
        </a-form-item>

        <!-- SERIES -->
        <a-form-item label="Maglumat sütüni(series)" v-if="form.type === 'pie'">
          <a-select v-model:value="form.seriesFieldId" allow-clear show-search>
            <a-select-option v-for="f in fields" :key="f.id" :value="f.id">
              {{ f.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
// =====================
// ECHARTS (YOUR STYLE)
// =====================
import VChart from 'vue-echarts';
import * as echarts from 'echarts';
import dayjs from 'dayjs';
import chroma from 'chroma-js';

import { LineChart, BarChart, PieChart } from 'echarts/charts';

import {
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components';

import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  LineChart,
  BarChart,
  PieChart,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  CanvasRenderer,
]);

// =====================
// VUE + QUERY
// =====================
import { ref, computed, watch } from 'vue';
import { useGetCharts, useDeleteChart, useCreateChart } from './useCharts';
import { useGetFields } from '../Fields/useFields';
import Error from '../../components/Error.vue';
import Loading from '../../components/Loading.vue';

// =====================
// STATE
// =====================
const range = ref('all');
const isModalOpen = ref(false);

const queryKey = computed(() => ({
  range: range.value,
}));

const { data: fieldsData } = useGetFields();
const fields = computed(() => fieldsData.value?.data || []);

const { data, isLoading, isError, error } = useGetCharts(queryKey);
const charts = computed(() => data.value?.data || []);

// =====================
// CREATE
// =====================
const { mutate: createChart, isPending: isCreating } = useCreateChart();

const form = ref({
  name: '',
  type: 'bar',

  xFieldId: null,
  yFieldId: null,
  seriesFieldId: null,

  aggregation: 'count',
});
watch(
  () => isModalOpen.value,
  () =>
    (form.value = {
      name: '',
      type: 'bar',

      xFieldId: null,
      yFieldId: null,
      seriesFieldId: null,

      aggregation: 'count',
    })
);
const handleCreate = () => {
  if (!form.value.name || !form.value.xFieldId) return;

  if (form.value.type !== 'pie' && !form.value.yFieldId) {
    return; // ❗ you can show toast here
  }

  const axes = [];

  // X
  axes.push({
    fieldId: form.value.xFieldId,
    axisType: form.value.type === 'pie' ? 'category' : 'x',
  });

  // Y / VALUE
  if (form.value.type === 'pie') {
    axes.push({
      fieldId: form.value.xFieldId,
      axisType: 'value',
      aggregation: form.value.aggregation,
    });
  } else {
    axes.push({
      fieldId: form.value.yFieldId,
      axisType: 'y',
      aggregation: form.value.aggregation,
    });
  }

  // SERIES (only for bar/line)
  if (form.value.type !== 'pie' && form.value.seriesFieldId) {
    axes.push({
      fieldId: form.value.seriesFieldId,
      axisType: 'series',
    });
  }

  createChart({
    name: form.value.name,
    type: form.value.type,
    axes,
  });

  isModalOpen.value = false;

  form.value = {
    name: '',
    type: 'bar',
    xFieldId: null,
    yFieldId: null,
    seriesFieldId: null,
    aggregation: 'count',
  };
};

const { mutate: deleteChart } = useDeleteChart();

const handleDelete = (id) => {
  deleteChart(id);
};

const generateColors = (count) => {
  return chroma
    .scale(['#1677ff', '#52c41a', '#fa8c16', '#f5222d'])
    .mode('lch')
    .colors(count);
};

const buildOption = (chart) => {
  const data = chart.data;

  if (!data?.xAxis?.length) return {};

  const colors = generateColors(data.xAxis.length);

  // PIE
  if (chart.type === 'pie') {
    return {
      tooltip: { trigger: 'item' },
      legend: { bottom: 0 },
      series: [
        {
          type: 'pie',
          radius: '60%',
          data: data.xAxis.map((x, i) => ({
            name: x,
            value: data.series[0]?.data[i] || 0,
            itemStyle: { color: colors[i] },
          })),
        },
      ],
    };
  }

  // DATE FORMAT
  const isDate = data.xAxis[0] && dayjs(data.xAxis[0]).isValid();

  const formattedXAxis = isDate
    ? data.xAxis.map((d) => dayjs(d).format('DD MMM'))
    : data.xAxis;

  return {
    tooltip: { trigger: 'axis' },
    legend: { top: 0 },

    grid: {
      left: '3%',
      right: '3%',
      bottom: '5%',
      containLabel: true,
    },

    xAxis: {
      type: 'category',
      data: formattedXAxis,
    },

    yAxis: {
      type: 'value',
    },

    series: data.series.map((s, idx) => ({
      ...s,
      smooth: chart.type === 'line',
      itemStyle: {
        color: colors[idx % colors.length],
      },
    })),
  };
};
</script>
<!-- {
  "name": "Cargo Type Distribution",
  "type": "pie",
  "axes": [
    { "fieldId": 5, "axisType": "category" },
    { "fieldId": 5, "axisType": "value", "aggregation": "count" }
  ]
} -->

<!-- {
  "name": "Revenue by Date",
  "type": "line",
  "axes": [
    { "fieldId": 8, "axisType": "x" },
    { "fieldId": 4, "axisType": "y", "aggregation": "sum" }
  ]
} -->

<!-- {
  "name": "Revenue by Priority",
  "type": "bar",
  "axes": [
    { "fieldId": 13, "axisType": "x" },
    { "fieldId": 4, "axisType": "y", "aggregation": "sum" }
  ]
} -->
