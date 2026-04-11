// store/socket.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { io } from 'socket.io-client';
import { notification } from 'ant-design-vue';
import useAuthStore from './auth';
import useOnlineUser from './users';

export const useSocketStore = defineStore('socket', () => {
  const socket = ref(null);
  const isConnected = ref(false);
  const authStore = useAuthStore();
  const onlineUsers = useOnlineUser();
  const connect = () => {
    if (!authStore.user?.id) return;
    socket.value = io(import.meta.env.VITE_SOCKET_URL, {
      query: { id: authStore.user.id, role: authStore.user.role },
      transports: ['polling', 'websocket'],
      withCredentials: true,
    });

    socket.value.on('connect', () => {
      isConnected.value = true;
      notification.destroy('socket-disconnect');
      console.log('✅ Socket connected');
    });
    socket.value.on('onlineUsers', (data) => {
      onlineUsers.setData(data);
    });
    socket.value.on('connect_error', (err) => {
      console.error('❌ Socket connect error:', err.message);
    });

    socket.value.on('values:created', (payload) => {
      window.dispatchEvent(
        new CustomEvent('table:created', { detail: payload })
      );
    });

    socket.value.on('values:updated', (payload) => {
      window.dispatchEvent(
        new CustomEvent('table:updated', { detail: payload })
      );
    });

    socket.value.on('values:deleted', (payload) => {
      window.dispatchEvent(
        new CustomEvent('table:deleted', { detail: payload })
      );
    });

    socket.value.on('values:imported', (payload) => {
      window.dispatchEvent(
        new CustomEvent('table:bulkCreated', { detail: payload })
      );
    });

    socket.value.on('disconnect', (reason) => {
      isConnected.value = false;
      console.log('Socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        // server forced disconnect → can try reconnect
        socket.value.connect();
      }
    });
  };

  const disconnect = () => {
    if (socket.value) {
      socket.value.disconnect();
      socket.value = null;
      isConnected.value = false;
    }
  };

  return { socket, isConnected, connect, disconnect };
});
