<template>
  <div class="mx-5">
    <HeadHeader />
    <router-view />
  </div>
</template>
<script setup>
import { onBeforeUnmount, onMounted } from 'vue';
import { useSocketStore } from '../store/socket';
import HeadHeader from '../components/HeadHeader.vue';

const socketStore = useSocketStore();

onMounted(() => {
  socketStore.connect();
});
onBeforeUnmount(() => {
  socketStore.disconnect();
});
</script>
