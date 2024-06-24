const { ethers } = require('ethers');
const { MongoClient } = require('mongodb');
const config = require('./config');


const provider = new ethers.WebSocketProvider(config.bscWSNodeUrl);
   
const marketContract = new ethers.Contract(config.marketplaceContractAddress, config.marketPlaceAbi, provider);
const domainContract = new ethers.Contract(config.domainContractAddress, config.domainAbi, provider);

async function saveToDatabase(eventData) {
    const uri = 'mongodb://localhost:27017/market';
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        const database = client.db('market');
        const domainMintedCollection = database.collection('minteddomain')
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
                    const findedDomain = await domainMintedCollection.findOne({ ItemId: eventData.ItemId });
                    findedDomain.Price = eventData.Price
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
                    console.log(`New event inserted cancel market table with the _id: ${resultSold.insertedId}`);
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



async function processEvent(event) {

    let processedEvent;

    

    const domainName = await domainContract.getDomainName(event.args[0].toString());


    switch (event.filter) {
        case "OfferCreated":
            processedEvent = {
                Type: event.filter,
                ItemId: event.args[0].toString(),
                From: event.args[1],
                To: "Privapp Market Place",
                Price: Number(event.args[2]) / 10 ** 8,
                DomainName: domainName,
                Approval:false,
                TxId: event.log.transactionHash,
                Timestamp: new Date().toISOString()
            };
            break;
        case "OfferCancelled":
            processedEvent = {
                Type: event.filter,
                ItemId: event.args[0].toString(),
                From: event.args[1],
                To: "Privapp Market Place",
                Price: Number(event.args[2]) / 10 ** 8,
                DomainName: domainName,
                Approval:false,
                TxId: event.log.transactionHash,
                Timestamp: new Date().toISOString()
            };
            break;
        case "DomainSold":
            processedEvent = {
                Type: event.filter,
                ItemId: event.args[0].toString(),
                From: event.args[1],
                To: event.args[2],
                Price: Number(event.args[3]) / 10 ** 8,
                DomainName: domainName,
                Approval:false,
                TxId: event.log.transactionHash,
                Timestamp: new Date().toISOString()
            };
            break;
        default:
            break;
    }

    await saveToDatabase(processedEvent);
}


async function main() {
   const events = [
        "OfferCreated",
        "OfferCancelled",
        "DomainSold"
    ];
   

    events.forEach(event => {
        marketContract.on(event, async (...args) => {
            const event = args[args.length - 1];
            await processEvent(event)
        });
    });
}

main().catch((error) => {
    console.error('Error in main execution:', error);
});
