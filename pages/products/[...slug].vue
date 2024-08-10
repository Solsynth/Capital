<template>
  <v-container>
    <article class="text-base prose prose-truegray xl:text-lg mx-auto">
      <content-doc>
        <template #empty>
          <v-empty-state
            icon="mdi-image-broken-variant"
            text="This product has no specific describe for it, yet."
            title="No Content"
            class="no-content-placeholder"
          >
            <template #actions>
              <v-btn prepend-icon="mdi-list-box" variant="plain" text="Back to index" to="/products" exact />
            </template>
          </v-empty-state>
        </template>
        <template #not-found>
          <v-empty-state
              icon="mdi-flask-empty-remove-outline"
              text="We haven't this product, yet."
              title="Not Found"
              class="no-content-placeholder"
          >
            <template #actions>
              <v-btn prepend-icon="mdi-list-box" variant="plain" text="Back to index" to="/products" exact />
            </template>
          </v-empty-state>
        </template>
      </content-doc>
    </article>
  </v-container>
</template>

<style scoped>
.no-content-placeholder {
  min-height: 0;
  max-height: 64rem;
}
</style>
<script setup lang="ts">
</script>
