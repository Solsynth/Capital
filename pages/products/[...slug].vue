<template>
  <v-container>
    <content-doc>
      <template #empty>
        <v-empty-state
          icon="mdi-image-broken-variant"
          text="This product has no spefifc describe for it, yet."
          title="No Content"
          class="no-content-placeholder"
        >
          <template #actions>
            <v-btn prepend-icon="mdi-list-box" variant="plain" text="Back to index" to="/products" exact />
          </template>
        </v-empty-state>
      </template>
    </content-doc>
  </v-container>
</template>

<style scoped>
.no-content-placeholder {
  min-height: 0;
  max-height: 64rem;
}
</style>
