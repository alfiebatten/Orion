<template>
  <div id="app">

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


export default {
  name: "app",
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
