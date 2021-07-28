<template>
  <l-map
    id="map"
    ref="map"
    :zoom="zoom"
    :center="center"
    :options="mapOptions"
    :inertia="true"
    :zoomAnimation="true"
    :noBlockingAnimations="true"
    @mouseenter="mapActive = true"
    @mouseleave="mapActive = false">
    <l-control-zoom :position="isLandscape ? 'bottomright' : 'topright'" />
    <l-tile-layer :url="url" :attribution="attribution" />
    <v-icondefault :image-path="'/assets/images/'"></v-icondefault>
    <!-- <v-marker-cluster ref="cluster" :options="clusterOptions"> -->
      <!-- <l-marker :ref="entry.id" v-for="entry in entriesWithLatLng" :key="entry.id" :lat-lng="getLatLng(entry)" @keyup.enter="markerClicked(entry.id)" @click="markerClicked(entry.id)"> -->
    <v-marker-cluster :options="clusterOptions">
      <l-marker :ref="entry.id" v-for="entry in entriesWithLatLng" :key="entry.id" :lat-lng="getLatLng(entry)" @click="markerClicked(entry.id)" @keyup.enter="markerClicked(entry.id)" >
        <l-popup :ref="`popup-${entry.id}`" class="popup-inner" :options="{maxWidth: 480, offset: [0, -34], closeButton: true}">
          <div class="popup-header">
            <p class="entry-category">{{ entry.category}}</p>
            <h3 class="entry-title" v-html="entry.name"></h3>
            <p class="entry-address" v-if="entry.address">{{ entry.address.replace(entry.postcode,'').toLowerCase() }}<span v-if="entry.postcode">, {{entry.postcode}}</span></p>
            <p v-if="entry.description">{{entry.description}}</p>


            <a v-if="entry.latitude && entry.longitude" class="button is-primary" target="_blank" :href="googleMapsDirections(entry)">Get directions</a>
          </div>
          <div class="popup-sidebar" v-if="parseInt(entry.weight)">
            <h4 class="popup-sidebar--title">Last year at this site:</h4>
            <ul>
              <li>
                <img class="popup-sidebar--icon" src="/assets/images/weight.svg" />
                <div class="popup-sidebar--text">
                  <h5 class="popup-sidebar--number">
                    <ICountUp
                      v-if="currentPopupID == entry.id"
                      :endVal="convertWeightToNumber(entry.weight)"
                      :options="options"
                    />kg</h5>
                  of glass recycled
                </div>
              </li>
              <li>
                <img class="popup-sidebar--icon" src="/assets/images/bottle.svg" />
                <div class="popup-sidebar--text">
                  <h5 class="popup-sidebar--number"><ICountUp
                  v-if="currentPopupID == entry.id"
                    :delay="250"
                    :endVal="convertWeightToWords(entry.weight)"
                    :options="options"
                  /></h5>
                  <p>glass jars and bottles</p>
                </div>
              </li>

              <li>
                <img class="popup-sidebar--icon" src="/assets/images/electricity.svg" />
                <div class="popup-sidebar--text">
                  <h5 class="popup-sidebar--number">
                    <ICountUp
                    v-if="currentPopupID == entry.id"
                      :delay="500"
                      :endVal="convertWeightToEnergy(entry.weight)"
                      :options="options"
                    />kWh</h5>
                    <p>energy saved</p>
                  </div>
              </li>
            </ul>

            <h4 class="popup-sidebar--title highlight">Saving enough energy to power...</h4>
            <ul class="highlight">
              <li>

                <img class="popup-sidebar--icon" :src="convertWeightToRealWorld(entry.weight)[2]" />
                <div class="popup-sidebar--text">
                  <h5 class="popup-sidebar--number">
                  <ICountUp
                  v-if="currentPopupID == entry.id"
                    :delay="750"
                    :endVal="convertWeightToRealWorld(entry.weight)[0]"
                    :options="options"
                  /></h5>
                  <p>{{ convertWeightToRealWorld(entry.weight)[1] }}</p>
                </div>
              </li>
            </ul>
          </div>
          <!-- <button id="popup-close" aria-label="Close popup" class="popup--close" @click="markerClicked(null)" @keyup.enter="markerClicked(null)">×</button> -->
        </l-popup>
        <l-icon
          :popupAnchor="[0,20]"
          :iconSize="[35,53]"
          icon-url="/assets/images/marker-icon-red.svg"
        />
        <!--
        :iconSize="selectedEntryID == entry.id ? [50,82] : [25,41]"
        :className="selectedEntryID == entry.id ? 'large' : ''"
        :icon-anchor="selectedEntryID == entry.id ? [25,82] : [12.5,41]"
        :icon-url="selectedEntryID == entry.id ? '/assets/images/marker-icon-red.svg' : '/assets/images/marker-icon.svg'"
        :iconRetinaUrl="selectedEntryID == entry.id ? '/assets/images/marker-icon-red.svg' : '/assets/images/marker-icon.svg'"
        -->
      </l-marker>
    </v-marker-cluster>
  </l-map>

</template>

<script>
import L from 'leaflet';
import { divIcon as DivIcon, point as Point } from "leaflet";
import { latLng } from "leaflet";
import { LIconDefault,LPopup, LIcon, LMap, LTileLayer, LMarker, LControlZoom } from 'vue2-leaflet';
import Vue2LeafletMarkerCluster from 'vue2-leaflet-markercluster'
import * as focusTrap from 'focus-trap';
import ICountUp from 'vue-countup-v2';

export default {
  name: 'Map',
  props: ['entries', 'selectedEntryID', 'userLatLng', 'isLandscape'],
  components: {
    ICountUp,
    'v-icondefault': LIconDefault,
    LPopup,
    LMap,
    LTileLayer,
    LMarker,
    LIcon,
    LControlZoom,
    'v-marker-cluster': Vue2LeafletMarkerCluster
  },
  data () {
    return {

      options: {
        useEasing: true,
        useGrouping: true,
      },

      zoom: 12,
      center: latLng(53.7928737,-1.546013),
      // url: 'https://stamen-tiles.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.png',
      // url: 'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png',
      // url: 'https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png',
      // url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',

    	maxZoom: 24,
    	attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
      mapOptions: {
        scrollWheelZoom: window.self == window.top,
        zoomSnap: 0.5,
        zoomControl: false,
        zoomAnimationThreshold: 8,
      },
      showMap: true,
      mapActive: false,
      currentPopupID: null,
      popupFocusTrap: null,
      clusterOptions: {
        disableClusteringAtZoom: 18,
        spiderLegPolylineOptions: { weight: 6, color: '#efbfd3', opacity: 0.75 },
        // maxClusterRadius: 50,

        iconCreateFunction: cluster => {
          var childCount = cluster.getChildCount();

          return new DivIcon({
            html: "<div><span>" + childCount + "</span></div>",
            className: "marker-cluster my-marker-cluster-" + ((childCount < 4) ? 'small' : ((childCount < 8) ? 'medium' : 'large')),
            iconSize: new Point(40, 40)
          });
        }
      }
    }
  },
  computed: {
    entriesWithLatLng: function() {
      return this.entries.filter(entry => this.hasLatLng(entry));
    },
  },
  watch: {
    userLatLng: function() {
      this.recenterMap();
    },

    $route (to, from) {
      if(to.name == 'app') {
        this.recenterMap();
      }
    },

    selectedEntryID: function (newID, oldID) {

      if(!this.mapActive) {
        this.$refs.map.mapObject.flyTo(this.$refs[ newID ][ 0 ].latLng, 18);
        this.$refs.map.mapObject.once('moveend', () => {
          this.$refs[ newID ][ 0 ].mapObject.openPopup();
          this.currentPopupID = newID;
        });
      }
    }
  },
  methods: {

    googleMapsDirections: function(entry) {
      return `https://www.google.com/maps/dir/?api=1&travelmode=walking&destination=${entry.latitude}%2C${entry.longitude}`;
    },

    convertWeightToRealWorld(value) {
      let number = parseFloat(value.replace(',',''));
      let power = this.convertWeightToEnergy(value);

      if(number > 100000) {
        return [Math.round(power/3700), 'houses for a year', '/assets/images/house.svg'];
      }
      else if(number > 30000) {
        return [Math.round(power/50), 'e-Bikes for a year', '/assets/images/bicycle.svg'];
      }
      else if(number > 10000) {
        return [Math.round(power/35), 'laptops for a year', '/assets/images/laptop.svg'];
      }
      else {
        return [Math.round(power/1.8), 'mobile phones for a year', '/assets/images/mobile.svg'];
      }
    },


    convertWeightToNumber(value) {
      let number = parseFloat(value.replace(',',''));
      return Math.round(number);
    },

    convertWeightToWords(value) {
      let number = parseFloat(value.replace(',',''))/0.3;
      if(number > 1000000) {
        return Math.round(number/1000000) * 1000000;
      }
      else if(number > 1000) {
        return Math.round(number/1000) * 1000;
      }
      else {
        return Math.round(number);
      }
    },

    convertWeightToEnergy(value) {
      let number = parseFloat(value.replace(',',''));
      number = Math.round(number * 322 / 1000); //   322 kWh or 42kWh per tonne?.
      return number;
    },

    getLatLng(entry) {
      let latLngArray = [parseFloat(entry.latitude),parseFloat(entry.longitude)];
      return latLngArray;
    },

    hasLatLng(entry) {
      if( entry.longitude == '' || entry.latitude == '' ) {
        return false;
      }
      if(typeof(parseInt(entry.longitude)) != 'number') {
        return false;
      }
      if(typeof(parseInt(entry.latitude)) != 'number') {
        return false;
      }
      return true;
    },

    markerClicked(selectedEntryID) {


        this.$refs.map.mapObject.flyTo(this.$refs[selectedEntryID][0].latLng);
        this.currentPopupID = selectedEntryID;
        this.$emit('marker-clicked', selectedEntryID);

    },

    recenterMap() {
      if(this.userLatLng && this.userLatLng.length) {
        this.$refs.map.mapObject.flyTo(latLng(this.userLatLng[0],this.userLatLng[1]), 14);
      } else {
        this.$refs.map.mapObject.flyTo(this.center, 12);
      }
    }
  },
}
</script>

<style lang="scss">
  @import '../../styles/base.scss';

  .leaflet-container {
    width: 100%;
    height: auto !important;
    flex: 1;

    @media screen and (orientation: landscape) and (min-width: 800px) {
      width: calc(100vw - #{$sidebar-width}) !important;
      // height: 100% !important;
    }
  }

  .leaflet-container :focus {
    outline: -webkit-focus-ring-color auto thin !important; /* Fallback for some browsers that don't support `revert`. */
    outline: revert !important;
  }


  .leaflet-marker-icon {

    &:focus {
      outline: 3px solid $brand-green !important;
    }
  }

    // margin-top: -41px !important;
    // margin-left: -12.5px !important;
    // width: 25px !important;
    // height: 41px !important;
    //
    // &.large {
    //   width: 50px !important;
    //   height: 82px !important;
    //   margin-top: -82px !important;
    //   margin-left: -25px !important;
    // }

  .marker-cluster,
  .marker-cluster div {
    border-radius: 500px;
  }

  .marker-cluster.active {
    outline: 2px solid yellow;
  }

  .marker-cluster div {
    height: 30px;
    width: 30px;
    margin: 5px;
    text-align: center;
    line-height: 30px;
  }

  .my-marker-cluster-small div,
  .my-marker-cluster-medium div,
  .my-marker-cluster-large div {
    background-color: white;
  }

  .my-marker-cluster-small {
    background-color: lighten($brand-green,5%);
    box-shadow: 9px 9px 12px -7px rgba(0,0,0,0.25) !important;
  }

  .my-marker-cluster-medium {
    background-color: $brand-green;
    box-shadow: 9px 9px 12px -7px rgba(0,0,0,0.25) !important;
  }

  .my-marker-cluster-large {
    background-color: darken($brand-green,10%);
    box-shadow: 9px 9px 12px -7px rgba(0,0,0,0.25) !important;
  }



  // Popup
  // .leaflet-container a.leaflet-popup-close-button {

  // }

  .leaflet-pane {
    z-index: 1001;

    a.leaflet-popup-close-button {
      top: ms(-2) !important;
      right: ms(-2) !important;
      width: 1em !important;
      height: 1em !important;
      font: 25px/12px Tahoma, Verdana, sans-serif !important;
      border-radius: 99999px;
      padding: 4px;
      background-color: darken($brand-green, 20%);
      color: black;

      @media screen and (orientation: landscape) and (min-width: 800px) {
        top: ms(0) !important;
        right: ms(0) !important;
        width: 1em !important;
        height: 1em !important;
      }
    }
  }

  .leaflet-popup {
    width: 90vw;
    // max-width: 95%;
    @media screen and (orientation: landscape) and (min-width: 800px) {
      width: 550px;
    }
  }

  .leaflet-popup-content-wrapper {
      overflow: hidden;
      border: 1px solid $medium-gray;
      border-bottom: none;
      position: relative;
      font-size: 1rem !important;
      padding: 0;
      // border-radius: 0 !important;
      box-shadow: 13px 19px 12px -7px rgba(0,0,0,0.2) !important;

      .leaflet-popup-content {
        margin: 0 !important;
        width: auto !important;
      }

      .entry-title {
        text-transform: capitalize;
        font-size: ms(1);
        font-weight: 400;
        margin-bottom: 0;

        @media screen and (orientation: landscape) and (min-width: 800px) {
          font-size: ms(2);
          margin-bottom: ms(-1);
        }
      }

      .entry-category {
        background-color: $brand-light-green;
        padding: 0 10px;
        font-size: ms(-1);
        border-radius: 99999px;
        display: inline-block;
      }

      .entry-address {
        font-size: ms(-1);
        color: $gray;
        text-transform: capitalize;
        padding-left: 1em;

        &::before {
          content: '';
          margin-left: -1.25em;
          display: inline-block;
          background-image: url(/assets/images/marker-icon-red.svg);
          width: 1em;
          height: 1.5em;
          vertical-align: bottom;
          margin-right: .25em;
          background-size: contain;
          background-repeat: no-repeat;
          background-position: left;
        }
      }

      p {
        margin: 0 0 ms(-4);

        @media screen and (orientation: landscape) and (min-width: 800px) {
          margin: 0 0 ms(0);
        }
      }

      .entry-links {
        display: flex;
        flex-direction: row;

        > * + * {
          margin-left: ms(-6);
        }
      }

      .entry-link {
        margin-bottom: ms(0);

        a {
          display: inline-block;
          color: $dark-gray;
          background-color: $medium-gray;
          border-radius: 99999px;
          line-height: ms(4);
          padding: 0 ms(-2);
        }

      }

      .entry-social {
        margin-bottom: ms(0);
        display: inline-block;
        padding: ms(-4);
        background-color: $dark-gray;
        border-radius: 99999px;

        svg {
          display: block;
          width: ms(0);
          height: ms(0);

          path {
            fill: #fff
          }
        }

        &__ebay {
          padding: ms(-8);
          svg {
            width: ms(2);
            height: ms(2);
          }
        }
      }

      .popup-inner {
        display: flex;
        flex-direction: column;

        @media screen and (orientation: landscape) and (min-width: 800px) {
          align-items: center;
          flex-direction: row;
        }
      }

      .popup-sidebar {
        background-color: lighten($brand-green, 15%);
        align-self: normal;
        font-size: ms(-2);
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;

        @media screen and (orientation: landscape) and (min-width: 800px) {
          font-size: ms(-1);
          flex: 0 0 250px;
          flex-wrap: nowrap;
          flex-direction: column;
          justify-content: center;
        }

        p {
          margin-bottom: 0;
          flex: 0 0 33%;
        }

        ul {
          // display: flex;
          // flex-direction: row;
          // flex-wrap: wrap;
          flex: 1 1 auto;
          padding: 10px 0;

          @media screen and (orientation: landscape) and (min-width: 800px) {
            display: block;
            padding: 15px 0 20px;

          }

          &.highlight {
            background-color: lighten($brand-green, 5%);
            @media screen and (orientation: landscape) and (min-width: 800px) {
              padding-bottom: 20px;
            }
          }
        }

        li {
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          padding: 0 10px;

          @media screen and (orientation: landscape) and (min-width: 800px) {
            padding: 0 20px;
          }

          &:not(:first-child) {
            margin-top: ms(-2);

            @media screen and (orientation: landscape) and (min-width: 800px) {
              margin-top: ms(2);
            }
          }
        }

        &--icon {
          width: 2.25em;
          height: auto;
          margin-right: 0.5em;
          margin-bottom: auto;
        }

        &--title {
          font-weight: 600;
          margin-bottom: 0;
          padding: 10px 10px;
          flex: 0 0 40%;

          @media screen and (orientation: landscape) and (min-width: 800px) {
            padding: 30px 20px 0;
            flex: none;
          }

          &.highlight {
            background-color: lighten($brand-green, 5%);
          }
        }

        &--text {
          @media screen and (orientation: landscape) and (min-width: 800px) {
            flex: 1;
          }
        }

        &--number {
          font-size: ms(0);
          font-weight: 700;
          margin: 0;

          @media screen and (orientation: landscape) and (min-width: 800px) {
            font-size: ms(2);
          }
        }
      }

      .popup-header {
        padding: 15px;

        @media screen and (orientation: landscape) and (min-width: 800px) {
          flex: 0 0 300px;
          padding: 30px;
        }
      }

      .popup-footer {
        border-top: 1px solid $light-gray;
        padding-top: ms(0);
      }
  }



  @media screen and (orientation: portrait) {
    .leaflet-popup {
      // display: none;
    }
  }
  //
  // .leaflet-overlay-pane svg path {
  //   stroke: $red !important;
  //   fill: transparentize($red, 0.5) !important;
  // }

</style>