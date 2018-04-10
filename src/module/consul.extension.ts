import { CoreModule, Extension, ExtensionWithConfig, OnExtensionLoad, ExtensionShutdownPriority, OnShutdown } from '@hapiness/core';

import { Observable } from 'rxjs/Observable';

import { ConsulClientManager } from './managers';
import { HapinessConsulClientOptions } from '.';

const debug = require('debug')('hapiness:consul');

export class ConsulExt implements OnExtensionLoad, OnShutdown {

    public static setConfig(config: HapinessConsulClientOptions): ExtensionWithConfig {
        return {
            token: ConsulExt,
            config
        };
    }

    onExtensionLoad(module: CoreModule, config: HapinessConsulClientOptions): Observable<Extension> {
        debug('loading consul extension', config);
        return Observable
            .of(new ConsulClientManager(config))
            .do(_ => _.createClient())
            .map(consulClient => ({
                instance: this,
                token: ConsulExt,
                value: consulClient
            }));
    }

    onShutdown(module, consulClient: ConsulClientManager) {
        debug('SIGTERM received, shutting down consul module relatives');
        return {
            priority: ExtensionShutdownPriority.NORMAL,
            resolver: Observable.of(null)
        };
    }
}
