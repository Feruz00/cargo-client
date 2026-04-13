<template>
  <a-layout-header
    class="bg-white border-b border-gray-200 px-4 sticky top-0 z-50"
  >
    <div class="max-w-7xl mx-auto flex items-center h-16">
      <!-- Logo -->
      <router-link
        :to="{ name: 'home' }"
        class="flex items-center gap-3 px-2 py-1 rounded-lg hover:bg-gray-100 transition"
      >
        <img
          :src="logo"
          alt="Logo"
          class="h-10 w-auto object-contain transition-transform duration-200 hover:scale-105"
        />
        <span class="hidden sm:block text-lg font-semibold text-gray-800">
          Başlyk - {{ auth.user.name ?? '' }}
        </span>
      </router-link>

      <!-- Right Side -->
      <div class="flex items-center ml-auto gap-2">
        <div v-if="isDesktop" class="flex items-center gap-2">
          <a-menu
            mode="horizontal"
            :selectedKeys="[activeKey]"
            class="border-none"
          >
            <a-menu-item key="/head" @click="go('/head')">
              <ContainerOutlined class="mr-2" />
              Maglumatlar
            </a-menu-item>
            <a-menu-item key="/head/users" @click="go('/head/users')">
              <UserOutlined class="mr-2" />
              Ulanyjylar
            </a-menu-item>

            <!-- <a-menu-item key="/head/chart" @click="go('/head/chart')">
              <LineChartOutlined class="mr-2" />
              Grafiki seljerme
            </a-menu-item> -->
          </a-menu>

          <a-dropdown>
            <a-button type="text" class="flex items-center gap-2">
              <UserOutlined />
              <DownOutlined />
            </a-button>

            <template #overlay>
              <a-menu>
                <a-menu-item @click="handleLogout">
                  <LogoutOutlined class="mr-2" />
                  Ulgamdan çykmak
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>

        <div v-else>
          <a-button
            class="transition-transform duration-200 hover:scale-110"
            type="text"
            @click="isOpen = true"
          >
            <MenuOutlined />
          </a-button>
        </div>
      </div>
    </div>

    <!-- Mobile Drawer -->
    <a-drawer
      placement="left"
      :open="isOpen"
      @close="isOpen = false"
      width="260"
    >
      <div class="flex flex-col gap-2 mt-4">
        <a-button
          type="text"
          block
          class="flex items-center justify-start gap-2"
          @click="go('/head')"
        >
          <ContainerOutlined />
          Maglumatlar
        </a-button>

        <a-button
          type="text"
          block
          class="flex items-center justify-start gap-2"
          @click="go('/head/users')"
        >
          <UserOutlined />
          Ulanyjylar
        </a-button>

        <!-- <a-button
          type="text"
          block
          class="flex items-center justify-start gap-2"
          @click="go('/head/chart')"
        >
          <LineChartOutlined />
          Grafiki seljerme
        </a-button> -->

        <a-button
          danger
          block
          class="flex items-center justify-start gap-2"
          @click="handleLogout"
        >
          <LogoutOutlined />
          Ulgamdan çykmak
        </a-button>
      </div>
    </a-drawer>
  </a-layout-header>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import logo from '@/assets/begleryoly_logo.svg';

import {
  UserOutlined,
  AppstoreOutlined,
  LogoutOutlined,
  MenuOutlined,
  DownOutlined,
  LineChartOutlined,
  FundOutlined,
  ContainerOutlined,
} from '@ant-design/icons-vue';

import { useLogout } from '../views/Login/useLogin';
import useAuthStore from '../store/auth';

const route = useRoute();
const router = useRouter();

const isOpen = ref(false);
const isDesktop = ref(false);
const logoutMutation = useLogout();

const auth = useAuthStore();

const activeKey = computed(() => {
  if (route.name === 'head') return '/head';
  if (route.name === 'head-users') return '/head/users';
  if (route.name === 'head-chart') return '/head/chart';

  return '';
});

const checkScreen = () => {
  isDesktop.value = window.innerWidth >= 1150;
};

onMounted(() => {
  checkScreen();
  window.addEventListener('resize', checkScreen);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkScreen);
});

/* Navigation */
const go = (path) => {
  router.push(path);
  isOpen.value = false;
};

/* Close drawer on route change */
watch(
  () => route.path,
  () => {
    isOpen.value = false;
  }
);

/* Logout */
const handleLogout = () => {
  logoutMutation.signout(
    {},
    {
      onSuccess: () => {
        router.push('/login');
      },
    }
  );
};
</script>

<style scoped>
.ant-menu-item {
  @apply flex items-center;
}
</style>
