<template>
    <div class="entry-panel">
      <loading v-if="!entryLoaded"></loading>
      <div v-else class="container">
        <router-link class="back-link" :to="{ name: 'categories'}">&larr; Back to map</router-link>
        <div v-if="entry.image" class="image-container" :class="`is-${ entry.colour.toLowerCase() }`">
          <transition name="slide-from-right">
            <div v-show="isImageLoaded">
              <img :class="imageClass" :src="entry.image" @load="imageLoaded($event)" />
            </div>
          </transition>
        </div>
        <div class="panel">
          <h2 class="entry-title"><span>{{ entry.title }}</span> <small>{{ entry.date_open || 'unknown' }} – {{ entry.date_close || 'unknown'}}</small></h2>
          <a target="_blank" :href="googleMapsLink" v-if="entry.address" class="entry-address">{{ entry.address }}</a>
          <div class="entry-description" v-html="entry.description"></div>
          <details v-if="entry.description_extended">
            <summary>Read more</summary>
            <div class="summary-content" v-html="entry.description_extended"></div>
          </details>
        </div>

        <div class="panel">
          <h3 class="panel-heading">Share your memories</h3>
        </div>
      </div>
    </div>
</template>

<script>
import Loading from './Loading.vue';

export default {
  name: 'Entry',
  props: ['slug'],
  components: {
    Loading
  },
  data() {
    return {
      entryLoaded: false,
      entry: {},
      errored: false,
      isImageLoaded: false,
      imageClass: null
    }
  },
  watch: {
    slug: function (slug) {
      this.getEntry(slug)
    }
  },
  computed: {
    googleMapsLink: function() {
      return `https://www.google.com/maps/search/?api=1&query=${this.entry.location.coordinates[1]},${this.entry.location.coordinates[0]}`;
    }
  },
  methods: {
    getEntry(slug) {
      axios
        .get(`/api/entry/${ slug }.json`)
        .then(response => {
          this.entry = response.data;
        })
        .catch(error => {
          console.log(error)
          this.errored = true
        })
        .finally(() => {
          this.entryLoaded = true;
        })
    },
    imageLoaded($event) {
      let ratio = $event.target.naturalWidth/$event.target.naturalHeight;
      if(ratio >= 1.6) {
        this.imageClass = 'is-x-wide';
      }
      else if(ratio >= 1.35) {
        this.imageClass = 'is-wide';
      }
      else if(ratio <= 0.5) {
        this.imageClass = 'is-x-tall';
      }
      else if(ratio <= 0.8) {
        this.imageClass = 'is-tall';
      }
      else {
        this.imageClass = 'is-square';
      }
      this.isImageLoaded = true;
    }
  },
  mounted () {
    // this.getEntry(this.slug);
  }
}
</script>

<style lang="scss">
@import '../../styles/base.scss';

.empty-photos {
  padding: ms(8) ms(4);
  margin-top: ms(0);
  background-color: $brand-light-green;
  text-align: center;
  .button {
    margin-top: ms(0);
  }
}

.entry-panel {
  left: 0;
  position: absolute;
  overflow-y: auto;
  padding: 0 0 ms(2);
  top: 0;
  bottom: 0;
  right: 0;
  z-index: 9999999;
  background-color: white;

  @media screen and (orientation: landscape) and (min-width: 800px) {
    padding: 0 ms(4) ms(2);
    left: $sidebar-width;
  }

  .container {
    max-width: 800px;
    margin: 0 auto;
    @media screen and (orientation: landscape) and (min-width: 800px) {
      margin: ms(6) auto;
    }
  }

  .panel {
    margin-top: ms(4);
    padding-top: ms(4);
    border-top: 1px solid $medium-gray;
  }

  .panel-heading {
    font-size: ms(2);
    font-weight: 700;
  }

  .entry-title {
    font-size: ms(3);
    @media screen and (orientation: landscape) and (min-width: 800px) {
      font-size: ms(5);
    }
    font-weight: 700;
    margin-bottom: 0;

    span {
      @media screen and (orientation: landscape) and (min-width: 800px) {
        display: inline-block;
        margin-right: ms(1);
      }
    }

    small {
      font-weight: 400;
      display: block;
      color: $gray;
      font-size: ms(2);
      vertical-align: baseline;
      @media screen and (orientation: landscape) and (min-width: 800px) {
        display: inline-block;
      }
    }
  }

  .entry-address {
    display: inline-block;
    font-size: ms(0);
    margin-top: ms(-4);

    &::before, &::after {
      content: '';
      display: inline-block;
      background-image: url(/assets/images/marker-icon-red.svg);
      width: 0.75em;
      height: 1em;
      margin-right: .25em;
      background-size: contain;
      background-repeat: no-repeat;
      background-position: left bottom;
    }

    &::after {
      background-image: url(/assets/images/external_link.svg);
      margin-left: 0.25em;
    }
  }

  .entry-description {
    margin-top: ms(2);
    margin-bottom: ms(2);
  }

  // .image-container {
  //   position: relative;
  //   background-image: linear-gradient(to top, $blue 30%, white 30%);
  //   &.is-red {
  //     background-image: linear-gradient(to top, $red 30%, white 30%);
  //   }
  //   &.is-orange {
  //     background-image: linear-gradient(to top, $orange 30%, white 30%);
  //   }
  //   &.is-cream {
  //     background-image: linear-gradient(to top, $cream 30%, white 30%);
  //   }
  //
  //   & > div {
  //     height: 100%;
  //   }
  //   margin-bottom: ms(2);
  //   padding-bottom: ms(4);
  //   height: calc(100vw - #{2 * ms(2)});
  //   @media screen and (orientation: landscape) and (min-width: 800px) {
  //     height: 0.5 * 800px;
  //     background-image: linear-gradient(to top, $blue 40%, white 40%);
  //     &.is-red {
  //       background-image: linear-gradient(to top, $red 40%, white 40%);
  //     }
  //     &.is-orange {
  //       background-image: linear-gradient(to top, $orange 40%, white 40%);
  //     }
  //     &.is-cream {
  //       background-image: linear-gradient(to top, $cream 40%, white 40%);
  //     }
  //   }
  //
  //   img {
  //     margin: 0 auto;
  //     height: 100%;
  //     width: 75vw;
  //     object-fit: contain;
  //     object-position: center bottom;
  //
  //     @media screen and (orientation: landscape) and (min-width: 800px) {
  //       height: 0.5 * 800px;
  //       width: 0.5 * 800px;
  //       padding-bottom: ms(2);
  //     }
  //     &.is-square {
  //       width: 60vw;
  //
  //       @media screen and (orientation: landscape) and (min-width: 800px) {
  //         width: 0.4 * 800px;
  //       }
  //     }
  //
  //     &.is-x-wide {
  //       width: calc(100vw - 3 * ms(2));
  //
  //       @media screen and (orientation: landscape) and (min-width: 800px) {
  //         width: 0.65 * 800px;
  //       }
  //     }
  //
  //     &.is-x-tall {
  //       // height: 60vw;
  //
  //       @media screen and (orientation: landscape) and (min-width: 800px) {
  //         height: 0.575 * 800px;
  //         transform: translateY(#{-0.075 * 800px});
  //       }
  //     }
  //   }
  // }
}

summary {
  cursor: default;
  padding-right: 1em;
  display: inline-block;
  font-weight: 700;
  &:focus {
    outline: 2px solid $medium-gray;
  }
}

.summary-content {
  margin-top: ms(-2);
}

.back-link {
  color: $gray;
  display: inline-block;

  @media screen and (orientation: portrait) {
    margin-bottom: ms(0);
  }
}
</style>