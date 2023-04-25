const{ethers, network} = require("hardhat");
const { developmentChains, networkConfig } = require("../helper-hardhat-config");
const fs = require("fs")

module.exports = async function({getNamedAccounts, deployments}){
    const {deployer} = await getNamedAccounts();
    const {deploy, log} = await deployments;
    const chainId = network.config.chainId

    let EthUsdPriceFeedAdddress;

    if (developmentChains.includes(network.name)){
        const MockV3Aggregator = await ethers.getContract("MockV3Aggregator")
        EthUsdPriceFeedAdddress = MockV3Aggregator.address
    }
    else{
        EthUsdPriceFeedAdddress = networkConfig[chainId].ethUsdPriceFeed;
    }

    const lowImageUri = fs.readFileSync("./images/DynamicNft/frown.svg", {encoding: "utf8"});
    const highImageYri = fs.readFileSync("./images/DynamicNft/happy.svg", {encoding: "utf8"});

    args = [lowImageUri, highImageYri, EthUsdPriceFeedAdddress]

    const dynamicSvgNft = await deploy("DynamicSvgNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1
    })

}
module.exports.tags = ["all", "dynamicNft", "main"]