import bProgress from './progress';
import bProgressBar from './progress-bar';
import { registerComponents, vueUse } from '../../utils/plugins';

var components = {
  bProgress: bProgress,
  bProgressBar: bProgressBar
};

var VuePlugin = {
  install: function install(Vue) {
    registerComponents(Vue, components);
  }
};

vueUse(VuePlugin);

export default VuePlugin;