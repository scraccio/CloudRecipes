import { Buffer } from "buffer";
(window as any).global = window;
(window as any).Buffer = Buffer;

import { createApp } from "vue"
import App from "./App.vue"
import router from "./router"
import './style.css'

createApp(App).use(router).mount("#app")
