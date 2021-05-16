<template>
    <div class="category-panel" @mouseleave="currentlyHovered = null">
      <template v-for="entry in entriesSortedByDistance">
        <div class="category-panel--type" v-if="!userLatLng.length && entry.type && newType(entry.type)">{{ entry.type }}</div>
        <button class="category-panel--entry" :class="{selected: (entry.id == selectedEntryID)}" :key="entry.id" :ref="entry.id" @keyup.enter="$emit('menu-entry-selected',entry.id)" @click="$emit('menu-entry-selected',entry.id)">
          <div class="category-panel--entry--text">
            <span class="category-panel--entry--type">{{ entry.type }}</span>
            <h3 class="category-panel--entry--title">{{ entry.name }}</h3>
          </div>
          <span class="category-panel--entry--location" v-if="entry.distance">{{ entry.distance }} miles</span>
          <span class="category-panel--entry--location" v-else-if="entry.postcode">{{ entry.postcode }}</span>
        </button>
      </template>
    </div>
</template>

<script>


export default {
  name: 'Category',
  props: ['slug','selectedEntryID', 'userLatLng', 'menuOpen', 'isLandscape'],
  components: {

  },
  data() {
    return {
      entries: [],
      currentlyHovered: null,
      categoryLoaded: false,
      currentCategoryHeading: null
    }
  },
  watch: {
    userLatLng: function(userLatLng) {
      if(!userLatLng.length) {
        this.getCategory(this.slug);

      }
    },
    entries: function(entries) {
      this.$emit('filtered-entries', entries)
    },
    selectedEntryID: function (selectedEntryID) {
      this.scrollToSidebarEntry(selectedEntryID);
    },
  },
  computed: {
    entriesSortedByDistance() {
      if(this.userLatLng.length) {
        return this.entries.map( (entry) => {
          if(entry.latitude && entry.longitude) {
            entry.distance = this.distanceFromUserLatLng(entry);
          }
          else {
            entry.distance == null;
          }
          return entry;
        }).sort( (a,b) => {
          if(!b.distance) {
            return -1;
          }
          else {
            return a.distance - b.distance;
          }
        });
      }
      else {
        return this.entries
      }
    }
  },
  methods: {

  },
  mounted () {
    this.getCategory(this.slug);
    if(this.selectedEntryID) {
      this.scrollToSidebarEntry(this.selectedEntryID);
    }
  }
}
</script>

<style lang="scss">
@import '../../styles/base.scss';

.category-panel {
  flex: 1 1 60vh;
  overflow-y: auto;

  &--type {
    background-color: $brand-green;
    color: white;
    padding: ms(-6) ms(2);

  }

  &--entry {
    width: 100%;
    display: flex;
    flex-direction: row;
    text-align: left;
    padding: ms(2) ms(2) ms(2) ms(2)/2;
    cursor: pointer;
    border-left: ms(2)/2 solid transparent;

    + .category-panel--entry {
      border-top: 1px solid $light-gray;
    }

    &:hover {
      background-color: $light-gray;

      .category-panel--entry--location {
        background-color: $medium-gray;
      }
    }

    &--text {
      overflow: hidden;
      flex: 1;
      margin-right: auto;
    }

    &--title {
      text-transform: capitalize;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &--type {
      font-size: ms(-2);
      color: $gray;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-top: -ms(0);
      text-overflow: ellipsis;
      white-space: nowrap;

    }

    &--location {
      white-space: nowrap;
      margin-top: auto;
      font-size: ms(-1);
      margin-left: ms(-1);
      background-color: $light-gray;
      border-radius: 1em;
      padding: 0 ms(-2);
      color: $gray;
    }

    &.selected {
      border-top: none;
      border-bottom: none;
      border-left-color: $brand-green;
      background-color: transparentize($brand-green, 0.85);

      .category-panel--entry--location {
        background-color: $brand-green;
        color: white;
      }


    }
  }
}

</style>