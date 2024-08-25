<template>
  <v-dialog max-width="640">
    <template v-slot:activator="{ props }">
      <slot name="activator" v-bind="{ props }" />
    </template>

    <v-card title="Bot Keys" :subtitle="`of bot @${props.item.name}`">
      <v-card-text class="pb-0 pt-0">
        <v-card variant="outlined">
          <v-data-table-server
            density="default"
            :headers="dataDefinitions.keys"
            :items="keys"
            :items-length="pagination.keys.total"
            :loading="reverting.keys"
            v-model:items-per-page="pagination.keys.pageSize"
            @update:options="readKeys"
            item-value="id"
            class="overflow-y-auto text-no-wrap"
          >
            <template v-slot:item="{ item }: { item: any }">
              <tr>
                <td>{{ item.id }}</td>
                <td>
                  <p>{{ item.name }}</p>
                  <p class="text-xs">{{ item.description }}</p>
                </td>
                <td>{{ new Date(item.created_at).toLocaleString() }}</td>
                <td>
                  <dev-bot-token-grant :item="item">
                    <template #activator="{ props }">
                      <v-btn
                        v-bind="props"
                        variant="text"
                        size="x-small"
                        color="info"
                        icon="mdi-key-variant"
                      />
                    </template>
                  </dev-bot-token-grant>

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
                      <v-card :title="`Delete token ${item.name}?`">
                        <v-card-text>
                          This action will delete the token and invalid it immediately.
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
                            @click="() => { revokeKey(item); isActive.value = false }"
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
      </v-card-text>

      <div class="flex justify-end px-5.5 py-5">
        <dev-bot-token-create :item="props.item" @completed="readKeys({})">
          <template #activator="{ props }">
            <v-btn variant="flat" text="Create" append-icon="mdi-plus" v-bind="props" />
          </template>
        </dev-bot-token-create>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { solarFetch } from "~/utils/request"

const props = defineProps<{ item: any }>()

const keys = ref<any[]>([])

const error = ref<null | string>(null)

const dataDefinitions: { [id: string]: any[] } = {
  keys: [
    { align: "start", key: "id", title: "ID" },
    { align: "start", key: "name", title: "Name" },
    { align: "start", key: "created_at", title: "Created At" },
    { align: "start", key: "actions", title: "Actions", sortable: false },
  ],
}

const reverting = reactive({ keys: false })
const pagination = reactive({
  keys: { page: 1, pageSize: 5, total: 0 },
})

async function readKeys({ page, itemsPerPage }: { page?: number; itemsPerPage?: number }) {
  if (itemsPerPage) pagination.keys.pageSize = itemsPerPage
  if (page) pagination.keys.page = page

  reverting.keys = true
  const res = await solarFetch(
    `/cgi/id/dev/bots/${props.item.id}/keys?` +
    new URLSearchParams({
      take: pagination.keys.pageSize.toString(),
      offset: ((pagination.keys.page - 1) * pagination.keys.pageSize).toString(),
    }),
  )
  if (res.status !== 200) {
    error.value = await res.text()
  } else {
    const data = await res.json()
    keys.value = data["data"]
    pagination.keys.total = data["count"]
  }
  reverting.keys = false
}

onMounted(() => readKeys({}))

async function revokeKey(item: any) {
  submitting.value = true
  const res = await solarFetch(`/cgi/id/dev/bots/${item.account_id}/keys/${item.id}`, {
    method: "DELETE",
  })
  if (res.status !== 200) {
    error.value = await res.text()
  } else {
    await readKeys({ page: 1 })
  }
  submitting.value = false
}

const submitting = ref(false)
</script>
