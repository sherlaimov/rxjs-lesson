import { from, fromEvent, Observable, of, merge, throwError } from 'rxjs';
import { map, catchError, mergeMap, pluck, distinctUntilChanged } from 'rxjs/operators';
import { ICharacter, IInfo, IServerResp, IAppState } from './interfaces';
import {
  inputElement,
  statusSelect,
  controlsNav,
  render,
  applyFiltersAndRender,
} from './html.renderer';
import './main.scss';

const appState: IAppState = {
  step: 5,
  currPage: 1,
  range: { min: 1, max: 5 },
  searchVal: '',
  statusMap: {
    all: true,
    alive: false,
    dead: false,
    unknown: false,
  },
};

const initHttp$: Observable<IServerResp> = from(
  fetch(`https://rickandmortyapi.com/api/character/?page=${appState.currPage}`)
    .then((res: Response) => res.json())
    .catch(err => throwError(err))
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
      appState.currPage > 1 ? (appState.currPage -= 1) : (appState.currPage = appState.currPage);
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
  catchError((err: Error, caught: any) => {
    return of(err);
  })
);

const status$: Observable<string> = fromEvent(statusSelect, 'change').pipe(
  pluck('target', 'value')
);

const input$: Observable<string> = fromEvent(inputElement, 'input').pipe(
  distinctUntilChanged(),
  map((e: Event) => {
    const searchVal = (e.target as HTMLInputElement).value;
    return searchVal.trim();
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
  applyFiltersAndRender(appState);
});

input$.subscribe((searchVal: string) => {
  appState.searchVal = searchVal;
  applyFiltersAndRender(appState);
});

const addToCache = (source: Observable<IServerResp>) =>
  source.pipe(
    map(response => {
      const { results } = response;
      Object.assign(appState, { cache: results });
      return response;
    })
  );

merge(initHttp$, controls$)
  .pipe(
    addToCache,
    map(response => {
      // filter by status
      const { results } = response;
      const status = Object.keys(appState.statusMap).find(key => appState.statusMap[key] === true);
      if (status === undefined) return response;
      if (status === 'all') {
        return response;
      } else {
        if (results === undefined) return response;
        response.results = results.filter(
          (character: ICharacter) => character.status.toLowerCase() === status.toLowerCase()
        );
      }
      return response;
    }),
    map(response => {
      //filter by search
      const { searchVal } = appState;
      const { results } = response;
      if (results === undefined) return response;
      if (searchVal! == '') {
        response.results = results.filter(character =>
          character.name.toLowerCase().includes(searchVal.toLowerCase())
        );
      } else {
        response.results = appState.cache;
      }
      return response;
    })
  )
  .subscribe((response: IServerResp) => {
    const { results } = response;
    const { info }: { info: IInfo } = response;
    Object.assign(appState, info, { results });
    render(appState);
  });
