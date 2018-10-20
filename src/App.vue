<template>
  <div id="app">
    <vue-progress-bar></vue-progress-bar>

    <gradientBackgroundTopology
      :delay = "100"
      ref = "referenceGradientBackgroundTopology"
      animated
    ></gradientBackgroundTopology>

    <initialLoadingSegment
      :mainTitleDelay = "500"
      :secondaryDurations = "1000"
      initialTransformX = "500px"
      finalTransformX = "0px"
    ></initialLoadingSegment>

    <devicePicker></devicePicker>
    <deviceController></deviceController>

  </div>
</template>

<script>
import gradientBackgroundTopology from "./components/gradientBackgroundTopology.vue";
import initialLoadingSegment from "./components/initialLoadingSegment.vue";
import devicePicker from "./components/devicePicker.vue";
import deviceController from "./components/deviceController.vue";
import mousetrap from "mousetrap";
const mainWindow = require("electron").remote.getCurrentWindow();

export default {
  name: "app",
  mounted: function() {
    Mousetrap.bind(['command+r', 'ctrl+r'], () => {
      mainWindow.webContents.openDevTools()
      return false;
    });
    Mousetrap.bind(['command+e', 'ctrl+e'], () => {
      mainWindow.webContents.openDevTools()
      return false;
    });
  },
  components: {
    gradientBackgroundTopology,
    initialLoadingSegment,
    devicePicker,
    deviceController
  }
};
</script>

<style lang="stylus">
  @import "components/constants.styl"

  body, html
    margin: 0
    overflow: hidden

  #app
    display: grid
    height: 100vh
    grid-template-columns: repeat(auto-fit, minmax(600px, 1fr))
    grid-template-rows: auto
    grid-gap: 6px
    background-color: $colourConst.ShadeY.Primary;
    overflow: none;
    -webkit-app-region: drag;
</style>
