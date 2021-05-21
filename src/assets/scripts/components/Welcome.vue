<template>
  <transition name="fade">
      <div class="dialog-wrapper" v-if="!hasVisitedBefore && siteDataLoaded">
        <div class="dialog">
          <div class="dialog-inner">
            <h4>Zero Waste Leeds</h4>
            <h3>{{ site.welcome_title }}</h3>
            <div v-html="site.welcome_message.replace(/(?:\r\n|\r|\n)/g, '<br>')"></div>
            <button class="button is-primary is-large" @click="confirmEntrance">Enter</button>
          </div>
        </div>
      </div>
    </transition>
</template>

<script>
export default {
  props: [],
  components: {
  },
  data () {
    return {
      hasVisitedBefore: false,
      siteDataLoaded: false
    }
  },
  watch: {
    // hasVisitedBefore(newValue) {
    //   localStorage.hasVisitedBefore = newValue;
    // }
  },
  mounted() {
    axios
      .get('/api/site.json')
      .then(response => {
        this.site = response.data
      })
      .catch(error => {
        console.log(error)
        this.errored = true
      })
      .finally(() => this.siteDataLoaded = true)
  },
  created() {
    // if (localStorage.hasVisitedBefore) {
    //   this.hasVisitedBefore = localStorage.hasVisitedBefore;
    // }
  },
  methods: {
    confirmEntrance() {
      this.hasVisitedBefore = true;
    }
  }
}
</script>

<style lang="scss">
  @import '../../styles/base.scss';

  .dialog {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
    z-index: 9999999999;
    background-color: rgba(255,255,255,0.95);
    padding: ms(8) ms(4) ms(10);
    border-radius: ms(0);
    animation: popup 1s forwards;
    width: 100%;
    max-width: 680px;
    text-align: center;
    background-image: url(/assets/images/bottle-background.svg);
    background-position: center bottom;
    background-position: contain;
    background-repeat: no-repeat;
    font-size: ms(-1);

    @media screen and (orientation: landscape) and (min-width: 800px) {
      font-size: ms(0);
    }

    .dialog-inner {
      max-width: 420px;
      margin: 0 auto;
    }

    h4 {
      font-size: ms(1);
      font-weight: 900;
      margin-bottom: ms(-3);

      @media screen and (orientation: landscape) and (min-width: 800px) {
        font-size: ms(2);
        margin-bottom: ms(-1);
      }
    }

    h3 {
      font-size: ms(3);
      font-weight: 900;
      margin-bottom: ms(2);

      @media screen and (orientation: landscape) and (min-width: 800px) {
        font-size: ms(5);
      }
    }

    .button {
      margin-top: ms(3);
    }
  }

  @keyframes popup {
    0% {
      transform: translate(-50%,-40%);
      opacity: 0;
    }
    100% {
      transform: translate(-50%,-50%);
      opacity: 1;
    }
  }

  .dialog-wrapper {
    position: fixed;
    z-index: 9999999998;
    background-color: rgba(0,0,0,0.5);
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

</style>