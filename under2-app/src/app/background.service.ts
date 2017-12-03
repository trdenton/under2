import { Injectable } from '@angular/core';

import { Observable, Subject } from 'rxjs/Rx';

@Injectable()
export class BackgroundService {

    public numeratorSource$: Observable<string>;
    public denominatorSource$: Observable<string>;

    private numeratorSource: Subject<string>;
    private denominatorSource: Subject<string>;

    constructor() {
        this.numeratorSource = new Subject<string>();
        this.numeratorSource$ = this.numeratorSource.asObservable();

        this.denominatorSource = new Subject<string>();
        this.denominatorSource$ = this.denominatorSource.asObservable();
    }

    public addNumerator(value: string) {
        this.numeratorSource.next(value);
    }

    public addDenominator(value: string) {
        this.denominatorSource.next(value);
    }

}