import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-01',
  srcDir: 'app',
  serverDir: 'server',
  ssr: false,
  devtools: { enabled: false },
  experimental: {
    appManifest: false
  },
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
      title: 'ShareSpend · Quản lý chi tiêu cá nhân & chia tiền nhóm thông minh',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'google-site-verification', content: 'QjZaMzvUkvw0sdBDkcDFzyv1ML6bZ9lfKB2k4nOO4ug' },
        { name: 'description', content: 'ShareSpend - Ứng dụng ghi chép thu chi cá nhân, chia tiền nhóm du lịch, ăn uống photobooth và theo dõi công nợ ai nợ ai thông minh, minh bạch.' },
        { name: 'keywords', content: 'quản lý chi tiêu, chia tiền nhóm, sổ thu chi, chi tiêu cá nhân, chia tiền ăn uống, share tiền, ai nợ ai, sharespend' },
        { name: 'author', content: 'ShareSpend' },
        { name: 'robots', content: 'index, follow' },
        { name: 'theme-color', content: '#EDE6FF' },
        // Open Graph / Facebook
        { property: 'og:site_name', content: 'ShareSpend' },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://chitieu.blogcuavinh.id.vn' },
        { property: 'og:title', content: 'ShareSpend · Quản lý chi tiêu cá nhân & chia tiền nhóm thông minh' },
        { property: 'og:description', content: 'Ghi chép thu chi cá nhân, tạo nhóm chia tiền du lịch, ăn uống photobooth và theo dõi công nợ ai nợ ai minh bạch.' },
        { property: 'og:image', content: 'https://chitieu.blogcuavinh.id.vn/stickers/camera.png' },
        { property: 'og:locale', content: 'vi_VN' },
        // Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'ShareSpend · Quản lý chi tiêu cá nhân & chia tiền nhóm thông minh' },
        { name: 'twitter:description', content: 'Ghi chép thu chi cá nhân, tạo nhóm chia tiền du lịch, ăn uống photobooth và theo dõi công nợ ai nợ ai minh bạch.' },
        { name: 'twitter:image', content: 'https://chitieu.blogcuavinh.id.vn/stickers/camera.png' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'canonical', href: 'https://chitieu.blogcuavinh.id.vn' }
      ],
      script: [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'ShareSpend',
            url: 'https://chitieu.blogcuavinh.id.vn',
            description: 'Ứng dụng quản lý thu chi cá nhân và chia tiền nhóm thông minh theo phong cách Photobooth.',
            applicationCategory: 'FinanceApplication',
            operatingSystem: 'All',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'VND'
            }
          })
        }
      ]
    }
  },
  build: { transpile: ['echarts', 'vue-echarts', 'resize-detector'] }
})
