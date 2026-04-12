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
          <a-breadcrumb-item>Täze maglumat</a-breadcrumb-item>
        </a-breadcrumb>

        <h2 class="text-lg font-semibold">Täze maglumat döretmek</h2>
      </div>
    </div>

    <Loading v-if="isLoading" />
    <Error v-else-if="isError" :error="error" />
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
                placeholder="Giriziň..."
              />

              <a-select
                v-else-if="field.type === 'enum'"
                v-model:value="form[field.key]"
                :options="
                  field.enums.map((row) => ({
                    value: row.name,
                    label: row.name,
                  }))
                "
                class="w-full"
                style="width: 100%"
                :placeholder="`${field.name} saýlaň`"
              />

              <!-- DATE -->
              <a-date-picker
                v-else-if="field.type === 'date'"
                v-model:value="form[field.key]"
                class="w-full"
                format="YYYY-MM-DD"
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
import { onMounted, ref, watch } from 'vue';
import { useCreateValue } from './useValue';
import { useRouter } from 'vue-router';
import dayjs from 'dayjs';

const { isLoading, isError, error, data } = useGetUserFields();

const form = ref({});
const router = useRouter();
const { mutate, isPending } = useCreateValue();

const handleSubmit = () => {
  mutate(form.value, {
    onSuccess: () => {
      router.go(-1);
    },
  });
};
watch(
  () => data.value,
  (val) => {
    if (!val) return;

    const obj = {};

    (data.value?.data || []).forEach((f) => {
      let v = val[f.key];

      if (f.type === 'date' && v) {
        v = dayjs(v);
      }

      obj[f.key] = v;
    });

    form.value = obj;
  }
);
onMounted(() => {
  document.title = 'Ulanyjy | Täze maglumat döretmek ';
});
</script>
