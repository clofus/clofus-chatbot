import paginationMixin from '../../mixins/pagination';
import { isVisible } from '../../utils/dom';

var props = {
  perPage: {
    type: Number,
    default: 20
  },
  totalRows: {
    type: Number,
    default: 20
  },
  ariaControls: {
    type: String,
    default: null
  }

  // Our render function is brought in from the pagination mixin
};export default {
  mixins: [paginationMixin],
  props: props,
  computed: {
    numberOfPages: function numberOfPages() {
      var result = Math.ceil(this.totalRows / this.perPage);
      return result < 1 ? 1 : result;
    }
  },
  methods: {
    // These methods are used by the render function
    onClick: function onClick(num, evt) {
      var _this = this;

      // Handle edge cases where number of pages has changed (i.e. if perPage changes)
      if (num > this.numberOfPages) {
        num = this.numberOfPages;
      } else if (num < 1) {
        num = 1;
      }
      this.currentPage = num;
      this.$nextTick(function () {
        // Keep the current button focused if possible
        var target = evt.target;
        if (isVisible(target) && _this.$el.contains(target) && target.focus) {
          target.focus();
        } else {
          _this.focusCurrent();
        }
      });
      this.$emit('change', this.currentPage);
    },
    makePage: function makePage(pagenum) {
      return pagenum;
    },
    linkProps: function linkProps(pagenum) {
      return { href: '#' };
    }
  }
};