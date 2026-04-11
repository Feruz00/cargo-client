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
        rowKey="rowNum"
        bordered
        :scroll="{ x: 'max-content', y: '650px' }"
      >
        <!-- index -->
        <a-table-column title="T/b" fixed="left" width="5rem">
          <template #default="{ index }">
            {{ (currentPage - 1) * pageSize + (index + 1) }}
          </template>
        </a-table-column>

        <!-- dynamic fields -->
        <a-table-column
          v-for="field in filteredFields"
          :key="field.key"
          :title="field.name"
          :dataIndex="field.key"
          width="10rem"
          ellipsis
        >
          <template #default="{ text }">
            {{
              field.type === 'date'
                ? dayjs(text).format('YYYY-MM-DD HH:mm')
                : text
            }}
          </template>
        </a-table-column>

        <!-- system columns -->
        <a-table-column
          v-if="selectedColumnKeys.includes('createdAt')"
          title="Döredilen senesi"
          dataIndex="createdAt"
          width="10rem"
        >
          <template #default="{ text }">
            {{ dayjs(text).format('DD/MM/YYYY HH:mm') }}
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
            {{ text ? dayjs(text).format('DD/MM/YYYY HH:mm') : '------' }}
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
                :to="{ name: 'update-info', params: { id: record.rowNum } }"
              >
                <EditOutlined class="text-blue-500 cursor-pointer" />
              </router-link>

              <a-popconfirm
                title="Delete?"
                @confirm="() => handleDelete(record.rowNum)"
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
import { computed, ref, watch, onMounted } from 'vue';
import Loading from '../../components/Loading.vue';
import Error from '../../components/Error.vue';
import dayjs from 'dayjs';
import {
  DeleteOutlined,
  EditOutlined,
  FilterOutlined,
} from '@ant-design/icons-vue';
import * as XLSX from 'xlsx';
const route = useRoute();
const router = useRouter();

const pageSize = ref(Number(route.query.limit) || 15);
const currentPage = ref(Number(route.query.page) || 1);

const dropdownOpen = ref(false);

const selectedColumnKeys = ref([]);

const tempSelectedKeys = ref([]);

// const queryKey = computed(() => ({
//   page: currentPage.value,
//   limit: pageSize.value,
// }));

const queryKey = computed(() => ({
  page: currentPage.value,
  limit: pageSize.value,
}));
const query = computed(() => ['values', currentPage.value, pageSize.value]);
const { isFetching, isLoading, isError, error, data } = useGetValues(
  queryKey,
  query
);

const { mutate: deleteValue, isPending: isDeleteValue } = useDeleteValue();
const { mutate: importExcel, isPending: isImporting } = useImportExcel();
const handleDelete = (id) => {
  deleteValue(id);
};
// system columns
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

// init
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
// filtered dynamic fields
const filteredFields = computed(() => {
  return (data.value?.fields || []).filter((f) =>
    selectedColumnKeys.value.includes(f.key)
  );
});

// 🔹 dropdown logic
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

  dropdownOpen.value = false; // ✅ CLOSE DROPDOWN
}

function resetColumns() {
  tempSelectedKeys.value = allColumns.value.map((c) => c.key);
}

// pagination
const onChange = (page, limit) => {
  const safePage = page > 0 ? page : 1;

  currentPage.value = safePage;
  pageSize.value = limit;

  router.push({
    query: {
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
onMounted(() => {
  document.title = 'Işgär';
});
</script>

<style scoped>
:deep(.ant-table),
:deep(.ant-form),
:deep(.ant-form-item) {
  font-size: 90%;
}
</style>
