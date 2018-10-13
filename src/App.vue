<template>
  <div id="app">
    <!--
      <gradientBackgroundTopology
        delay = "100"
        animated
      ></gradientBackgroundTopology>
      We don't want to load this quiet yet!
    -->
    <initialLoadingSegment
      :mainTitleDelay = "500"
      :secondaryDurations = "500"
      initialTransformX = "500px"
      finalTransformX = "0px"
    ></initialLoadingSegment>
  </div>
</template>

<script>
import gradientBackgroundTopology from "./components/gradientBackgroundTopology.vue";
import initialLoadingSegment from "./components/initialLoadingSegment.vue";

export default {
  name: "app",
  components: {
    gradientBackgroundTopology,
    initialLoadingSegment
  }
};
</script>

<style lang="stylus">
  body, html
    margin: 0

  #app
    display: grid
    height: 100vh
    grid-template-columns: repeat(auto-fit, minmax(600px, 1fr))
    grid-template-rows: auto
    grid-gap: 6px
    background-color: #dcdde1;
    overflow: none
</style>
