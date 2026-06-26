<script setup lang="ts">
const props = defineProps<{
  username: string
}>()

const { data } = await useAsyncData(
  `heatmap-${props.username}`,
  () => $fetch<{ days: Array<{ date: string; count: number }> }>(`/api/contribution/${props.username}/heatmap`),
)

const { t } = useI18n()

const levelColors = ['bg-base-300', 'bg-success/30', 'bg-success/50', 'bg-success/70', 'bg-success']
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
  <div class="card bg-base-200/60 border border-base-content/5 p-5">
    <div class="flex items-center justify-between mb-4">
      <p class="text-sm font-medium">{{ totalContributions }} {{ t('contributions.inPastYear') }}</p>
      <div class="flex items-center gap-1.5 text-xs opacity-50">
        <span>{{ t('contributions.less') }}</span>
        <span v-for="i in 5" :key="i" class="w-2.5 h-2.5 rounded-[2px]" :class="levelColors[i - 1]" />
        <span>{{ t('contributions.more') }}</span>
      </div>
    </div>

    <div class="overflow-x-auto">
      <!-- Month labels -->
      <div class="relative h-4 ml-[2.25rem] mb-1">
        <span
          v-for="m in monthLabels"
          :key="m.col"
          class="absolute text-[10px] opacity-50 top-0"
          :style="{ left: `${m.col * (cellSize + gap)}px` }"
        >
          {{ m.name }}
        </span>
      </div>

      <!-- Grid -->
      <div class="flex gap-[3px]">
        <!-- Day labels -->
        <div class="flex flex-col shrink-0" :style="{ gap: `${gap}px`, width: '1.75rem' }">
          <div
            v-for="(label, i) in ['', 'Mon', '', 'Wed', '', 'Fri', '']"
            :key="i"
            class="text-[10px] opacity-50 flex items-center"
            :style="{ height: `${cellSize}px` }"
          >
            {{ label }}
          </div>
        </div>

        <!-- Weeks -->
        <div v-for="(week, wi) in grid" :key="wi" class="flex flex-col" :style="{ gap: `${gap}px` }">
          <div
            v-for="(day, di) in week"
            :key="di"
            class="rounded-[2px] cursor-default transition-colors"
            :class="levelColors[day.level]"
            :style="{ width: `${cellSize}px`, height: `${cellSize}px` }"
            :title="tooltip(day)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
