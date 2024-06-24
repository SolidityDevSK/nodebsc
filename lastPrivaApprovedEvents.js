const { ethers } = require('ethers');
const { MongoClient } = require('mongodb');
const config = require('./config');

const provider = new ethers.JsonRpcProvider(config.bscNodeUrl);
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
            } else{
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
        Type: log.fragment.name,
        From: log.args[0],
        To: log.args[1],
        MarketApprovalBalance: log.args[1] === config.marketplaceContractAddress ? Number(log.args[2]) / 10**8 : 0,
        DomainApprovalBalance: log.args[1] === config.domainContractAddress ? Number(log.args[2]) / 10**8 : 0,
        TxId: log.transactionHash
    };
    return processedEvent;
}

async function getPastEvents(fromBlock, toBlock) {
    const maxBlockRange = 50000;
    const allEvents = [];
    const events = ["Approval"];

    for (let startBlock = fromBlock; startBlock <= toBlock; startBlock += maxBlockRange) {
        const endBlock = Math.min(startBlock + maxBlockRange - 1, toBlock);

        for (const event of events) {
            const filter = contract.filters[event]();
            const logs = await contract.queryFilter(filter, startBlock, endBlock);

            for (const log of logs) {
                if (log.args[1] === config.marketplaceContractAddress || log.args[1] === config.domainContractAddress) {
                    const eventData = await processEvent(log);
                    allEvents.push(eventData);
                }
            }
        }
    }

    return allEvents;
}

async function main() {
    const currentBlock = await provider.getBlockNumber();
    const events = await getPastEvents(6150796, currentBlock);
    events.sort((a, b) => a.BlockNumber - b.BlockNumber);
    for (const event of events) {
        await saveToDatabase(event);
    }
}

main().catch((error) => {
    console.error('Error in main execution:', error);
});
