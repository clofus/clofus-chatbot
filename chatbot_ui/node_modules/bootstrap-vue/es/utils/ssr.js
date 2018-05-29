// Polyfills for SSR

var isSSR = typeof window === 'undefined';

export var HTMLElement = isSSR ? Object : window.HTMLElement;