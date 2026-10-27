<script setup lang="ts">
const props = defineProps<{
  username: string
}>()

const { data } = await useAsyncData(
  `heatmap-${props.username}`,
  () => $fetch<{ days: Array<{ date: string; count: number }> }>(`/api/contribution/${props.username}/heatmap`),
)

const { t } = useI18n()

// Empty days are the page's own surface, not a tint of it; filled days are the
// one signal colour at five steps, so the grid reads as one hue.
const levelColors = [
  'bg-base-300',
  'bg-primary/20',
  'bg-primary/40',
  'bg-primary/65',
  'bg-primary',
]
const cellSize = 11
const gap = 3

// Build 52-week grid
const grid = computed(() => {
  const days = data.value?.days ?? []
  const map = new Map(days.map(d => [d.date, d.count]))
  const today = new Date()
  const end = new Date(today)
  end.setDate(today.getDate() + (6 - today.getDay())) // Saturday

  const start = new Date(end)
  start.setDate(start.getDate() - 364)

  const weeks: Array<Array<{ date: string; count: number; level: number }>> = []
  let current: Array<{ date: string; count: number; level: number }> = []

  const d = new Date(start)
  while (d <= end) {
    const dateStr = d.toISOString().slice(0, 10)
    const count = map.get(dateStr) ?? 0
    const level = count === 0 ? 0 : count <= 2 ? 1 : count <= 5 ? 2 : count <= 9 ? 3 : 4
    current.push({ date: dateStr, count, level })

    if (d.getDay() === 6) {
      weeks.push(current)
      current = []
    }
    d.setDate(d.getDate() + 1)
  }
  if (current.length) weeks.push(current)
  return weeks
})

const totalContributions = computed(() => {
  return data.value?.days?.reduce((sum, d) => sum + d.count, 0) ?? 0
})

// Month labels: show when the first day of a new month appears
const monthLabels = computed(() => {
  if (!grid.value.length) return []
  const labels: Array<{ name: string; col: number }> = []
  let lastMonth = -1
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  grid.value.forEach((week, i) => {
    const m = new Date(week[0].date).getMonth()
    if (m !== lastMonth) {
      labels.push({ name: names[m], col: i })
      lastMonth = m
    }
  })
  return labels
})

function tooltip(day: { date: string; count: number }) {
  const d = new Date(day.date + 'T00:00:00')
  return `${day.count} contribution${day.count !== 1 ? 's' : ''} on ${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`
}
</script>

<template>
  <section class="plate heatmap">
    <div class="head">
      <p class="total">
        {{ totalContributions }} {{ t('contributions.inPastYear') }}
      </p>
      <div class="legend">
        <span>{{ t('contributions.less') }}</span>
        <span v-for="i in 5" :key="i" class="swatch" :class="levelColors[i - 1]" />
        <span>{{ t('contributions.more') }}</span>
      </div>
    </div>

    <div class="scroll">
      <!-- Month labels -->
      <div class="months">
        <span
          v-for="m in monthLabels"
          :key="m.col"
          class="month"
          :style="{ left: `${m.col * (cellSize + gap)}px` }"
        >
          {{ m.name }}
        </span>
      </div>

      <!-- Grid -->
      <div class="weeks">
        <!-- Day labels -->
        <div class="days" :style="{ gap: `${gap}px` }">
          <div
            v-for="(label, i) in ['', 'Mon', '', 'Wed', '', 'Fri', '']"
            :key="i"
            class="day"
            :style="{ height: `${cellSize}px` }"
          >
            {{ label }}
          </div>
        </div>

        <!-- Weeks -->
        <div v-for="(week, wi) in grid" :key="wi" class="week" :style="{ gap: `${gap}px` }">
          <div
            v-for="(day, di) in week"
            :key="di"
            class="cell"
            :class="levelColors[day.level]"
            :style="{ width: `${cellSize}px`, height: `${cellSize}px` }"
            :title="tooltip(day)"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.heatmap {
  padding: 1.25rem;
}

.head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.total {
  margin: 0;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-dim);
}

.legend {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.6875rem;
  color: var(--color-faint);
}

.swatch {
  display: block;
  width: 0.625rem;
  height: 0.625rem;
  border-radius: 2px;
}

.scroll {
  overflow-x: auto;
}

.months {
  position: relative;
  height: 1rem;
  margin-left: 2.25rem;
  margin-bottom: 0.25rem;
}

.month {
  position: absolute;
  top: 0;
  font-size: 0.625rem;
  color: var(--color-faint);
}

.weeks {
  display: flex;
  gap: 3px;
}

.days {
  display: flex;
  flex: none;
  flex-direction: column;
  width: 1.75rem;
}

.day {
  display: flex;
  align-items: center;
  font-size: 0.625rem;
  color: var(--color-faint);
}

.week {
  display: flex;
  flex-direction: column;
}

.cell {
  border-radius: 2px;
  cursor: default;
}
</style>
