import * as consul from 'consul';

import { bindObservable, appendAuthStringToUrl } from '../utils';
import { HapinessConsulClientOptions } from '../interfaces';

export class ConsulClientManager {

    private _config: HapinessConsulClientOptions;
    private _consul: consul.Consul;
    private _client: any;

    constructor(config: HapinessConsulClientOptions) {
        this._config = this._buildConfig(config);
    }

    protected _buildConfig(config: HapinessConsulClientOptions): HapinessConsulClientOptions {
        const _config = {
            scheme: config.scheme || 'http',
            host: config.host || '127.0.0.1',
            port: config.port || 8500,
            username: config.username,
            password: config.password,
            ca: config.ca,
            baseUrl: config.baseUrl
        };

        const authString = _config.username && _config.password ?
            `${_config.username}:${_config.password}` : '';

        if (!!authString.length) {
            if (_config.baseUrl) {
                _config.baseUrl = appendAuthStringToUrl(authString, _config.baseUrl);
            } else {
                const baseUrl = `${_config.scheme}://${_config.host}:${_config.port}`;
                _config.baseUrl = appendAuthStringToUrl(authString, baseUrl);
            }

            _config.scheme = undefined;
            _config.host = undefined;
            _config.port = undefined;
        }

        return Object.keys(_config).reduce((finalConf, prop) => {
            if (!_config[prop]) {
                return finalConf;
            }
            return Object.assign({}, finalConf, { [prop]: _config[prop] });
        }, {});
    }

    protected _convertClientFunctionToObservable(client: any, functions: any): any {
        const functionsSet: any = {};

        [].concat(functions.root)
            .filter(_ => !!_)
            .forEach(
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

        const subClients = Object.keys(functions).filter(name => name !== 'root');
        if (subClients.length > 0) {
            subClients.forEach(
                cliName => {
                    const _bindObservable = bindObservable.bind({ client: client[cliName] });
                    functionsSet[cliName] = {};
                    [].concat(functions[cliName])
                        .filter(_ => !!_)
                        .forEach(
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

    public createClient(): void {
        this._consul = consul(Object.assign({}, this._config, { promisify: true }));
        this._client = {
            acl: this._convertClientFunctionToObservable(this._consul.acl, ConsulClientManager.KnownFunctions.acl),
            agent: this._convertClientFunctionToObservable(this._consul.agent, ConsulClientManager.KnownFunctions.agent),
            catalog: this._convertClientFunctionToObservable(this._consul.catalog, ConsulClientManager.KnownFunctions.catalog),
            event: this._convertClientFunctionToObservable(this._consul.event, ConsulClientManager.KnownFunctions.event),
            health: this._convertClientFunctionToObservable(this._consul.health, ConsulClientManager.KnownFunctions.health),
            kv: this._convertClientFunctionToObservable(this._consul.kv, ConsulClientManager.KnownFunctions.kv),
            lock: (args: consul.Lock.Options) => this._consul.lock(args),
            session: this._convertClientFunctionToObservable(this._consul.session, ConsulClientManager.KnownFunctions.session),
            status: this._convertClientFunctionToObservable(this._consul.status, ConsulClientManager.KnownFunctions.status),
            watch: (options: consul.CommonOptions & consul.Watch.WatchOptions) =>
                this._consul.watch({ method: this._consul.kv.get, options })
        };
    }

    public get client(): any {
        return this._client;
    }

    public get config(): HapinessConsulClientOptions {
        return this._config;
    }

    public static get KnownFunctions(): any {
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

}
