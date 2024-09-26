<template>
  <v-expand-transition>
    <v-alert v-if="error" variant="tonal" type="error" class="text-xs mb-3">
      {{ t("errorOccurred", [error]) }}
    </v-alert>
  </v-expand-transition>

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
          <div class="item-texture-cell">
            <v-img
              cover
              aspect-ratio="1"
              width="28"
              height="28"
              color="grey-lighten-2"
              rounded="sm"
              :src="`${config.public.solarNetworkApi}/cgi/uc/attachments/${item.attachment.rid}`"
            >
              <template #placeholder>
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

            <v-code class="px-2 w-fit font-mono">
              {{ item.attachment.rid }}
            </v-code>
          </div>
        </td>
        <td>{{ item.name }}</td>
        <td>{{ props.packPrefix + item.alias }}</td>
        <td>
          <v-btn
            v-bind="props"
            variant="text"
            size="x-small"
            color="warning"
            icon="mdi-pencil"
            class="ms-[-8px]"
            :to="`/creator/stickers/${item.pack_id}/${item.id}/edit`"
          />

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
              <v-card :title="`Delete sticker #${item.id}?`">
                <v-card-text>
                  This action will delete this sticker, all content used it will no longer show your sticker.
                  But the attachment will still exists.
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
                    @click="() => { deleteSticker(item); isActive.value = false }"
                  />
                </v-card-actions>
              </v-card>
            </template>
          </v-dialog>
        </td>
      </tr>
    </template>
  </v-data-table-server>
</template>

<script setup lang="ts">
import { solarFetch } from "~/utils/request"

const config = useRuntimeConfig()
const { t } = useI18n()

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

const submitting = ref(false)

async function deleteSticker(item: any) {
  submitting.value = true

  const res = await solarFetch(`/cgi/uc/stickers/${item.id}`, {
    method: "DELETE",
  })
  if (res.status !== 200) {
    error.value = await res.text()
  } else {
    await readStickers({})
  }

  submitting.value = false
}
</script>

<style scoped>
.item-texture-cell {
  display: grid;
  grid-template-columns: 28px auto;
  gap: 6px;
  width: fit-content;
}
</style>
