import { TableServiceClient, TableClient, AzureNamedKeyCredential, odata } from "@azure/data-tables";
import { setLogLevel } from "@azure/logger";
import { RestError } from "@azure/core-rest-pipeline";


setLogLevel("info");

const account = "appointmentcrawlergac19";
const accountKey = "qQb064LwcqGVudB7W2nWT0VgufiRo/IwaPKhsVrEpnbWD7et/EoQYohGNUgKh1Zu16/muV5f8aki+ASt9OEWnQ==";
const tableName = "tgUsers"
const partitionKey = "Users";
const rowKeyTemplate = "row";

const credential = new AzureNamedKeyCredential(account, accountKey);

// const serviceClient = new TableServiceClient(
//   `https://${account}.table.core.windows.net`,
//   credential
// );

const usersTable = new TableClient(`https://${account}.table.core.windows.net`, tableName, credential);

export const getUser =async (userId:any) => {
    try {
        const user = await usersTable.getEntity(partitionKey,`${rowKeyTemplate}${userId}`);
        return user;    
    } catch (error) {
        if((error as RestError).statusCode === 404){
            return undefined;
        }
        throw error;
    }
    
}
export const addTGUser = async (tgUser:any) => {
    try {
        const user = await getUser(tgUser.id);
        if(!user){
            await usersTable.createEntity({
                partitionKey: partitionKey,
                rowKey: `row${tgUser.id}`,
                ...tgUser
            });
        }else{
            console.log("User already exists");
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
    
}

// (async function() {
//     for(let i=0; i< 10;i++){
//         const dateNow = new Date();
//         const expirationDate = new Date();
//         expirationDate.setMonth(expirationDate.getMonth()+1);
//         await usersTable.createEntity({
//             partitionKey: "Users",
//             rowKey: `RowKey12345120+${i}`,
//             userId:12345120+i,
//             name: `12345120+${i}`,
//             telephone: '2011110902',
//             email: `test12345120+${i}@gmail.com`,
//             expirationDate: dateNow.toISOString(),
//             lastActivatedSubscription: expirationDate.toISOString(),
//             zip:`07921`,
//             distance:25
//         });
//         }
//     })();
      