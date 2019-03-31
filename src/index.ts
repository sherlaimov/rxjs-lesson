import { from, fromEvent, Observable, of, merge } from 'rxjs';
import { map, catchError, mergeMap, filter } from 'rxjs/operators';

import './main.scss';
import { ICharacter, IInfo, IServerResp, IAppState } from './interfaces';

const capitalize = (s: string | undefined) => {
  if (typeof s !== 'string') return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const appState: IAppState = {
  step: 5,
  currPage: 1,
  range: { min: 1, max: 5 },
  statusMap: {
    all: true,
    alive: false,
    dead: false,
    unknown: false,
  },
};

const wrapper = document.querySelector('.wrapper') as HTMLDivElement;
const inputElement: HTMLInputElement = document.querySelector('#refInput') as HTMLInputElement;
const statusSelect = document.querySelector('#status') as HTMLSelectElement;
const genderSelect = document.querySelector('#gender') as HTMLSelectElement;

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

const controlsNav = createEl('nav', { class: 'controls' });

const updateAppState = (): void => {
  console.log(appState);
  createPagination();
  createList();
};

const createPagination = (): void => {
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

const ul = createEl('ul');

const createList = (): void => {
  const { results } = appState;
  if (results !== undefined) {
    ul.innerHTML = '';
    results.forEach((character: ICharacter) => {
      const li = createEl('li');
      li.textContent = `${character.id}. ${character.name}`;
      ul.appendChild(li);
    });
    wrapper.insertBefore(ul, controlsNav);
  }
};

const source$: Observable<IServerResp> = from(
  fetch(`https://rickandmortyapi.com/api/character/?page=${appState.currPage}`)
    .then((res: Response) => res.json())
    .catch(err => console.log(err))
);

const controls$ = fromEvent(controlsNav, 'click').pipe(
  map((e: Event) => {
    const target = e.target as any;

    if (target.nodeName === 'BUTTON') {
      const action = target.className;
      return action;
    } else {
      const { page } = target.dataset;
      return page;
    }
  }),
  map((action: string) => {
    if (action === 'prev') {
      if (appState.currPage > 1) {
        appState.currPage -= 1;
      }
    } else if (action === 'next') {
      appState.currPage += 1;
    } else {
      appState.currPage = parseInt(action);
    }
  }),
  mergeMap(() =>
    from(
      fetch(`https://rickandmortyapi.com/api/character/?page=${appState.currPage}`)
        .then((res: Response) => res.json())
        .catch(err => console.log(err))
    )
  ),
  filter(response => {
    const { results } = response;
    const status = Object.keys(appState.statusMap).find(key => appState.statusMap[key] === true);
    if (status === 'all') {
      return response;
    } else {
      response.results = results.filter(
        (character: ICharacter) => character.status === capitalize(status)
      );
    }
    return response;
  }),
  catchError((err: Error, caught: any) => {
    return of(err);
  })
);

const status$ = fromEvent(statusSelect, 'change').pipe(
  map((e: Event) => {
    const v = (e.target as any).value;
    return v.toLowerCase();
  })
);

status$.subscribe(status => {
  const { cache } = appState;
  if (cache === undefined) return;
  Object.keys(appState.statusMap).forEach(key => {
    appState.statusMap[key] = false;
    if (key === status) {
      appState.statusMap[key] = true;
    }
  });

  if (status !== 'all') {
    appState.results = cache.filter(
      (character: ICharacter) => character.status === capitalize(status)
    );
  } else {
    appState.results = appState.cache;
  }
  createList();
});

const input$ = fromEvent(inputElement, 'input').pipe(
  map((e: Event) => {
    const searchVal = (e.target as any).value;
    return searchVal.trim();
  })
);

input$.subscribe((searchVal: string) => {
  const { cache } = appState;
  if (cache === undefined || appState.results === undefined) return;

  const status = Object.keys(appState.statusMap).find(key => appState.statusMap[key] === true);
  if (status === 'all') {
    appState.results = appState.cache;
  } else {
    appState.results = cache.filter(
      (character: ICharacter) => character.status === capitalize(status)
    );
  }

  if (searchVal !== '' && appState.results !== undefined) {
    appState.results = appState.results.filter(character =>
      character.name.toLowerCase().includes(searchVal.toLowerCase())
    );
  }
  createList();
});

merge(source$, controls$).subscribe((response: any) => {
  const { results }: { results: Array<ICharacter> } = response;
  const { info }: { info: IInfo } = response;
  Object.assign(appState, info, { results }, { cache: results });
  updateAppState();
});
