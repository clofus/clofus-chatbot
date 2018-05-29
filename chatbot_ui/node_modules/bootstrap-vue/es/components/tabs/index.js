import bTabs from './tabs';
import bTab from './tab';
import { registerComponents, vueUse } from '../../utils/plugins';

var components = {
  bTabs: bTabs,
  bTab: bTab
};

var VuePlugin = {
  install: function install(Vue) {
    registerComponents(Vue, components);
  }
};

vueUse(VuePlugin);

export default VuePlugin;