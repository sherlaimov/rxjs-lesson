import { ICharacter, IAppState } from './interfaces';

const wrapper = document.querySelector('.wrapper') as HTMLDivElement;
export const inputElement: HTMLInputElement = document.querySelector(
  '#refInput'
) as HTMLInputElement;

export const statusSelect: HTMLSelectElement = document.querySelector(
  '#status'
) as HTMLSelectElement;
export const genderSelect: HTMLSelectElement = document.querySelector(
  '#gender'
) as HTMLSelectElement;

const createEl = (type: string, attr?: object, textNode?: string): HTMLElement => {
  const el = document.createElement(type);
  if (attr && Object.entries(attr).length !== 0) {
    Object.entries(attr).forEach(keyVal => {
      const [key, value] = keyVal;
      el.setAttribute(key, value);
    });
  }
  if (textNode) {
    el.textContent = textNode;
  }
  return el;
};

export const controlsNav = createEl('nav', { class: 'controls' });

const ul = createEl('ul');

const createPagination = (appState: IAppState): void => {
  controlsNav.innerHTML = '';
  const { step, currPage } = appState;
  if (currPage < appState.range.min) {
    appState.range.max = currPage;
    appState.range.min = currPage - step + 1;
  }
  if (currPage > appState.range.max) {
    appState.range.min = currPage;
    appState.range.max = currPage + step;
  }
  const { min, max } = appState.range;

  for (let i = min; i <= max; i++) {
    const spanAttr = { 'data-page': i, class: '' };
    if (appState.currPage === i) {
      spanAttr.class = 'active';
    }
    const pageNum = createEl('span', spanAttr, `${i}`.toString());
    controlsNav.appendChild(pageNum);
  }
  const prevBtn = createEl('button', { class: 'prev' }, 'Prev') as HTMLButtonElement;
  const nextBtn = createEl('button', { class: 'next' }, 'Next') as HTMLButtonElement;

  appState.currPage === 1 ? (prevBtn.disabled = true) : (prevBtn.disabled = false);
  appState.currPage === appState.pages ? (nextBtn.disabled = true) : (nextBtn.disabled = false);
  controlsNav.prepend(prevBtn);
  controlsNav.append(nextBtn);
  wrapper.appendChild(controlsNav);
};

const createList = (appState: IAppState): void => {
  const { results } = appState;
  if (results !== undefined) {
    ul.innerHTML = '';
    results.forEach((character: ICharacter) => {
      const li = createEl('li', {}, `${character.id}. ${character.name}`);
      const img = createEl('img', { src: character.image });
      li.appendChild(img);
      ul.appendChild(li);
    });
    wrapper.insertBefore(ul, controlsNav);
  }
};

const filterByStatus = (appState: IAppState): void => {
  const { results, cache } = appState;
  const status = Object.keys(appState.statusMap).find(key => appState.statusMap[key] === true);
  if (status === undefined || results === undefined) return;
  if (status === 'all') {
    appState.results = appState.cache;
  } else {
    if (cache === undefined) return;
    appState.results = cache.filter(
      (character: ICharacter) => character.status.toLowerCase() === status.toLowerCase()
    );
  }
};

const filterBySearch = (appState: IAppState): void => {
  const { searchVal } = appState;

  const status = Object.keys(appState.statusMap).find(key => appState.statusMap[key] === true);

  if (status === 'all') {
    appState.results = appState.cache;
  }
  if (searchVal !== '' && appState.results !== undefined) {
    appState.results = appState.results.filter(character =>
      character.name.toLowerCase().includes(searchVal.toLowerCase())
    );
  }
};

export const applyFiltersAndRender = (appState: IAppState): void => {
  filterByStatus(appState);
  filterBySearch(appState);
  console.log('appState');
  console.log(appState);
  render(appState);
};

export const render = (appState: IAppState): void => {
  createPagination(appState);
  createList(appState);
};
