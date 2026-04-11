import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import {
  createValueApi,
  deleteValueApi,
  deleteValuesApi,
  getValueApi,
  getValuesApi,
  getValuesChartApi,
  importExcelApi,
  updateValueApi,
} from './valueApi';
import { computed } from 'vue';
import { toast } from 'vue-sonner';

// const useGetValues = (params) => {
//   return useQuery({
//     queryKey: ['values', params],
//     queryFn: () => getValuesApi(params?.value),
//     refetchOnWindowFocus: false,
//     refetchOnMount: true,
//   });
// };

const useGetValues = (queryKey, query) => {
  return useQuery({
    queryKey: query,
    queryFn: () => getValuesApi(queryKey?.value),
    refetchOnWindowFocus: false,
  });
};

const useGetValuesChart = (queryKey, query) => {
  return useQuery({
    queryKey: query,
    queryFn: () => getValuesChartApi(queryKey?.value),
    refetchOnWindowFocus: false,
  });
};
const useGetValue = (id) => {
  return useQuery({
    queryKey: ['value', id], // ✅ Vue Query auto unwraps refs
    queryFn: () => getValueApi(id.value), // ✅ use .value
    enabled: computed(() => !!id.value), // ✅ FIX
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
};
const useCreateValue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createValueApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['values'] });
      toast.success('Information created in successfully!');
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

const useImportExcel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: importExcelApi,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['values'] });
      toast.success('Excel imported successfully!');
    },

    onError: (err) => {
      toast.error(err);
    },
  });
};

const useUpdateValue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateValueApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['values'] });
      toast.success('Information updated in successfully!');
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

const useDeleteValue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteValueApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['values'] });
      toast.success('Information deleted in successfully!');
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

const useDeleteValues = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => deleteValuesApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['values'] });
      toast.success('Information deleted in successfully!');
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

export {
  useGetValues,
  useCreateValue,
  useDeleteValue,
  useDeleteValues,
  useGetValue,
  useUpdateValue,
  useImportExcel,
  useGetValuesChart,
};
