<script setup lang="ts">
const { t, locale } = useI18n()

// A readout, not a hero metric: four facts printed as one line of the
// instrument, so the numbers support the page instead of headlining it.
const years = computed(() => new Date().getFullYear() - 2024)

const stats = computed(() => [
  { value: String(Math.max(2, years.value)).padStart(2, '0'), suffix: '+', label: t('home.stats.years') },
  { value: '07', suffix: '', label: t('home.stats.products') },
  { value: '1K', suffix: '+', label: t('home.stats.users') },
  { value: '100', suffix: '%', label: t('home.stats.passion') },
])

const ariaLabel = computed(() =>
  locale.value === 'zh' ? '我们的数据' : 'Solsynth by the numbers',
)
</script>

<template>
  <section class="readout" :aria-label="ariaLabel">
    <div class="shell">
      <dl class="readout-grid">
        <div v-for="stat in stats" :key="stat.label" class="readout-cell">
          <dt class="readout-label">
            {{ stat.label }}
          </dt>
          <dd class="readout-figure">
            <span>{{ stat.value }}</span><span class="readout-suffix">{{ stat.suffix }}</span>
          </dd>
        </div>
      </dl>
    </div>
  </section>
</template>

<style scoped>
.readout {
  padding-block: 1.5rem;
  border-bottom: 1px solid var(--color-line-soft);
}

.readout-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem 1.5rem;
  margin: 0;
}

.readout-cell {
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
}

.readout-label {
  order: 2;
  font-size: 0.8125rem;
  color: var(--color-faint);
}

.readout-figure {
  order: 1;
  display: flex;
  align-items: baseline;
  margin: 0;
  font-family: var(--font-mono);
  font-size: 0.9375rem;
  font-weight: 500;
  line-height: 1;
  color: var(--color-base-content);
  font-variant-numeric: tabular-nums;
}

.readout-suffix {
  color: var(--color-dim);
}

@media (min-width: 768px) {
  .readout-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0;
  }

  .readout-cell {
    padding-inline: 1.5rem;
    border-left: 1px solid var(--color-line-soft);
  }

  .readout-cell:first-child {
    padding-left: 0;
    border-left: 0;
  }
}
</style>
