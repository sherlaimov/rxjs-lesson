// import { Observable, Observer } from 'rxjs'

// const o$: Observable<string> = Observable.create((observer: Observer<string>) => {

//   console.log('hello');

//   observer.next('hello listeners');
//   observer.next('hello listeners againg');

//   observer.error('smt')

//   observer.next('hello listeners after error');

// })


// o$.subscribe(
//   (next: string) => console.log('list 1', next),
//   (err: any) => console.log(err),
//   () =>  console.log('complited'),
// )

// o$.subscribe({
//   next(x: string) { console.log('list 2' + x); },
//   error(err) { console.error('something wrong occurred: ' + err); },
//   complete() { console.log('done'); }
// });


// import { fromEvent, Observable } from 'rxjs';
// const inputElem: HTMLInputElement | null = document.querySelector('#refInput');

// if (!inputElem) { 
//   throw new Error('can fon input element')
// }


// const input$: Observable<Event> = fromEvent(inputElem, 'input')
// const click$: Observable<Event> = fromEvent(inputElem, 'click')

// input$.subscribe(
//   (data: Event) => console.log((data.target as HTMLInputElement).value)
// )

// input$.subscribe(
//   (data: Event) => console.log('2', (data.target as HTMLInputElement).value)
// )

// click$.subscribe(
//   (data: Event) => console.log('click list 1', data)
// )


// import {of, Observable} from 'rxjs';


// const seq$: Observable<any> = of(1, 2, 3)
// seq$.subscribe(
//   (data: Event) => console.log('click list 1', data)
// )


// import { range } from 'rxjs';

// //emit 1-10 in sequence
// const source = range(1, 10);
// //output: 1,2,3,4,5,6,7,8,9,10
// const example = source.subscribe(val => console.log(val));


// import { from } from 'rxjs';

// //emit result of promise
// const promiseSource = from(new Promise(resolve => {
//   setTimeout(() => {
//     resolve('hello world')
//   }, 2000)
// }));
// //output: 'Hello World'
// const subscribe = promiseSource.subscribe(val => console.log(val));
// const subscribe1 = promiseSource.subscribe(val => console.log('2', val));


// import { Observable, from } from 'rxjs';
// import { filter, map, skip, takeLast, takeUntil } from 'rxjs/operators';
// // import 'rxjs/operators/map';
// // import 'rxjs/operators/filter';

// const item$: Observable<number> = from([1, 2, 3, 4, 5, 6, 7]).pipe(
//   filter((value: number) => value % 2 === 0),
//   skip(1),
//   map((value: number) => value * 2),
//   takeLast(2)
//   // takeUntil()
// )
// // .filter((value: number) => value % 2 === 0)
// // .map()

// item$.subscribe(
//   (data: number) => console.log(data)
// )

// item$.subscribe(
//   (data: number) => console.log('list2', data)
// )



// import { fromEvent, of, Observable, combineLatest} from  'rxjs';
// import { scan, throttleTime, delay } from 'rxjs/operators';

// const button: HTMLButtonElement  = document.querySelector('button') as HTMLButtonElement;
// fromEvent(button, 'click').pipe(
//   throttleTime(1000),
//   scan((count: any) => count + 1, 0)
// )
// .subscribe((count: number) => console.log(`Clicked ${count} times`));




// const a$: Observable<number> = of(1, 2).pipe(
//   delay(2000)
// );
// const b$: Observable<number> = of(2)



// const c$: Observable<number> = combineLatest(
//   a$,
//   b$,
//   (a: number, b: number) => {
//     return a + b
//   }
// )

// c$.subscribe((c: number) => console.log(c))

import { fromEvent, Observable, of, from} from 'rxjs';
import {map, debounceTime, distinctUntilChanged, filter, switchMap, catchError} from 'rxjs/operators';

type IRepo = { name: string, owner: { repos_url: string } };
type IGithubRepos = {
  total_count: number;
  items: IRepo[]
};


const inputElem: HTMLInputElement | null = document.querySelector('#refInput');
const wrapperElement: HTMLInputElement | null = document.querySelector('.wrapper');

if (!inputElem || !wrapperElement) {
  throw new Error('can fon input element')
}


const input$: Observable<IGithubRepos> = fromEvent(inputElem, 'input').pipe(
  map((event: Event) => (event.target as HTMLInputElement).value),
  // filter((value: string) => value.length > 3),
  distinctUntilChanged(),
  debounceTime(1000),
  switchMap((value: string) => {
    return from(
      fetch(`https://api.github.com/search/repositories?q=${value}`)
      .then((res: Response) => res.json())
    ).pipe(
      catchError((err: any) => {
        console.log(err);
        return of(err)
      })
    )
  })
)

input$.subscribe((data: IGithubRepos) => {
  console.log(data);
  data.items.forEach((item: IRepo) => {
        const a: HTMLAnchorElement = document.createElement('a');
        a.innerHTML = item.name;
        a.setAttribute('href', item.owner.repos_url);
        wrapperElement.appendChild(a);
    })
})



// inputElem.addEventListener('input', (event: Event) => {
//   const value: string = (event.target as HTMLInputElement).value;

//   fetch(`https://api.github.com/search/repositories?q=${value}`)
//     .then((res: Response) => res.json())
//     .then((data: IGithubRepos) => {
//       console.log(data);
//       data.items.forEach((item: IRepo) => {
//           const a: HTMLAnchorElement = document.createElement('a');
//           a.innerHTML = item.name;
//           a.setAttribute('href', item.owner.repos_url);
//           wrapperElement.appendChild(a);
//       })
//     })
//     .catch((err: any) => console.log(err))
// })




