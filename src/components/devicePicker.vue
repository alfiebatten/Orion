<template>
  <div class="connectedClientContainer">
    <div class = "connectedListTitle">
      <h2>
        <b>3</b>
        Connected clients
      </h2>
    </div>

    <div class = "mainContainerPicker">
      <div class = "devicePicker">
        <div
          class = "deviceCard"
          v-for="user in userData"
          v-bind:key = "user"
          v-bind:class = "[user.enabled ? 'onlineTransform' : 'offlineTransform']"
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
      default: 0.75
    }
  },
  mounted: function() {
    EventBus.$on("showDeviceList", () => {
      this.LoadDevices();
    });
  },
  methods: {
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

      divElement.style.zIndex = "30";

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
          enabled: false
        }
      ]
    };
  }
};
</script>

<style scoped lang="stylus">
  $cardBackground = #212121
  $bluePrimary = #2980b9
  $redPrimary = #b52516
  $whitePrimary = #ecf0f1

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
        background-color: $whitePrimary;
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
        color: $whitePrimary
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
        background-color: $cardBackground
        display: grid
        grid-template-columns: 1fr
        grid-template-rows: 0.8fr 1fr

      .offlineTransform
        replicateGrid($redPrimary)

      .onlineTransform
        replicateGrid($bluePrimary)

        &:hover
          cursor: pointer

          .iconComponent
            .iconContainer
              transform: scale(1.15)
              transition: all 0.25s

              .icon
                transition: @transition
                color: darken($bluePrimary, 30%)
</style>
