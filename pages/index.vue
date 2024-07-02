<template>
  <product-carousel class="carousel-section" :products="products as any[]" />

  <v-container>
    <v-row class="content-section">
      <v-col cols="12" md="6">
        <v-img src="/assets/logo.png" alt="Logo" max-width="300"></v-img>
      </v-col>
      <v-col cols="12" md="6" class="d-flex align-center">
        <div>
          <h1 class="text-4xl font-bold">Welcome to Solsynth</h1>
          <p class="text-lg mt-4">
            We specialize in creating software that delights users. Our passion is to develop intuitive, efficient, and
            beautiful software that everyone loves to use.
          </p>
          <v-btn prepend-icon="mdi-magnify" color="primary" class="mt-4 mx-[-8px]">Discover More</v-btn>
        </div>
      </v-col>
    </v-row>

    <v-row class="content-section">
      <v-col cols="12" class="text-center">
        <h2 class="text-3xl font-bold">Our Expertise</h2>
        <p class="text-lg mt-2">We excel in a wide range of software development services.</p>
      </v-col>
      <v-col cols="12" md="4" class="d-flex">
        <v-card class="pa-4">
          <v-icon large class="mb-4">mdi-laptop</v-icon>
          <h3 class="headline">Custom Software Development</h3>
          <p>
            We design and develop custom software solutions tailored to your business needs, ensuring high performance
            and scalability.
          </p>
        </v-card>
      </v-col>
      <v-col cols="12" md="4" class="d-flex">
        <v-card class="pa-4">
          <v-icon large class="mb-4">mdi-cellphone</v-icon>
          <h3 class="headline">Mobile App Development</h3>
          <p>Our team creates user-friendly and feature-rich mobile applications for both iOS and Android platforms.</p>
        </v-card>
      </v-col>
      <v-col cols="12" md="4" class="d-flex">
        <v-card class="pa-4">
          <v-icon large class="mb-4">mdi-web</v-icon>
          <h3 class="headline">Web Application Development</h3>
          <p>
            We build responsive and interactive web applications that provide a seamless user experience across all
            devices.
          </p>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="content-section">
      <v-col cols="12" class="text-center">
        <h2 class="text-3xl font-bold">Get in Touch</h2>
        <p class="text-lg mt-2">Ready to start your next project with us? We would love to hear from you.</p>
        <v-btn class="mt-3" color="primary">Contact Us</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
const { data: products } = await useAsyncData("products", () => queryContent("/products").limit(5).find())
</script>

<style scoped>
.carousel-section {
  height: 96rem;
}

.content-section {
  margin-top: 8rem;
  margin-bottom: 8rem;
}
</style>
