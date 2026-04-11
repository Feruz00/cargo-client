import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { currentUserApi, loginApi, logoutApi } from './loginApi';
import { toast } from 'vue-sonner';
import useAuthStore from '../../store/auth';

const useLogin = () => {
  const authStore = useAuthStore();
  const queryClient = useQueryClient();

  const {
    mutate: signin,
    isPending: isLoading,
    isSuccess,
    isError,
  } = useMutation({
    mutationFn: (data) => loginApi(data),
    onSuccess: (data) => {
      const { user } = data.data;

      authStore.setUser(user);

      queryClient.invalidateQueries(['auth']);
      toast.success('Ulanyjy ulgama üstünlikli girdi');
      return data;
    },
    onError: (err) => {
      toast.error(err);
    },
  });
  return { signin, isLoading, isSuccess, isError };
};

const useLogout = () => {
  const authStore = useAuthStore();
  const queryClient = useQueryClient();
  const {
    mutate: signout,
    isLoading,
    isSuccess,
    isError,
  } = useMutation({
    mutationFn: () => logoutApi(),
    onSuccess: () => {
      authStore.setUser(null);
      window.location.reload();
      queryClient.invalidateQueries(['auth']);
      toast.success('Ulanyjy üstünlikli çykdy');
    },
    onError: (err) => {
      toast.error(err);
    },
  });
  return { signout, isLoading, isSuccess, isError };
};
const useCurrentUser = () => {
  return useQuery({
    queryFn: currentUserApi,
    queryKey: ['current-user'],
  });
};

export { useLogin, useLogout, useCurrentUser };
