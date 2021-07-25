import Router from '../../assets/js/utils/router';

// not yet supported 06/2020
// https://developers.google.com/web/fundamentals/web-elements/customelements#extendhtml

// export default class AppLinkElement extends HTMLAnchorElement {
//   static selector = 'app-link-element';
//
//   connectedCallback() {
//     this.addEventListener('click', (e: MouseEvent) => {
//       console.log(e);
//     });
//   }
// }

// customElements.define(AppLinkElement.selector, AppLinkElement, { extends: 'a' });

export class AppLinkElement extends HTMLElement {

  static selector = 'app-link-element';

  onClick(e: MouseEvent) {
    e.preventDefault();
    const href = (e.currentTarget as HTMLAnchorElement).getAttribute('href');
    if (href) Router.navigate(href);
  }

  connectedCallback() {
    const anchor = this.querySelector('a');
    if (anchor) anchor.addEventListener('click', this.onClick);
  }

}

if (!window.customElements.get(AppLinkElement.selector)) {
  window.customElements.define(AppLinkElement.selector, AppLinkElement);
}

const Link: FC<{
  href: string;
}> = ({ href, children }) => (
  <div element={AppLinkElement.selector}>
    <a href={href}>{children}</a>
  </div>
);

export default Link;
