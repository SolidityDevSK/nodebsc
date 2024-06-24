const { ethers } = require('ethers');
const fs = require('fs');
const config = require('./config');

const provider = new ethers.JsonRpcProvider("https://morning-dry-frog.bsc.quiknode.pro/4bea564e513c20b9fd4b7de93b61f8a050b88fbd/");
const contract = new ethers.Contract("0x64A24E509c914b892ba3D171c5e59CE6c4D929CA", config.domainAbi, provider);

function bigIntReplacer(key, value) {
  return typeof value === 'bigint' ? value.toString() : value;
}

async function saveToLocalFile(eventData) {
  const filePath = 'data.json';

  // Mevcut verileri okuyun (varsa)
  let data = [];
  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath);
    data = JSON.parse(fileContent);
  }

  // Veritabanındaki mevcut belgeyi kontrol et
  const existingDocumentIndex = data.findIndex(item => item.ItemId === eventData.ItemId);

  if (existingDocumentIndex > -1) {
    // Güncelleme işlemi
    console.log(`Updated document with ItemId ${eventData.ItemId}`);
  } else {
    // Yeni kayıt ekleme işlemi
    data.push(eventData);
    console.log(`New event inserted into local data.json with ItemId: ${eventData.ItemId}`);
  }

  // Güncellenmiş veriyi yaz
  fs.writeFileSync(filePath, JSON.stringify(data, bigIntReplacer, 2));
}

async function processEvent(log) {
  let processedEvent;
  const domainName = await contract.getDomainName(log.args[1].toString());
  const domainMintPrice = await contract.showPrivPrice();
  if (log.fragment.name === "DomainMinted") {
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
  }
  return processedEvent;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getPastEvents(fromBlock, toBlock) {
  const maxBlockRange = 5;
  const event = "DomainMinted";
  const allEvents = [];

  for (let startBlock = fromBlock; startBlock <= toBlock; startBlock += maxBlockRange) {
    const endBlock = Math.min(startBlock + maxBlockRange - 1, toBlock);

    console.log(`Fetching logs for blocks from ${startBlock} to ${endBlock}`);

    const filter = contract.filters[event]();
    let logs;
    try {
      logs = await contract.queryFilter(filter, startBlock, endBlock);
    } catch (error) {
      console.error(`Error fetching logs for ${event} from ${startBlock} to ${endBlock}: ${error.message}`);
      await sleep(1000);
      logs = await contract.queryFilter(filter, startBlock, endBlock);
    }

    for (const log of logs) {
      const eventData = await processEvent(log);
      if (eventData) {
        allEvents.push(eventData);
      }
    }
  }

  return allEvents;
}

async function main() {
  const events = await getPastEvents(39785139, 39788862);
  events.sort((a, b) => a.BlockNumber - b.BlockNumber);

  for (const event of events) {
    await saveToLocalFile(event);
  }
}

main().catch((error) => {
  console.error('Error in main execution:', error);
});
