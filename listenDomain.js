const { ethers } = require('ethers');
const { MongoClient } = require('mongodb');
const config = require('./config');

const provider = new ethers.WebSocketProvider(config.bsc2WSNodeUrl);
const contract = new ethers.Contract(config.domainContractAddress, config.domainAbi, provider);

async function saveToDatabase(eventData) {
    const uri = 'mongodb://localhost:27017/market';
    const client = new MongoClient(uri);
    console.log(eventData, "eventData");
    try {
        await client.connect();
        const database = client.db('market');
        const collection = database.collection('minteddomain');
        const approvedCollection = database.collection('approvedtoken');

        const existingDocument = await collection.findOne({ ItemId: eventData.ItemId });

        if (existingDocument) {
            if (eventData.Type === "Approval" && eventData.To === config.marketplaceContractAddress) {
                const updateResult = await collection.updateOne(
                    { ItemId: eventData.ItemId },
                    { $set: { Approval: true } }
                );
                console.log(`Updated document with ItemId ${eventData.ItemId}. Matched: ${updateResult.matchedCount}, Modified: ${updateResult.modifiedCount}`);
            } else if (eventData.Type === "Transfer" && eventData.From !== "0x0000000000000000000000000000000000000000") {
                const updateResult = await collection.updateOne(
                    { ItemId: eventData.ItemId },
                    { $set: { From: eventData.To } }
                );
                console.log(`Updated document with ItemId ${eventData.ItemId}. Matched: ${updateResult.matchedCount}, Modified: ${updateResult.modifiedCount}`);

            }
            else {
                console.log(`Event with ItemId ${eventData.ItemId} already exists and is not an approval or transfer for the marketplace.`);
            }
            return;
        } else  {
                if (eventData.Type != "Transfer"){
                    const insertResult = await collection.insertOne(eventData);
                    console.log(`New event inserted into minteddomain with _id: ${insertResult.insertedId}`);
                }else{
                    const updateFields = {}
                    updateFields.DomainApprovalBalance = Number(eventData.Price);
                    const updateApprovalBalance = await approvedCollection.updateOne(
                        { From: eventData.From },
                        { $inc: updateFields }
                    )
                    console.log(`Aprroval balance is updated: ${updateApprovalBalance.matchedCount}`)
                }
         
           
         
       
        }
    } catch (error) {
        console.error('Error saving to database:', error);
    } finally {
        await client.close();
    }
}

async function processEvent(event) {
    console.log(event, "event");
    let processedEvent;
    const domainName = await contract.getDomainName(event.args[1].toString());
    const domainMintPrice = await contract.showPrivPrice();
    switch (event.filter) {
        case "DomainMinted":
            processedEvent = {
                Type: event.filter,
                ItemId: event.args[1].toString(),
                From: event.args[0],
                To: 'N/A',
                DomainName: domainName,
                IpfsHash: event.args[3],
                Price: domainMintPrice.toString(),
                TxId: event.log.transactionHash,
                Approval: false
            }
            break;
        case "AwardDomain":
            processedEvent = {
                Type: "DomainMinted",
                ItemId: event.args[1].toString(),
                From: event.args[0],
                To: 'N/A',
                DomainName: domainName,
                IpfsHash: event.args[3],
                Price: domainMintPrice.toString(),
                TxId: event.log.transactionHash,
                Approval: false
            }
            break;
        case "Approval":
            processedEvent = {
                Type: event.filter,
                ItemId: event.args[2].toString(),
                From: event.args[0],
                To: event.args[1],
                DomainName: domainName,
                TxId: event.log.transactionHash
            }
            break;
        case "Transfer":
            processedEvent = {
                Type: event.filter,
                ItemId: event.args[2].toString(),
                From: event.args[0],
                To: event.args[1]
            }
        default:
            break;
    }

    await saveToDatabase(processedEvent);
}

async function main() {
    const events = [
        "DomainMinted",
        "Approval",
        "Transfer",
        "AwardDomain"
    ];

    events.forEach(event => {
        contract.on(event, async (...args) => {
            const event = args[args.length - 1];
            await processEvent(event);
        })

    });
}

main().catch((error) => {
    console.error('Error in main execution:', error);
});
