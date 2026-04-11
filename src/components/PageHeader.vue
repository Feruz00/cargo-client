<template>
  <div
    class="bg-white py-2 px-3 rounded shadow flex flex-row items-center justify-between mt-2"
  >
    <div class="flex gap-5 items-center">
      <slot />
      <div>
        {{ pageName }}
        <span v-if="isSuccess">(Jemi {{ filteredTagsCount }} sany)</span>
      </div>
      <a-button v-if="hasNonSortQuery" @click="removeQueries"
        >Filteri arassala</a-button
      >
    </div>

    <div class="flex items-center gap-2">
      <a-button
        v-if="selectedRows.length"
        danger
        type="primary"
        :loading="isDeleteSources"
        :disabled="isDeleteSources"
        @click.prevent="$emit('delete')"
      >
        Saýlanan ({{ selectedRows.length }} ) pozmak
      </a-button>

      <router-link :to="{ name: btnHref }" v-if="btn">
        <a-button type="primary">{{ btnName }}</a-button>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';
import { computed } from 'vue';
const router = useRouter(),
  route = useRoute();
defineProps({
  pageName: {
    type: String,
    required: true,
  },
  btnName: {
    type: String,
    required: true,
  },
  btn: {
    type: Boolean,
    default: true,
  },
  btnHref: {
    type: String,
    required: true,
  },
  btnPermission: {
    type: String,
    required: true,
  },
  selectedRows: {
    type: Array,
    default: () => [],
  },
  isDeleteSources: {
    type: Boolean,
    default: false,
  },
  isSuccess: {
    type: Boolean,
    default: false,
  },
  filteredTagsCount: {
    type: Number,
    default: 0,
  },
});

defineEmits(['delete']);

const removeQueries = () => {
  const name = route.name;
  const params = route.params;
  router.push({ name, params, query: {} });
};

const hasNonSortQuery = computed(() => {
  const queryKeys = Object.keys(route.query);
  if (queryKeys.length === 0) return false;
  return queryKeys.some((key) => key !== 'sort' && key !== 'order');
});
</script>
