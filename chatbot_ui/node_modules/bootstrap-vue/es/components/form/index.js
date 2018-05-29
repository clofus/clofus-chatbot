import bForm from './form';
import bFormRow from './form-row';
import bFormText from './form-text';
import bFormInvalidFeedback from './form-invalid-feedback';
import bFormValidFeedback from './form-valid-feedback';
import { registerComponents, vueUse } from '../../utils/plugins';

var components = {
  bForm: bForm,
  bFormRow: bFormRow,
  bFormText: bFormText,
  bFormInvalidFeedback: bFormInvalidFeedback,
  bFormFeedback: bFormInvalidFeedback,
  bFormValidFeedback: bFormValidFeedback
};

var VuePlugin = {
  install: function install(Vue) {
    registerComponents(Vue, components);
  }
};

vueUse(VuePlugin);

export default VuePlugin;