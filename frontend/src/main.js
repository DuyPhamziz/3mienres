import { createApp } from "vue";
import { createPinia } from "pinia";
import router from "./router";

// Bootstrap 5 & FontAwesome CSS
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "@fortawesome/fontawesome-free/css/all.min.css";

import "./style.css";
import App from "./App.vue";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.mount("#app");
