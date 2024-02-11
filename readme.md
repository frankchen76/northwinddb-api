# NordthWindDB API

A sample project to demonstrate Northwind DB API


## Setup
* create .env with the following content
```
# Port
PORT=3443

# Debug settings, default logging "msteams"
DEBUG=northwinddb-api

# AAD app registration
CLIENTID="[app-id]"
TENANT_NAME="[tenant-name].onmicrosoft.com"
AUDIENCE="[audience-name]"

# Cosmos DB endpoint
DB_ENDPOINT=[cosmos-db-endpoint]
# Cosmos DB key
DB_KEY=[cosmos-db-key]
# Cosmos DB database and container Ids
DB_ID=[cosmos-db-id]
DB_CID_ORDERS=[cosmos-containerid-orders]
DB_CID_PRODUCTS=[cosmos-containerid-products]

```

## Debug
* ```npm run dev```: start local debug
* ```npm run build```: start a build process
* ```npm start```: start api

## Change logs
### v1.0.0: init code
