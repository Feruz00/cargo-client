const userRouter = [
  {
    name: 'users',
    path: '/admin/users',
    meta: { auth: true, role: ['admin'] },
    component: () => import('./Users.vue'),
  },
  {
    name: 'create-user',
    path: '/admin/users/new',
    meta: { auth: true, role: ['admin'] },
    component: () => import('./Create.vue'),
  },
  {
    name: 'update-user',
    path: '/admin/users/edit/:id',
    meta: { auth: true, role: ['admin'] },
    component: () => import('./Update.vue'),
  },
];

export default userRouter;
