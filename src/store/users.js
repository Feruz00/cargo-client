import { defineStore } from 'pinia';
import { ref } from 'vue';

const useOnlineUser = defineStore('online-users', () => {
  const onlineUsers = ref([]);

  const setData = (users) => {
    onlineUsers.value = users;
  };
  const checkUser = (id) => {
    return onlineUsers.value.find((user) => Number(user.userId) == id)
      ? true
      : false;
  };
  return {
    checkUser,
    setData,
  };
});

export default useOnlineUser;
