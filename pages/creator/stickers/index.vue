<template>
  <v-container class="px-12">
    <div class="flex justify-between items-center mt-5">
      <div class="flex items-end gap-2">
        <h1 class="text-2xl">Stickers & packs</h1>
      </div>

      <div class="flex gap-2">
        <v-btn
          color="primary"
          text="New"
          append-icon="mdi-plus"
          variant="tonal"
          to="/dev/bots/new"
        />
      </div>
    </div>

    <div class="mt-5">
      <v-expansion-panels>
        <v-expansion-panel
          v-for="item in data"
          :key="'sticker-pack#'+item.id"
        >
          <template #title>
            <div class="flex items-center gap-2">
              <p>{{ item.name }}</p>
              <v-chip size="x-small" class="font-mono" rounded color="primary">#{{ item.id }}</v-chip>
            </div>
          </template>

          <template #text>
            <v-row>
              <v-col cols="12">
                <p><b>Description</b></p>
                <p>{{ item.description }}</p>
              </v-col>
              <v-col cols="12" md="6" lg="4">
                <p><b>Pack Prefix</b></p>
                <v-code class="font-mono mt-0.5 px-3 w-fit">
                  <span v-if="item.prefix.length == 0"><i>no prefix</i></span>
                  <span v-else>{{ item.prefix }}</span>
                </v-code>
              </v-col>
              <v-col cols="12">
                <p><b>Stickers</b></p>
                <v-card variant="outlined" class="mx-[-0.5ch] mt-1">
                  <creator-stickers-data-table :pack-id="item.id" :pack-prefix="item.prefix" />
                </v-card>
              </v-col>
            </v-row>
          </template>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>
  </v-container>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "creator-hub",
  middleware: ["auth"],
})

useHead({
  title: "Stickers",
})

const loading = ref(false)
const error = ref<null | string>(null)

const data = ref<any[]>([])

async function readPacks() {
  loading.value = true

  const resp = await solarFetch(`/cgi/uc/stickers/packs?take=10&offset=${data.value.length}`)
  if (resp.status != 200) {
    error.value = await resp.text()
  } else {
    const out = await resp.json()
    data.value.push(...out["data"])
  }

  loading.value = false
}

onMounted(() => readPacks())
</script>
