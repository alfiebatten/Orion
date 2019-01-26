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
          v-bind:class = "[user.dangerMode ? classes.danger : user.enabled ? classes.online : classes.offline]"
          v-on:click = "showControlOptions( user.enabled, user.computerName )"
          @contextmenu="contextMenuObserver($event)"
        >
          <div class = "imageComponent">
            <img v-bind:src = "user.screenShot">
          </div>
          <div class = "mainContent">
            <h3><span style = "opacity: 0.5">IP ADDR · </span>{{ user.IP }}</h3>
            <h1>{{ user.OSPlatform }}</h1>
            <h2><span style = "opacity: 0.5">OS · </span>{{ user.OSRelease }}</h2>
          </div>
          <div class = "statisticContent">
            <div class = "profilePicture">
              <img src = "https://media.licdn.com/dms/image/C4D03AQGTabNv25R9qQ/profile-displayphoto-shrink_200_200/0?e=1553731200&v=beta&t=AIvHH3ZZav3zGYqPnDZ4QrhM6gdPMFZz7aAWpffUMrI">
            </div>
            <div class = "userInformation">
              <h3>{{ allocateContentOfCardTitleComponent(user.computerName) }}</h3>
              <h4>Uptime: <span>15324ms</span></h4>
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
import SocketsIO from "socket.io-client";
import vueAlert from 'sweetalert';

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
    this.loadDevicesIntoObj();
    EventBus.$on("showDeviceList", () => {
      this.LoadDevices();
    });
    EventBus.$on("attemptToLoadDevicesAgain", () => {
      this.loadDevicesIntoObj();
    });
  },
  methods: {
    contextMenuObserver: function(event){
      let currentElementName = event.path[1].getElementsByTagName('h1')[0].innerHTML
      swal({
        title: "Rename card",
        text: `Would you like to rename: ${currentElementName}`,
        icon: "warning",
        buttons: true,
        dangerMode: true,
      }).then( () => {
        vueAlert("Input selection here", {
          content: "input",
        })
        .then((value) => {
          if (value === "null" || value === "" || !value) return
          vueAlert(`Synced: ${value} with system`);
          event.path[1].getElementsByTagName('h1')[0].innerHTML = value;
          window.localStorage.setItem(currentElementName, value);
        });
      })
      //
      return event.preventDefault()
    },
    allocateContentOfCardTitleComponent: function(serverData){
      return window.localStorage.getItem(serverData) ? window.localStorage.getItem(serverData) : serverData
    },
    loadDevicesIntoObj: function() {
      this.$http
        .get("https://suraj.codes:4000/activeClients", {
          "Access-Control-Allow-Origin": "*"
        })
        .then(
          result => {
            let parsedData = JSON.parse(result.bodyText);
            EventBus.$emit("connectedClients", parsedData);
            this.userData = [...parsedData, ...this.$data.additionalDevices];
          },
          error => {
            console.error(error);
          }
        );
    },
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
      userData: [],
      classes: {
        online: "onlineTransform",
        danger: "dangerTransform",
        offline: "offlineTransform"
      },
      socketData: {
        CurrentSocket: SocketsIO("http://139.59.200.147:4001/")
      },
      additionalDevices: [
        {
          computerName: "ALL CLIENTS",
          dangerMode: true,
          enabled: true,

          IP: "N/A",
          screenShot: "https://i.imgur.com/vaGQwkD.png",

          OSRelease: "N/A",
          OSPlatform: "Simultanious client control"
        },
      ],
      pseudoUserData: [
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

  @keyframes morph
    0%
      border-radius: 40% 60% 60% 40% / 60% 30% 70% 40%;
    100%
      border-radius: 40% 60%

  @keyframes spin
    to
      transform: rotate(1turn)

  replicateGrid(pushedColour, pushedWidth)
    .mainContent
      padding-top: 10px
      padding-left: 18px
      max-height: 125px
      background: white

      h1, h2, h3, h4
        font-family: 'Open Sans', sans-serif
        margin-top: 9px
        margin-bottom: @margin-top

      h3
        font-size: 1em
        color: #2f3640
        font-weight: 700

      h1
        font-size: 1.3em
        color: #2f3640
        font-weight: 700

      h2
        font-size: 1em
        font-weight: 600
        color: #212121

    .imageComponent
      display: flex
      justify-content: center

      img
        display: block
        border-radius: 15px 15px 0px 0px
        max-height: 142px
        width: pushedWidth

    .statisticContent
        height: 100px
        display: flex
        background: white

        .profilePicture
            padding-top: 15px
            padding-left: 15px
            img
              width: 60px
              border-radius: 50%

         .userInformation
           padding-left: 18px
           padding-top: 15px

           h1, h2, h3, h4
            font-family: 'Open Sans', sans-serif
            margin-top: 4px
            margin-bottom: @margin-top

           h3
             font-weight: 600
             color: pushedColour
             text-transform: uppercase

           h4
             color: lighten(#57606f, 10%)
             font-weight: 600

             span
               font-weight: 700
               color: black

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
      display: flex;
      justify-content: center

      h2
        font-family: 'Montserrat', sans-serif
        text-transform: uppercase
        color: lighten($colourConst.ShadeY.Primary, 15%)
        font-weight: 300
        opacity: 0
        align-self: center;

        b
          font-weight: 700

  .mainContainerPicker
    overflow: scroll
    padding: 50px

    .devicePicker
      display: grid;
      align-self: center;
      justify-content: center;
      grid-template-columns: repeat(auto-fill, 300px)
      grid-auto-rows: 380px
      grid-gap: 65px 65px

      .deviceCard
        opacity: 0
        border-radius: 15px
        grid-column-start: auto
        grid-row-start: auto
        border: 2px solid darken(white, 5%)
        transition: all 0.25s
        background: white
        display: grid
        grid-template-columns: 1fr
        grid-template-rows: 1fr 1fr 1fr
        box-shadow: 0px 7px 20px rgba(0,0,0,0.2)

      .offlineTransform
        replicateGrid($colourConst.ShadeZ.LightRed, 294px)

      .onlineTransform
        replicateGrid($colourConst.ShadeZ.DarkBlue, 294px)

        &:hover
          cursor: pointer
          box-shadow: 0px 14px 30px rgba(0,0,0,0.3)
          transform: translateY(5px)
          transition: box-shadow transform 0.25s

      .dangerTransform
        replicateGrid($colourConst.ShadeZ.LightRed, auto)

        &:hover
          cursor: pointer
          box-shadow: 0px 14px 30px rgba($colourConst.ShadeZ.LightRed,0.3)
          transform: translateY(5px)
          transition: box-shadow transform 0.25s
</style>
