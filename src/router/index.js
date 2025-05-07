import { createRouter, createWebHistory } from 'vue-router';
import dashboardView from '../views/dashboardView.vue';
import reportsView from '../views/reportsView.vue';
import configuracionView from '../views/configuracionView.vue'; // Nueva vista

const routes = [
  { path: '/dashboar', component: dashboardView },
  { path: '/reportes', component: reportsView },
  { path: '/configuracion', component: configuracionView }, // Nueva ruta
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;