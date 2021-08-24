<template>
  <div class="map-wrapper">
    <Welcome />
    <Menu :entryCount="entries.length" :userLatLng="userLatLng" :entries="entries" :isLandscape="isLandscape()" :selectedEntryID="selectedEntryID" @user-latlng-changed="updateUserLatLng($event)" @menu-entry-selected="selectedEntryID = $event"></Menu>
    <Map v-if="entries" :isLandscape="isLandscape()" :entries="entries" :userLatLng="userLatLng" :selectedEntryID="selectedEntryID" @marker-clicked="selectedEntryID = $event"></Map>
  </div>
</template>

<script>
import Map from './Map.vue';
import Menu from './Menu.vue';
import Welcome from './Welcome.vue';

export default {
  name: 'Overview',
  props: [],
  components: {
    Map,
    Menu,
    Welcome
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