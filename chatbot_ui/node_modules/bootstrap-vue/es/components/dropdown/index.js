import bDropdown from './dropdown';
import bDropdownItem from './dropdown-item';
import bDropdownItemButton from './dropdown-item-button';
import bDropdownHeader from './dropdown-header';
import bDropdownDivider from './dropdown-divider';
import { registerComponents, vueUse } from '../../utils/plugins';

var components = {
  bDropdown: bDropdown,
  bDd: bDropdown,
  bDropdownItem: bDropdownItem,
  bDdItem: bDropdownItem,
  bDropdownItemButton: bDropdownItemButton,
  bDropdownItemBtn: bDropdownItemButton,
  bDdItemButton: bDropdownItemButton,
  bDdItemBtn: bDropdownItemButton,
  bDropdownHeader: bDropdownHeader,
  bDdHeader: bDropdownHeader,
  bDropdownDivider: bDropdownDivider,
  bDdDivider: bDropdownDivider
};

var VuePlugin = {
  install: function install(Vue) {
    registerComponents(Vue, components);
  }
};

vueUse(VuePlugin);

export default VuePlugin;