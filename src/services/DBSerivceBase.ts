import { Container, CosmosClient, CosmosClientOptions } from "@azure/cosmos";

export interface IDBServiceConfig {
    endpoint: string;
    key: string;
    dbId: string;
    cIdOrders: string;
    cIdProducts: string;
}
export class DBServiceBase {
    constructor(protected config: IDBServiceConfig) {
    }

    protected getContainer(containId: string): Container {
        const options: CosmosClientOptions = {
            endpoint: this.config.endpoint,
            key: this.config.key,
            userAgentSuffix: 'NorthWindDB-API'
        };

        const client = new CosmosClient(options);
        return client.database(this.config.dbId).container(containId);
    }
}