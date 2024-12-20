export default defineNuxtConfig({
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/icon'
  ],
  css: [
    'leaflet/dist/leaflet.css'
  ],
  build: {
    transpile: ['leaflet']
  },
  ssr: false,
  compatibilityDate: '2024-12-18'
})
