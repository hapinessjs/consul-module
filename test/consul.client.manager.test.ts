import * as unit from 'unit.js';

import { test, suite } from 'mocha-typescript';

import { ConsulClientManager } from '../src';

@suite('- Unit ConsulClientManagerTest file')
export class ConsulClientManagerTest {

    @test('- Create the service and get the client')
    testCreateManagerWithoutConfigShouldReturnDefaultOne() {
        const managerDefaultConf = new ConsulClientManager({});
        unit.object(managerDefaultConf.config).is(
            {
                scheme: 'http',
                host: '127.0.0.1',
                port: 8500
            }
        );

        const managerWithAuth = new ConsulClientManager({ username: 'user1', password: 'passwd' });
        unit.object(managerWithAuth.config).is(
            {
                username: 'user1',
                password: 'passwd',
                baseUrl: 'http://user1:passwd@127.0.0.1:8500'
            }
        );

        const managerWithAuthAndBaseUrl = new ConsulClientManager({
            baseUrl: 'https://thisisatest.com:4444',
            username: 'user1',
            password: 'passwd'
        });
        unit.object(managerWithAuthAndBaseUrl.config).is(
            {
                username: 'user1',
                password: 'passwd',
                baseUrl: 'https://user1:passwd@thisisatest.com:4444'
            }
        );
    }

    @test('- Should return the known consul functions')
    testGetKnownConsulFunctions() {
        unit.object(ConsulClientManager.KnownFunctions).is(
            {
                acl: {
                    root: ['create', 'update', 'destroy', 'get', 'clone', 'list']
                },
                agent: {
                    root: ['members', 'self', 'maintenance', 'join', 'forceLeave'],
                    check: ['list', 'register', 'deregister', 'pass', 'warn', 'fail'],
                    service: ['list', 'register', 'deregister', 'maintenance']
                },
                catalog: {
                    root: ['datacenters'],
                    node: ['list', 'services'],
                    service: ['list', 'nodes']
                },
                event: {
                    root: ['fire', 'list']
                },
                health: {
                    root: ['node', 'checks', 'service', 'state']
                },
                kv: {
                    root: ['get', 'set', 'del', 'keys']
                },
                session: {
                    root: ['create', 'destroy', 'get', 'node', 'list', 'renew']
                },
                status: {
                    root: ['leader', 'peers']
                }
            }
        );
    }

    @test('- Should convert promises function of the client in observable having subClient')
    testConvertClientFunctionToObservableHavingSubClient(done) {
        const client = {
            run: (param1) => Promise.resolve({ param1, status: 'executed' }),
            subClient: {
                exec: (param1) => Promise.resolve({ param1, report: 'finished' })
            }
        };

        class Tester extends ConsulClientManager {
            constructor(config) {
                super(config);
            }
            convertClientFunctionToObservable(cli, functions) {
                return this._convertClientFunctionToObservable(cli, functions);
            }
        }

        const instance = new Tester({});

        const funcs = { root: ['run'], subClient: ['exec'] };
        const newCli = instance.convertClientFunctionToObservable(client, funcs);

        newCli
            .run('first param')
            .do(_ => unit.object(_).is({ param1: 'first param', status: 'executed' }))
            .flatMap(_ => newCli.subClient.exec('sub cli param'))
            .do(_ => unit.object(_).is({ param1: 'sub cli param', report: 'finished' }))
            .subscribe(
                _ => done(),
                err => done(err)
            );
    }

    @test('- Should convert promises function of the client in observable')
    testConvertClientFunctionToObservable(done) {
        const client = {
            run: (param1) => Promise.resolve({ param1, status: 'executed' })
        };

        class Tester extends ConsulClientManager {
            constructor(config) {
                super(config);
            }
            convertClientFunctionToObservable(cli, functions) {
                return this._convertClientFunctionToObservable(cli, functions);
            }
        }

        const instance = new Tester({});

        const funcs = { root: ['run'] };
        const newCli = instance.convertClientFunctionToObservable(client, funcs);

        newCli
            .run('first param')
            .do(_ => unit.object(_).is({ param1: 'first param', status: 'executed' }))
            .subscribe(
                _ => done(),
                err => done(err)
            );
    }

}
