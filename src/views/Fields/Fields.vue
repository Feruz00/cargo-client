<template>
  <Loading v-if="isLoading" />
  <Error v-else-if="isError" :error="error" />

  <template v-else>
    <PageHeader
      pageName="Sütünler bölümi"
      btnName="Täze sütün döret"
      btnHref="create-field"
      :selectedRows="selectedRows"
      :isDeleteSources="isDeleteFields"
      @delete="deleteRowSelections"
    />

    <div class="bg-white mt-3 p-3 rounded shadow">
      <a-table
        :dataSource="tableData"
        :columns="columns"
        rowKey="id"
        :loading="isFetching"
        :pagination="false"
        :components="components"
        :scroll="{ x: 'max-content' }"
        bordered
      >
      </a-table>
    </div>
  </template>
</template>

<script setup>
import { ref, watch, h, onMounted } from 'vue';
import draggable from 'vuedraggable';
import dayjs from 'dayjs';

import Loading from '../../components/Loading.vue';
import Error from '../../components/Error.vue';
import { Popconfirm } from 'ant-design-vue';
import {
  useDeleteField,
  useDeleteFields,
  useGetFields,
  useUpdateOrders,
} from './useFields';

import { DeleteOutlined, EditOutlined } from '@ant-design/icons-vue';
import { useRouter } from 'vue-router';

const tableData = ref([]);
const selectedRows = ref([]);

const { isLoading, isError, error, data, isFetching } = useGetFields();
const router = useRouter();
const { mutate: deleteField } = useDeleteField();
const { mutate: deleteFields } = useDeleteFields();
const { mutate: updateOrder } = useUpdateOrders();
const columns = [
  { title: '☰', key: 'drag', width: 50 },
  { title: 'Ady', dataIndex: 'name' },
  { title: 'Key', dataIndex: 'key' },
  { title: 'Görnüş', dataIndex: 'type' },
  {
    title: 'Hasaplama',
    dataIndex: 'isComputed',
    customRender: ({ text }) => (text ? 'Hawa' : 'Ýok'),
  },
  {
    title: 'Döredilen wagty',
    dataIndex: 'createdAt',
    customRender: ({ text }) => dayjs(text).format('DD/MM/YYYY HH:mm'),
  },
  { title: 'Sazlama', key: 'actions' },
];

watch(
  () => data?.value?.data,
  (val) => {
    if (val) tableData.value = [...val];
  },
  { immediate: true }
);

const rowSelection = {
  onChange: (_, rows) => {
    selectedRows.value = rows.map((r) => r.id);
  },
};

/* DELETE */
const handleDelete = (id) => {
  deleteField(id);
};

const deleteRowSelections = () => {
  deleteFields(selectedRows.value, {
    onSuccess: () => {
      selectedRows.value = [];
    },
  });
};

const DragBody = (props) => {
  return h(
    draggable,
    {
      tag: 'tbody',
      list: tableData.value,
      itemKey: 'id',
      animation: 150,
      handle: '.drag-handle',
      onEnd: () => {
        const list = tableData.value;

        const payload = list.map((item, index) => ({
          id: item.id,
          order: index,
        }));
        updateOrder(payload);
        // console.log('📦 SEND TO BACKEND:', payload);
      },
    },
    {
      item: ({ element }) =>
        h('tr', { key: element.id }, [
          h(
            'td',
            {
              class: 'drag-handle cursor-move text-gray-400',
              style: { width: '50px' },
            },
            '☰'
          ),

          h('td', element.name),
          h('td', element.key),
          h('td', element.type),
          h('td', element.isComputed ? 'Hawa' : 'Ýok'),
          h('td', dayjs(element.createdAt).format('DD/MM/YYYY HH:mm')),

          h('td', [
            h('div', { class: 'flex gap-2' }, [
              h(EditOutlined, {
                class: 'cursor-pointer',
                onClick: () => {
                  router.push({
                    name: 'update-field',
                    params: { id: element.id },
                  });
                },
                // (window.location.href = `/update-field/${element.id}`),
              }),

              h(
                Popconfirm,
                {
                  title: 'Sütüni pozmakçymy?',
                  okText: 'Hawa',
                  cancelText: 'Ýok',
                  onConfirm: () => handleDelete(element.id),
                },
                {
                  default: () =>
                    h(DeleteOutlined, {
                      class: 'cursor-pointer text-red-500',
                    }),
                }
              ),
            ]),
          ]),
        ]),
    }
  );
};

const components = {
  body: {
    wrapper: DragBody,
  },
};

onMounted(() => {
  document.title = 'Admin | Tablissa sütünleri';
});
</script>

<style scoped>
.drag-handle {
  cursor: grab;
  user-select: none;
  font-size: 16px;
}
.drag-handle:active {
  cursor: grabbing;
}
:deep(.ant-table),
:deep(.ant-form),
:deep(.ant-form-item) {
  font-size: 90%;
}
</style>
