import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';

import {
  createUserApi,
  deleteUserApi,
  deleteUsersApi,
  getUserApi,
  getUserFieldApi,
  getUsersApi,
  updateUserApi,
} from './userApi';
import { toast } from 'vue-sonner';
import { computed } from 'vue';

const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUserApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User created in successfully!');
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateUserApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User updated in successfully!');
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteUserApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted in successfully!');
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

const useDeleteUsers = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => deleteUsersApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted in successfully!');
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

const useGetUser = (id) => {
  return useQuery({
    queryKey: ['user', id], // ✅ Vue Query auto unwraps refs
    queryFn: () => getUserApi(id.value), // ✅ use .value
    enabled: computed(() => !!id.value), // ✅ FIX
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
};

const useGetUsers = (params) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => getUsersApi(params?.value),
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
};

const useGetUserFields = () => {
  return useQuery({
    queryKey: ['user-fields'],
    queryFn: () => getUserFieldApi(),
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
};
export {
  useCreateUser,
  useDeleteUser,
  useGetUser,
  useGetUsers,
  useUpdateUser,
  useDeleteUsers,
  useGetUserFields,
};
