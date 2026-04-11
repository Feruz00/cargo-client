<template>
  <div class="mx-5">
    <!-- HEADER -->
    <div
      class="bg-white items-center py-4 mt-2 px-6 rounded-lg shadow-md flex flex-row gap-2"
    >
      <ArrowLeftOutlined
        class="cursor-pointer"
        @click.prevent="$router.go(-1)"
      />

      <div class="flex flex-row justify-between items-center gap-2 w-full">
        <a-breadcrumb>
          <a-breadcrumb-item>
            <router-link :to="{ name: 'fields' }">Sütünler</router-link>
          </a-breadcrumb-item>
          <a-breadcrumb-item>Täze sütün</a-breadcrumb-item>
        </a-breadcrumb>

        <h2 class="text-lg font-semibold">Täze sütün döretmek</h2>
      </div>
    </div>

    <!-- LOADING -->
    <Loading v-if="isLoading" />
    <Error v-else-if="isError" :error="error" />

    <!-- FORM -->
    <div
      v-else
      class="bg-white mt-4 p-6 rounded-lg shadow-md max-w-full mx-auto"
    >
      <a-form layout="vertical" :model="form" @finish="onSubmit">
        <!-- BASIC INFO -->
        <div class="grid grid-cols-2 gap-4">
          <!-- NAME -->
          <a-form-item label="Ady" name="name" required>
            <a-input v-model:value="form.name" placeholder="Ady giriziň" />
          </a-form-item>

          <!-- KEY -->
          <a-form-item label="Key" name="key" required>
            <a-input v-model:value="form.key" placeholder="key giriziň" />
          </a-form-item>

          <!-- TYPE -->
          <a-form-item label="Görnüş" name="type" required>
            <a-select v-model:value="form.type">
              <a-select-option value="text">Text</a-select-option>
              <a-select-option value="number">Number</a-select-option>
              <a-select-option value="date">Date</a-select-option>
            </a-select>
          </a-form-item>

          <!-- COMPUTED -->
          <a-form-item label="Hasaplanýan">
            <div class="flex items-center gap-3">
              <a-switch v-model:checked="form.isComputed" />
              <span>
                {{ form.isComputed ? 'Hawa' : 'Ýok' }}
              </span>
            </div>
          </a-form-item>
        </div>

        <!-- FORMULA -->
        <a-form-item v-if="form.isComputed" label="Formula" required>
          <a-input
            v-model:value="form.formula"
            placeholder="mysal: field1 + field2"
          />
        </a-form-item>

        <!-- USERS -->
        <a-form-item label="Ulanyjylar">
          <!-- TOP BAR -->
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm text-gray-500">
              {{ form.users.length }} saýlandy
            </span>

            <a-button size="small" @click="toggleAll">
              {{ isAllSelected ? 'Arassala' : 'Hemmesini saýla' }}
            </a-button>
          </div>

          <!-- LIST -->
          <div
            class="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto border rounded p-3"
          >
            <a-checkbox
              v-for="user in users"
              :key="user.id"
              :checked="form.users.includes(user.id)"
              @change="togglePermission(user.id)"
            >
              <div class="flex flex-row items-center gap-2 leading-tight">
                <span>{{ user.name }}</span>
                <span class="text-gray-400"> - {{ user.username }} </span>
              </div>
            </a-checkbox>
          </div>
        </a-form-item>

        <!-- SUBMIT -->
        <div class="flex justify-end mt-4">
          <a-button type="primary" html-type="submit" :loading="isCreating">
            Üýtgetmek
          </a-button>
        </div>
      </a-form>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { ArrowLeftOutlined } from '@ant-design/icons-vue';
import { useRoute, useRouter } from 'vue-router';

import Loading from '../../components/Loading.vue';
import Error from '../../components/Error.vue';

import { useGetUsers } from '../User/useUsers';
import { useCreateField, useGetField, useUpdateField } from './useFields';

const router = useRouter();
const route = useRoute();
const id = computed(() => route.params.id);

/* API */
const { isLoading, isError, error, data } = useGetUsers();
const {
  isLoading: isLoadingField,
  isError: isErrorField,
  error: errorField,
  data: field,
} = useGetField(id);
const { mutate: updateField, isPending: isUpdating } = useUpdateField();

/* FORM */
const form = ref({
  name: '',
  key: '',
  type: 'text',
  isComputed: false,
  formula: '',
  users: [],
});

const users = ref([]);

/* AUTO FORMAT KEY */
watch(
  () => form.value.key,
  (val) => {
    if (val) {
      form.value.key = val.toLowerCase().replace(/\s+/g, '_');
    }
  }
);

/* TOGGLE USER */
const togglePermission = (id) => {
  if (form.value.users.includes(id)) {
    form.value.users = form.value.users.filter((p) => p !== id);
  } else {
    form.value.users.push(id);
  }
};

/* SELECT ALL */
const isAllSelected = computed(() => {
  if (!data.value?.data) return false;

  return data.value.data.every((u) => form.value.users.includes(u.id));
});

const toggleAll = () => {
  if (!data.value?.data) return;

  if (isAllSelected.value) {
    form.value.users = [];
  } else {
    form.value.users = data.value.data.map((u) => u.id);
  }
};

/* SUBMIT */
const onSubmit = () => {
  const data = {
    ...form.value,
    users: form.value.users,
  };
  updateField(
    {
      data,
      id: id.value,
    },
    {
      onSuccess: () => {
        router.go(-1);
      },
    }
  );
};

const reload = () => {
  if (field.value) {
    const val = field.value.data.field;
    const per = field.value.data.users;
    form.value.name = val.name;
    form.value.isComputed = val.isComputed;
    form.value.key = val.key;
    form.value.type = val.type;
    form.value.formula = val.formula;

    form.value.users = per?.map((row) => row.userId);
  }
};
watch(() => field.value, reload);
watch(
  () => data.value,
  () => {
    users.value = data.value.data.filter((row) => row.role === 'user');
  }
);
onMounted(() => {
  document.title = 'Admin | Sütün maglumatlaryny üýtgetmek';
  reload();
});
</script>
