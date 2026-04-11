import { defineStore } from 'pinia';
import { ref } from 'vue';
import { currentUserApi } from '../views/Login/loginApi';

const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const isLoggedIn = ref(false);
  const isLoading = ref(false);

  const setUser = (userData) => {
    user.value = userData;

    isLoggedIn.value = true;
    isLoading.value = false;
  };

  const clearUser = () => {
    user.value = null;
    isLoggedIn.value = false;
    isLoading.value = false;
  };

  const viewItem = (...value) => {
    if (!user.value) return false;
    if (value.includes(user.value.role)) return true;
    return false;
  };

  const fetchCurrentUser = async () => {
    isLoading.value = true;
    await currentUserApi()
      .then((res) => {
        const { data } = res;
        // console.log('data', data)
        setUser(data);
        return res;
      })
      .catch(() => {
        // console.log('clear user')
        clearUser();
      })
      .finally(() => {
        isLoading.value = false;
      });
  };

  return {
    user,
    isLoggedIn,
    isLoading,
    setUser,
    clearUser,
    fetchCurrentUser,
    viewItem,
  };
});

export default useAuthStore;
