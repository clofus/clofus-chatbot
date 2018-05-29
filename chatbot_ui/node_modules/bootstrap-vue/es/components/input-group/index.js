import { registerComponents, vueUse } from '../../utils/plugins';

import bInputGroup from './input-group';
import bInputGroupAddon from './input-group-addon';
import bInputGroupPrepend from './input-group-prepend';
import bInputGroupAppend from './input-group-append';
import bInputGroupText from './input-group-text';

var components = {
  bInputGroup: bInputGroup,
  bInputGroupAddon: bInputGroupAddon,
  bInputGroupPrepend: bInputGroupPrepend,
  bInputGroupAppend: bInputGroupAppend,
  bInputGroupText: bInputGroupText
};

var VuePlugin = {
  install: function install(Vue) {
    registerComponents(Vue, components);
  }
};

vueUse(VuePlugin);

export default VuePlugin;