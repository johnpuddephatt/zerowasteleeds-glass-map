<template>
  <div class="map-wrapper">
    <Menu :entryCount="entries.length" :userLatLng="userLatLng" :entries="entries" :isLandscape="isLandscape()" :selectedEntryID="selectedEntryID" @user-latlng-changed="updateUserLatLng($event)" @menu-entry-selected="selectedEntryID = $event"></Menu>
    <Map v-if="entries" :isLandscape="isLandscape()" :entries="entries" :userLatLng="userLatLng" :selectedEntryID="selectedEntryID" @marker-clicked="selectedEntryID = $event"></Map>
  </div>
</template>

<script>
import Map from './Map.vue';
import Menu from './Menu.vue';
import Popup from './Popup.vue';

export default {
  name: 'Overview',
  props: [],
  components: {
    Map,
    Menu,
    Popup
  },
  data () {
    return {
      userLatLng: [],
      categories: [],
      entries: [],
      selectedEntryID: null,
      errored: false,
      entriesLoaded: false,
      categoriesLoaded: false,
      siteDataLoaded: false,
      site: {}
    }
  },
  watch: {

  },
  methods: {
    isLandscape() {
      return (document.documentElement.clientWidth > document.documentElement.clientHeight);
    },

    updateUserLatLng(latlng) {
      this.userLatLng = latlng;
    }
  },
  mounted () {
    setTimeout(()=>{
      this.$forceUpdate();
    }, 3000);

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
    axios
      .get('/api/all.json')
      .then(response => {
        this.entries = response.data
      })
      .catch(error => {
        console.log(error)
        this.errored = true
      })
      .finally(() => this.entriesLoaded = true)
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
  padding: ms(8) ms(4);
  border-radius: ms(0);
  animation: popup 1s forwards;
  width: 100%;
  max-width: 680px;
  text-align: center;

  .dialog-inner {
    max-width: 400px;
    margin: 0 auto;
  }

  h3 {
    font-family: mikado;
    font-size: ms(6);
    font-weight: 900;
    font-style: italic;
    margin-bottom: ms(2);
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

.map-wrapper {
  position: relative;
  overflow: hidden;
  flex: 1 1 100%;
  display: flex;
  flex-direction: column;

  @media screen and (orientation: landscape) and (min-width: 800px) {
    flex-direction: row;
  }
}
</style>