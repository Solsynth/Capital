<template>
  <canvas ref="canvasRef" class="fixed top-0 left-0 w-screen h-screen opacity-50"></canvas>

  <v-container class="flex flex-col my-2 px-12 gap-[4rem]">
    <section class="content-section flex flex-col items-center justify-center text-center px-4">
      <img
        v-motion="{
          initial: {
            y: 100,
            opacity: 0,
          },
          enter: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.8 },
          },
        }"
        :src="Logo"
        alt="Company Logo"
        class="w-32 h-32 mb-4"
      />
      <h1 class="text-4xl font-bold">Welcome to {{ t("brandName") }}</h1>
      <p class="mt-2 text-lg">Building cool, open-source, and elegant apps for human.</p>
      <v-btn class="mt-4" color="primary" prepend-icon="mdi-arrow-down" href="#products">{{ t("learnMore") }}</v-btn>
    </section>

    <section class="content-section py-16" id="products">
      <div class="container mx-auto text-center">
        <h2 class="text-3xl font-bold">Our Projects</h2>
        <p>Take a peek of our works.</p>
        <v-card class="mt-12">
          <product-carousel class="carousel-section" :products="products as any[]" />
        </v-card>
      </div>
    </section>

    <v-row class="content-section">
      <v-col cols="12" md="6">
        <v-card>
          <v-list>
            <v-list-item
              title="GitHub"
              subtitle="The place hosts most of our public projects' code"
              prepend-icon="mdi-github"
              href="https://github.com/Solsynth"
              target="_blank"
            />
            <v-list-item
              lines="two"
              title="Solsynth Code Repository"
              subtitle="Our self-hosted git server, may contains some unpublished projects' code"
              prepend-icon="mdi-git"
              href="https://git.solsynth.dev/explore"
              target="_blank"
            />
          </v-list>
        </v-card>
      </v-col>
      <v-col cols="12" md="6" class="flex justify-end" order="first" order-md="last">
        <div class="text-right flex flex-col items-end">
          <h2 class="text-4xl font-bold">
            We<br />
            ❤️ Open-source
          </h2>
          <p class="text-md mt-3 max-w-2/3">
            No software can run without the support of open source software, and our software is no exception.
            Therefore, we feel it is important to contribute to open source as well.
          </p>
          <p class="text-grey mt-2">
            <v-icon icon="mdi-arrow-left" size="16" class="mb-0.5" />
            Check out our GitHub
          </p>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import Logo from "~/assets/logo-w-shadow.png"

import { getLocale } from "~/utils/locale"

const { t } = useI18n()

useHead({
  title: t("brandName"),
})

useSeoMeta({
  title: t("brandName"),
  description: t("indexIntroduce"),
  ogTitle: t("brandName"),
  ogDescription: t("indexIntroduce"),
  ogUrl: useRuntimeConfig().public.siteUrl,
  ogType: "website",
  ogSiteName: "Solsynth Capital",
})

const { data: products } = await useAsyncData("products", () => {
  return queryContent("/products")
    .where({ _locale: getLocale(), archived: { $ne: true } })
    .limit(5)
    .find()
})

const canvasRef = ref(null)

onMounted(() => {
  const isDarkMode = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches

  const canvas: HTMLCanvasElement = canvasRef.value!
  const ctx = canvas.getContext("2d")!
  const dpr = window.devicePixelRatio || 1
  canvas.width = window.innerWidth * dpr
  canvas.height = window.innerHeight * dpr

  let particles: Particle[] = []
  const numParticles = 100

  class Particle {
    x: number
    y: number
    vx: number
    vy: number
    size: number

    constructor() {
      this.x = Math.random() * canvas.width
      this.y = Math.random() * canvas.height
      this.vx = (Math.random() - 0.5) * 1.5
      this.vy = (Math.random() - 0.5) * 1.5
      this.size = Math.random() * 3 + 1
    }

    move() {
      this.x += this.vx
      this.y += this.vy
      if (this.x <= 0 || this.x >= canvas.width) this.vx *= -1
      if (this.y <= 0 || this.y >= canvas.height) this.vy *= -1
    }

    draw() {
      ctx.beginPath()
      ctx.arc(this.x * dpr, this.y * dpr, this.size * dpr, 0, Math.PI * 2)
      ctx.fillStyle = isDarkMode ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 0, 0, 0.8)"
      ctx.fill()
    }
  }

  function init() {
    particles = []
    for (let i = 0; i < numParticles; i++) {
      particles.push(new Particle())
    }
  }

  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        let dx = particles[i].x - particles[j].x
        let dy = particles[i].y - particles[j].y
        let distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < 100) {
          ctx.beginPath()
          ctx.moveTo(particles[i].x * dpr, particles[i].y * dpr)
          ctx.lineTo(particles[j].x * dpr, particles[j].y * dpr)
          ctx.strokeStyle = isDarkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)"
          ctx.lineWidth = 0.5 * dpr
          ctx.stroke()
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    particles.forEach((p) => {
      p.move()
      p.draw()
    })
    drawLines()
    requestAnimationFrame(animate)
  }

  init()
  animate()
})
</script>

<style scoped>
.carousel-section {
  height: 120rem;
}

.content-section {
  min-height: calc(100vh - 80px);
  display: flex;
  place-items: center;
}
</style>

<style>
body,
html {
  scroll-behavior: smooth;
}
</style>
