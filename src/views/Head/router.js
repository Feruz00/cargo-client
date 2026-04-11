const headRouter = [
  {
    name: 'head',
    path: '/head',
    meta: { auth: true, role: ['head'] },
    component: () => import('./Page.vue'),
  },
  {
    name: 'head-users',
    path: '/head/users',
    meta: { auth: true, role: ['head'] },
    component: () => import('../User/Users.vue'),
  },

  {
    name: 'head-chart',
    path: '/head/chart',
    meta: { auth: true, role: ['head'] },
    component: () => import('./LineChart.vue'),
  },
];

export default headRouter;
