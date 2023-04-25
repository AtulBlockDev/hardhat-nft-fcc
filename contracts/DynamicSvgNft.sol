// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "base64-sol/base64.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract DynamicSvgNft is ERC721 {

uint256 private s_tokenCounter;
string private i_lowImageUri;
string private i_highImageUri;
string private constant base64EncodedSvgPrefix = "data:image/svg+xml;base64,";
AggregatorV3Interface private immutable i_priceFeed;
mapping(uint256=>int256) public s_tokenIdToValue;


constructor(string memory lowImageUri, string memory highImageUri, address priceFeedAddress) ERC721("Dynamic Svg Nft", "DSN"){

    i_lowImageUri = svgToImageUri(lowImageUri);
    i_highImageUri = svgToImageUri(highImageUri);
    s_tokenCounter = 0;
    i_priceFeed = AggregatorV3Interface(priceFeedAddress);

}
function svgToImageUri(string memory svg) public pure returns(string memory){

    string memory base64EncodedSvg = Base64.encode(bytes(string(abi.encodePacked(svg))));
    return string(abi.encodePacked(base64EncodedSvgPrefix, base64EncodedSvg));

}

function mintNft(int256 highValue) public{
    s_tokenIdToValue[s_tokenCounter] = highValue;
    _safeMint(msg.sender, s_tokenCounter);
    s_tokenCounter += 1;
}
function _baseURI() internal pure override returns(string memory){
    return "data:application/json;base64";
}

function tokenURI(uint256 tokenId) public view override returns(string memory){
    require(_exists(tokenId),"tokenId does not exists!");
    // string memory ImageURI = "hi";

    (,int256 price,,,) =  i_priceFeed.latestRoundData();
    string memory ImageURI = i_lowImageUri;
    if(price>s_tokenIdToValue[tokenId]){
        return i_highImageUri;
    }

    return

    string(abi.encode(_baseURI(), Base64.encode(bytes(abi.encodePacked('{"name":"', name(),'", "description:  An Nft that changes based on Chainlink feed", ',
    '"attribiutes":[{"trait_type": "coolness", "value": 100}], "image": " ', ImageURI,'"}'
    )))));



}


}
