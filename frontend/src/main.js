import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import 'element-plus/dist/index.css'; // 引入样式文件

createApp(App)
   .use(router)
   .mount("#app");
