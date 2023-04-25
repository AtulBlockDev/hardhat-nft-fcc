const { assert } = require("chai")
const { getNamedAccounts, ethers } = require("hardhat")



 describe("basicNftTest", async function(){


    let basicNft, deployer;

    beforeEach(async function(){
    deployer = (await getNamedAccounts()).deployer
    await deployments.fixture(["basicNft"]);
    basicNft = await ethers.getContract("BasicNft", deployer)

    })

    describe("Constructor", ()=>{
        it("initializes the NFT correctly", async function(){
            const name = await basicNft.name();
            const symbol = await basicNft.symbol();
            const tokenCounter = await basicNft.getTokenCounter();

            assert.equal(name, "Doggie")
            assert.equal(symbol, "DOG")
            assert.equal(tokenCounter.toString(), "0")
        })
    } )

 })