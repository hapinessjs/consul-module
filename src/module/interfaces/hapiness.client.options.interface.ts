import { CommonOptions } from 'consul';

export interface HapinessConsulClientOptions {
    scheme?: string;
    host?: string;
    port?: number;
    defaults?: CommonOptions;
    ca?: string;
    baseUrl?: string;
}
