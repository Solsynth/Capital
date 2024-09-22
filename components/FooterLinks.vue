<template>
  <div class="text-xs text-grey sidebar-footer transition-opacity duration-500">
    <div class="flex footer-links flex-wrap">
      <nuxt-link to="/terms/privacy-policy" class="hover:underline">Privacy Policy</nuxt-link>
      <nuxt-link to="/terms/user-agreement" class="hover:underline">Term of Service</nuxt-link>
    </div>
  </div>
</template>

<style scoped>
.sidebar-footer {
  opacity: 0.3;
}

.sidebar-footer:hover {
  opacity: 1;
}

.footer-links *:not(:last-child):after {
  content: "·";
  font-family: monospace;
  font-weight: bold;
  text-align: center;
  margin-left: 4px;
  margin-right: 4px;
  text-decoration: none !important;
  display: inline-block;
}
</style>
