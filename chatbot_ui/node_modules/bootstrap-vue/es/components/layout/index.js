import bContainer from './container';
import bRow from './row';
import bCol from './col';
import bFormRow from './form-row';
import { registerComponents, vueUse } from '../../utils/plugins';

var components = {
  bContainer: bContainer,
  bRow: bRow,
  bCol: bCol,
  bFormRow: bFormRow
};

var VuePlugin = {
  install: function install(Vue) {
    registerComponents(Vue, components);
  }
};

vueUse(VuePlugin);

export default VuePlugin;