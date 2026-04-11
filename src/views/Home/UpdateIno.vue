<template>
  <div>
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
            <router-link :to="{ name: 'home' }">Maglumatlar</router-link>
          </a-breadcrumb-item>
          <a-breadcrumb-item>Maglumady üýtgetmek</a-breadcrumb-item>
        </a-breadcrumb>

        <h2 class="text-lg font-semibold">Maglumady üýtgetmek</h2>
      </div>
    </div>

    <Loading v-if="isLoading || isLoadingValue" />
    <Error v-else-if="isError || isErrorValue" :error="error || errorValue" />
    <div v-else class="bg-white mt-4 p-4 md:p-6 rounded-xl shadow-sm">
      <a-form layout="vertical" :model="form" @finish="handleSubmit">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <template v-for="field in data?.data" :key="field.key">
            <!-- NORMAL FIELD -->
            <a-form-item
              v-if="!field.isComputed"
              :label="field.name"
              :name="field.key"
              :rules="[{ required: true, message: `${field.name} hökmany` }]"
              class="mb-2"
            >
              <!-- STRING -->
              <a-input
                v-if="field.type === 'text'"
                v-model:value="form[field.key]"
                placeholder="Giriziň..."
              />

              <!-- NUMBER -->
              <a-input-number
                v-else-if="field.type === 'number'"
                v-model:value="form[field.key]"
                class="w-full"
              />

              <!-- DATE -->
              <a-date-picker
                v-else-if="field.type === 'date'"
                v-model:value="form[field.key]"
                class="w-full"
                format="YYYY-MM-DD HH:mm"
              />
            </a-form-item>

            <!-- COMPUTED -->
            <a-form-item v-else :label="field.name" class="mb-2">
              <a-input disabled placeholder="Auto hasaplanýar" />
            </a-form-item>
          </template>
        </div>

        <!-- 🔹 ACTIONS -->
        <div
          class="mt-6 pt-4 border-t flex flex-col sm:flex-row justify-end gap-3"
        >
          <a-button type="primary" :loading="isPending" html-type="submit">
            Ugrat
          </a-button>
        </div>
      </a-form>
    </div>
  </div>
</template>

<script setup>
import { ArrowLeftOutlined } from '@ant-design/icons-vue';
import { useGetUserFields } from '../User/useUsers';
import { computed, onMounted, ref, watch } from 'vue';
import { useGetValue, useUpdateValue } from './useValue';
import { useRoute, useRouter } from 'vue-router';
import dayjs from 'dayjs';

const router = useRouter();
const route = useRoute();
const id = computed(() => route.params.id);
const { isLoading, isError, error, data } = useGetUserFields();

const {
  isLoading: isLoadingValue,
  isError: isErrorValue,
  data: values,
  error: errorValue,
} = useGetValue(id);
const form = ref({});
const { mutate, isPending } = useUpdateValue();

const handleSubmit = () => {
  mutate(
    { data: form.value, id: id.value },
    {
      onSuccess: () => {
        router.go(-1);
      },
    }
  );
};
watch(
  [() => data.value, () => values.value],
  ([fieldsRes, valuesRes]) => {
    if (!fieldsRes || !valuesRes) return;

    const obj = {};

    const valueMap = {};

    (valuesRes.data || []).forEach((item) => {
      valueMap[item.fieldId] = item.value;
    });

    (fieldsRes.data || []).forEach((f) => {
      let v = valueMap[f.id];

      if (f.type === 'number') {
        v = v !== undefined ? Number(v) : undefined;
      }

      if (f.type === 'date' && v) {
        v = dayjs(v);
      }

      obj[f.key] = v;
    });

    form.value = obj;
  },
  { immediate: true }
);
onMounted(() => {
  document.title = 'Ulanyjy | Maglumady üýtgetmek ';
});
</script>
