import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';

import { toast } from 'vue-sonner';
import { computed } from 'vue';
import {
  createFieldApi,
  deleteFieldApi,
  deleteFieldsApi,
  getFieldApi,
  getFieldsApi,
  updateFieldApi,
  updateOrdersApi,
} from './fieldApi';

const useCreateField = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createFieldApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fields'] });
      toast.success('User created in successfully!');
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

const useUpdateField = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateFieldApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fields'] });
      toast.success('Field updated in successfully!');
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

const useUpdateOrders = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => updateOrdersApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fields'] });
      toast.success('Field updated in successfully!');
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};
const useDeleteField = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteFieldApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fields'] });
      toast.success('Field deleted in successfully!');
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

const useDeleteFields = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => deleteFieldsApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fields'] });
      toast.success('Field deleted in successfully!');
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

const useGetField = (id) => {
  return useQuery({
    queryKey: ['field', id], // ✅ Vue Query auto unwraps refs
    queryFn: () => getFieldApi(id.value), // ✅ use .value
    enabled: computed(() => !!id.value), // ✅ FIX
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
};

const useGetFields = (params) => {
  return useQuery({
    queryKey: ['fields', params],
    queryFn: () => getFieldsApi(params?.value),
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
};

export {
  useCreateField,
  useDeleteField,
  useGetField,
  useGetFields,
  useUpdateField,
  useDeleteFields,
  useUpdateOrders,
};
