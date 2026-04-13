import { computed } from 'vue';
import { toast } from 'vue-sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import {
  createChartApi,
  deleteChartApi,
  getChartApi,
  getChartsApi,
} from './chartApi';

const useGetCharts = (queryKey) => {
  return useQuery({
    queryKey: ['charts', queryKey],
    queryFn: () => getChartsApi(queryKey?.value),
    refetchOnWindowFocus: false,
  });
};

const useGetChart = (id) => {
  return useQuery({
    queryKey: ['chart', id],
    queryFn: () => getChartApi(id.value),
    enabled: computed(() => !!id.value),
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
};

const useCreateChart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createChartApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['charts'] });
      toast.success('Chart created in successfully!');
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};

const useDeleteChart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteChartApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['charts'] });
      toast.success('Chart deleted in successfully!');
    },
    onError: (err) => {
      toast.error(err);
    },
  });
};
export { useCreateChart, useGetChart, useGetCharts, useDeleteChart };
