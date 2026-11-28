<script setup lang="ts">
const {
  title = "Solsynth",
  description = "",
  iconImage,
  backgroundImage = "/images/hero/background-og.png",
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
      background-color: #171618;
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
        opacity: 0.28;
      "
      alt=""
    />

    <!-- Warm obsidian overlay -->
    <div
      style="
        position: absolute;
        inset: 0;
        background: linear-gradient(
          135deg,
          rgba(23, 22, 24, 0.9) 0%,
          rgba(29, 29, 32, 0.78) 50%,
          rgba(23, 22, 24, 0.92) 100%
        );
      "
    />

    <!-- Subtle orange ambient glow -->
    <div
      style="
        position: absolute;
        top: 50%;
        left: 50%;
        width: 680px;
        height: 680px;
        transform: translate(-50%, -55%);
        background: radial-gradient(
          circle,
          rgba(249, 137, 0, 0.14) 0%,
          rgba(249, 137, 0, 0) 68%
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
      <div style="margin-bottom: 28px">
        <img
          v-if="iconImage"
          :src="iconImage"
          :alt="title"
          class="rounded-2xl"
          style="width: 120px; height: 120px; filter: invert(1) brightness(10)"
        />
        <svg
          v-else
          viewBox="0 0 640 640"
          fill="none"
          style="width: 120px; height: 120px"
        >
          <path
            d="M183.98 320.33A214 214 0 1 1 312 458.67A137.5 137.5 0 0 0 183.98 320.33Z"
            fill="#ffffff"
          />
          <path
            d="M312 458.67A137.5 137.5 0 1 1 183.98 320.33A214 214 0 0 0 312 458.67Z"
            fill="#f98900"
          />
        </svg>
      </div>

      <!-- Title -->
      <h1
        style="
          color: #edeaee;
          font-size: 64px;
          font-weight: 800;
          letter-spacing: -1px;
          margin: 0 0 12px 0;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.35);
        "
      >
        {{ title }}
      </h1>

      <!-- Description -->
      <p
        v-if="description"
        style="
          color: #c8c5ca;
          font-size: 24px;
          font-weight: 400;
          margin: 0;
          max-width: 640px;
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
        background: linear-gradient(90deg, #f98900 0%, #fdba55 50%, #f98900 100%);
      "
    />
  </div>
</template>
