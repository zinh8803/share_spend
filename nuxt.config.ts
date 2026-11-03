import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-01',
  srcDir: 'app',
  serverDir: 'server',
  ssr: false,
  devtools: { enabled: false },
  modules: ['@pinia/nuxt'],
  css: ['~/assets/css/main.css'],
  vite: { plugins: [tailwindcss()] },
  runtimeConfig: {
    mysql: {
      host: process.env.MYSQL_HOST || '127.0.0.1',
      port: Number(process.env.MYSQL_PORT || 3306),
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'sharespend'
    }
  },
  app: {
    head: {
      htmlAttrs: { lang: 'vi' },
      title: 'ShareSpend · Chi tiêu cá nhân & chia tiền nhóm',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Ghi thu chi cá nhân, chia tiền nhóm và theo dõi ai nợ ai.' },
        { name: 'theme-color', content: '#EDE6FF' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }
      ]
    }
  },
  build: { transpile: ['echarts', 'vue-echarts', 'resize-detector'] }
})
