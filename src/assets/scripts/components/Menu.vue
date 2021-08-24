<template>
  <div class="sidebar" :class="menuOpen ? 'menu-open' : ''">
    <div class="sidebar--header">
      <img class="sidebar--logo" src="/assets/images/glass-icon.png" />
      <div>
        <h1 class="sidebar--subtitle">Zero Waste Leeds</h1>
        <h2 class="sidebar--title">Glass Recycling</h2>
      </div>
      <button
        class="button sidebar--header--button"
        v-if="!isLandscape"
        @click="menuOpen = !menuOpen"
        v-html="menuOpen ? 'Show map' : 'Show list'"
      ></button>
    </div>

    <div class="sidebar--controls">
      <span class="sidebar--back">{{ entryCount }} entries loaded</span>

      <div class="sidebar--postcode" v-if="!latLng.length">
        <label for="postcode" class="sr-only">Postcode</label>
        <input
          @keyup.enter="convertPostcodeToLatLng"
          placeholder="Enter postcode"
          id="postcode"
          class="sidebar--postcode--input"
          type="text"
          v-model="postcode"
        />
        <button
          class="sidebar--postcode--button"
          @click="convertPostcodeToLatLng"
          aria-label="Search"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      </div>
      <div v-else class="sidebar--postcode">
        <div class="sidebar--postcode--badge">
          Near to {{ postcode }}
          <button
            class="sidebar--postcode--clear"
            @click="clearPostcode"
            aria-label="Clear postcode"
          >
            ✕
          </button>
        </div>
      </div>
    </div>

    <p v-if="error" class="sidebar--postcode--error">{{ error }}</p>

    <nav class="sidebar--menu" v-show="isLandscape || menuOpen">
      <div
        ref="entrylist"
        class="category-panel"
        @mouseleave="currentlyHovered = null"
      >
        <template v-for="entry in entriesSortedByDistance">
          <button
            class="category-panel--entry"
            :class="{ selected: entry.id == selectedEntryID }"
            :key="entry.id"
            :ref="entry.id"
            @keyup.enter="$emit('menu-entry-selected', entry.id)"
            @click="$emit('menu-entry-selected', entry.id)"
          >
            <div class="category-panel--entry--text">
              <h3 class="category-panel--entry--title">{{ entry.site_name }}</h3>
            </div>
            <span class="category-panel--entry--location" v-if="entry.distance !== undefined">{{ entry.distance < 1 ? `${Math.round(entry.distance * 20)} mins walk` : `${entry.distance} miles` }} </span>
            <span
              class="category-panel--entry--location"
              v-else-if="entry.post_code"
              >{{ entry.post_code }}</span
            >
          </button>
        </template>
      </div>
    </nav>
    <!-- <transition name="fade" >

      <nav class="sidebar--menu" v-show="isLandscape || menuOpen" >
        <template v-for="category in categories"  :class="($route.params.slug && $route.params.slug != category.slug) ? 'contract' : 'expand'">
          <router-link :to="($route.params.slug && $route.params.slug == category.slug) ? { name: 'app'} : { name: 'category', params: { slug: category.slug } }" :ref="category.slug" :tabindex="($route.params.slug && $route.params.slug != category.slug) ? -1 : ''" :key="category.slug" class="sidebar--menu--item" :class="($route.params.slug && $route.params.slug !== category.slug) ? 'contract' : 'expand'">
              <img class="sidebar--menu--item--icon" :src="category.icon" />
              {{ category.title }}
              <svg class="sidebar--menu--item--arrow"  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 841.89 595.28"><path d="M412.98 119.97l64.25 49.48L623.3 281.97c8.54 6.57 8.54 25.49 0 32.07L477.22 426.55l-64.25 49.48" fill="none" stroke="currentColor" stroke-width="15.527" stroke-miterlimit="10"/></svg>
          </router-link>
          <transition name="expand">
            <router-view v-if="$route.params.slug == category.slug" :key="$route.params.slug" :menuOpen="menuOpen" :isLandscape="isLandscape" :userLatLng="userLatLng" :selectedEntryID="selectedEntryID" @menu-entry-selected="$emit('menu-entry-selected', $event)" @filtered-entries="$emit('filtered-entries', $event)"></router-view>
          </transition>
        </template>
      </nav>
    </transition> -->
  </div>
</template>

<script>
export default {
  name: "Menu",
  props: [
    "entries",
    "selectedEntryID",
    "isLandscape",
    "userLatLng",
    "entryCount",
  ],
  data() {
    return {
      menuOpen: false,
      commentCounts: null,
      postcode: null,
      error: null,
      latLng: [],
      currentlyHovered: null,
      categoryLoaded: false,
      currentCategoryHeading: null,
    };
  },
  computed: {
    entriesSortedByDistance() {
      if (this.userLatLng.length) {
        return this.entries
          .map((entry) => {
            if (entry.latitude && entry.longitude) {
              entry.distance = this.distanceFromUserLatLng(entry);
            } else {
              entry.distance == null;
            }
            return entry;
          })
          .sort((a, b) => {
            return a.distance - b.distance;
          });
      } else {
        return this.entries;
      }
    },
  },
  watch: {
    latLng: function() {
      this.$emit("user-latlng-changed", this.latLng);
    },
    selectedEntryID: function(selectedEntryID) {
      if (selectedEntryID) {
        this.menuOpen = false;
      }
    },
    userLatLng: function(userLatLng) {
      this.$refs.entrylist.scrollTop = 0;
    },
    entries: function(entries) {
      this.$emit("filtered-entries", entries);
    },
    selectedEntryID: function(selectedEntryID) {
      this.scrollToSidebarEntry(selectedEntryID);
    },
  },
  methods: {
    mouseoverCategory: function(selectedCategoryID) {
      this.$emit("menu-hovered", selectedCategoryID);
    },
    convertPostcodeToLatLng: function() {
      fetch(`//api.postcodes.io/postcodes/${this.postcode.split(" ").join("")}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.status == 200) {
            this.latLng = [data.result.latitude, data.result.longitude];
            this.error = null;
            this.postcode = this.postcode.toUpperCase();
          } else {
            this.error = data.error;
          }
        });
    },
    clearPostcode: function() {
      this.latLng = [];
      this.postcode = null;
    },
    newType(type) {
      let compareMe = this.currentTypeHeading;
      this.currentTypeHeading = type;
      return type != compareMe;
    },
    distanceFromUserLatLng: function(entry) {
      let distance = this.distance(
        entry.latitude,
        entry.longitude,
        this.userLatLng[0],
        this.userLatLng[1]
      );
      return Math.round(distance * 10) / 10;
    },
    distance(lat1, lon1, lat2, lon2) {
      if (lat1 == lat2 && lon1 == lon2) {
        return 0;
      } else {
        var radlat1 = (Math.PI * lat1) / 180;
        var radlat2 = (Math.PI * lat2) / 180;
        var theta = lon1 - lon2;
        var radtheta = (Math.PI * theta) / 180;
        var dist =
          Math.sin(radlat1) * Math.sin(radlat2) +
          Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
          dist = 1;
        }
        dist = Math.acos(dist);
        dist = (dist * 180) / Math.PI;
        dist = dist * 60 * 1.1515;
        // dist = dist * 1.609344;
        return dist;
      }
    },
    scrollToSidebarEntry(selectedEntryID) {
      if (selectedEntryID && this.$refs[selectedEntryID]) {
        let clickedMenuElement = this.$refs[selectedEntryID][0];
        if (clickedMenuElement) {
          if (!this.currentlyHovered && (this.isLandscape || this.menuOpen)) {
            clickedMenuElement.scrollIntoView({
              behavior: "smooth",
              block: "center",
              inline: "center",
            });
          }
        }
      }
    },
  },
  mounted() {
    if (this.selectedEntryID) {
      this.scrollToSidebarEntry(this.selectedEntryID);
    }
  },
};
</script>

<style lang="scss">
@import "../../styles/base.scss";

.sidebar {
  z-index: 999999;
  position: absolute;
  background-color: white;
  padding: 0;
  // width: 100%;
  // height: 100%;
  overflow: hidden;
  top: calc(100% - 10em);
  border-radius: 0.2em;
  border: 1px solid $medium-gray;

  transition: top 1s ease, z-index 1.5s ease;
  display: flex;
  flex-direction: column;

  left: ms(-2);
  right: ms(-2);
  width: auto;

  &::before {
    height: ms(-2);
    content: "";
    display: block;
    background-color: $brand-green;
    margin-bottom: ms(3);
  }

  &.menu-open {
    overflow-y: auto;
    z-index: 9999999;
    top: ms(-1);
    transition: top 1s ease, z-index 0s ease;
  }

  @media screen and (orientation: landscape) and (min-width: 800px) {
    display: block;
    overflow-y: auto;
    position: fixed;
    top: ms(2);
    height: auto;
    left: ms(1);
    bottom: auto;
    padding: 0;
    box-shadow: $box-shadow;
    width: $sidebar-width;
    // max-width: $sidebar-max-width;
  }

  &--header {
    line-height: ms(4);
    padding: 0 ms(0);
    display: flex;
    flex-direction: row;
    align-items: center;

    @media screen and (orientation: landscape) and (min-width: 800px) {
      padding: 0 ms(2) ms(0);
    }

    &--button {
      font-size: ms(-1);
      margin-left: auto;

      @media screen and (orientation: landscape) and (min-width: 800px) {
        font-size: ms(0);
      }
    }
  }

  &--logo {
    border-radius: 99999px;
    display: block;
    width: ms(6);
    height: auto;
    margin-right: ms(-4);

    @media screen and (orientation: landscape) and (min-width: 800px) {
      margin-right: ms(-2);
    }
  }

  &--title {
    font-weight: 400;
    font-size: ms(1);
    color: $dark-gray;

    @media screen and (orientation: landscape) and (min-width: 800px) {
      font-size: ms(2);
    }
  }

  &--subtitle {
    font-weight: 700;
    margin-bottom: 0;
    font-size: ms(-1);
    color: $dark-gray;

    @media screen and (orientation: landscape) and (min-width: 800px) {
      margin-bottom: ms(-6);
      font-size: ms(0);
    }
  }

  &--controls {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: ms(-2) ms(0) ms(-2) ms(2);
  }

  &--back {
    display: block;
    color: $gray;
    text-transform: lowercase;
    font-size: ms(-1);
  }

  &--postcode {
    margin-left: auto;
    position: relative;

    &--input {
      padding-right: ms(6);
      font-size: ms(-1);
      width: 11em;
      line-height: 1.6;
      border: 1px solid darken($brand-green, 15%);
      border-radius: 2em;
      padding: ms(-5) ms(-2);

      &::placeholder {
        color: $new-gray;
      }

      &:focus {
        outline: none;
        box-shadow: none;
        border-color: $gray;
      }
    }

    &--button {
      position: absolute;
      right: 1px;
      top: 1px;
      line-height: 1.4;
      background-color: darken($brand-green, 10%);
      color: white;
      border: 1px solid darken($brand-green, 20%);
      border-radius: 2em;
      padding: ms(-4);
      svg {
        width: ms(0);
        height: ms(0);
      }
    }

    &--clear {
      margin-left: ms(-4);
      color: black;
    }

    &--error {
      padding: ms(-1) ms(0);
      font-size: ms(-1);
      border: 1px solid $brand-green;
      border-radius: 3em;
      background-color: lighten($brand-green, 30%);
      margin: 0 ms(0) ms(-2) ms(2);
      color: $black;
    }

    &--badge {
      padding: ms(-5) ms(-1);
      border: 1px solid $gray;
      border-radius: 2em;
      font-size: ms(-1);
      background-color: $light-gray;
      color: $gray;
    }
  }

  &--menu {
    flex: 1;
    flex-direction: column;
    display: flex;

    &--item {
      overflow: hidden;
      display: flex;
      flex-direction: column;
      flex: 0 0 4em;
      display: flex;
      flex-direction: row;
      align-items: center;
      padding: 0 ms(2);

      @media screen and (orientation: landscape) and (min-width: 800px) {
      }

      // &:not(:last-child) {
      border-top: 1px solid $light-gray;
      // }

      @extend .expand-enter-active;

      &.contract {
        flex: 0 0 0;
        opacity: 0;
        user-select: none;
        pointer-events: none;

        @extend .expand-leave-active;
      }

      &.router-link-active {
        background-color: $brand-green;

        &:hover {
          background-color: darken($brand-green, 5%);
        }

        .sidebar--menu--item--icon {
          filter: brightness(0.5);
          opacity: 0.7;
        }

        .sidebar--menu--item--arrow {
          transform: rotate(90deg);
        }
      }

      &:hover {
        background-color: $light-gray;
      }

      &--icon {
        width: ms(4);
        height: ms(4);
        object-fit: contain;
        object-position: center;
        display: block;
        margin-right: ms(1);
        color: $brand-light-green;
      }

      &--arrow {
        width: ms(4);
        height: ms(4);
        margin-left: auto;
        color: $gray;
        transform-origin: 50% 50%;
        transition: transform $base-duration $base-timing;
      }
    }
  }
}

.category-panel {
  flex: 1 1 70vh;
  overflow-y: auto;

  @media screen and (orientation: landscape) and (min-width: 800px) {
    flex: 1 1 60vh;
  }

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
    padding: ms(2) ms(2) ms(2) ms(2) / 2;
    cursor: pointer;
    border-left: ms(2) / 2 solid transparent;

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
      background-color: $brand-light-green;

      .category-panel--entry--location {
        background-color: $brand-green;
        color: $dark-gray;
      }
    }
  }
}
</style>
