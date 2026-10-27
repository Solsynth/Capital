<script setup lang="ts">
import { Zap } from '@lucide/vue'

const { t } = useI18n()
</script>

<template>
  <span class="express">
    <Zap class="express-icon" aria-hidden="true" />
    <span class="express-label">{{ t('express.poweredBy') }}</span>
  </span>
</template>

<style scoped>
.express {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.15rem 0.5rem;
  border: 1px solid var(--color-line-soft);
  border-radius: 999px;
}

.express-icon {
  width: 0.75rem;
  height: 0.75rem;
  color: var(--color-accent);
}

.express-label {
  font-family: var(--font-mono);
  font-size: 0.625rem;
  color: var(--color-faint);
}
</style>
