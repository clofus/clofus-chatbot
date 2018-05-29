export default {
  mounted: function mounted() {
    if (typeof document !== 'undefined') {
      document.documentElement.addEventListener('click', this._clickOutListener);
    }
  },
  beforeDestroy: function beforeDestroy() {
    if (typeof document !== 'undefined') {
      document.documentElement.removeEventListener('click', this._clickOutListener);
    }
  },

  methods: {
    _clickOutListener: function _clickOutListener(e) {
      if (!this.$el.contains(e.target)) {
        if (this.clickOutListener) {
          this.clickOutListener();
        }
      }
    }
  }
};