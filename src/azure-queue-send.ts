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
const sleep = (waitTimeInMs:number) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));

(async function() {
   await queueClient.create();    
   for(let i=0;i<1000;i++){
        console.log(`Send message: ${i}`);
        const msg = JSON.stringify({
            userId:12345,
            message:'We have appointment for you at 12/12/2022 09:30AM on Flemington, NJ ',
            link: "http://myappointment.com/12/12/2022/09/15/dmv/12"
        });
        let buff = new Buffer(msg);
        let base64data = buff.toString('base64');

        await queueClient.sendMessage(base64data);
        await sleep(5000);
   }
   

})();
// Create the queue
