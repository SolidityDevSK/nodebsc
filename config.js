require('dotenv').config();
const domainAbi = require("./DomainNFT.json")
const marketPlaceAbi = require("./NFTMarketPlace.json")
const privaAbi = require("./Priva.json")

module.exports = {
  bscNodeUrl: process.env.BSC_NODE_URL,
  bscWSNodeUrl: process.env.BSC_WSNODE_URL,
  domainContractAddress: process.env.DOMAIN_CONTRACT_ADDRESS,
  marketplaceContractAddress: process.env.MARKETPLACE_CONTRACT_ADDRESS,
  privaContractAddress: process.env.PRIVA_CONTRACT_ADDRESS,
  domainAbi: domainAbi,
  marketPlaceAbi: marketPlaceAbi,
  privaAbi: privaAbi
};
