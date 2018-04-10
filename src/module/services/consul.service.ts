import { Injectable, Inject } from '@hapiness/core';

import { ConsulExt } from '../consul.extension';

import { ConsulClientManager } from '../managers';

@Injectable()
export class ConsulService {
    constructor(@Inject(ConsulExt) private _consulManager: ConsulClientManager) {}

    public get client(): any {
        return this._consulManager.client;
    }
}
