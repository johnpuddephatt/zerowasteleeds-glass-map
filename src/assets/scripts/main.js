// import Vue from 'vue';
import Vue from "vue/dist/vue.js";

import VueRouter from "vue-router";
import "leaflet/dist/leaflet.css";
import VueGtag from "vue-gtag";

Vue.use(VueRouter);

window.axios = require("axios");

import App from "./components/App.vue";
import Category from "./components/Category.vue";
import Entry from "./components/Entry.vue";

import NotFound from "./components/404.vue";

const routes = [
  {
    path: "/",
    component: App,
    name: "app",
    children: [
      {
        path: ":slug",
        component: Category,
        props: true,
        name: "category",
      },
    ],
  },
  { path: "*", component: NotFound },
];

const router = new VueRouter({
  routes, // short for `routes: routes`
});

Vue.use(
  VueGtag,
  {
    config: { id: "G-7PPC9H61Y7" },
  },
  router
);

const app = new Vue({
  router,
}).$mount("#app");
//
// const app = new Vue({
//   router,
//   render: (h) => {
//     return h();
//   },
// }).$mount('#app');
