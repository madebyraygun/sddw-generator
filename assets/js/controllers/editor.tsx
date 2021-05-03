// import swearjar from 'swearjar';

import ThemeController from './theme';

import PosterState from '../../../components/poster/poster-state';
import WordState from '../../../components/poster/word-state';
import CharacterState from '../../../components/poster/character-state';

class Editor {

  posters: Array<PosterState>;
  currentPoster: PosterState;
  currentWord: WordState;

  constructor() {
    try {
      this.currentPoster = new PosterState(ThemeController.theme);
    } catch (e) {
      console.error(e);
    }
  }

  // render phrases and characters

  nextCharacter(word: WordState, characterIndex: number, $container: HTMLElement | null, callback?: (value) => void) {
    word.nextCharacterByIndex(characterIndex);

    if ($container) {
      this.renderWord(word, $container);
    }

    if (callback) {
      callback({ word, characterIndex, $container });
    }
  }

  prevCharacter(word: WordState, characterIndex: number, $container: HTMLElement | null, callback?: (value) => void) {
    word.prevCharacterByIndex(characterIndex);

    if ($container) {
      this.renderWord(word, $container);
    }

    if (callback) {
      callback({ word, characterIndex, $container });
    }
  }

  shuffleCharacter(word: WordState, characterIndex: number, $container: HTMLElement | null, callback?: (value) => void) {
    word.shuffleCharacterByIndex(characterIndex);

    if ($container) {
      this.renderWord(word, $container);
    }

    if (callback) {
      callback({ word, characterIndex, $container });
    }
  }

  shuffleWord(word: WordState, $container: HTMLElement | null, callback?: (value) => void) {
    word.shuffle();

    if ($container) {
      this.renderWord(word, $container);
    }

    if (callback) {
      callback({ word, $container });
    }
  }

  // utilities

  pxToRem(value: number) {
    return value / 10;
  }

  attachWord(word: WordState) {
    this.currentWord = word;
    this.currentPoster.attachWord(this.currentWord);
  }

  // render word to container

  renderWord(word: WordState, $container?: HTMLElement, callback?: (value: NodeList) => void) {
    const $characters: DocumentFragment = document.createDocumentFragment();
    for (const character of word.characters) {
      const data = this.assets.characters[character.glyph][character.variationIndex];
      const [width, height] = data.dimension;
      const phraseHeight = 100;
      $characters.appendChild(
        <figure data-character data-index={$characters.length} style={{ width: `${this.pxToRem(width * (phraseHeight / height))}rem`, height: `${this.pxToRem(phraseHeight)}rem` }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${width} ${height}`}>
            {[...data.paths].map((path, index) => {
              const d = path.getAttribute('d');
              return d ? (
                <path key={index} d={d} fill={!character.variationIndex ? this.currentPoster.theme.bright : character.colors[index]}></path>
              ) : null;
            })}
          </svg>
        </figure>
      );
    }

    if ($container) {
      $container.innerHTML = '';
      $container.appendChild((
        <figure data-phrase>
          {$characters}
        </figure>
      ));
    }

    if (callback) callback($characters.childNodes);

    return $characters;
  }

  // render poster to container

  renderPoster(poster: PosterState, $container: HTMLElement | null = null) {
    const $output: HTMLElement = poster.render() as HTMLElement;

    if ($container) {
      $container.innerHTML = $output.outerHTML;
    }

    return $output;
  }

  renderPosters($container: HTMLElement = document.body) {
    if ($container) {
      const $posterWrappers: NodeList = $container.querySelectorAll('[data-poster]');
      for (const $posterWrapper of $posterWrappers) {
        this.renderPoster(this.currentPoster, $posterWrapper as HTMLElement);
      }
    }
  }

}

export default new Editor();