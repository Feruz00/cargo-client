const fieldRouter = [
  {
    name: 'fields',
    path: '/admin/fields',
    meta: { auth: true, role: ['admin'] },
    component: () => import('./Fields.vue'),
  },
  {
    name: 'create-field',
    path: '/admin/fields/new',
    meta: { auth: true, role: ['admin'] },
    component: () => import('./Create.vue'),
  },
  {
    name: 'update-field',
    path: '/admin/fields/edit/:id',
    meta: { auth: true, role: ['admin'] },
    component: () => import('./Update.vue'),
  },
];

export default fieldRouter;
