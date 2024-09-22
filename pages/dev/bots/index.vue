<template>
  <v-container class="px-12">
    <div class="flex justify-between items-center mt-5">
      <div class="flex items-end gap-2">
        <h1 class="text-2xl">Bots</h1>
        <v-chip rounded="xl" size="small" class="font-mono mb-0.5">
          {{ pagination.bots.total }}/{{ currentBotLimit }} quota
        </v-chip>
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
      <v-card>
        <v-data-table-server
          density="compact"
          :headers="dataDefinitions.bots"
          :items="bots"
          :items-length="pagination.bots.total"
          :loading="reverting.bots"
          v-model:items-per-page="pagination.bots.pageSize"
          @update:options="readBots"
          item-value="id"
        >
          <template v-slot:item="{ item }: { item: any }">
            <tr>
              <td>{{ item.id }}</td>
              <td>{{ item.name }}</td>
              <td>{{ new Date(item.created_at).toLocaleString() }}</td>
              <td>
                <dev-bot-token-dialog :item="item">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      variant="text"
                      size="x-small"
                      color="info"
                      icon="mdi-key"
                    />
                  </template>
                </dev-bot-token-dialog>

                <v-dialog max-width="480">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      variant="text"
                      size="x-small"
                      color="error"
                      icon="mdi-delete"
                      :disabled="submitting"
                    />
                  </template>

                  <template v-slot:default="{ isActive }">
                    <v-card :title="`Delete bot ${item.name}?`">
                      <v-card-text>
                        This action will delete the bot and all resources related to this bot and cannot be undone.
                      </v-card-text>

                      <v-card-actions>
                        <v-spacer></v-spacer>

                        <v-btn
                          text="Cancel"
                          color="grey"
                          @click="isActive.value = false"
                        ></v-btn>

                        <v-btn
                          text="Delete"
                          color="error"
                          @click="() => { deleteBot(item); isActive.value = false }"
                        />
                      </v-card-actions>
                    </v-card>
                  </template>
                </v-dialog>
              </td>
            </tr>
          </template>
        </v-data-table-server>
      </v-card>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { solarFetch } from "~/utils/request"

definePageMeta({
  layout: "dev-portal",
})

useHead({
  title: "Bots",
})

const auth = useUserinfo()

const error = ref<null | string>(null)

const dataDefinitions: { [id: string]: any[] } = {
  bots: [
    { align: "start", key: "id", title: "ID" },
    { align: "start", key: "name", title: "Name" },
    { align: "start", key: "created_at", title: "Created At" },
    { align: "start", key: "actions", title: "Actions", sortable: false },
  ],
}

const bots = ref<any>([])

const currentBotLimit = computed(() => auth.userinfo?.perm_nodes["CreateBots"] ?? 0)

const reverting = reactive({ bots: false })
const pagination = reactive({
  bots: { page: 1, pageSize: 5, total: 0 },
})

async function readBots({ page, itemsPerPage }: { page?: number; itemsPerPage?: number }) {
  if (itemsPerPage) pagination.bots.pageSize = itemsPerPage
  if (page) pagination.bots.page = page

  reverting.bots = true
  const res = await solarFetch(
    "/cgi/id/dev/bots?" +
    new URLSearchParams({
      take: pagination.bots.pageSize.toString(),
      offset: ((pagination.bots.page - 1) * pagination.bots.pageSize).toString(),
    }),
  )
  if (res.status !== 200) {
    error.value = await res.text()
  } else {
    const data = await res.json()
    bots.value = data["data"]
    pagination.bots.total = data["count"]
  }
  reverting.bots = false
}

onMounted(() => readBots({}))

const submitting = ref(false)

async function deleteBot(item: any) {
  submitting.value = true

  const res = await solarFetch(`/cgi/id/dev/bots/${item.id}`, {
    method: "DELETE",
  })
  if (res.status !== 200) {
    error.value = await res.text()
  } else {
    await readBots({ page: 1 })
  }

  submitting.value = false
}
</script>
