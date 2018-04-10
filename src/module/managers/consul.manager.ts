import * as consul from 'consul';

import { bindObservable } from '../utils';
import { HapinessConsulClientOptions } from '../interfaces';

export class ConsulClientManager {

    static AllowedConfigKey: string[] = [
        'scheme',
        'host',
        'port',
        'username',
        'password',
        'ca',
        'baseUrl'
    ];

    private _consul: consul.Consul;
    private _client: any;
    private _config: HapinessConsulClientOptions;

    constructor(config: any) {
        this._config = this._buildConfig(config);
        this._createClient();
    }

    private get _functions(): any {
        return {
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
        };
    }

    private _buildConfig(config: any): HapinessConsulClientOptions {
        const _config: HapinessConsulClientOptions = Object
            .keys(config)
            .reduce((options, cur_opt) => {
                if (ConsulClientManager.AllowedConfigKey.indexOf(cur_opt) !== -1) {
                    return Object.assign({ [cur_opt]: config[cur_opt] }, options);
                }
                return options;
            }, {});

        const authString = _config.username && _config.password ?
            `${_config.username}:${_config.password}@` : '';
        const scheme = _config.scheme || 'http';
        if (!_config.baseUrl) {
            _config.baseUrl = `${scheme}://${authString}${_config.host || '127.0.0.1'}:${_config.port || 8500}`;
        }

        return _config;
    }

    private _createClient(): void {
        this._consul = consul(Object.assign({}, this._config, { promisify: true }));
        this._client = {
            acl: this._convertClientFunctionToObservable(this._consul.acl, this._functions.acl),
            agent: this._convertClientFunctionToObservable(this._consul.agent, this._functions.agent),
            catalog: this._convertClientFunctionToObservable(this._consul.catalog, this._functions.catalog),
            event: this._convertClientFunctionToObservable(this._consul.event, this._functions.event),
            health: this._convertClientFunctionToObservable(this._consul.health, this._functions.health),
            kv: this._convertClientFunctionToObservable(this._consul.kv, this._functions.kv),
            lock: (args: consul.Lock.Options) => this._consul.lock(args),
            session: this._convertClientFunctionToObservable(this._consul.session, this._functions.session),
            status: this._convertClientFunctionToObservable(this._consul.status, this._functions.status),
            watch: (options: consul.CommonOptions & consul.Watch.WatchOptions) =>
                this._consul.watch({ method: this._consul.kv.get, options })
        };
    }

    private _convertClientFunctionToObservable(client: any, functions: any): any {
        const functionsSet: any = {};

        functions.root.forEach(
            func_name => {
                const _bindObservable = bindObservable.bind({ client });
                Object.defineProperty(
                    functionsSet,
                    func_name,
                    {
                        configurable: true,
                        enumerable: true,
                        writable: true,
                        value(...args) {
                            return _bindObservable(func_name, ...args)
                        }
                    }
                );
            }
        );

        const subClient = Object.keys(functions).filter(name => name !== 'root');
        if (subClient.length > 0) {
            subClient.forEach(
                cliName => {
                    const _bindObservable = bindObservable.bind({ client: client[cliName] });
                    functionsSet[cliName] = {};
                    functions[cliName].forEach(
                        func_name => {
                            Object.defineProperty(
                                functionsSet[cliName],
                                func_name,
                                {
                                    configurable: true,
                                    enumerable: true,
                                    writable: true,
                                    value(...args) {
                                        return _bindObservable(func_name, ...args)
                                    }
                                }
                            );
                        }
                    );
                }
            );
        }

        return functionsSet;
    }

    public get client(): any {
        return this._client;
    }

}
