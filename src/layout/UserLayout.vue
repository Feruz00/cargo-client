<template>
  <div class="mx-5">
    <UserHeader />
    <router-view />
  </div>
</template>
<script setup>
import { onBeforeUnmount, onMounted } from 'vue';
import { useSocketStore } from '../store/socket';
import UserHeader from '../components/UserHeader.vue';

const socketStore = useSocketStore();

onMounted(() => {
  socketStore.connect();
});
onBeforeUnmount(() => {
  socketStore.disconnect();
});
</script>
