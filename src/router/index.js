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
      path: '/base64',
      name: 'base64',
      component: () => import('../views/Base64EncoderView.vue'),
    },
    {
      path: '/url-encoder',
      name: 'url-encoder',
      component: () => import('../views/UrlEncoderView.vue'),
    },
    {
      path: '/sql-formatter',
      name: 'sql-formatter',
      component: () => import('../views/SqlFormatterView.vue'),
    },
    {
      path: '/in-clause',
      name: 'in-clause',
      component: () => import('../views/InClauseView.vue'),
    },
    {
      path: '/jwt-decoder',
      name: 'jwt-decoder',
      component: () => import('../views/JwtDecoderView.vue'),
    },
    {
      path: '/uuid-generator',
      name: 'uuid-generator',
      component: () => import('../views/UuidGeneratorView.vue'),
    },
    {
      path: '/regex-tester',
      name: 'regex-tester',
      component: () => import('../views/RegexTesterView.vue'),
    },
    {
      path: '/cron-expression',
      name: 'cron-expression',
      component: () => import('../views/CronExpressionView.vue'),
    },
    {
      path: '/timestamp',
      name: 'timestamp',
      component: () => import('../views/TimestampConverterView.vue'),
    },
    {
      path: '/docker-compose-converter',
      name: 'docker-compose-converter',
      component: () => import('../views/DockerComposeConverterView.vue'),
    },
    {
      path: '/docker-command-builder',
      name: 'docker-command-builder',
      component: () => import('../views/DockerCommandBuilderView.vue'),
    },
    {
      path: '/dockerfile-generator',
      name: 'dockerfile-generator',
      component: () => import('../views/DockerfileGeneratorView.vue'),
    },
    {
      path: '/docker-compose-validator',
      name: 'docker-compose-validator',
      component: () => import('../views/DockerComposeValidatorView.vue'),
    },
    {
      path: '/docker-run-to-compose',
      name: 'docker-run-to-compose',
      component: () => import('../views/DockerRunToComposeView.vue'),
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
  ],
})

export default router
