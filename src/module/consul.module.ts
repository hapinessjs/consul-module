
import { HapinessModule } from '@hapiness/core';
import { ConsulService } from './services';

@HapinessModule({
    version: '1.0.0',
    declarations: [],
    providers: [],
    exports: [ConsulService]
})
export class ConsulModule {}
