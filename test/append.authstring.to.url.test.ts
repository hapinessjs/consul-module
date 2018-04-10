import * as unit from 'unit.js';

import { test, suite } from 'mocha-typescript';

import { appendAuthStringToUrl } from '../src/module/utils/append.authstring.to.url';

@suite('- Unit appendAuthStringToUrl function test file')
export class AppendAuthStringToUrlTest {

    @test('- Should test the function')
    testFunction() {
        unit.string(appendAuthStringToUrl('', 'http://10.0.0.1:8500'))
            .is('http://10.0.0.1:8500');

        unit.string(appendAuthStringToUrl('user:pass', 'http://user:pass@10.0.0.1:8500'))
            .is('http://user:pass@10.0.0.1:8500');

        unit.string(appendAuthStringToUrl('user:pass', 'http://10.0.0.1:8500'))
            .is('http://user:pass@10.0.0.1:8500');
    }

}
