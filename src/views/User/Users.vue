<template>
  <Loading v-if="isLoading" />
  <Error v-else-if="isError" :error="error" />
  <template v-else-if="!isError">
    <PageHeader
      pageName="Ulanyjylar bölümi"
      :btn="auth.user?.role === 'user'"
      :btnName="'Täze ulanyjy döret'"
      :btnHref="'create-user'"
      :selectedRows="selectedRows"
      :isDeleteSources="isDeleteUsers"
      :isSuccess="isSuccess"
      :filteredTagsCount="isSuccess ? data.count : 0"
      @delete="deleteRowSelections"
    />
    <div
      class="bg-white mt-3 py-2 px-3 rounded shadow flex flex-row items-center justify-end gap-4"
    >
      <a-table
        :dataSource="data?.data || []"
        :loading="isFetching"
        :pagination="false"
        class="text-sm"
        rowKey="id"
        bordered
        @change="onTableChange"
        @row-click="handleRowClick"
        :scroll="{ x: 'max-content', y: '650px' }"
        :row-selection="auth.user?.role === 'user' ? rowSelection : false"
      >
        <a-table-column title="T/b" key="index" fixed="left" width="5rem">
          <template #default="{ index }">
            {{ (currentPage - 1) * pageSize + (index + 1) }}
          </template>
        </a-table-column>
        <a-table-column dataIndex="name" width="18rem" fixed="left">
          <template #title>
            <div class="flex flex-col gap-1">
              <div>Ulanyjynyň ady</div>
              <a-input-search
                v-model:value="searchNameInput"
                enter-button
                allowClear
                @search="onSearchName"
                placeholder="Ady boýunça gözleg"
                class="font-normal"
              />
            </div>
          </template>
          <template #default="{ text }">
            <div class="line-clamp-2 break-all">
              {{ text }}
            </div>
          </template>
        </a-table-column>
        <a-table-column dataIndex="username" width="18rem" fixed="left">
          <template #title>
            <div class="flex flex-col gap-1">
              <div>Ulanyjynyň logini</div>
              <a-input-search
                v-model:value="searchUsernameInput"
                enter-button
                allowClear
                @search="onSearchUsername"
                placeholder="Logini boýunça gözleg"
                class="font-normal"
              />
            </div>
          </template>
          <template #default="{ text }">
            <div class="line-clamp-2 break-all">
              {{ text }}
            </div>
          </template>
        </a-table-column>

        <a-table-column
          title="Ygtyýarlygy"
          dataIndex="role"
          width="8rem"
          :filters="[
            { text: 'Admin', value: 'admin' },
            { text: 'Başlyk', value: 'head' },
            { text: 'Işgär', value: 'user' },
          ]"
          :filteredValue="role.length ? role : null"
          :filterMultiple="true"
        >
          <template #default="{ text }">
            <div class="flex flex-col gap-1">
              <span v-if="text == 'admin'"> Admin </span>
              <span v-else-if="text == 'user'"> Işgär </span>

              <span v-else-if="text == 'head'"> Başlyk </span>
            </div>
          </template>
        </a-table-column>

        <a-table-column
          title="Status"
          width="8rem"
          dataIndex="isActive"
          :filters="[
            { text: 'Aktiwler', value: 'active' },
            { text: 'Doňdurylanlar', value: 'deactive' },
          ]"
          :filteredValue="status.length ? status : null"
          :filterMultiple="false"
        >
          <template #default="{ text }">
            <a-tag :color="text === false ? 'red' : 'green'">{{
              text === true ? 'Aktiw' : 'Doňdurylan'
            }}</a-tag>
          </template>
        </a-table-column>

        <a-table-column
          title="Ulgamdaky soňky wagty"
          dataIndex="last_login"
          width="10rem"
          :sorter="true"
          :sortOrder="sortField === 'last_login' ? sortOrder : null"
        >
          <template #default="{ text, record }">
            <span
              class=""
              :class="{
                'text-green-500 font-bold': online.checkUser(record.id),
              }"
            >
              {{
                online.checkUser(record.id)
                  ? 'Online'
                  : text
                    ? dayjs(text).format('DD/MM/YYYY HH:mm')
                    : '-----'
              }}
            </span>
          </template>
        </a-table-column>

        <a-table-column
          title="Döredilen wagty"
          dataIndex="createdAt"
          width="10rem"
          :sorter="true"
          :sortOrder="sortField === 'createdAt' ? sortOrder : null"
        >
          <template #default="{ text }">
            <span class="">
              {{ dayjs(text).format('DD/MM/YYYY HH:mm') }}
            </span>
          </template>
        </a-table-column>
        <a-table-column
          title="Sazlamalar"
          width="7rem"
          dataIndex="id"
          fixed="right"
          v-if="auth.user?.role === 'user'"
        >
          <template #default="{ text }">
            <div class="flex flex-row items-center gap-2 text-base">
              <EyeOutlined class="cursor-pointer" @click="viewId = text" />

              <router-link
                class="flex items-center justify-center"
                :to="{ name: 'update-user', params: { id: text } }"
              >
                <EditOutlined class="cursor-pointer" />
              </router-link>

              <a-popconfirm
                placement="leftTop"
                title="Ulanyjynyň maglumatlaryny pozmakçymy?"
                ok-text="Yes"
                cancel-text="No"
                :loading="isDeletePending"
                @confirm="() => handleDelete(text)"
              >
                <DeleteOutlined class="cursor-pointer" />
              </a-popconfirm>
            </div>
          </template>
        </a-table-column>
      </a-table>
    </div>
    <div
      class="bg-white mt-3 py-2 px-3 rounded shadow flex flex-row items-center justify-end gap-4"
    >
      <div class="flex flex-row items-center gap-2">
        <a-pagination
          :total="isSuccess ? data.count : 0"
          @change="onChange"
          show-size-changer
          :current="currentPage"
          :pageSize="pageSize"
          :pageSizeOptions="['15', '25', '50', '100']"
          :show-total="(total) => `Jemi: ${total} sany`"
        />
      </div>
    </div>
  </template>

  <view-user :id="viewId" @close="viewId = null" />
</template>
<script setup>
import { useRoute, useRouter } from 'vue-router';
import AdminHeader from '../../components/AdminHeader.vue';
import Error from '../../components/Error.vue';
import Loading from '../../components/Loading.vue';
import { useDeleteUser, useDeleteUsers, useGetUsers } from './useUsers';
import { computed, onMounted, ref, watch } from 'vue';
import useOnlineUser from '../../store/users';
import dayjs from 'dayjs';
import {
  DeleteOutlined,
  EditOutlined,
  KeyOutlined,
  EyeOutlined,
} from '@ant-design/icons-vue';
import PageHeader from '../../components/PageHeader.vue';
import ViewUser from './ViewUser.vue';
import useAuthStore from '../../store/auth';

const route = useRoute();
const router = useRouter();
const online = useOnlineUser();

const pageSize = ref(Number(route.query.limit) || 15);
const currentPage = ref(Number(route.query.page) || 1);

const searchNameInput = ref('');
const searchUsernameInput = ref('');

const auth = useAuthStore();

const viewId = ref(null);
const searchName = ref('');
const searchUsername = ref('');
const role = ref([]);
const status = ref([]);
const sortField = ref('');
const sortOrder = ref('');
const selectedRows = ref([]);

const queryKey = computed(() => ({
  page: currentPage.value,
  limit: pageSize.value,
  sort: sortField.value ? sortField.value : undefined,
  order: sortOrder.value
    ? sortOrder.value === 'ascend'
      ? 'asc'
      : 'desc'
    : undefined,
  status: status.value.length ? mapStatusToBackend(status.value) : undefined,
  role: role.value.length ? role.value.join(',') : undefined,
  name: searchName.value ? searchName.value : undefined,
  username: searchUsername.value ? searchUsername.value : undefined,
}));
const { isFetching, isLoading, isError, error, isSuccess, data, refetch } =
  useGetUsers(queryKey);
const { mutate: deleteUsers, isPending: isDeleteUsers } = useDeleteUsers();
const { mutate: deleteUser, isPending: isDeleteUser } = useDeleteUser();

const mapStatusToBackend = (statusArray) => {
  if (!statusArray.length) return undefined;

  return statusArray.map((s) => (s === 'active' ? true : false)).join(',');
};

const onTableChange = (pagination, filters, sorter) => {
  let query = {};
  let hasChanges = false;

  // SORT
  if (sorter?.field && sorter?.order) {
    sortField.value = sorter.field;
    sortOrder.value = sorter.order;

    query.sort = sorter.field;
    query.order = sorter.order === 'ascend' ? 'asc' : 'desc';
    hasChanges = true;
  } else {
    sortField.value = '';
    sortOrder.value = '';
    query.sort = undefined;
    query.order = undefined;
  }

  // STATUS
  const newStatus = filters.isActive || [];

  if (JSON.stringify(status.value) !== JSON.stringify(newStatus)) {
    status.value = newStatus;

    query.status = newStatus.length
      ? newStatus.map((s) => (s === 'active' ? true : false)).join(',')
      : undefined;

    hasChanges = true;
  }

  // ROLE
  const newRole = filters.role || [];
  if (JSON.stringify(role.value) !== JSON.stringify(newRole)) {
    role.value = newRole;
    query.role = newRole.length ? newRole.join(',') : undefined;
    hasChanges = true;
  }

  // PAGINATION
  if (pagination.current !== currentPage.value) {
    currentPage.value = pagination.current;
    query.page = pagination.current;
    hasChanges = true;
  }

  if (pagination.pageSize !== pageSize.value) {
    pageSize.value = pagination.pageSize;
    query.limit = pagination.pageSize;
    hasChanges = true;
  }

  if (hasChanges) addQuery(query);
};

const rowSelection = ref({
  checkStrictly: false,
  onChange: (selectedRowKeys, rows) => {
    selectedRows.value = rows.map((row) => row.id);
  },
});
const deleteRowSelections = () => {
  deleteUsers(selectedRows.value, {
    onSuccess: () => {
      selectedRows.value = [];
    },
  });
};
const handleDelete = (userId) => {
  deleteUser(userId);
};
const onChange = (page, limit) => {
  const query = route.query;
  if (limit !== pageSize.value) {
    pageSize.value = limit;
    currentPage.value = 1;
  } else if (page !== currentPage.value) {
    currentPage.value = page;
  }

  router.push({
    query: {
      ...query,
      page: currentPage.value,
      limit: limit,
    },
  });
};
const addQuery = (query) => {
  const q = { ...route.query, ...query };

  Object.keys(q).forEach((key) => {
    if (!q[key]) {
      delete q[key];
    }
  });

  router.push({ query: q });
};

const reload = () => {
  currentPage.value = Number(route.query.page) || 1;
  pageSize.value = Number(route.query.limit) || 15;
  if (route.query.sort) {
    sortField.value = route.query.sort;
    sortOrder.value = route.query.order === 'asc' ? 'ascend' : 'descend';
  } else {
    sortField.value = '';
    sortOrder.value = '';
  }
  if (route.query.name) {
    searchName.value = route.query.name;
    searchNameInput.value = route.query.name; // ✅ sync input
  } else {
    searchName.value = '';
    searchNameInput.value = '';
  }

  if (route.query.username) {
    searchUsername.value = route.query.username;
    searchUsernameInput.value = route.query.username;
  } else {
    searchUsername.value = '';
    searchUsernameInput.value = '';
  }
  if (route.query.status) {
    status.value = route.query.status
      .split(',')
      .map((s) => (s === 'true' ? 'active' : 'deactive'));
  } else {
    status.value = [];
  }
  if (route.query.role) {
    role.value = route.query.role.split(',');
  } else {
    role.value = '';
  }
};

const onSearchName = (text) => {
  searchName.value = text; // ✅ apply only here

  addQuery({
    name: text || undefined,
    page: 1,
  });
};

const onSearchUsername = (text) => {
  searchUsername.value = text;

  addQuery({
    username: text || undefined,
    page: 1,
  });
};
watch(() => route.query, reload);

onMounted(() => {
  if (auth.user?.role === 'head') {
    document.title = 'Başlyk | Ulanyjylar';
  } else {
    document.title = 'Admin | Ulanyjylar';
  }
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
