import { CoreModule, Extension, ExtensionWithConfig, OnExtensionLoad, ExtensionShutdownPriority, OnShutdown } from '@hapiness/core';

import { Observable } from 'rxjs/Observable';

import { ConsulClientManager } from './managers';

const debug = require('debug')('hapiness:consul');

export class ConsulExt implements OnExtensionLoad, OnShutdown {

    public static setConfig(config: any): ExtensionWithConfig {
        return {
            token: ConsulExt,
            config
        };
    }

    onExtensionLoad(module: CoreModule, config: any): Observable<Extension> {
        debug('loading consul extension', config);
        return Observable
            .of(new ConsulClientManager(config))
            .map(consulClient => ({
                instance: this,
                token: ConsulExt,
                value: consulClient
            }));
    }

    onShutdown(module, consulClient: ConsulClientManager) {
        debug('SIGTERM received, shutdown consul');
        return {
            priority: ExtensionShutdownPriority.NORMAL,
            // TODO: Resolve shutdown
            resolver: Observable.of(null)
        };
    }
}
