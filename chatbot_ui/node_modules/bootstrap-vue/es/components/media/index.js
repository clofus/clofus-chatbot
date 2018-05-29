import bMedia from './media';
import bMediaAside from './media-aside';
import bMediaBody from './media-body';
import { registerComponents, vueUse } from '../../utils/plugins';

var components = {
  bMedia: bMedia,
  bMediaAside: bMediaAside,
  bMediaBody: bMediaBody
};

var VuePlugin = {
  install: function install(Vue) {
    registerComponents(Vue, components);
  }
};

vueUse(VuePlugin);

export default VuePlugin;