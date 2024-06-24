const { ethers } = require('ethers');
const { MongoClient } = require('mongodb');
const config = require('./config');

const provider = new ethers.JsonRpcProvider(config.bscNodeUrl);
const marketContract = new ethers.Contract(config.marketplaceContractAddress, config.marketPlaceAbi, provider);
const domainContract = new ethers.Contract(config.domainContractAddress, config.domainAbi, provider);

async function saveToDatabase(eventData) {
    const uri = 'mongodb://localhost:27017/market';
    const client = new MongoClient(uri);
     try {
         await client.connect();
         const database = client.db('market');
         const domainMintedCollection = database.collection('minteddomain');
         const activeMarketCollection = database.collection('activemarket');
         const cancelMarketCollection = database.collection('cancelmarket');
         const createMarketCollection = database.collection('createmarket');
         const soldMarketCollection = database.collection('soldmarket');
         const allMarketEventCollection = database.collection('allmarketevent');
         const approvedCollection = database.collection('approvedtoken');

         const existingActiveDocument = await activeMarketCollection.findOne({ ItemId: eventData.ItemId });

         switch (eventData.Type) {
             case "OfferCreated":
                 if (existingActiveDocument) {
                     console.log(`Document with ItemId ${eventData.ItemId} already exists.`);
                 } else {
                    await domainMintedCollection.updateOne(
                        { ItemId: eventData.ItemId },
                        { $set: { Approval: true } }
                    );
                     const findedDomain = await domainMintedCollection.findOne({ ItemId: eventData.ItemId });
                     console.log(findedDomain, "findedDomain");
                     findedDomain.Price = eventData.Price;
                     const resultActive2 = await activeMarketCollection.insertOne(findedDomain);
                     console.log(`New document inserted active market table with the _id: ${resultActive2.insertedId}`);
                     const resultCreate = await createMarketCollection.insertOne(eventData);
                     console.log(`New document inserted created market table with the _id: ${resultCreate.insertedId}`);
                     const resultAll = await allMarketEventCollection.insertOne(eventData);
                     console.log(`New event inserted all event with the _id: ${resultAll.insertedId}`);
                 }
                 break;
             case "OfferCancelled":
                 if (existingActiveDocument) {
                     await activeMarketCollection.deleteOne({ ItemId: eventData.ItemId });
                     console.log(`New event deleted active market table`);
                     const resultCancel = await cancelMarketCollection.insertOne(eventData);
                     console.log(`New event inserted cancel market table with the _id: ${resultCancel.insertedId}`);
                     const resultAll = await allMarketEventCollection.insertOne(eventData);
                     console.log(`New event inserted all market table with the _id: ${resultAll.insertedId}`);
                 } else {
                     console.log(`Event with ItemId ${eventData.ItemId} not found.`);
                 }
                 break;
             case "DomainSold":
                 if (existingActiveDocument) {
                     await domainMintedCollection.updateOne(
                         { ItemId: eventData.ItemId },
                         { $set: { Approval: false } }
                     );

                     const updateFields = {}
                     updateFields.MarketApprovalBalance = Number(eventData.Price);
                     const updateApprovalBalance = await approvedCollection.updateOne(
                         { From: eventData.To },
                         { $inc: updateFields }
                     )

                     console.log(`Aprroval balance is updated: ${updateApprovalBalance.matchedCount}`)
                     await activeMarketCollection.deleteOne({ ItemId: eventData.ItemId });
                     console.log(`New event deleted active market table`);
                     const resultSold = await soldMarketCollection.insertOne(eventData);
                     console.log(`New event inserted sold market table with the _id: ${resultSold.insertedId}`);
                     const resultAll = await allMarketEventCollection.insertOne(eventData);
                     console.log(`New event inserted all market table with the _id: ${resultAll.insertedId}`);
                 } else {
                     console.log(`Event with ItemId ${eventData.ItemId} not found.`);
                 }
                 break;
             default:
                 break;
         }

     } catch (error) {
         console.error('Error saving to database:', error);
     } finally {
         await client.close();
     }
}

async function processEvent(log) {
    let processedEvent;
    const domainName = await domainContract.getDomainName(log.args[0].toString());

    switch (log.fragment.name) {
        case "OfferCreated":
            processedEvent = {
                Type: log.fragment.name,
                ItemId: log.args[0].toString(),
                From: log.args[1],
                To: "Privapp Market Place",
                Price: Number(log.args[2]) / 10 ** 8,
                DomainName: domainName,
                Approval: true,
                TxId: log.transactionHash,
                BlockNumber: log.blockNumber,
                TransactionIndex: log.transactionIndex,
                Timestamp: new Date().toISOString()
            };
            break;
        case "OfferCancelled":
            processedEvent = {
                Type: log.fragment.name,
                ItemId: log.args[0].toString(),
                From: log.args[1],
                To: "Privapp Market Place",
                Price: Number(log.args[2]) / 10 ** 8,
                DomainName: domainName,
                Approval: false,
                TxId: log.transactionHash,
                BlockNumber: log.blockNumber,
                TransactionIndex: log.transactionIndex,
                Timestamp: new Date().toISOString()
            };
            break;
        case "DomainSold":
            processedEvent = {
                Type: log.fragment.name,
                ItemId: log.args[0].toString(),
                From: log.args[1],
                To: log.args[2],
                Price: Number(log.args[3]) / 10 ** 8,
                DomainName: domainName,
                Approval: false,
                TxId: log.transactionHash,
                BlockNumber: log.blockNumber,
                TransactionIndex: log.transactionIndex,
                Timestamp: new Date().toISOString()
            };
            break;
        default:
            break;
    }

    return processedEvent;
}

async function getPastEvents(fromBlock, toBlock) {
    const maxBlockRange = 50000; // Maximum block range per request
    const events = [
        "OfferCreated",
        "OfferCancelled",
        "DomainSold"
    ];

    let allLogs = [];

    for (let startBlock = fromBlock; startBlock <= toBlock; startBlock += maxBlockRange) {
        const endBlock = Math.min(startBlock + maxBlockRange - 1, toBlock);

        for (const event of events) {
            const filter = marketContract.filters[event]();
            const logs = await marketContract.queryFilter(filter, startBlock, endBlock);
            allLogs = allLogs.concat(logs);
        }
    }

    // Sort all logs by block number and transaction index
    allLogs.sort((a, b) => {
        if (a.blockNumber === b.blockNumber) {
            return a.transactionIndex - b.transactionIndex;
        } else {
            return a.blockNumber - b.blockNumber;
        }
    });

    // Process each log
    const allEvents = [];
    for (const log of allLogs) {
        const eventData = await processEvent(log);
        allEvents.push(eventData);
    }

    return allEvents;
}

async function main() {
    const currentBlock = await provider.getBlockNumber();
    const events = await getPastEvents(6150796, currentBlock);

    // Process sorted events
    for (const event of events) {
        await saveToDatabase(event);
    }
}

main().catch((error) => {
    console.error('Error in main execution:', error);
});
