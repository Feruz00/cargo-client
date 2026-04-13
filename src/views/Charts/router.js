const chartRoutes = [
  {
    name: 'head-chart',
    path: '/head/chart',
    meta: { auth: true, role: ['head'] },
    component: () => import('./Page.vue'),
  },
];

export default chartRoutes;
