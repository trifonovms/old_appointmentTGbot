import { QueueClient, QueueServiceClient } from "@azure/storage-queue"

// Retrieve the connection from an environment
// variable called AZURE_STORAGE_CONNECTION_STRING
let connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
connectionString = "DefaultEndpointsProtocol=https;AccountName=appointmentcrawlergac19;AccountKey=UXbHy3wYj/nPcRW3glGZuY/lLoduGwlhaAU1eFPUU0scADyuRKv079uiNzjVVOi8HKQiP7iv36nS+AStfazIpg==;EndpointSuffix=core.windows.net"
// Create a unique name for the queue
const queueName = "telegram";

// Instantiate a QueueServiceClient which will be used
// to create a QueueClient and to list all the queues
const queueServiceClient = QueueServiceClient.fromConnectionString(connectionString);

// Get a QueueClient which will be used
// to create and manipulate a queue
const queueClient = queueServiceClient.getQueueClient(queueName);

const internalMessageQueue = async (sendMessageCallback:any) => {
    const response = await queueClient.receiveMessages();
    if (response.receivedMessageItems.length == 1) {
        const receivedMessageItem = response.receivedMessageItems[0];
        console.log(`Processing & deleting message with content: ${receivedMessageItem.messageText}`);
        
        sendMessageCallback(receivedMessageItem.messageText);
        
        const deleteMessageResponse = await queueClient.deleteMessage(
        receivedMessageItem.messageId,
        receivedMessageItem.popReceipt
        );
        console.log(
        `Delete message successfully, service assigned request Id: ${deleteMessageResponse.requestId}`
        );
    }
}

export const startQueueMessageHandler = async (sendMessageCallback:any) => {
    setInterval(async ()=>{
        await internalMessageQueue(sendMessageCallback);
    }, 5000);
} 

// (async function() {
//    // await queueClient.create();    
// //    for(let i=0;i<9;i++){
// //         await queueClient.sendMessage(JSON.stringify({
// //             userId:12345+i,
// //             message:i+'.We have appointment for you at 12/12/2022 09:30AM on Flemington, NJ ',
// //             link: "http://myappointment.com/12/12/2022/09/15/dmv/12"+i
// //         }));
// //    }
//     const properties = await queueClient.getProperties();
//     console.log("Approximate queue length: ", properties.approximateMessagesCount);
//     while(true){
//         const response = await queueClient.receiveMessages();
//         if (response.receivedMessageItems.length == 1) {
//             const receivedMessageItem = response.receivedMessageItems[0];
//             console.log(`Processing & deleting message with content: ${receivedMessageItem.messageText}`);
//             const deleteMessageResponse = await queueClient.deleteMessage(
//             receivedMessageItem.messageId,
//             receivedMessageItem.popReceipt
//             );
//             console.log(
//             `Delete message successfully, service assigned request Id: ${deleteMessageResponse.requestId}`
//             );
//         }
//     }
//     // for (let i = 0; i < peekedMessages.peekedMessageItems.length; i++) {
//     //     // Display the peeked message
//     //     console.log("Peeked message: ", peekedMessages.peekedMessageItems[i].messageText);
//     //     const obj = JSON.parse(peekedMessages.peekedMessageItems[i].messageText);
//     //     console.log(obj);
//     // }

// })();
// Create the queue
