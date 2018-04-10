import { Observable } from 'rxjs';

export function bindObservable(func, ...args) {
    return Observable.create(
        observer => {
            this.client[func](...args)
                .then(_ => {
                    observer.next(_);
                    observer.complete();
                })
                .catch(err => {
                    observer.error(err);
                });
        }
    );
}
