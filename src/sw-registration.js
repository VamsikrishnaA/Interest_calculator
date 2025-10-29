// src/sw-registration.js
import { registerSW } from 'virtual:pwa-register';

registerSW({
  immediate: true,
  onNeedRefresh() {},
  onOfflineReady() {},
});