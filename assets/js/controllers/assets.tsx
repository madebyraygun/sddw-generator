import { Character, Characters, InlineSVG, InlineSVGs } from '../../../components/types/assets';
import Controller from './controller';

interface AssetTheme {
  [category: string]: AssetCategory
}

interface AssetCategory {
  characters: Characters,
  footers: InlineSVGs,
  icons: InlineSVGs,
  logos: InlineSVGs
}

class AssetsController implements Controller {

  allowedCharacters = '';

  assets: {
    [theme: string]: AssetTheme
  } = {};

  state: {
    theme: string
  } = {
    theme: 'default'
  };

  initialize() {
    this.require();
  }

  require() {
    // default theme
    this.loadCharacters(require.context('../../vectors/characters/default/', true, /\.tsx$/));
    this.loadInlineSVGs(require.context('../../vectors/footers/default/', true, /\.tsx$/), 'footers');
    this.loadInlineSVGs(require.context('../../vectors/icons/default/', true, /\.tsx$/), 'icons');
    this.loadInlineSVGs(require.context('../../vectors/logos/default/', true, /\.tsx$/), 'logos');

    // 2021
    this.loadInlineSVGs(require.context('../../vectors/logos/2021/', true, /\.tsx$/), 'logos', '2021');
  }

  checkAssets(category, themeSlug?: string | null) {
    const theme = themeSlug || this.state.theme;

    if (!this.assets[theme]) {
      this.assets[theme] = {};
    }

    if (!this.assets[theme][category]) {
      this.assets[theme][category] = {
        characters: {},
        footers: {},
        icons: {},
        logos: {}
      };
    }
  }

  loadCharacters(required, themeSlug?: string | null) {
    const theme = themeSlug || this.state.theme;
    this.checkAssets('characters', themeSlug);
    required.keys().map((path: string) => {
      const character = decodeURIComponent(path.split('/')[1].toLowerCase());
      const { default: SvgCharacter } = required(path);
      const svg = SvgCharacter({});
      const children = svg.querySelectorAll('path, rect, circle');
      const [,, width, height] = svg.getAttribute('viewBox').split(' ');
      const dimension = [parseFloat(width), parseFloat(height)];
      if (this.allowedCharacters.indexOf(character) === -1) this.allowedCharacters += character;
      if (!this.assets[theme].characters[character]) this.assets[theme].characters[character] = [];
      this.assets[theme].characters[character].push({
        svg,
        children: children,
        dimension
      });
    });
    console.log(this.allowedCharacters);
  }

  loadInlineSVGs(required, category:string, themeSlug?: string | null) {
    const theme = themeSlug || this.state.theme;
    this.checkAssets(category, themeSlug);
    required.keys().map((path: string) => {
      const [svgName] = path.split('/')[1].toLowerCase().split('.tsx');
      const { default: SvgAsset } = required(path);
      const svg = SvgAsset({});
      const children = svg.querySelectorAll('path, rect, circle');
      const [,, width, height] = svg.getAttribute('viewBox').split(' ');
      const dimension = [parseFloat(width), parseFloat(height)];
      this.assets[theme][category][svgName] = {
        svg,
        children: children,
        dimension
      };
    });
  }

  getCharacter(glyph: string, variationIndex = 0, themeSlug?: string | null): Character | null {
    const theme = themeSlug || this.state.theme;
    return this.assets[theme].characters[glyph][Math.min(variationIndex, this.assets[theme].characters[glyph].length - 1)];
  }

  getAsset(type: string, id: string, themeSlug?: string | null): InlineSVG {
    const theme = themeSlug || this.state.theme;
    const typePlural = ['footer', 'icon', 'logo'].indexOf(type) >= 0 ? type + 's' : type;
    const asset: InlineSVG = this.assets[theme][typePlural][id];
    if (!asset) {
      console.error(`Cannot find asset id "${id}", type "${type}", theme "${themeSlug}"`);
      return null;
    }
    return asset;
  }

  getFooter(id: string, themeSlug?: string | null): InlineSVG {
    return this.getAsset('footer', id, themeSlug);
  }

  getIcon(id: string, themeSlug?: string | null): InlineSVG {
    return this.getAsset('icon', id, themeSlug);
  }

  getLogo(id: string, themeSlug?: string | null): InlineSVG {
    return this.getAsset('logo', id, themeSlug);
  }

  set theme(id: string) {
    this.state.theme = id;
  }

  get theme(): string {
    return this.state.theme;
  }

}

export default new AssetsController();