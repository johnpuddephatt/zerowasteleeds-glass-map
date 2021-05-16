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
            <p class="entry-address" v-if="entry.address">
              {{ entry.address.replace(entry.postcode,'').toLowerCase() }}
              <span v-if="entry.postcode">{{entry.postcode}}</span>
              </p>
            <p v-if="entry.description">{{entry.description}}</p>

            <a class="button is-primary" target="_blank" :href="googleMapsDirections(entry)">Get directions</a>
          </div>
          <div class="popup-sidebar" v-if="parseInt(entry.weight)">
            <h4 class="popup-sidebar--title">Here last year</h4>
            <ul>
              <li>
                <h5 class="popup-sidebar--number">{{ convertWeightToNumber(entry.weight) }}kg</h5>
                of glass recycled
              </li>
              <li>
                <h5 class="popup-sidebar--number">{{convertWeightToWords(entry.weight)}}</h5>
                <p>glass jars and bottles</p>
              </li>

              <li>
                <h5 class="popup-sidebar--number">{{ convertWeightToEnergy(entry.weight) }}kWh</h5>
                <p>energy saved</p>

              </li>

              <li v-html="convertWeightToRealWorld(entry.weight)">
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

export default {
  name: 'Map',
  props: ['entries', 'selectedEntryID', 'userLatLng', 'isLandscape'],
  components: {
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
      currentPopup: null,
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
        return `<h5 class="popup-sidebar--number">${ Math.round(power/3700)}</h5>
                <p>houses powered for a year</p>`;
      }
      else if(number > 30000) {
        return `<h5 class="popup-sidebar--number">${ Math.round(power/50)}</h5>
                <p>e-Bikes powered for a year</p>`;
      }
      else if(number > 10000) {
        return `<h5 class="popup-sidebar--number">${ Math.round(power/35)}</h5>
          <p>laptops powered for a year</p>`;
      }
      else {
        return `<h5 class="popup-sidebar--number">${ Math.round(power/1.8)}</h5>
                <p>mobile phones powered for a year</p>`;
      }
    },


    convertWeightToNumber(value) {
      let number = parseFloat(value.replace(',',''));
      number = Math.round(number)
      return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    convertWeightToWords(value) {
      let number = parseFloat(value.replace(',',''))/0.3;
      if(number > 1000000) {
        return `${Math.round(number/1000000)} million`;
      }
      else if(number > 1000) {
        return `${Math.round(number/1000)},000`
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

  .leaflet-popup-close-button {
    top: ms(0) !important;
    right: ms(0) !important;
    width: auto !important;
    height: auto !important;
    font: 30px/17px Tahoma, Verdana, sans-serif !important;
  }


  .leaflet-popup-content-wrapper {
      max-width: 480px;
      border: 1px solid $medium-gray;
      border-bottom: none;
      position: relative;
      width: 100vw;
      font-size: 1rem !important;
      padding: 0;
      // border-radius: 0 !important;
      box-shadow: 13px 19px 12px -7px rgba(0,0,0,0.2) !important;

      .popup--close {
        position: absolute;
        top: ms(0);
        line-height: 1;
        right: ms(0);
        font-size: ms(4);
        color: $gray;
      }

      .leaflet-popup-content {
        margin: 0 !important;
        width: auto !important;
      }

      .entry-title {
        text-transform: capitalize;
        font-size: ms(2);
        font-weight: 400;
        margin-bottom: ms(-1);
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

        &::before {
          content: '';
          display: inline-block;
          background-image: url(/assets/images/marker-icon-red.svg);
          width: 0.75em;
          height: 1em;
          margin-right: .25em;
          background-size: contain;
          background-repeat: no-repeat;
          background-position: left;
        }
      }

      p {
        margin: 0 0 ms(0);
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
        flex-direction: row;
        align-items: center;
      }

      .popup-sidebar {
        background-color: $brand-green;
        flex: 0 0 200px;
        align-self: normal;
        padding: 30px 20px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        font-size: ms(-1);

        p {
          margin-bottom: 0;
        }

        li {
          margin-top: ms(2);
        }

        &--title {
          font-weight: 600;
          margin-bottom: 0;
        }

        &--number {
          font-size: ms(2);
          font-weight: 700;
          margin: 0;
        }
      }

      .popup-header {
        padding: 30px;
        flex: 0 0 300px;
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