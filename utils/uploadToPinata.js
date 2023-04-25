const { default: pinataClient } = require("@pinata/sdk")
const PinataSDK = require("@pinata/sdk")
const fs = require ("fs")
require("dotenv").config
const path = require("path")


const PINATA_API_KEY = process.env.PINATA_API_KEY
const PINATA_API_SECRET = process.env.PINATA_API_SECRET
const Pinata = PinataSDK(PINATA_API_KEY, PINATA_API_SECRET)

async function storeImages(ImagesFilePath)
{
const fullImagesPath = path.resolve(ImagesFilePath)
const files = fs.readdirSync(fullImagesPath).filter((file) => file.includes(".png"));


let responses = []

console.log("Uploading to IPFS")

for(fileIndex in files){
const readableStreamForFile = fs.createReadStream(`${fullImagesPath}/${files[fileIndex]}`);
        try{
            const response = await Pinata.pinFileToIPFS(readableStreamForFile)
            responses.push(response)
            
        }
        catch(error){
            console.log(error)
        }

}
return {responses, files}
}

async function storetokenUriMetaData(metadata){

    try{
    const response = await Pinata.pinJSONToIPFS(metadata)
    return response
    }
    catch(error){
        console.log(error)
    }
    return null
}
module.exports = {storeImages, storetokenUriMetaData}

