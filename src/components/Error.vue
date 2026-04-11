<template>
  <div
    class="bg-white py-2 px-3 rounded shadow mt-3 h-96 flex items-center flex-col gap-2 justify-center"
  >
    <WarningOutlined class="text-5xl text-red-500" />
    <h2 class="text-xl font-semibold text-red-600 mb-2">
      Oops! Something went wrong.
    </h2>
    <p class="text-gray-700 mb-4" v-if="error">
      Error Code: <strong>{{ error.response?.status }}</strong>
    </p>
    <p class="text-gray-500 mb-4">
      {{ error?.response?.data?.message || 'Please try again later.' }}
    </p>
    <div class="flex gap-4">
      <a-button type="primary" @click="refreshPage">Refresh</a-button>
      <router-link to="/" class="text-blue-600 hover:underline"
        >Go to Home</router-link
      >
    </div>
  </div>
</template>

<script setup>
import { WarningOutlined } from '@ant-design/icons-vue';

const props = defineProps(['error']);

const refreshPage = () => {
  location.reload();
};
</script>
