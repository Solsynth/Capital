<template>
  <v-carousel show-arrows="hover" cycle hide-delimiters>
    <v-carousel-item v-for="(item, i) in props.products" :key="i" :src="item?.thumbnail" cover>
      <v-sheet color="rgba(0, 0, 0, .4)" height="calc(100% + 24px)" class="p-5">
        <v-row class="fill-height" align="center" justify="center">
          <v-col class="text-center">
            <h1 class="text-4xl font-bold text-white" :class="item?.archived ? 'line-through' : null">
              {{ item?.title }}
            </h1>
            <p class="text-lg text-white">{{ item?.description }}</p>

            <div class="flex justify-center mt-3">
              <v-btn variant="text" color="white" prepend-icon="mdi-school" text="Learn more" :to="item._path" />
              <v-btn
                v-if="item?.url"
                variant="text"
                color="white"
                prepend-icon="mdi-launch"
                text="Open"
                :href="item?.url"
                target="_blank"
              />
            </div>
            <div class="flex justify-center">
              <v-chip
                v-if="item?.archived"
                label
                prepend-icon="mdi-archive"
                variant="text"
                color="warning"
                size="small"
              >
                Archived
              </v-chip>
            </div>
          </v-col>
        </v-row>
      </v-sheet>
    </v-carousel-item>
  </v-carousel>
</template>

<script setup lang="ts">
const props = defineProps<{ products: any[] }>()
</script>
