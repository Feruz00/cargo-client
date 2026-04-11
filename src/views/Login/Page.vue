<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="w-full max-w-md">
      <!-- Card -->
      <a-card
        class="shadow-xl rounded-2xl border border-gray-100"
        :bodyStyle="{ padding: '32px' }"
      >
        <!-- Header -->
        <div class="text-center mb-6">
          <h1 class="text-2xl font-semibold text-gray-800">
            Ulgama hoş geldiňiz!
          </h1>
          <p class="text-gray-500 text-sm mt-1">
            Ulgama girmek üçin degişli meýdançalary dolduryň
          </p>
        </div>

        <!-- Form -->
        <a-form
          layout="vertical"
          :model="form"
          @finish="handleSubmit"
          :rules="rules"
        >
          <!-- Username -->
          <a-form-item
            label="Login"
            name="username"
            :rules="[{ required: true, message: 'Logini girizmeli' }]"
          >
            <a-input
              v-model:value="form.username"
              size="large"
              placeholder="Logini giriziň"
            />
          </a-form-item>

          <!-- Password -->
          <a-form-item
            label="Açar sözi"
            name="password"
            :rules="[{ required: true, message: 'Açar sözüni girizmeli' }]"
          >
            <a-input-password
              v-model:value="form.password"
              size="large"
              placeholder="Açar sözüni giriziň"
            />
          </a-form-item>

          <!-- Submit -->
          <a-form-item class="mb-2">
            <a-button
              type="primary"
              html-type="submit"
              size="large"
              block
              :loading="isLoading"
              class="h-11 rounded-lg"
            >
              Ulgama gir
            </a-button>
          </a-form-item>
        </a-form>

        <!-- Footer -->
        <div class="text-center mt-4 text-sm text-gray-500">
          © {{ new Date().getFullYear() }} Begler Ýoly
        </div>
      </a-card>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';

import { useRouter } from 'vue-router';
import { useLogin } from './useLogin';
const router = useRouter();

const { signin, isLoading } = useLogin();

const form = ref({
  username: '',
  password: '',
});

const rules = {
  username: [
    {
      required: true,
      message: 'Please enter your username',
      trigger: 'change',
    },
  ],
  password: [
    {
      required: true,
      message: 'Please enter your password',
      trigger: 'change',
    },
  ],
};

const handleSubmit = () => {
  signin(form.value, {
    onSuccess: ({ data }) => {
      const user = data;
      // console.log(user);
      if (user.role === 'admin') {
        router.push({ name: 'users' });
      } else {
        router.push({ name: 'home' });
      }
    },
  });
};
onMounted(() => {
  document.title = 'Begler Ýoly | Login';
});
</script>
