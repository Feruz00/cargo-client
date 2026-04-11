import nProgress from 'nprogress'
export default (router) => {
  nProgress.configure({ showSpinner: false })
  router.beforeEach((to, from, next) => {
    nProgress.start() // Start the progress bar
    next() // Proceed to the route
  })

  router.afterEach(() => {
    nProgress.done() // Complete the progress bar
  })
}
