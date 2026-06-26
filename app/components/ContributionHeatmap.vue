<script setup lang="ts">
const props = defineProps<{
  username: string
}>()

const { data } = await useAsyncData(
  `heatmap-${props.username}`,
  () => $fetch<{ days: Array<{ date: string; count: number }> }>(`/api/contribution/${props.username}/heatmap`),
)

const { t } = useI18n()

// Build 52-week grid (like GitHub)
const weeks = computed(() => {
  const days = data.value?.days ?? []
  if (!days.length) return []

  const map = new Map(days.map(d => [d.date, d.count]))
  const today = new Date()
  const end = new Date(today)
  // Find the end of the current week (Saturday)
  end.setDate(today.getDate() + (6 - today.getDay()))

  const start = new Date(end)
  start.setDate(start.getDate() - 364) // 52 weeks back

  const result: Array<Array<{ date: string; count: number; level: number }>> = []
  let currentWeek: Array<{ date: string; count: number; level: number }> = []

  const d = new Date(start)
  while (d <= end) {
    const dateStr = d.toISOString().slice(0, 10)
    const count = map.get(dateStr) ?? 0
    const level = count === 0 ? 0 : count <= 2 ? 1 : count <= 5 ? 2 : count <= 9 ? 3 : 4

    currentWeek.push({ date: dateStr, count, level })

    if (d.getDay() === 6) {
      result.push(currentWeek)
      currentWeek = []
    }
    d.setDate(d.getDate() + 1)
  }

  if (currentWeek.length) result.push(currentWeek)
  return result
})

const totalContributions = computed(() => {
  return data.value?.days?.reduce((sum, d) => sum + d.count, 0) ?? 0
})

const months = computed(() => {
  if (!weeks.value.length) return []
  const labels: Array<{ label: string; index: number }> = []
  let lastMonth = -1

  weeks.value.forEach((week, i) => {
    const firstDay = week[0]
    if (!firstDay) return
    const m = new Date(firstDay.date).getMonth()
    if (m !== lastMonth) {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      labels.push({ label: monthNames[m], index: i })
      lastMonth = m
    }
  })

  return labels
})

const levelColors = ['bg-base-300', 'bg-success/30', 'bg-success/50', 'bg-success/70', 'bg-success']

function tooltip(day: { date: string; count: number }) {
  const d = new Date(day.date + 'T00:00:00')
  return `${day.count} contribution${day.count !== 1 ? 's' : ''} on ${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`
}
</script>

<template>
  <div class="card bg-base-200/60 border border-base-content/5 p-5">
    <div class="flex items-center justify-between mb-3">
      <p class="text-sm font-medium">{{ totalContributions }} {{ t('contributions.inPastYear') }}</p>
      <div class="flex items-center gap-1 text-xs opacity-50">
        <span>{{ t('contributions.less') }}</span>
        <span v-for="i in 5" :key="i" class="w-2.5 h-2.5 rounded-sm" :class="levelColors[i - 1]" />
        <span>{{ t('contributions.more') }}</span>
      </div>
    </div>

    <div class="overflow-x-auto">
      <div class="inline-block">
        <!-- Month labels -->
        <div class="flex mb-1" :style="{ paddingLeft: '2rem' }">
          <div
            v-for="m in months"
            :key="m.index"
            class="text-[10px] opacity-50"
            :style="{ position: 'absolute', left: `${m.index * 13 + 32}px` }"
          >
            {{ m.label }}
          </div>
        </div>

        <!-- Grid -->
        <div class="flex gap-[3px]">
          <!-- Day labels -->
          <div class="flex flex-col gap-[3px] mr-1 mt-0">
            <div v-for="d in 7" :key="d" class="h-[11px] text-[10px] opacity-50 flex items-center" :class="{ 'invisible': d % 2 === 0 }">
              {{ ['', 'Mon', '', 'Wed', '', 'Fri', ''][d - 1] }}
            </div>
          </div>

          <!-- Weeks -->
          <div v-for="(week, wi) in weeks" :key="wi" class="flex flex-col gap-[3px]">
            <div
              v-for="(day, di) in week"
              :key="di"
              class="w-[11px] h-[11px] rounded-sm cursor-default"
              :class="levelColors[day.level]"
              :title="tooltip(day)"
            />
            <!-- Pad incomplete week -->
            <div
              v-for="p in (7 - week.length)"
              :key="'pad-' + p"
              class="w-[11px] h-[11px]"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
