<template>
  <div class="container max-w-xl mx-auto my-16 px-8">
    <div class="flex justify-between items-end mb-4 gap-4">
      <h1 class="text-4xl font-bold pl-1">Terms and Conditions</h1>
      <n-select
        v-model:value="chosenLanguage"
        :options="languageOptions"
        class="max-w-36"
      />
    </div>
    <nuxt-link v-for="term in terms" :key="term.path" :to="term.path">
      <n-card :title="term.title" hoverable class="mb-4">
        <p>{{ term.description }}</p>

        <template #footer>
          <p class="text-xs">
            Last updated at
            {{ new Date(term.updatedDate).toLocaleDateString() }}
          </p>
        </template>
      </n-card>
    </nuxt-link>
  </div>
</template>

<script setup>
import { NCard, NSelect } from "naive-ui";

const languages = ["zh", "en"];
const languageNames = ["简体中文", "English"];

const languageOptions = languages.map((lang) => ({
  label: languageNames[languages.indexOf(lang)],
  value: lang,
}));

const chosenLanguage = ref(languages[0]);

const { data: terms } = await useAsyncData(
  "terms",
  () =>
    queryCollection("terms")
      .where("lang", "=", chosenLanguage.value)
      .order("updatedDate", "DESC")
      .all(),
  { watch: [chosenLanguage] },
);
</script>

<style scoped>
/* Styling for the terms listing page */
</style>
