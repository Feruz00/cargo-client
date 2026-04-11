// src/plugins/scrollRestoration.js
import { nextTick } from 'vue'

const STORAGE_KEY = 'app_scroll_positions_v2'

export default function install(router) {
  const positions = new Map()
  let isPopState = false

  // Detect back/forward navigation
  window.addEventListener('popstate', () => {
    isPopState = true
    setTimeout(() => (isPopState = false), 100)
  })

  // Load saved scrolls
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      Object.entries(parsed).forEach(([key, value]) =>
        positions.set(key, value),
      )
    }
  } catch (_) {}

  const persist = () => {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(Object.fromEntries(positions)),
    )
  }

  const makeKey = (route) =>
    `${route.fullPath}-${window.history.state?.position ?? 0}`

  const save = (route) => {
    const selector = route.meta.scrollContainer || '.ant-table-body'
    const el = document.querySelector(selector) || document.documentElement
    if (!el) return

    const key = makeKey(route)
    positions.set(key, { top: el.scrollTop, left: el.scrollLeft })
    persist()
  }

  const restore = async (route) => {
    await nextTick()
    const selector = route.meta.scrollContainer || '.ant-table-body'
    const el = document.querySelector(selector) || document.documentElement
    if (!el) return

    const key = makeKey(route)
    const saved = positions.get(key)
    if (saved) {
      requestAnimationFrame(() => el.scrollTo(saved.left, saved.top))
    } else {
      requestAnimationFrame(() => el.scrollTo(0, 0))
    }
  }

  // Save before navigation
  router.beforeEach((to, from, next) => {
    if (from.matched.length && from.meta.saveScroll !== false) {
      save(from)
    }
    next()
  })

  // Restore after navigation
  router.afterEach(async (to) => {
    await nextTick()
    await new Promise((r) => setTimeout(r, 70))

    const key = makeKey(to)
    const hasSaved = positions.has(key)

    if (isPopState && hasSaved) {
      // Back/forward → restore old position
      await restore(to)
    } else {
      // New route → scroll top
      const selector = to.meta.scrollContainer || '.ant-table-body'
      const el = document.querySelector(selector) || document.documentElement
      requestAnimationFrame(() => el.scrollTo(0, 0))
    }
  })
}
