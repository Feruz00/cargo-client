<template>
  <a-drawer
    v-model:visible="visible"
    title="Ulanyjy maglumatlary"
    placement="right"
    :width="640"
    @close="closeDrawer"
    class="custom-drawer"
    :mask-closable="true"
  >
    <template v-if="isLoading">
      <div class="flex justify-center items-center h-32">
        <a-spin />
      </div>
    </template>
    <template v-else-if="isError">
      <error :error="error" />
    </template>
    <template v-else-if="isSuccess">
      <div class="flex flex-col gap-6">
        <!-- USER INFO -->
        <div class="flex items-center gap-4">
          <div
            class="w-14 h-14 rounded-full bg-blue-500 text-white flex items-center justify-center text-xl font-semibold"
          >
            {{ data.data.user.name?.charAt(0).toUpperCase() }}
          </div>

          <div class="flex flex-col">
            <span class="text-lg font-semibold">
              {{ data.data.user.name }}
            </span>
            <span class="text-gray-500 text-sm">
              @{{ data.data.user.username }}
            </span>
          </div>
        </div>

        <!-- STATUS + ROLE -->
        <div class="flex flex-wrap gap-2">
          <a-tag
            :color="data.data.user.isActive ? 'green' : 'red'"
            class="px-3 py-1 text-sm"
          >
            {{ data.data.user.isActive ? 'Aktiw' : 'Doňdurylan' }}
          </a-tag>

          <a-tag color="blue" class="px-3 py-1 text-sm">
            {{ data.data.user.role }}
          </a-tag>
        </div>

        <!-- META INFO -->
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span class="text-gray-400">Soňky giriş:</span><br />
            <span class="font-medium">
              {{
                data.data.user.last_login
                  ? dayjs(data.data.user.last_login).format('DD/MM/YYYY HH:mm')
                  : '---'
              }}
            </span>
          </div>

          <div>
            <span class="text-gray-400">Döredilen:</span><br />
            <span class="font-medium">
              {{ dayjs(data.data.user.createdAt).format('DD/MM/YYYY HH:mm') }}
            </span>
          </div>
        </div>

        <!-- DIVIDER -->
        <div class="border-t pt-4">
          <div class="text-base font-semibold mb-3">
            Rugsatlar (Permissions)
          </div>

          <div class="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto pr-2">
            <a-tag
              v-for="perm in data.data.permissions"
              :key="perm.id"
              color="purple"
              class="px-3 py-1 text-sm"
            >
              {{ perm.field?.name }}
            </a-tag>
          </div>
        </div>
      </div>
    </template>
  </a-drawer>
</template>

<script setup>
import { useQueryClient } from '@tanstack/vue-query';
import { ref, watch } from 'vue';
import { useGetUser } from './useUsers';
import Error from '../../components/Error.vue';
import dayjs from 'dayjs';

const id = ref(null);
const visible = ref(false);
const props = defineProps({
  id: {
    type: [Number, String],
    default: null,
  },
});

const emit = defineEmits(['close']);
const queryClient = useQueryClient();
const closeDrawer = () => {
  visible.value = false;
  id.value = null;
  queryClient.removeQueries(['habar', id.value]);
  emit('close');
};

const {
  isFetching: isLoading,
  isError,
  isSuccess,
  data,
  error,
} = useGetUser(id);

watch(
  () => props.id,
  (newId) => {
    if (newId) {
      visible.value = true;
      id.value = newId;
    } else {
      visible.value = false;
      id.value = null;

      queryClient.removeQueries(['user', id.value]);
    }
  }
);
</script>
