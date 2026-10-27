<script setup lang="ts">
import { computed } from "vue";
import { code128 } from "~/utils/barcode";

const props = defineProps<{ value: string }>();

/** Modules of blank either side, so a scanner can find the edges of the code. */
const QUIET_ZONE = 10;

const elements = computed(() => code128(props.value));
const width = computed(() =>
  (elements.value ?? []).reduce((total, element) => total + element.width, 0),
);

/** Bars only; the spaces are the gaps between them. */
const bars = computed(() => {
  const list: Array<{ offset: number; width: number }> = [];
  let offset = QUIET_ZONE;
  for (const element of elements.value ?? []) {
    if (element.bar) list.push({ offset, width: element.width });
    offset += element.width;
  }
  return list;
});
</script>

<template>
  <svg
    v-if="bars.length"
    :viewBox="`0 0 ${width + QUIET_ZONE * 2} 40`"
    preserveAspectRatio="none"
    shape-rendering="crispEdges"
    class="barcode"
    aria-hidden="true"
  >
    <rect
      v-for="(bar, index) in bars"
      :key="index"
      :x="bar.offset"
      y="0"
      :width="bar.width"
      height="40"
      fill="currentColor"
      class="barcode-bar"
      :style="{ '--bar': index }"
    />
  </svg>
</template>

<style scoped>
/* A barcode is printed matter: dark bars on light paper, in both themes. The
   surface is fixed so a light-theme page and a dark-theme page scan alike. */
.barcode {
  display: block;
  width: 100%;
  height: 100%;
  padding: 5px 6px;
  border-radius: 3px;
  background: #f7f4f7;
  color: #171618;
}

/* The code prints left to right, bar by bar, like a label printer laying down the head. */
.barcode-bar {
  animation: barcode-print 0.16s linear both;
  animation-delay: calc(var(--bar) * 2.4ms);
}

@keyframes barcode-print {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .barcode-bar {
    animation-delay: 0ms !important;
  }
}
</style>
