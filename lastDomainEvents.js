const { ethers } = require('ethers');
const { MongoClient } = require('mongodb');
const config = require('./config');

const provider = new ethers.JsonRpcProvider(config.bscNodeUrl);
const contract = new ethers.Contract(config.domainContractAddress, config.domainAbi, provider);

async function saveToDatabase(eventData) {
  const uri = 'mongodb://localhost:27017/market';
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const database = client.db('market');
    const mintedCollection = database.collection('minteddomain');
    const approvedCollection = database.collection('approvedtoken');
    const existingDocument = await mintedCollection.findOne({ ItemId: eventData.ItemId });

    if (existingDocument) {
      const updateFields = {};
      if (eventData.Type === "Approval" && eventData.To === config.marketplaceContractAddress) {
        updateFields.Approval = true;
      } else if (eventData.Type === "Transfer" && eventData.From !== "0x0000000000000000000000000000000000000000") {
        updateFields.From = eventData.To;
      }

      if (Object.keys(updateFields).length > 0) {
        const updateResult = await mintedCollection.updateOne(
          { ItemId: eventData.ItemId },
          { $set: updateFields }
        );
        console.log(`Updated document with ItemId ${eventData.ItemId}. Matched: ${updateResult.matchedCount}, Modified: ${updateResult.modifiedCount}`);
      } else {
        console.log(`Event with ItemId ${eventData.ItemId} already exists and is not an approval or transfer for the marketplace.`);
      }
    } else {
      const insertResult = await mintedCollection.insertOne(eventData);
      const updateFields = {}
      updateFields.DomainApprovalBalance = Number(eventData.Price);
      const updateApprovalBalance = await approvedCollection.updateOne(
        {From: eventData.From},
        {$inc:updateFields}
        )
      console.log(`New event inserted into minteddomain with _id: ${insertResult.insertedId}`);
      console.log(`Aprroval balance is updated: ${updateApprovalBalance.matchedCount}`)
    }
  } catch (error) {
    console.error('Error saving to database:', error);
  } finally {
    await client.close();
  }
}

async function processEvent(log) {
  let processedEvent;
  const domainName = await contract.getDomainName(log.args[1].toString());
  const domainMintPrice = await contract.showPrivPrice();
  switch (log.fragment.name) {
    case "DomainMinted":
      processedEvent = {
        Type: log.fragment.name,
        ItemId: log.args[1].toString(),
        From: log.args[0],
        To: 'N/A',
        DomainName: domainName,
        IpfsHash: log.args[3],
        Price: domainMintPrice,
        TxId: log.transactionHash,
        BlockNumber: log.blockNumber,
        Approval: false
      };
      break;
    case "Approval":
      processedEvent = {
        Type: log.fragment.name,
        ItemId: log.args[2].toString(),
        From: log.args[0],
        To: log.args[1],
        DomainName: domainName,
        TxId: log.transactionHash,
        BlockNumber: log.blockNumber
      };
      break;
    case "Transfer":
      processedEvent = {
        Type: log.fragment.name,
        ItemId: log.args[2].toString(),
        From: log.args[0],
        To: log.args[1],
        TxId: log.transactionHash,
        BlockNumber: log.blockNumber
      };
      break;
    default:
      break;
  }

  return processedEvent;
}

async function getPastEvents(fromBlock, toBlock) {
  const maxBlockRange = 50000;
  const events = [
    "DomainMinted",
    "Approval",
    "Transfer"
  ];
  const allEvents = [];

  for (let startBlock = fromBlock; startBlock <= toBlock; startBlock += maxBlockRange) {
    const endBlock = Math.min(startBlock + maxBlockRange - 1, toBlock);

    for (const event of events) {
      const filter = contract.filters[event]();
      const logs = await contract.queryFilter(filter, startBlock, endBlock);

      for (const log of logs) {
        const eventData = await processEvent(log);
        allEvents.push(eventData);
      }
    }
  }

  return allEvents;
}

async function main() {
  const currentBlock = await provider.getBlockNumber();
  const events = await getPastEvents(6150796, currentBlock);

  // Olayları blok numarasına göre sıralama
  events.sort((a, b) => a.BlockNumber - b.BlockNumber);

  // Sıralanmış olayları işleme
  for (const event of events) {
    await saveToDatabase(event);
  }
}

main().catch((error) => {
  console.error('Error in main execution:', error);
});
