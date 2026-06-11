<script setup lang="ts">
const {
  title = "Solsynth",
  description = "",
  iconImage,
  backgroundImage = "/images/hero/background.png",
} = defineProps<{
  title?: string;
  description?: string;
  iconImage?: string;
  backgroundImage?: string;
}>();
</script>

<template>
  <div
    class="w-full h-full"
    style="
      font-family: &quot;Nunito&quot;, &quot;Noto Sans SC&quot;, sans-serif;
      position: relative;
      overflow: hidden;
    "
  >
    <!-- Background image -->
    <img
      :src="backgroundImage"
      style="
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
        opacity: 0.35;
      "
      alt=""
    />

    <!-- Dark overlay -->
    <div
      style="
        position: absolute;
        inset: 0;
        background: linear-gradient(
          135deg,
          rgba(15, 23, 42, 0.85) 0%,
          rgba(30, 41, 59, 0.75) 50%,
          rgba(15, 23, 42, 0.85) 100%
        );
      "
    />

    <!-- Grid pattern overlay -->
    <div
      style="
        position: absolute;
        inset: 0;
        background-image: radial-gradient(
          rgba(255, 255, 255, 0.04) 1px,
          transparent 1px
        );
        background-size: 32px 32px;
      "
    />

    <!-- Content area -->
    <div
      class="w-full h-full flex flex-col items-center justify-center p-16"
      style="position: relative; z-index: 1"
    >
      <!-- Logo -->
      <div style="margin-bottom: 32px">
        <img
          v-if="iconImage"
          :src="iconImage"
          :alt="title"
          class="rounded-2xl"
          style="width: 120px; height: 120px; filter: invert(1) brightness(10)"
        />
        <img
          v-else
          src="/favicon.png"
          alt="Solsynth"
          style="width: 120px; height: 120px; filter: invert(1) brightness(10)"
        />
      </div>

      <!-- Title -->
      <h1
        class="text-white"
        style="
          font-size: 64px;
          font-weight: 800;
          letter-spacing: -1px;
          margin: 0 0 12px 0;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        "
      >
        {{ title }}
      </h1>

      <!-- Description -->
      <p
        v-if="description"
        class="text-slate-400"
        style="
          font-size: 24px;
          font-weight: 400;
          margin: 0;
          max-width: 600px;
          text-align: center;
          line-height: 1.4;
        "
      >
        {{ description }}
      </p>
    </div>

    <!-- Bottom accent line -->
    <div
      style="
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, #6366f1, #3b82f6, #8b5cf6);
      "
    />
  </div>
</template>
