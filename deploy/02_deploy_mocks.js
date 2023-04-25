const{ethers, network} = require("hardhat")
const{DECIMALS, INITIAL_PRICE} = require("../helper-hardhat-config");



module.exports = async function({deployments, getNamedAccounts}){

    deployer = (await getNamedAccounts()).deployer
    const{deploy, log} = await deployments;
    const chainId = network.config.chainId

    args = [DECIMALS, INITIAL_PRICE];


    if(chainId == 31337){
        await deploy("VRFCoordinatorV2Mock",{
            from: deployer,
            args: args,
            log: true,
            waitConfirmations: network.config.blockConfirmations || 1

        })

        const mockV3Aggregator = await deploy("MockV3Aggregator", {
          from: deployer,
          args: [DECIMALS, INITIAL_PRICE],
          log: true,
          waitConfirmations: network.config.blockConfirmations || 1,
        }); 

        log("Mocks Deployed!");
        log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    }
}
module.exports.tags = ["all", "mocks", "main"]
