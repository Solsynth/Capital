<template>
  <v-container class="px-12">
    <div class="flex justify-between items-center mt-5">
      <div class="flex items-end gap-2">
        <h1 class="text-2xl">Stickers & packs</h1>
      </div>

      <div class="flex gap-2">
        <v-btn color="primary" text="New" append-icon="mdi-plus" variant="tonal" to="/creator/stickers/new" />
      </div>
    </div>

    <v-expand-transition>
      <v-alert v-if="error" variant="tonal" type="error" class="text-xs mt-5 mb-3">
        {{ t("errorOccurred", [error]) }}
      </v-alert>
    </v-expand-transition>

    <div class="mt-5">
      <v-expansion-panels>
        <v-expansion-panel v-for="item in data" :key="'sticker-pack#' + item.id">
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
              <v-col cols="12" md="6" lg="4">
                <p><b>Actions</b></p>
                <div class="flex mx-[-10px]">
                  <v-btn
                    variant="text"
                    size="x-small"
                    color="info"
                    icon="mdi-sticker-plus"
                    :to="`/creator/stickers/${item.id}/new`"
                  />
                  <v-btn
                    variant="text"
                    size="x-small"
                    color="warning"
                    icon="mdi-pencil"
                    :to="`/creator/stickers/${item.id}/edit`"
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
                      <v-card :title="`Delete sticker pack #${item.id}?`">
                        <v-card-text>
                          This action will delete the stickers belongs to it and cannot be undone.
                        </v-card-text>

                        <v-card-actions>
                          <v-spacer></v-spacer>

                          <v-btn text="Cancel" color="grey" @click="isActive.value = false"></v-btn>

                          <v-btn
                            text="Delete"
                            color="error"
                            @click="
                              () => {
                                deletePack(item)
                                isActive.value = false
                              }
                            "
                          />
                        </v-card-actions>
                      </v-card>
                    </template>
                  </v-dialog>
                </div>
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
import { solarFetch } from "~/utils/request"

definePageMeta({
  layout: "creator-hub",
  middleware: ["auth"],
})

useHead({
  title: "Stickers",
})

const { t } = useI18n()
const ua = useUserinfo()

const loading = ref(false)
const error = ref<null | string>(null)

const data = ref<any[]>([])

async function readPacks() {
  loading.value = true

  const res = await solarFetch(`/cgi/uc/stickers/packs?take=10&author=${ua.userinfo?.id}&offset=${data.value.length}`)
  if (res.status != 200) {
    error.value = await res.text()
  } else {
    const out = await res.json()
    data.value.push(...out["data"])
  }

  loading.value = false
}

onMounted(() => readPacks())

const submitting = ref(false)

async function deletePack(item: any) {
  submitting.value = true

  const res = await solarFetch(`/cgi/uc/stickers/packs/${item.id}`, {
    method: "DELETE",
  })
  if (res.status !== 200) {
    error.value = await res.text()
  } else {
    data.value = []
    await readPacks()
  }

  submitting.value = false
}
</script>
