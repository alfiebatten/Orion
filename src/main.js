import Vue from "vue";
import App from "./App.vue";
import VueResource from "vue-resource";
import VueProgressBar from "vue-progressbar"
import VueResourceProgressBarInterceptor from "vue-resource-progressbar-interceptor"
import "./registerServiceWorker";

Vue.config.productionTip = false;

Vue.use(VueResource);
Vue.use(VueProgressBar, {
  color: '#212121',
  failedColor: '#ff7979',
  thickness: '10px',
  transition: {
    speed: '0.25s',
    opacity: '0.6s',
    termination: 300
  },
  autoRevert: true,
  inverse: false
});

Vue.use(VueResourceProgressBarInterceptor);

new Vue({
  render: h => h(App)
}).$mount("#app");
