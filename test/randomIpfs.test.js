const { getNamedAccounts, ethers, deployments } = require("hardhat")

describe("RandomIpfsNftTest", ()=>{

    beforeEach(async function() {
        deployer = (await getNamedAccounts()).deployer
        randomIpfsNft = await ethers.getContractAt("randomIpfsNft", deployer)
        await deployments.fixture("all")

    })

    describe("constructor",async ()=>{
        it("initializes the constructor correctly", async function(){
            
        })

    })


})