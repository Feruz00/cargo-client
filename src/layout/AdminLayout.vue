<template>
  <div class="mx-5">
    <AdminHeader />
    <router-view />
  </div>
</template>
<script setup>
import { onBeforeUnmount, onMounted } from 'vue';
import AdminHeader from '../components/AdminHeader.vue';
import { useSocketStore } from '../store/socket';

const socketStore = useSocketStore();

onMounted(() => {
  socketStore.connect();
});
onBeforeUnmount(() => {
  socketStore.disconnect();
});
</script>
