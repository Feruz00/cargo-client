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
            <router-link :to="{ name: 'users' }">Ulanyjylar</router-link>
          </a-breadcrumb-item>
          <a-breadcrumb-item>Täze ulanyjy</a-breadcrumb-item>
        </a-breadcrumb>

        <h2 class="text-lg font-semibold">Täze ulanyjy döretmek</h2>
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
        <div class="grid grid-cols-2 gap-4">
          <!-- NAME -->
          <a-form-item label="Ady" name="name" required>
            <a-input v-model:value="form.name" placeholder="Ady giriziň" />
          </a-form-item>

          <!-- USERNAME -->
          <a-form-item label="Username" name="username" required>
            <a-input
              v-model:value="form.username"
              placeholder="Username giriziň"
            />
          </a-form-item>

          <!-- PASSWORD -->
          <a-form-item label="Parol" name="password" required>
            <a-input-password
              v-model:value="form.password"
              placeholder="Parol giriziň"
            />
          </a-form-item>

          <!-- ROLE -->
          <a-form-item label="Roly" name="role" required>
            <a-select v-model:value="form.role">
              <a-select-option value="admin">Admin</a-select-option>
              <a-select-option value="head">Başlyk</a-select-option>
              <a-select-option value="user">Işgär</a-select-option>
            </a-select>
          </a-form-item>
        </div>

        <!-- STATUS -->
        <a-form-item label="Status">
          <div class="flex items-center gap-3">
            <a-switch v-model:checked="form.isActive" />
            <span>
              {{ form.isActive ? 'Aktiw' : 'Doňdurylan' }}
            </span>
          </div>
        </a-form-item>

        <!-- PERMISSIONS -->
        <a-form-item label="Rugsatlar (Permissions)">
          <!-- TOP BAR -->
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm text-gray-500">
              {{ form.permissions.length }} saýlandy
            </span>

            <a-button size="small" @click="toggleAll">
              {{ isAllSelected ? 'Arassala' : 'Hemmesini saýla' }}
            </a-button>
          </div>

          <!-- LIST -->
          <div
            class="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto border rounded p-3"
            v-if="form.role == 'user'"
          >
            <a-checkbox
              v-for="field in data.data"
              :key="field.id"
              :checked="form.permissions.includes(field.id)"
              @change="togglePermission(field.id)"
            >
              <span>
                {{ field.name }}
                <span v-if="field.isComputed" class="text-xs ml-1">
                  (auto)
                </span>
              </span>
            </a-checkbox>
          </div>
        </a-form-item>

        <!-- SUBMIT -->
        <div class="flex justify-end mt-4">
          <a-button type="primary" html-type="submit" :loading="isCreating">
            Döretmek
          </a-button>
        </div>
      </a-form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { ArrowLeftOutlined } from '@ant-design/icons-vue';
import { useRouter } from 'vue-router';

import Error from '../../components/Error.vue';
import Loading from '../../components/Loading.vue';

import { useGetFields } from '../Fields/useFields';
import { useCreateUser } from './useUsers';

const router = useRouter();

const { isLoading, isError, error, data } = useGetFields();
const { mutate: createUser, isPending: isCreating } = useCreateUser();

const form = ref({
  name: '',
  username: '',
  password: '',
  role: 'user',
  isActive: true,
  permissions: [],
});

// toggle single permission
const togglePermission = (id) => {
  if (form.value.permissions.includes(id)) {
    form.value.permissions = form.value.permissions.filter((p) => p !== id);
  } else {
    form.value.permissions.push(id);
  }
};

// check if all selected
const isAllSelected = computed(() => {
  if (!data.value?.data) return false;

  const availableIds = data.value.data;

  return availableIds.every((id) => form.value.permissions.includes(id));
});

// toggle all
const toggleAll = () => {
  if (!data.value?.data) return;

  if (isAllSelected.value) {
    form.value.permissions = [];
  } else {
    form.value.permissions = data.value.data.map((f) => f.id);
  }
};
watch(
  () => form.value.role,
  () => {
    form.value.permissions = [];
  }
);
// submit
const onSubmit = () => {
  createUser(
    {
      ...form.value,
      permissions: form.value.permissions,
    },
    {
      onSuccess: () => {
        router.go(-1);
      },
    }
  );
};

onMounted(() => {
  document.title = 'Admin | Ulanyjy döretmek';
});
</script>
