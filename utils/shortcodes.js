module.exports = {
    icon: function (name, width, height) {
      return `<svg class="icon icon--${name}" role="img" aria-hidden="true" width="${width || 24}" height="${height || 24}">
        <use xlink:href="#icon-${name}"></use>
      </svg>`
    },
}
