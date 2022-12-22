import { TableServiceClient, TableClient, AzureNamedKeyCredential, odata } from "@azure/data-tables";


/**
 * The Azure module reads 
 * the environment variables AZURE_ACCOUNT and AZURE_ACCESS_KEY and AZURE_TABLES_ENDPOINT 
 * for information required to connect to your Azure Storage account or Azure Cosmos DB.
 */
const endpoint = "https://appointmentcrawlergac19.table.core.windows.net/users";
const credential = new AzureNamedKeyCredential(
  "appointmentcosmosdb",
  "j2AeeyNixFIALAGVctJu6qedFPDriSvPj0NiylxxUtNPznLgdiRPIGlkdHP6iMcQOvq3vTZzc3skACDb88X2JQ=="
);

const tableService = new TableServiceClient(
  endpoint,
  credential
);

const env={
    connectionString : "DefaultEndpointsProtocol=https;AccountName=appointmentcosmosdb;AccountKey=LhEczeCHui7lGwmD7kdswWi4VNkJytAqfM4OvmagF5k78d2jE4Z2yu15dlbKdIdky05AF1H25e5WACDbP4jSrA==;TableEndpoint=https://appointmentcosmosdb.table.cosmos.azure.com:443/;",
    tableName: "users"
}
const serviceClient = TableClient.fromConnectionString(
    env.connectionString,
    env.tableName
  );

const insertEntity = async function (entity:any) {
    await serviceClient.createEntity(entity);
  };
  
  const upsertEntity = async function (entity:any) {
    await serviceClient.upsertEntity(entity, "Merge");
  };

(async function() {
for(let i=0; i< 10;i++){
    const dateNow = new Date();
    const expirationDate = new Date();
    expirationDate.setMonth(expirationDate.getMonth()+1);
    await insertEntity({
        PartitionKey: "Users",
        RowKey: `RowKey12345120+${i}`,
        userId:12345120+i,
        name: `12345120+${i}`,
        telephone: '2011110902',
        email: `test12345120+${i}@gmail.com`,
        expirationDate: dateNow.toISOString(),
        lastActivatedSubscription: expirationDate.toISOString(),
        zip:`07921`,
        distance:25
    })
    }
})();
  