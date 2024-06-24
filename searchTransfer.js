const { ethers } = require('ethers');
const config = require('./config');

const provider = new ethers.JsonRpcProvider(config.bscNodeUrl); // RPC provider for querying past events
const contract = new ethers.Contract(config.domainContractAddress, config.domainAbi, provider);

async function processEvent(log) {
console.log(log);
  
}

async function getPastEvents(fromBlock, toBlock) {
    const maxBlockRange = 50000; // Maximum block range per request
    const events = [
        "Transfer"
    ];

    for (let startBlock = fromBlock; startBlock <= toBlock; startBlock += maxBlockRange) {
        const endBlock = Math.min(startBlock + maxBlockRange - 1, toBlock);

        for (const event of events) {
            const filter = contract.filters[event]();
            const logs = await contract.queryFilter(filter, startBlock, endBlock);

            for (const log of logs) {
                await processEvent(log);
            }
        }
    }
}

async function main() {
    // Manual call to fetch past events, for example from block 0 to the latest block
    const currentBlock = await provider.getBlockNumber();
    await getPastEvents(6150796, currentBlock);
}

main().catch((error) => {
    console.error('Error in main execution:', error);
});
