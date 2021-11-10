import { ChangeDetectorRef, Directive, OnDestroy } from '@angular/core';
import { Subject, Observable, zip, of } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

@Directive()
export abstract class CoreComponent implements OnDestroy {
    protected readonly ngUnsubscribe_: Subject<void> = new Subject<void>();

    constructor(protected cdr: ChangeDetectorRef) {}

    ngOnDestroy(): void {
        this.ngUnsubscribe_.next();
        this.ngUnsubscribe_.complete();
    }

    detectChanges(): void {
        this.cdr.detectChanges();
    }

    markForCheck(): void {
        this.cdr.markForCheck();
    }

    protected subscribeToObservable(observable: Observable<any>): void {
        observable.pipe(takeUntil(this.ngUnsubscribe_)).subscribe();
    }

    protected subscribeToObservables(observables: Observable<any>[], onFinished?: () => void): void {
        this.subscribeToObservable(
            this.zipObservables(observables).pipe(
                map(() => {
                    if (onFinished) {
                        onFinished();
                    }
                })
            )
        );
    }

    private zipObservables(observables: Observable<any>[]): Observable<any> {
        if (!observables) {
            throw Error(`Given observables are not valid`);
        }

        if (!Array.isArray(observables)) {
            throw Error(`Given observables are not in array`);
        }

        if (observables.length === 0) {
            // return empty/fake observable if there are none observables
            return of(undefined);
        }

        if (observables.length === 1) {
            return observables[0];
        }

        let zippedObservable: Observable<any> = observables[0];

        for (let i = 1; i < observables.length; i++) {
            const currentObservable = observables[i];
            zippedObservable = zip(zippedObservable, currentObservable);
        }

        return zippedObservable;
    }
}
