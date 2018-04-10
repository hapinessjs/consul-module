import * as unit from 'unit.js';

import { test, suite } from 'mocha-typescript';
// import { Observable } from 'rxjs';

import { bindObservable } from '../src/module/utils/bind.observable';

@suite('- Unit bindObservable function test file')
export class BindObservableTest {

    @test('- Should create an Observable function from a promise function')
    testCreateObservableFromResolvedPromise(done) {
        const clientWithPromiseFunc = {
            run: (param1, param2) => Promise.resolve({ param1, param2, status: 'executed' })
        };

        bindObservable
            .bind({ client: clientWithPromiseFunc })('run', 'first param', 'second param')
            .do(res => {
                unit.object(res).is(
                    {
                        param1: 'first param',
                        param2: 'second param',
                        status: 'executed'
                    }
                )
            })
            .subscribe(
                () => done(),
                err => done(err)
            );
    }

    @test('- Create the service and get the client')
    testCreateObservableFromPromiseWithRejectedPromise(done) {
        const clientWithPromiseFunc = {
            run: (param1, param2) => Promise.reject(new Error('Failed'))
        };

        bindObservable
            .bind({ client: clientWithPromiseFunc })('run', 'first param', 'second param')
            .subscribe(
                () => done(new Error('Should not be there')),
                err => {
                    unit.string(err.message).is('Failed');
                    done();
                }
            );
    }

}
