<template>
  <div class = "initialLoadingSegment">
    <h1>
      Project <b>Orion</b>
    </h1>

    <h3>
      Awaiting directory [ Placeholder ]
    </h3>

    <button>
      Initiate
    </button>
  </div>
</template>

<script>
import animateElements from "animejs";

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
      default: "500px"
    },
    finalTransformX: {
      type: String,
      required: false,
      default: "0px"
    }
  },
  mounted: function() {
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
      opacity: 0.75,
      duration: configData.props.secondaryDurations / 2,
      translateX: ["-50px", "0px"],
      easing: "easeOutCubic",
      begin: () =>
        animateElements({
          targets: [configData.subTitle, configData.initiaterButton],
          opacity: 0.75,
          duration: configData.props.secondaryDurations,
          easing: "easeOutCubic",
          delay: function(_, currentKeyframe) {
            return (currentKeyframe * configData.props.secondaryDurations) / 10;
          }
        })
    });
  }
};
</script>

<style scoped lang="stylus">
.initialLoadingSegment
  text-align: center
  width: 100vw
  z-index: 2
  height: 100%
  margin-top: 10%

  h1
    color: #212121
    z-index: 10
    font-weight: 500
    font-size: 6vw
    opacity: 0
    font-family: 'Montserrat', sans-serif

  h3
    margin-top: -10px
    color: #212121
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
    color: white
    background: linear-gradient(to right, #652060, #34ccc6)
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
