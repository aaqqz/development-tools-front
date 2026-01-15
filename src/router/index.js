import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/json-formatter',
      name: 'json-formatter',
      component: () => import('../views/JsonFormatterView.vue'),
    },
    {
      path: '/xml-formatter',
      name: 'xml-formatter',
      component: () => import('../views/XmlFormatterView.vue'),
    },
    {
      path: '/diff-checker',
      name: 'diff-checker',
      component: () => import('../views/DiffCheckerView.vue'),
    },
    {
      path: '/hash-generator',
      name: 'hash-generator',
      component: () => import('../views/HashGeneratorView.vue'),
    },
    {
      path: '/password-generator',
      name: 'password-generator',
      component: () => import('../views/PasswordGeneratorView.vue'),
    },
    {
      path: '/stack-trace',
      name: 'stack-trace',
      component: () => import('../views/StackTraceAnalyzerView.vue'),
    },
    {
      path: '/yaml-properties',
      name: 'yaml-properties',
      component: () => import('../views/YamlPropertiesView.vue'),
    },
    {
      path: '/case-converter',
      name: 'case-converter',
      component: () => import('../views/CaseConverterView.vue'),
    },
    {
      path: '/qr-generator',
      name: 'qr-generator',
      component: () => import('../views/QrGeneratorView.vue'),
    },
    {
      path: '/markdown-preview',
      name: 'markdown-preview',
      component: () => import('../views/MarkdownPreviewView.vue'),
    },
    {
      path: '/http-request',
      name: 'http-request',
      component: () => import('../views/HttpRequestView.vue'),
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
  ],
})

export default router
