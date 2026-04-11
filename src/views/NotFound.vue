<template>
  <div
    class="min-h-[80vh] bg-white px-6 py-24 text-center sm:py-32 lg:px-8 flex items-center justify-center -mt-16"
  >
    <div class="max-w-md">
      <p class="text-base font-semibold text-indigo-600">404</p>
      <h1
        class="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl"
      >
        Page not found
      </h1>
      <p class="mt-6 text-base leading-7 text-gray-600">
        Sorry, we couldn’t find the page you’re looking for.
      </p>
      <div class="mt-10">
        <router-link
          to="/"
          class="text-sm font-semibold text-indigo-600 hover:text-indigo-500"
        >
          ← Go back home
        </router-link>
      </div>
    </div>
  </div>
</template>
