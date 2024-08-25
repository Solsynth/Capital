<template>
  <v-dialog max-width="640">
    <template v-slot:activator="{ props }">
      <slot name="activator" v-bind="{ props }" />
    </template>

    <template v-slot:default="{ isActive }">
      <v-card title="Create Bot Key" :subtitle="`for bot @${props.item.name}`">
        <v-form @submit.prevent="(evt) => { submit(evt).then(() => isActive.value = false) }">
          <v-card-text class="pt-0 px-5">
            <v-expand-transition>
              <v-alert v-if="error" variant="tonal" type="error" class="text-xs mb-5">
                {{ t("errorOccurred", [error]) }}
              </v-alert>
            </v-expand-transition>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field label="Name" name="name" variant="outlined" hide-details />
              </v-col>
              <v-col cols="12" md="6">
                <v-textarea auto-grow rows="1" label="Description" name="description" variant="outlined" hide-details />
              </v-col>
              <v-col cols="12">
                <v-text-field type="number" label="Lifecycle" name="lifecycle" variant="outlined"
                              hint="How long will this key last (in seconds)" clearable persistent-hint />
              </v-col>
            </v-row>
          </v-card-text>

          <v-card-actions>
            <v-spacer />

            <v-btn
              text="Cancel"
              color="grey"
              @click="isActive.value = false"
            />
            <v-btn
              text="Create"
              type="submit"
            />
          </v-card-actions>
        </v-form>
      </v-card>
    </template>
  </v-dialog>
</template>

<script setup lang="ts">
const props = defineProps<{ item: any }>()
const emits = defineEmits(["completed"])

const { t } = useI18n()

const error = ref<null | string>(null)

const submitting = ref(false)

async function submit(evt: SubmitEvent) {
  const data: any = Object.fromEntries(new FormData(evt.target as HTMLFormElement).entries())
  if (!data.name) return

  data.lifecycle = parseInt(data.lifecycle)
  if (Number.isNaN(data.lifecycle)) delete data.lifecycle

  submitting.value = true

  const res = await solarFetch(`/cgi/id/dev/bots/${props.item.id}/keys`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (res.status != 200) {
    error.value = await res.text()
    throw new Error(error.value)
  } else {
    emits("completed")
  }

  submitting.value = false
}
</script>
