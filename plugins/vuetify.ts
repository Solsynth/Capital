import "@mdi/font/css/materialdesignicons.min.css";

import "vuetify/styles";
import { createVuetify } from "vuetify";
import { md3 } from "vuetify/blueprints";
import * as components from "vuetify/components";
import * as labsComponents from "vuetify/labs/components";
import * as directives from "vuetify/directives";

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    directives,
    components: {
      ...components,
      ...labsComponents,
    },
    blueprint: md3,
    theme: {
      defaultTheme: "original",
      themes: {
        original: {
          colors: {
            primary: "#4a5099",
            secondary: "#2196f3",
            accent: "#009688",
            error: "#f44336",
            warning: "#ff9800",
            info: "#03a9f4",
            success: "#4caf50",
          },
        },
      },
    },
  });
  app.vueApp.use(vuetify);
});
