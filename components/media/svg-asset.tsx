import AssetsController from '../../assets/js/controllers/assets';

interface Reference {
  el?: HTMLElement
}

interface SvgProps {
  className?: string,
  svgType: string,
  svgId: string,
  svgTheme?: string
}

export class SvgAssetElement extends HTMLElement {

  static selector = 'svg-asset';

  ref: Reference = {};

  connectedCallback() {
    this.ref.el = this;

    const { svgType, svgId, svgTheme } = this.ref.el.dataset;
    if (svgType && svgId) {
      const { svg } = AssetsController.getAsset(svgType, svgId, svgTheme);
      if (svg) this.ref.el.appendChild(svg);
    }
  }

}

// connect to functional component -------------------------------------- //

if (!window.customElements.get(SvgAssetElement.selector)) {
  window.customElements.define(SvgAssetElement.selector, SvgAssetElement);
}

const SvgAsset: FC<SvgProps> = ({
  className, svgType, svgId, svgTheme
}) => (
  <div element={SvgAssetElement.selector} className={className ?? ''} data-svg-type={svgType} data-svg-id={svgId} data-svg-theme={svgTheme ?? 'default'}></div>
);

export default SvgAsset;