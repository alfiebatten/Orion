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

    <div class = "loggerComponent"></div>

  </div>
</template>

<script>
import animateElements from "animejs";
import SocketsIO from "socket.io-client";
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
      socketData: {
        CurrentSocket: SocketsIO("http://139.59.200.147:4001/")
      },
      Subtitle: "Waiting for connectedClients event..."
    };
  },
  methods: {
    awaitSocketDataFromServer: function() {
      this._data.socketData.CurrentSocket.on(
        "DisconnectionFromClient",
        uniqueIdentifier => {
          if (!uniqueIdentifier || uniqueIdentifier === null) return;
          new Notification("Socket: Client disconnected", {
            body: "User identification: " + uniqueIdentifier,
            icon: "https://suraj.codes/ASSETS/CLIENT/IMAGES/ORION/1024x1024.png"
          });

          EventBus.$emit("attemptToLoadDevicesAgain", uniqueIdentifier);
        }
      );

      this._data.socketData.CurrentSocket.on(
        "newConnectionFromClient",
        uniqueIdentifier => {
          if (!uniqueIdentifier || uniqueIdentifier === null) return;
          new Notification("Socket: Got new connection from client", {
            body: "User identification: " + uniqueIdentifier,
            icon: "https://suraj.codes/ASSETS/CLIENT/IMAGES/ORION/1024x1024.png"
          });

          EventBus.$emit("attemptToLoadDevicesAgain", uniqueIdentifier);
        }
      );
    },
    playUnitTheme: function() {
      let AudioElement = new Audio(
        "https://suraj.codes/ASSETS/CLIENT/AUDIO/UnitTheme.mp3"
      );
      AudioElement.play();
      AudioElement.addEventListener(
        "ended",
        function() {
          this.currentTime = 0;
          this.play();
        },
        false
      );
    },
    loadDevicePicker: function() {
      let divElement = this.$el;
      this.playUnitTheme();

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
      else
        animateElements({
          targets: configData.initiaterButton,
          opacity: -configData.props.renderedOpacity,
          duration: configData.props.secondaryDurations,
          easing: "easeOutCubic"
        });

      this.awaitSocketDataFromServer();
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
    console.log("Loading initial segment");
    this.loadInitialElements();

    await EventBus.$on("connectedClients", parsedData => {
      console.log("User connected; ", parsedData);
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

  .loggerComponent
    width: 100%
    height: @width
    //background-color: #212121
    display: grid
    display: grid
    height: 100%
    grid-template-columns: 9fr 1fr
    grid-template-rows: 9fr 1fr
    grid-gap: 0px 0px

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
