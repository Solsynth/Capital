<template>
  <v-data-table-server
    density="compact"
    :headers="dataDefinitions.stickers"
    :items="stickers"
    :items-length="pagination.stickers.total"
    :loading="reverting.stickers"
    v-model:items-per-page="pagination.stickers.pageSize"
    @update:options="readStickers"
    item-value="id"
  >
    <template v-slot:item="{ item }: { item: any }">
      <tr>
        <td>{{ item.id }}</td>
        <td>
          <v-img
            cover
            aspect-ratio="1"
            width="28"
            height="28"
            color="grey-lighten-2"
            rounded="sm"
            :src="`${config.public.solarNetworkApi}/cgi/uc/attachments/${item.attachment.rid}`"
          >
            <template v-slot:placeholder>
              <div class="d-flex align-center justify-center fill-height">
                <v-progress-circular
                  size="x-small"
                  width="3"
                  color="grey-lighten-4"
                  indeterminate
                ></v-progress-circular>
              </div>
            </template>
          </v-img>
        </td>
        <td>{{ item.name }}</td>
        <td>{{ props.packPrefix + item.alias }}</td>
        <td>

        </td>
      </tr>
    </template>
  </v-data-table-server>
</template>

<script setup lang="ts">
import { solarFetch } from "~/utils/request"

const config = useRuntimeConfig()

const props = defineProps<{ packId: number, packPrefix?: string }>()

const error = ref<null | string>(null)

const dataDefinitions: { [id: string]: any[] } = {
  stickers: [
    { align: "start", key: "id", title: "ID" },
    { align: "start", key: "attachment", title: "Texture" },
    { align: "start", key: "name", title: "Name" },
    { align: "start", key: "alias", title: "Alias" },
    { align: "start", key: "actions", title: "Actions", sortable: false },
  ],
}

const stickers = ref<any>([])

const reverting = reactive({ stickers: false })
const pagination = reactive({
  stickers: { page: 1, pageSize: 5, total: 0 },
})

async function readStickers({ page, itemsPerPage }: { page?: number; itemsPerPage?: number }) {
  if (itemsPerPage) pagination.stickers.pageSize = itemsPerPage
  if (page) pagination.stickers.page = page

  reverting.stickers = true
  const res = await solarFetch(
    "/cgi/uc/stickers?" +
    new URLSearchParams({
      pack: props.packId.toString(),
      take: pagination.stickers.pageSize.toString(),
      offset: ((pagination.stickers.page - 1) * pagination.stickers.pageSize).toString(),
    }),
  )
  if (res.status !== 200) {
    error.value = await res.text()
  } else {
    const data = await res.json()
    stickers.value = data["data"]
    pagination.stickers.total = data["count"]
  }
  reverting.stickers = false
}

onMounted(() => readStickers({}))
</script>
