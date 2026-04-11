const homeRouter = [
  {
    name: 'home',
    path: '/',
    meta: { auth: true, role: 'user' },
    component: () => import('./Page.vue'),
  },
  {
    name: 'new-info',
    path: '/info/new',
    meta: { auth: true, role: 'user' },
    component: () => import('./Create.vue'),
  },
  {
    name: 'update-info',
    path: '/info/:id',
    meta: { auth: true, role: 'user' },
    component: () => import('./UpdateIno.vue'),
  },
];

export default homeRouter;
