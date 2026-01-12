import { I18nManager } from 'react-native';
import { registerRootComponent } from 'expo';
import App from './App';

// Force LTR layout direction regardless of device locale
// This must be done before any components are rendered
// Note: Changes to RTL settings require an app restart to take full effect
if (I18nManager.isRTL) {
  I18nManager.allowRTL(false);
  I18nManager.forceRTL(false);
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
