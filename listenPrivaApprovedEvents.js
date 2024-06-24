const { ethers } = require('ethers');
const { MongoClient } = require('mongodb');
const config = require('./config');

const provider = new ethers.WebSocketProvider(config.bscWSNodeUrl);
const contract = new ethers.Contract(config.privaContractAddress, config.privaAbi, provider);

async function saveToDatabase(eventData) {
    const uri = 'mongodb://localhost:27017/market';
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const database = client.db('market');
        const collection = database.collection('approvedtoken');

        const existingDocument = await collection.findOne({ From: eventData.From });

        if (existingDocument) {
            const updateFields = {};
            if (eventData.To === config.marketplaceContractAddress) {
                updateFields.MarketApprovalBalance = eventData.MarketApprovalBalance;
            } else {
                updateFields.DomainApprovalBalance = eventData.DomainApprovalBalance;
            }
            const updateResult = await collection.updateOne(
                { From: eventData.From },
                { $set: updateFields }
            );
            console.log(`Updated document with From ${eventData.From}. Matched: ${updateResult.matchedCount}, Modified: ${updateResult.modifiedCount}`);
        } else {
            const insertResult = await collection.insertOne(eventData);
            console.log(`New event inserted into approvetoken with _id: ${insertResult.insertedId}`);
        }
    } catch (error) {
        console.error('Error saving to database:', error);
    } finally {
        await client.close();
    }
}

async function processEvent(log) {
    const processedEvent = {
        Type: "Approval",
        From: log.from,
        To: log.to,
        MarketApprovalBalance: log.to == config.marketplaceContractAddress ? Number(log.value) / 10**8 : 0,
        DomainApprovalBalance: log.to == config.domainContractAddress ? Number(log.value) / 10**8 : 0,
        TxId: log.transactionHash
    };
    return processedEvent;
}

async function main() {
    // Canlı olayları dinleme
    contract.on('Approval', async (from, to, value, event) => {
        if (to === config.domainContractAddress || to === config.marketplaceContractAddress) {
            const log = {
                from: from,
                to: to,
                value: value,
                transactionHash: event.transactionHash
            };
            const eventData = await processEvent(log);
            await saveToDatabase(eventData);
        }
    });
}

main().catch((error) => {
    console.error('Error in main execution:', error);
});
