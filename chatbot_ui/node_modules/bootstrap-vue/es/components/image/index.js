import bImg from './img';
import bImgLazy from './img-lazy';
import { registerComponents, vueUse } from '../../utils/plugins';

var components = {
  bImg: bImg,
  bImgLazy: bImgLazy
};

var VuePlugin = {
  install: function install(Vue) {
    registerComponents(Vue, components);
  }
};

vueUse(VuePlugin);

export default VuePlugin;