import bCarousel from './carousel';
import bCarouselSlide from './carousel-slide';
import { registerComponents, vueUse } from '../../utils/plugins';

var components = {
  bCarousel: bCarousel,
  bCarouselSlide: bCarouselSlide
};

var VuePlugin = {
  install: function install(Vue) {
    registerComponents(Vue, components);
  }
};

vueUse(VuePlugin);

export default VuePlugin;