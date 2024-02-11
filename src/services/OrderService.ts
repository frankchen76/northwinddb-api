import { DBServiceBase, IDBServiceConfig } from "./DBSerivceBase";

export class OrderService extends DBServiceBase {
    public static async getAllOrders(config: IDBServiceConfig): Promise<any> {
        const service = new OrderService(config);
        const orderContainer = service.getContainer(config.cIdOrders);
        const { resources: orders } = await orderContainer.items.readAll().fetchAll();
        return orders;
    }
}