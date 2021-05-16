<template>
  <div class="loading-panel">
    <div class="loading-panel--spinner"><div></div><div></div></div>
  </div>
</template>

<script>
export default {
  name: 'Loading',
  props: [],
  components: {
  },
  data () {
    return {
    }
  },
  mounted() {

  },
  methods: {
  }
}
</script>

<style lang="scss">
  @import '../../styles/base.scss';
  
  .loading-panel {
    height: 100%;
    position: relative;
  }

  .loading-panel--spinner {
    display: inline-block;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
    width: 72px;
    height: 72px;

    div {
      position: absolute;
      border: 4px solid $gray;
      border-radius: 50%;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      animation: lds-ripple 1s cubic-bezier(0, 0.2, 0.8, 1) infinite;
      &:nth-child(2) {
        animation-delay: 0.5s;
      }
    }
  }


  @keyframes lds-ripple {
    0% {
      transform: scale(0);
      opacity: 1;
    }
    100% {
      transform: scale(1);
      opacity: 0;
    }
  }

</style>