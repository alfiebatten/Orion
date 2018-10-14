<template>
  <div class = "initialLoadingSegment">
    <h1>
      Project <b>Orion</b>
    </h1>

    <h3>
      {{ Subtitle }}
    </h3>

    <button v-on:click = "loadDevicePicker">
      Initiate
    </button>
  </div>
</template>

<script>
import animateElements from "animejs";
import { EventBus } from "../eventBus.js";

export default {
  name: "initialLoadingSegment",
  props: {
    mainTitleDelay: {
      type: Number,
      required: false,
      default: 500
    },
    secondaryDurations: {
      type: Number,
      required: false,
      default: 500
    },
    initialTransformX: {
      type: String,
      required: false,
      default: "50px"
    },
    finalTransformX: {
      type: String,
      required: false,
      default: "0px"
    },
    renderedOpacity: {
      type: Number,
      required: false,
      default: 0.75
    }
  },
  data: () => {
    return {
      Subtitle: "Waiting for connectedClients event..."
    };
  },
  methods: {
    loadDevicePicker: function() {
      let divElement = this.$el;

      let configData = {
        primaryTitle: divElement.getElementsByTagName("h1"),
        subTitle: divElement.getElementsByTagName("h3"),
        initiaterButton: divElement.getElementsByTagName("button"),
        props: this._props
      };

      animateElements({
        targets: configData.primaryTitle,
        delay: configData.props.mainTitleDelay,
        opacity: -configData.props.renderedOpacity,
        duration: configData.props.secondaryDurations / 2,
        translateX: [
          configData.props.finalTransformX,
          configData.props.initialTransformX
        ],
        easing: "easeOutCubic",
        begin: () =>
          animateElements({
            targets: [configData.subTitle, configData.initiaterButton],
            opacity: -configData.props.renderedOpacity,
            duration: configData.props.secondaryDurations,
            easing: "easeOutCubic",
            delay: function(_, currentKeyframe) {
              return (
                (currentKeyframe * configData.props.secondaryDurations) / 10
              );
            },
            complete: () => EventBus.$emit("initiateTopologyLoader")
          })
      });
    },
    allocateButton: function(deviceLength) {
      let divElement = this.$el;
      let configData = {
        primaryTitle: divElement.getElementsByTagName("h1"),
        subTitle: divElement.getElementsByTagName("h3"),
        initiaterButton: divElement.getElementsByTagName("button"),
        props: this._props
      };

      this._data.Subtitle =
        "Connected to " +
        deviceLength.toString() +
        " client" +
        (deviceLength > 1 || deviceLength === 0 ? "s" : "");

      if (deviceLength > 0)
        animateElements({
          targets: configData.initiaterButton,
          opacity: configData.props.renderedOpacity,
          duration: configData.props.secondaryDurations,
          easing: "easeOutCubic"
        });
    },
    loadInitialElements: function() {
      let vm = this;
      return new Promise(function(resolvedPromise) {
        let divElement = vm.$el;
        let configData = {
          primaryTitle: divElement.getElementsByTagName("h1"),
          subTitle: divElement.getElementsByTagName("h3"),
          initiaterButton: divElement.getElementsByTagName("button"),
          props: vm._props
        };

        animateElements({
          targets: configData.primaryTitle,
          delay: configData.props.mainTitleDelay,
          opacity: configData.props.renderedOpacity,
          duration: configData.props.secondaryDurations / 2,
          translateX: [
            configData.props.initialTransformX,
            configData.props.finalTransformX
          ],
          easing: "easeOutCubic",
          begin: () =>
            animateElements({
              targets: configData.subTitle,
              opacity: configData.props.renderedOpacity,
              duration: configData.props.secondaryDurations,
              easing: "easeOutCubic",
              delay: function(_, currentKeyframe) {
                return (
                  (currentKeyframe * configData.props.secondaryDurations) / 10
                );
              },
              complete: () => resolvedPromise()
            })
        });
      });
    }
  },
  mounted: async function() {
    this.loadInitialElements();

    await EventBus.$on("connectedClients", parsedData => {
      setTimeout(
        () => this.allocateButton(parsedData.length),
        this._props.mainTitleDelay * 2
      );
    });
  }
};
</script>

<style scoped lang="stylus">
@import "./constants.styl"

.initialLoadingSegment
  position: absolute
  text-align: center
  width: 100vw
  z-index: 2
  height: 100%
  margin-top: 10%

  h1
    color: $colourConst.ShadeX.Primary
    z-index: 10
    font-weight: 500
    font-size: 6vw
    opacity: 0
    font-family: 'Montserrat', sans-serif

    b {
    	background-image: linear-gradient(to right, $colourConst.ShadeZ.DarkPurple, $colourConst.ShadeZ.LightBlue)
      background-size: 200% auto
    	-webkit-background-clip: text
    	-webkit-text-fill-color: transparent
    }

  h3
    margin-top: -10px
    color: $colourConst.ShadeX.Primary
    z-index: 10
    font-weight: 500
    font-family: 'Montserrat', sans-serif
    opacity: 0

  button
    opacity: 0
    padding: 15px 45px
    margin-bottom: 25px
    font-size: 1.3em
    border-style: none
    border-radius: 10px
    font-family: 'Montserrat', sans-serif
    color: $colourConst.ShadeY.Primary
    background: linear-gradient(to right, $colourConst.ShadeZ.DarkPurple, $colourConst.ShadeZ.LightBlue)
    transition: transform 0.25s, box-shadow 0.25s
    text-transform: uppercase
    outline: 0

    &:hover
      box-shadow: 0px 0px 50px rgba(0, 0, 0, 0.2)
      transform: translateY(2.5px)
      opacity: 1
      cursor: pointer
      outline: 0
      transition: all 0.25s
</style>
