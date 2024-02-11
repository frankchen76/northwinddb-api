import { SqlQuerySpec } from "@azure/cosmos";
import { DBServiceBase, IDBServiceConfig } from "./DBSerivceBase";
import { log } from "../log";

export interface IProductQuery {
    productName?: string;
    categoryName?: string;
    inventoryStatus?: string;
    supplierCity?: string;
    stockLevel?: string;
}

export class ProductService extends DBServiceBase {
    public static async getProducts(config: IDBServiceConfig,
        productQuery: IProductQuery): Promise<any> {
        const service = new ProductService(config);
        const orderContainer = service.getContainer(config.cIdProducts);

        const querySpec: SqlQuerySpec = {
            query: `SELECT * FROM c 
                    where (IS_NULL(@categoryName) OR CONTAINS(c.Category.CategoryName, @categoryName, true))
                    AND (IS_NULL(@productName) OR CONTAINS(c.ProductName, @productName, true))
                    ${this.getInventoryStatusQuery(productQuery.inventoryStatus!)}
                    ${this.getStockLevelQuery(productQuery.stockLevel!)}
                    AND (IS_NULL(@supplierCity) OR CONTAINS(c.Supplier.City, @supplierCity, true))
                    `,
            parameters: [
                {
                    name: '@categoryName',
                    value: productQuery.categoryName ?? null
                },
                {
                    name: '@productName',
                    value: productQuery.productName ?? null
                },
                {
                    name: '@supplierCity',
                    value: productQuery.supplierCity ?? null
                }
            ]
        }
        log('querySpec:', querySpec)

        const { resources: orders } = await orderContainer.items.query(querySpec).fetchAll();
        return orders;
    }
    private static getInventoryStatusQuery(inventoryStatus: string | null): string {
        if (!inventoryStatus) {
            return "";
        }
        const query = inventoryStatus.toLowerCase();
        if (query.startsWith("out")) {
            // Out of stock
            return "AND c.UnitsInStock = 0";
        } else if (query.startsWith("low")) {
            // Low stock
            return "AND c.UnitsInStock <=c.ReorderLevel";
        } else if (query.startsWith("on")) {
            // On order
            return "AND c.UnitsOnOrder > 0";
        } else {
            // In stock
            return "AND c.UnitsInStock > 0";
        }

    }
    private static getStockLevelQuery(stockLevel: string | null): string {
        //c.UnitsInStock
        let result = "";     // Return false if the expression is malformed
        if (!stockLevel) {
            return result;
        }

        if (stockLevel.indexOf('-') < 0) {
            // If here, we have a single value or a malformed expression
            const val = Number(stockLevel);
            if (!isNaN(val)) {
                result = `AND c.UnitsInStock = ${val}`;
            }
        } else if (stockLevel.indexOf('-') === stockLevel.length - 1) {
            // If here we have a single lower bound or a malformed expression
            const lowerBound = Number(stockLevel.slice(0, -1));
            if (!isNaN(lowerBound)) {
                result = `AND c.UnitsInStock >= ${lowerBound}`;
            }
        } else {
            // If here we have a range or a malformed expression
            const bounds = stockLevel.split('-');
            const lowerBound = Number(bounds[0]);
            const upperBound = Number(bounds[1]);
            if (!isNaN(lowerBound) && !isNaN(upperBound)) {
                result = `AND (c.UnitsInStock <= ${lowerBound} AND c.UnitsInStock >= ${upperBound})`;
            }
        }
        return result;
    }
}