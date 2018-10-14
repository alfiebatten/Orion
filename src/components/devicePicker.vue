<template>
  <div class="connectedClientContainer">
    <div class = "connectedListTitle">
      <h2>
        <b>{{ userData.length }}</b>
        Connected clients
      </h2>
    </div>

    <div class = "mainContainerPicker">
      <div class = "devicePicker">
        <div
          class = "deviceCard"
          v-for="user in userData"
          v-bind:class = "[user.enabled ? 'onlineTransform' : 'offlineTransform']"
          v-on:click = "showControlOptions( user.enabled, user.computerName )"
        >
          <div class = "titleComponent">
            <h1>{{ user.computerName }}</h1>
          </div>
          <div class = "iconComponent">
            <div class = "iconContainer">
              <i class="material-icons icon">{{ user.enabled ? "chevron_right" : "close" }}</i>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import animateElements from "animejs";
import { EventBus } from "../eventBus.js";

export default {
  name: "devicePicker",
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
      default: 1
    }
  },
  mounted: function() {
    EventBus.$on("showDeviceList", () => {
      this.LoadDevices();
    });
  },
  methods: {
    showControlOptions: function(cardEnabled, cardElement) {
      if (!cardEnabled) return;
      let divElement = this.$el;

      let configData = {
        primaryTitle: divElement
          .getElementsByClassName("connectedListTitle")[0]
          .getElementsByTagName("h2")[0],
        deviceCards: divElement
          .getElementsByClassName("mainContainerPicker")[0]
          .getElementsByClassName("devicePicker")[0]
          .getElementsByClassName("deviceCard"),
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
            targets: configData.deviceCards,
            opacity: -configData.props.renderedOpacity,
            duration: configData.props.secondaryDurations / 2,
            delay: function(_, currentKeyframe) {
              return (
                (currentKeyframe * configData.props.secondaryDurations) / 10
              );
            },
            complete: () => {
              divElement.style.zIndex = "-1";
            },
            begin: () =>
              setTimeout(
                () => EventBus.$emit("initiateController", cardElement),
                configData.deviceCards * 10
              )
          })
      });
    },
    LoadDevices: function() {
      let divElement = this.$el;

      let configData = {
        primaryTitle: divElement
          .getElementsByClassName("connectedListTitle")[0]
          .getElementsByTagName("h2")[0],
        deviceCards: divElement
          .getElementsByClassName("mainContainerPicker")[0]
          .getElementsByClassName("devicePicker")[0]
          .getElementsByClassName("deviceCard"),
        props: this._props
      };
      divElement.style.zIndex = "5";

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
            targets: configData.deviceCards,
            opacity: configData.props.renderedOpacity,
            duration: configData.props.secondaryDurations / 2,
            delay: function(_, currentKeyframe) {
              return (
                (currentKeyframe * configData.props.secondaryDurations) / 10
              );
            }
          })
      });
    }
  },
  data: () => {
    return {
      userData: [
        {
          computerName: "Olivers PC",
          enabled: true
        },
        {
          computerName: "Nil-a-tron",
          enabled: false
        },
        {
          computerName: "Home desktop",
          enabled: true
        },
        {
          computerName: "Surajs mac",
          enabled: true
        },
        {
          computerName: "Amys laptop",
          enabled: false
        },
        {
          computerName: "The TARDIS",
          enabled: true
        }
      ]
    };
  }
};
</script>

<style scoped lang="stylus">
  @import "./constants.styl"

  replicateGrid(pushedColour)
    .titleComponent
      display: flex
      justify-content: center

      h1
        font-size: 25px;
        font-family: 'Roboto', sans-serif;
        color: pushedColour;

    .iconComponent
      display: flex
      justify-content: center

      .iconContainer
        background-color: $colourConst.ShadeY.Primary;
        height: 50px;
        transition: all 0.5s;
        width: @height;
        border-radius: @height;

        .icon
          color: pushedColour;
          font-size: @height;
          transition: @transition

  .connectedClientContainer
    position: absolute
    height: 100%
    width: 100%
    z-index: -5
    display: grid
    height: 100%
    grid-template-columns: 100%
    grid-template-rows: 50px 1fr
    grid-gap: 20px 20px

    .connectedListTitle
      text-align: center

      h2
        font-family: 'Montserrat', sans-serif
        text-transform: uppercase
        color: lighten($colourConst.ShadeY.Primary, 15%)
        mix-blend-mode: difference
        font-weight: 300
        opacity: 0

        b
          font-weight: 700

  .mainContainerPicker
    overflow: scroll
    padding: 50px

    .devicePicker
      display: grid;
      align-self: center;
      justify-content: center;
      grid-template-columns: repeat(auto-fill, 225px);
      grid-auto-rows: minmax(160px, auto);
      grid-gap: 35px 35px;

      .deviceCard
        border-radius: 15px;
        grid-column-start: auto;
        grid-row-start: auto;
        border: 0;
        opacity: 0;
        transition: all 0.25s;
        background-color: $colourConst.ShadeX.Primary
        display: grid
        grid-template-columns: 1fr
        grid-template-rows: 0.8fr 1fr

      .offlineTransform
        replicateGrid($colourConst.ShadeZ.LightRed)

      .onlineTransform
        replicateGrid($colourConst.ShadeZ.DarkBlue)

        &:hover
          cursor: pointer

          .iconComponent
            .iconContainer
              transform: scale(1.15)
              transition: all 0.25s

              .icon
                transition: @transition
                color: darken($colourConst.ShadeZ.DarkBlue, 30%)
</style>
