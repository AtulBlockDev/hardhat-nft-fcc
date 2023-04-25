const{ethers} = require("hardhat");
const { developmentChains, networkConfig } = require("../helper-hardhat-config");
const{storeImages, storetokenUriMetaData} = require("../utils/uploadToPinata")
require("dotenv").config


    const ImageLocation = "./images/randomNft/"

    const FUND_AMOUNT = "1000000000000000000000";

    const metaDataTemplate = {
        name:"",
        description:"",
        image:"",
        attributes:[{
            trait_type: "Cuteness",
            value: 100,
        }],
    }


    let tokenUris = [
  "ipfs://QmPFe6MqCCscB3MfbDtZTUcmDYhdBktUZvSKk3BkpkfVjc",
  "ipfs://Qmcwknxg78igAZmbyHTTco7HcBvgh5m5qxmrEqCiA7du5q",
  "ipfs://Qmc7h2dhCCtKVUwCrynNFoSanrVBcMA1P8rU63t8TGoFFE",
];

module.exports =  async function({getNamedAccounts, deployments}){
    const {deployer} = await getNamedAccounts();
    const {deploy, log} = await deployments;
    const chainId = network.config.chainId;

    let vrfCoordinatorV2Address, subscriptionId, vrfCoordinatorV2Mock
    const gasLane = networkConfig[chainId].gasLane
    const mintFee = networkConfig[chainId].mintFee
    const callbackGasLimit = networkConfig[chainId].callbackGasLimit




    if (process.env.UPLOAD_TO_PINATA == "TRUE") {
      tokenUris = await handleTokenUris();
    }


    if(developmentChains.includes(network.name)){
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address;
        const tx = await vrfCoordinatorV2Mock.createSubscription()
        const txReciept = await tx.wait(1)
        subscriptionId = txReciept.events[0].args.subId
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT)
    }
    else{
        vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2;
        subscriptionId = networkConfig[chainId].subscriptionId;


    }

     async function handleTokenUris() {
       tokenUris = [];

       const {responses: imageUploadResponses, files} = await storeImages(ImageLocation)
        for( items in imageUploadResponses){
            let tokenUriMetaData = {...metaDataTemplate}

            tokenUriMetaData.name = files[items].replace("png", "")
            tokenUriMetaData.description = `an adorable${tokenUriMetaData.name} puppy`
            tokenUriMetaData.image = `ipfs://${imageUploadResponses[items].IpfsHash}`
            console.log(`uploading ${tokenUriMetaData.name}........`)

            const  metaDataUploadResponse = await storetokenUriMetaData(tokenUriMetaData);
            tokenUris.push(`ipfs://${metaDataUploadResponse.IpfsHash}`)

        }
        console.log("tokenUris Uploaded!")
        console.log(tokenUris)

       return tokenUris;
     }

    args = [vrfCoordinatorV2Address, subscriptionId, gasLane, callbackGasLimit, tokenUris, mintFee]



    const randomIpfsNft = await deploy("RandomIpfsNft", {
        from: deployer,
        args:args,
        log: true,
        waitConfirmations: networkConfig.blockConfirmations || 1
    })

     if (chainId == 31337) {
       await vrfCoordinatorV2Mock.addConsumer(
         subscriptionId,
         randomIpfsNft.address
       );
     }
    
}

module.exports.tags = ["all", "randomIpfs", "main"]
