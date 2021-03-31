/**
* @license
* Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
* This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
* The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
* The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
* Code distributed by Google as part of the polymer project is also
* subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

/**
* This shim allows elements written in, or compiled to, ES5 to work on native
* implementations of Custom Elements v1. It sets new.target to the value of
* this.constructor so that the native HTMLElement constructor can access the
* current under-construction element's definition.
*/
(function () {
  if (
    window.Reflect === undefined ||
        window.customElements === undefined ||
        window.customElements.polyfillWrapFlushCallback
  ) return;
  const BuiltInHTMLElement = HTMLElement;
  const wrapper = {
    HTMLElement: function HTMLElement() {
      return Reflect.construct(BuiltInHTMLElement, [], (this.constructor));
    }
  };
  window.HTMLElement = wrapper['HTMLElement'];
  HTMLElement.prototype = BuiltInHTMLElement.prototype;
  HTMLElement.prototype.constructor = HTMLElement;
  Object.setPrototypeOf(HTMLElement, BuiltInHTMLElement);
})();