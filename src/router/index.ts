/**
 * router/index.ts
 *
 * Application routes aligned with baby-shower flow
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/views/Admin/Dashboard.vue'
import Donations from '@/views/Admin/Donations.vue'
import EventConfig from '@/views/Admin/EventConfig.vue'
import EventList from '@/views/Admin/EventList.vue'
import Gifts from '@/views/Admin/Gifts.vue'
import Guests from '@/views/Admin/Guests.vue'
import Confirm from '@/views/Confirm.vue'
import Donate from '@/views/Donate.vue'
import EventHome from '@/views/EventHome.vue'
import GiftList from '@/views/GiftList.vue'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/evento/:event_code',
      name: 'event-home',
      component: EventHome,
    },
    {
      path: '/evento/:event_code/presentes',
      name: 'event-gifts',
      component: GiftList,
    },
    {
      path: '/evento/:event_code/confirmar',
      name: 'event-confirm',
      component: Confirm,
    },
    {
      path: '/evento/:event_code/doar',
      name: 'event-donate',
      component: Donate,
    },
    {
      path: '/admin/eventos',
      name: 'admin-events',
      component: EventList,
    },
    {
      path: '/admin/eventos/dashboard',
      name: 'admin-dashboard',
      component: Dashboard,
    },
    {
      path: '/admin/eventos/:event_id/configuracoes',
      name: 'admin-event-config',
      component: EventConfig,
    },
    {
      path: '/admin/eventos/:event_id/convidados',
      name: 'admin-event-guests',
      component: Guests,
    },
    {
      path: '/admin/eventos/:event_id/presentes',
      name: 'admin-event-gifts',
      component: Gifts,
    },
    {
      path: '/admin/eventos/:event_id/doacoes',
      name: 'admin-event-donations',
      component: Donations,
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

export default router
