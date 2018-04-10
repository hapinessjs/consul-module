import * as unit from 'unit.js';

import { test, suite } from 'mocha-typescript';

import { ConsulService } from '../src';

@suite('- Unit ConsulServiceTest file')
export class ConsulServiceTest {

    @test('- Create the service and get the client')
    testCreateServiceAndGetClient() {
        const service = new ConsulService(<any> { client: { sayHi: () => 'hi there' } });
        unit.string(service.client.sayHi()).is('hi there');
    }

}
