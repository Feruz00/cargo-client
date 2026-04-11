<template>
  <VueQueryDevtools />
  <Toaster position="top-center" richColors />
  <div class="font-sans">
    <RouterView />
  </div>
</template>
<script setup>
import { VueQueryDevtools } from '@tanstack/vue-query-devtools';

import { RouterView } from 'vue-router';
import { Toaster } from 'vue-sonner';
</script>
