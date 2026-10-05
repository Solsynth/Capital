<script setup lang="ts">
import { Zap } from "@lucide/vue"

const { t } = useI18n()
</script>

<template>
  <span
    class="inline-flex items-center gap-2 rounded-full border border-dashed border-base-content/15 bg-base-100/40 px-3 py-1"
  >
    <Zap class="w-3.5 h-3.5 shrink-0 text-accent" aria-hidden="true" />
    <span class="font-mono text-[10px] uppercase tracking-[0.16em] opacity-60">
      {{ t("express.poweredBy") }}
    </span>
  </span>
</template>
