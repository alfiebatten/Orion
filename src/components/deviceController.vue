<template>
  <div class="connectedClientContainer">
    <div class = "connectedListTitle">
      <h2>
        Connected to:
        <b></b>
      </h2>
    </div>

    <div class = "mainContainerPicker">
      <div class = "devicePicker">
        <div
          class = "deviceCard"
          v-for="controlOptions in controlFunctions"
          :key="controlOptions.functionName"
          v-bind:class = "[controlOptions.requiresInput ? 'expandCard' : '']"
        >
          <div
            v-bind:class = "[controlOptions.enabled && controlOptions.function ? 'onlineTransform' : 'offlineTransform']"
          >
            <div class = "titleComponent">
              <h1>{{ controlOptions.functionName }}</h1>
            </div>

            <div v-if = "controlOptions.requiresInput" class = "iconAndInputComponent">
              <div class = "inputContainer">
                <input
                  v-bind:placeholder = "controlOptions.placeHolder"
                  v-bind:value = "nessescaryFunctions.Store.get(controlOptions.functionName)"
                >
              </div>
              <div class = "iconContainer">
                <i v-on:click = "prepareExecution(controlOptions, $event, 'requiresInput')" class="material-icons icon">{{ controlOptions.enabled && controlOptions.function ? 'chevron_right' : 'close' }}</i>
              </div>
            </div>

            <div v-else class = "iconComponent single">
              <div class = "iconContainer">
                <i v-on:click = "prepareExecution(controlOptions, $event)" class="material-icons icon">{{ controlOptions.enabled && controlOptions.function ? 'chevron_right' : 'close' }}</i>
              </div>
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
import Store from "electron-store";

export default {
  name: "controlFunctions",
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
    EventBus.$on("initiateController", computerName => {
      this.LoadControls(computerName);
    });
  },
  methods: {
    prepareExecution: function(identifier, eventElement, requiresInput) {
      if (!identifier.enabled) return;
      if (requiresInput) {
        let userInput = eventElement.target.parentElement.parentElement
          .getElementsByClassName("inputContainer")[0]
          .getElementsByTagName("input")[0].value;
        if (userInput !== "") {
          this._data.nessescaryFunctions.Store.set(
            identifier.functionName,
            userInput
          );
          identifier.function(userInput);
        } else {
          new Notification("Failed to call designated function", {
            body: "Input can not be blank"
          });
        }
      } else {
        identifier.function();
      }
    },
    LoadControls: function(computerName) {
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
      configData.primaryTitle.getElementsByTagName(
        "b"
      )[0].innerHTML = computerName;

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
      nessescaryFunctions: {
        Store: new Store()
      },
      controlFunctions: [
        {
          functionName: "Execute shell",
          requiresInput: true,
          placeHolder: "echo 'Hello world'",
          enabled: true,
          function: input => {
            this.emit("uniqueRoomNumber", input);
            //this.$sockets.emit("uniqueRoomNumber", input); // Implement functionality
          }
        },
        {
          functionName: "Shutdown",
          requiresInput: false,
          enabled: true
        },
        {
          functionName: "Restart",
          requiresInput: false,
          enabled: true
        },
        {
          functionName: "Max volume",
          requiresInput: false,
          enabled: true
        },
        {
          functionName: "Mute volume",
          requiresInput: false,
          enabled: true
        },
        {
          functionName: "Change background",
          requiresInput: true,
          placeHolder: "URL",
          enabled: true
        },
        {
          functionName: "Open URL",
          requiresInput: true,
          placeHolder: "URL",
          enabled: true
        },
        {
          functionName: "Set profile picture",
          requiresInput: true,
          placeHolder: "URL",
          enabled: true
        },
        {
          functionName: "Send notification",
          requiresInput: true,
          placeHolder: "Hello World",
          enabled: true
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
        justify-content: center
        font-family: 'Roboto', sans-serif;
        color: darken(pushedColour, 30%)

    .iconComponent
      display: flex
      justify-content: center

      .iconContainer
        background-color #e0f1f1
        width: 60px
        height: @width
        border-radius: @width
        transition: all 0.5s
        align-self: center

        .icon
          color: pushedColour
          font-size: @height
          transition: all 0.5s

     .iconAndInputComponent
       display: grid
       grid-template-columns: 4fr 1fr
       grid-gap: 25px
       padding-left: 25px

       .iconContainer
        background-color #e0f1f1
        width: 60px
        height: @width
        border-radius: @width
        transition: all 0.5s
        align-self: center

        .icon
          color: pushedColour
          font-size: @height
          transition: all 0.5s

       .inputContainer
         input
          width: 100%
          border: 0
          font-size: 2.5em;
          height: 100%
          border-radius: 3px
          box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2)
          transition: all 0.5s
          resize: none
          overflow: hidden

          &:hover
            box-shadow: 0px 0px 30px rgba(0, 0, 0, 0.45)
            transition: all 0.5s

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
      grid-auto-rows: 200px;
      grid-gap: 35px 35px;

      .expandCard
        grid-column: auto / span 2;

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
        grid-template-rows: 1fr 1fr 1fr

        .offlineTransform
          replicateGrid($redPrimary)

        .onlineTransform
          replicateGrid($bluePrimary)

        &:hover
          .onlineTransform
            cursor: pointer

            .iconComponent
              .iconContainer
                transform: scale(1.15)
                transition: all 0.25s

                .icon
                  transition: @transition
                  color: darken($bluePrimary, 30%)
</style>
