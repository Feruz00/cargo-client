<template>
  <Loading v-if="isLoading" />
  <Error v-else-if="isError" :error="error" />

  <template v-else>
    <div
      class="bg-white mt-3 py-2 px-3 w-full rounded shadow flex justify-between items-center"
    >
      <div class="font-medium">
        Maglumatlar

        <span v-if="data">({{ data.count }} sany)</span>
      </div>

      <div class="flex items-center gap-3">
        <a-button type="default" @click="exportToExcel">
          Export Excel
        </a-button>
        <a-upload :showUploadList="false" :customRequest="handleUpload">
          <a-button :loading="isImporting" :disabled="isImporting"
            >Import Excel</a-button
          >
        </a-upload>
        <router-link :to="{ name: 'new-info' }">
          <a-button type="primary"> + Maglumat goş </a-button>
        </router-link>
        <a-dropdown
          trigger="click"
          :open="dropdownOpen"
          @openChange="(val) => (dropdownOpen = val)"
        >
          <template #overlay>
            <div class="bg-white p-3 rounded shadow w-64" @click.stop>
              <!-- Select All -->
              <div class="mb-2">
                <a-checkbox
                  :checked="tempSelectedKeys.length === allColumns.length"
                  @change="toggleAll"
                >
                  Hemmesini saýla
                </a-checkbox>
              </div>

              <a-divider class="my-2" />

              <!-- Column list -->
              <div class="max-h-60 overflow-y-auto space-y-1">
                <div v-for="col in allColumns" :key="col.key">
                  <a-checkbox
                    :checked="tempSelectedKeys.includes(col.key)"
                    @change="(e) => toggleTemp(col.key, e.target.checked)"
                  >
                    {{ col.name }}
                  </a-checkbox>
                </div>
              </div>

              <a-divider class="my-2" />

              <!-- Actions -->
              <div class="flex justify-end gap-2">
                <a-button size="small" @click="resetColumns"> Reset </a-button>
                <a-button size="small" type="primary" @click="applyColumns">
                  OK
                </a-button>
              </div>
            </div>
          </template>

          <FilterOutlined class="p-2" />
        </a-dropdown>
      </div>
    </div>

    <div class="bg-white mt-3 py-2 px-3 w-full rounded shadow flex justify-end">
      <a-table
        :dataSource="data?.data || []"
        :loading="isFetching"
        :pagination="false"
        rowKey="rowId"
        @change="onTableChange"
        bordered
        :scroll="{ x: 'max-content', y: '650px' }"
      >
        <!-- index -->
        <a-table-column title="T/b" fixed="left" width="5rem">
          <template #default="{ index }">
            {{ (currentPage - 1) * pageSize + (index + 1) }}
          </template>
        </a-table-column>

        <template v-for="field in filteredFields" :key="field.key">
          <a-table-column
            v-if="field.type === 'enum'"
            :title="field.name"
            width="14rem"
            :dataIndex="field.key"
            :key="`enum-${field.key}`"
            :filters="
              (field.enums || []).map((row) => ({
                text: row.name,
                value: row.name,
              }))
            "
            :filteredValue="
              filterValues[field.key] ? filterValues[field.key] : null
            "
            :filterMultiple="true"
          >
            <template #default="{ text }">
              <a-tag
                v-if="text"
                :style="{
                  backgroundColor: getEnumColor(field, text),
                  color: '#fff',
                  border: 'none',
                }"
              >
                {{ text }}
              </a-tag>
              <span v-else>—</span>
            </template>
          </a-table-column>

          <a-table-column
            v-else-if="field.type === 'text'"
            :title="field.name"
            :dataIndex="field.key"
            :key="`text-${field.key}`"
            width="14rem"
            :filteredValue="
              filterValues[field.key] ? [filterValues[field.key]] : null
            "
            ellipsis
          >
            <template #default="{ text }">
              {{ text || '—' }}
            </template>
            <template
              #filterDropdown="{
                setSelectedKeys,
                selectedKeys,
                confirm,
                column,
                clearFilters,
              }"
            >
              <div class="p-2">
                <a-input
                  :placeholder="`Gözleg ${column.title.toLowerCase()}`"
                  :value="selectedKeys[0]"
                  style="width: 188px; margin-bottom: 8px; display: block"
                  @change="
                    (e) =>
                      setSelectedKeys(e.target.value ? [e.target.value] : [])
                  "
                  @pressEnter="
                    handleSearch(selectedKeys, confirm, column.dataIndex)
                  "
                />
                <a-button
                  type="primary"
                  size="small"
                  style="width: 90px; margin-right: 8px"
                  @click="handleSearch(selectedKeys, confirm, column.dataIndex)"
                >
                  <template #icon><SearchOutlined /></template>
                  Search
                </a-button>
                <a-button
                  size="small"
                  style="width: 90px"
                  @click="handleReset(column.dataIndex, clearFilters, confirm)"
                >
                  Reset
                </a-button>
              </div>
            </template>
          </a-table-column>

          <a-table-column
            v-else-if="field.type === 'date'"
            :title="field.name"
            :dataIndex="field.key"
            :key="`date-${field.key}`"
            width="14rem"
            :filteredValue="filterValues[field.key] || null"
            :sorter="true"
            :sortOrder="sortField === field.key ? sortOrder : null"
          >
            <template #default="{ text }">
              {{ text ? dayjs(text).format('DD.MM.YYYY') : '—' }}
            </template>

            <template
              #filterDropdown="{ setSelectedKeys, confirm, clearFilters }"
            >
              <div class="p-2 w-64">
                <a-range-picker
                  v-model:value="dateRange[field.key]"
                  format="YYYY-MM-DD"
                  style="width: 100%; margin-bottom: 8px"
                />

                <div class="flex justify-between">
                  <a-button
                    size="small"
                    @click="
                      () => handleDateReset(field.key, clearFilters, confirm)
                    "
                  >
                    Reset
                  </a-button>

                  <a-button
                    type="primary"
                    size="small"
                    @click="
                      () => handleDateApply(field.key, setSelectedKeys, confirm)
                    "
                  >
                    OK
                  </a-button>
                </div>
              </div>
            </template>
          </a-table-column>

          <a-table-column
            v-else-if="field.type === 'number'"
            :title="field.name"
            :dataIndex="field.key"
            :key="`number-${field.key}`"
            width="10rem"
            :sorter="true"
            :sortOrder="sortField === field.key ? sortOrder : null"
            @change="onTableChange"
            ellipsis
          >
            <template #default="{ text }">
              <span class="font-medium text-gray-700">
                {{ text }}
              </span>
            </template>
          </a-table-column>
        </template>

        <!-- system columns -->
        <a-table-column
          v-if="selectedColumnKeys.includes('createdAt')"
          title="Döredilen senesi"
          dataIndex="createdAt"
          width="10rem"
        >
          <template #default="{ text }">
            {{ dayjs(text).format('DD/MM/YYYY') }}
          </template>
        </a-table-column>

        <a-table-column
          v-if="selectedColumnKeys.includes('createdUser')"
          title="Döreden ulanyjy"
          dataIndex="createdUser"
          width="10rem"
        >
          <template #default="{ text }">
            {{ text ? text.name : '------' }}
          </template>
        </a-table-column>

        <a-table-column
          v-if="selectedColumnKeys.includes('updatedAt')"
          title="Üýtgedilen senesi"
          dataIndex="updatedAt"
          width="10rem"
        >
          <template #default="{ text }">
            {{ text ? dayjs(text).format('DD/MM/YYYY') : '------' }}
          </template>
        </a-table-column>

        <a-table-column
          v-if="selectedColumnKeys.includes('updatedUser')"
          title="Üýtgeden ulanyjy"
          dataIndex="updatedUser"
          width="10rem"
        >
          <template #default="{ text }">
            {{ text ? text.name : '------' }}
          </template>
        </a-table-column>

        <a-table-column
          v-if="selectedColumnKeys.includes('actions')"
          title="Sazlamalar"
          key="actions"
          width="10rem"
        >
          <template #default="{ record }">
            <div class="flex gap-2 items-center">
              <router-link
                :to="{ name: 'update-info', params: { id: record.rowId } }"
              >
                <EditOutlined class="text-blue-500 cursor-pointer" />
              </router-link>

              <a-popconfirm
                title="Delete?"
                @confirm="() => handleDelete(record.rowId)"
              >
                <DeleteOutlined class="text-red-500 cursor-pointer mt-1.5" />
              </a-popconfirm>
            </div>
          </template>
        </a-table-column>
      </a-table>
    </div>

    <!-- 🔹 PAGINATION -->
    <div class="bg-white mt-3 py-2 px-3 rounded shadow flex justify-end">
      <a-pagination
        :total="data?.count || 0"
        show-size-changer
        :current="currentPage"
        :pageSize="pageSize"
        :pageSizeOptions="['15', '25', '50', '100']"
        :show-total="(total) => `Jemi: ${total} sany`"
        @change="onChange"
      />
    </div>
  </template>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';
import {
  useCreateValue,
  useDeleteValue,
  useGetValue,
  useGetValues,
  useImportExcel,
  useUpdateValue,
} from './useValue';
import { computed, ref, watch, onMounted, watchEffect } from 'vue';
import Loading from '../../components/Loading.vue';
import Error from '../../components/Error.vue';
import dayjs from 'dayjs';
import {
  DeleteOutlined,
  EditOutlined,
  FilterOutlined,
  SearchOutlined,
} from '@ant-design/icons-vue';
import * as XLSX from 'xlsx';
const route = useRoute();
const router = useRouter();

const pageSize = ref(Number(route.query.limit) || 15);
const currentPage = ref(Number(route.query.page) || 1);

const dropdownOpen = ref(false);

const selectedColumnKeys = ref([]);

const tempSelectedKeys = ref([]);
const sortField = ref('');
const sortOrder = ref('');

const filterValues = ref({});
const dateRange = ref({});
const isReady = ref(false);

const backendQuery = computed(() => {
  const q = {
    page: currentPage.value,
    limit: pageSize.value,
    sort: sortField.value || undefined,
    order: sortOrder.value || undefined,
  };

  Object.entries(filterValues.value).forEach(([key, value]) => {
    if (!value) return;

    // TEXT
    if (typeof value === 'string') {
      if (value.trim()) {
        q[key] = value.trim();
      }
    } else if (Array.isArray(value) && typeof value[0] === 'string') {
      if (value.length > 0) {
        q[key] = value.join(',');
      }
    } else if (Array.isArray(value) && value.length === 2) {
      const [start, end] = value;

      if (start && end && start.$d) {
        q[`${key}From`] = dayjs(start).format('YYYY-MM-DD');
        q[`${key}End`] = dayjs(end).format('YYYY-MM-DD');
      }
    }
  });

  Object.keys(q).forEach((key) => {
    if (q[key] == null || q[key] === '') {
      delete q[key];
    }
  });

  return q;
});

const query = computed(() => [
  'values',
  currentPage.value,
  pageSize.value,
  JSON.stringify(backendQuery.value),
]);

const { isFetching, isLoading, isError, error, data } = useGetValues(
  backendQuery,
  query
);

const { mutate: deleteValue, isPending: isDeleteValue } = useDeleteValue();
const { mutate: importExcel, isPending: isImporting } = useImportExcel();
const handleDelete = (id) => {
  deleteValue(id);
};

const systemColumns = [
  { key: 'createdAt', name: 'Döredilen senesi' },
  { key: 'createdUser', name: 'Döreden ulanyjy' },
  { key: 'updatedAt', name: 'Üýtgedilen senesi' },
  { key: 'updatedUser', name: 'Üýtgeden ulanyjy' },
  { key: 'actions', name: 'Sazlamalar' },
];

// all columns
const allColumns = computed(() => [
  ...(data.value?.fields || []),
  ...systemColumns,
]);

watch(
  () => data.value?.fields,
  (fields) => {
    if (fields?.length && selectedColumnKeys.value.length === 0) {
      const keys = fields.map((f) => f.key);

      selectedColumnKeys.value = keys;
      tempSelectedKeys.value = [...keys];
    }
  },
  { immediate: true }
);

const handleSearch = (selectedKeys, confirm, dataIndex) => {
  confirm();
  filterValues.value[dataIndex] = selectedKeys[0];
  addQuery({ [dataIndex]: selectedKeys[0] });
};

const handleReset = (dataIndex, clearFilters, confirm) => {
  clearFilters({
    confirm: true,
  });
  filterValues.value[dataIndex] = '';
  dateRange.value[dataIndex] = [];
  confirm();
  addQuery({ [dataIndex]: undefined });
};

const handleDateApply = (key, setSelectedKeys, confirm) => {
  confirm();

  const range = dateRange.value[key];

  if (range && range.length === 2) {
    const startDate = dayjs(range[0]).format('YYYY-MM-DD');
    const endDate = dayjs(range[1]).format('YYYY-MM-DD');
    filterValues.value[key] = [startDate, endDate];

    setSelectedKeys(filterValues.value[key]);

    addQuery({
      [`${key}From`]: filterValues.value[key][0],
      [`${key}End`]: filterValues.value[key][1],
    });
  }
};

const handleDateReset = (key, clearFilters, confirm) => {
  clearFilters?.();
  confirm();

  filterValues.value[key] = [];
  addQuery({
    [`${key}From`]: undefined,
    [`${key}End`]: undefined,
  });
};

function onTableChange(pagination, filters, sorter) {
  const query = {};
  if (sorter?.field && sorter?.order) {
    if (sortField.value !== sorter.field || sortOrder.value !== sorter.order) {
      sortField.value = sorter.field;
      sortOrder.value = sorter.order;
      query.sort = sorter.field;
      query.order = sorter.order === 'ascend' ? 'asc' : 'desc';
    }
  } else {
    if (sortField.value || sortOrder.value) {
      sortField.value = '';
      sortOrder.value = '';
      query.sort = undefined;
      query.order = undefined;
    }
  }

  if (data.value?.fields) {
    data.value?.fields?.forEach((field) => {
      if (field.type === 'enum') {
        const queryKey = `enum-${field.key}`;
        if (filters[queryKey]?.length > 0) {
          if (
            JSON.stringify(filterValues.value[field.key]) !==
            JSON.stringify(filters[queryKey] || [])
          ) {
            filterValues.value[field.key] = filters[queryKey] || [];
          }
          if (filterValues.value[field.key].length > 0) {
            query[field.key] = filterValues.value[field.key].join(',');
          }
        } else {
          filterValues.value[field.key] = [];
          query[field.key] = undefined;
        }
      }
    });
  }
  addQuery(query);
}

const filteredFields = computed(() => {
  return (data.value?.fields || []).filter((f) =>
    selectedColumnKeys.value.includes(f.key)
  );
});

function toggleTemp(key, checked) {
  if (checked) {
    tempSelectedKeys.value.push(key);
  } else {
    tempSelectedKeys.value = tempSelectedKeys.value.filter((k) => k !== key);
  }
}

function toggleAll(e) {
  tempSelectedKeys.value = e.target.checked
    ? allColumns.value.map((c) => c.key)
    : [];
}

function applyColumns() {
  if (!tempSelectedKeys.value.length) return;

  selectedColumnKeys.value = [...tempSelectedKeys.value];

  dropdownOpen.value = false;
}

function resetColumns() {
  tempSelectedKeys.value = allColumns.value.map((c) => c.key);
}

function getEnumColor(field, value) {
  const enumItem = field?.enums?.find((row) => row.name === value);
  return enumItem?.color || '#999';
}

const addQuery = (query) => {
  const q = { ...route.query, ...query };

  Object.keys(q).forEach((key) => {
    if (!q[key]) {
      delete q[key];
    }
  });

  router.push({ query: q });
};

const onChange = (page, limit) => {
  const safePage = page > 0 ? page : 1;

  currentPage.value = safePage;
  pageSize.value = limit;

  const query = route.query;
  router.push({
    query: {
      ...query,
      page: safePage,
      limit,
    },
  });
};

function exportToExcel() {
  const tableData = data.value?.data || [];
  if (!tableData.length) return;

  // 🔹 visible dynamic fields
  const visibleFields = (data.value?.fields || []).filter(
    (f) => selectedColumnKeys.value.includes(f.key) && f.key !== 'actions'
  );

  // 🔹 visible system columns (❌ exclude actions)
  const visibleSystem = systemColumns.filter(
    (c) => selectedColumnKeys.value.includes(c.key) && c.key !== 'actions'
  );

  // 🔹 build rows
  const rows = tableData.map((row, index) => {
    const obj = {};

    // ✅ T/b column
    obj['T/b'] = (currentPage.value - 1) * pageSize.value + (index + 1);

    // dynamic fields
    visibleFields.forEach((f) => {
      let val = row[f.key];

      if (f.type === 'date' && val) {
        val = dayjs(val).format('YYYY-MM-DD HH:mm');
      }

      obj[f.name] = val ?? '';
    });

    // system fields
    visibleSystem.forEach((c) => {
      let val = row[c.key];

      if (c.key === 'createdAt' || c.key === 'updatedAt') {
        val = val ? dayjs(val).format('DD/MM/YYYY HH:mm') : '';
      }

      if (c.key === 'createdUser' || c.key === 'updatedUser') {
        val = val ? val.name : '';
      }

      obj[c.name] = val ?? '';
    });

    return obj;
  });

  // 🔹 create sheet
  const worksheet = XLSX.utils.json_to_sheet(rows);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

  XLSX.writeFile(
    workbook,
    `report_${dayjs().format('YYYY-MM-DD HH:mm').split(' ').join('_')}.xlsx`
  );
}
const handleUpload = ({ file }) => {
  const formData = new FormData();
  formData.append('file', file);

  importExcel(formData);
};

const reload = () => {
  if (data.value?.fields) {
    data.value?.fields?.forEach((field) => {
      if (field.type === 'enum') {
        if (route.query[field.key]) {
          filterValues.value[field.key] = route.query[field.key].split(',');
        } else {
          filterValues.value[field.key] = [];
        }
      } else if (field.type === 'text') {
        if (route.query[field.key]) {
          filterValues.value[field.key] = route.query[field.key];
        } else {
          filterValues.value[field.key] = '';
        }
      } else if (field.type === 'date') {
        const startKey = `${field.key}From`;
        const endKey = `${field.key}End`;
        if (route.query[startKey] && route.query[endKey]) {
          filterValues.value[field.key] = [
            dayjs(route.query[startKey], 'YYYY-MM-DD'),
            dayjs(route.query[endKey], 'YYYY-MM-DD'),
          ];
          dateRange.value[field.key] = filterValues.value[field.key];
        } else {
          filterValues.value[field.key] = dateRange.value[field.key] = [];
        }
      }
    });
  }
  if (route.query.sort) {
    sortField.value = route.query.sort;
    sortOrder.value = route.query.order === 'asc' ? 'ascend' : 'descend';
  } else {
    sortField.value = '';
    sortOrder.value = '';
  }
};

watch([() => route.query, () => data.value], reload);
onMounted(() => {
  document.title = 'Işgär';
  reload();
});
</script>

<style scoped>
:deep(.ant-table),
:deep(.ant-form),
:deep(.ant-form-item) {
  font-size: 90%;
}
</style>
