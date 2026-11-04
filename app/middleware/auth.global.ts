export default defineNuxtRouteMiddleware((to) => {
  const store = useAppStore()
  const publicPaths = ['/login', '/privacy', '/terms', '/join']
  if (store.hydrated && !store.loggedIn && !publicPaths.includes(to.path)) {
    return navigateTo('/login')
  }
})

