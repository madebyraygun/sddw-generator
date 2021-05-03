import { Characters, Footers } from '../../../components/types/assets';

class AssetController {

  assets: {
    [theme: string]: {
      characters: Characters,
      footers: Footers,
    }
  } = {
    default: {
      characters: {},
      footers: {},
    }
  };

  requireCharacters(required: __WebpackModuleApi.RequireContext, design = 'default') {
    required.keys().map((path: string) => {
      const character = path.split('/')[1].toLowerCase();
      const { default: SvgCharacter } = required(path);
      const svg = SvgCharacter({});
      const paths = svg.querySelectorAll('path');
      const [,, width, height] = svg.getAttribute('viewBox').split(' ');
      const dimension = [parseFloat(width), parseFloat(height)];
      if (!this.assets[design].characters[character]) this.assets[design].characters[character] = [];
      this.assets[design].characters[character].push({
        svg,
        paths,
        dimension
      });
    });
    console.log(this.assets);
  }

  requireFooters(required: __WebpackModuleApi.RequireContext, design = 'default') {
    required.keys().map((path: string) => {
      const footer = path.split('/')[1].toLowerCase();
      const { default: SvgFooter } = required(path);
      const svg = SvgFooter({});
      const paths = svg.querySelectorAll('path, rect, circle');
      const [,, width, height] = svg.getAttribute('viewBox').split(' ');
      const dimension = [parseFloat(width), parseFloat(height)];
      this.assets[design].footers[footer] = {
        svg,
        paths,
        dimension
      };
    });
  }

  getCharacter(id: string, variationIndex = 0, themeSlug = 'default') {
    return this.assets[themeSlug].characters[id][variationIndex];
  }

  getFooter(id: string, themeSlug = 'default') {
    return this.assets[themeSlug].footers[id];
  }

}

export default new AssetController();