import bListGroup from './list-group';
import bListGroupItem from './list-group-item';
import { registerComponents, vueUse } from '../../utils/plugins';

var components = {
  bListGroup: bListGroup,
  bListGroupItem: bListGroupItem
};

var VuePlugin = {
  install: function install(Vue) {
    registerComponents(Vue, components);
  }
};

vueUse(VuePlugin);

export default VuePlugin;