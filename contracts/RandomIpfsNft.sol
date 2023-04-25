// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract RandomIpfsNft is VRFConsumerBaseV2, ERC721URIStorage{

    error Ipfs_NotEnoughToMint();
    error ipfs_Not_Owner();
    error ipfs_RangeOutOfBound();
    error ipfs_TransferFailed();

    event requestedNft(uint256 indexed requestId, address requester);
    event NftMinted(breed dogBreed, address minter);


    enum breed{
        pug,
        shibaInu,
        St_bernard
    }

    VRFCoordinatorV2Interface private immutable i_vrfCoordinatorv2;
    uint64 private immutable i_subscriptionId;
    bytes32 private immutable i_gasLane;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    mapping(uint=> address) private s_requestIdToOwner;

    uint256 public s_tokenCounter;
    address private immutable i_owner;
    uint256 private immutable i_mintFee;



    uint256[] public requestIds;
    uint internal constant MAX_CHANCE_VALUE = 100;
    string[] internal s_dogTokenUris;


    constructor(address vrfCoordinatorV2, uint64 subscriptionId, bytes32 gasLane, uint32 callbackGasLimit,    
    string[3] memory dogTokenUris, uint256 mintFee) VRFConsumerBaseV2(vrfCoordinatorV2) 
    ERC721("RandomIpfsNft", "RIN") {
        i_vrfCoordinatorv2 = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_subscriptionId = subscriptionId;
        i_gasLane = gasLane;
        i_callbackGasLimit = callbackGasLimit;
        s_dogTokenUris = dogTokenUris;
        i_mintFee = mintFee;
        i_owner = msg.sender;

    }

    function requestNft() payable public returns(uint256 requestId){
        if(msg.value < i_mintFee){
            revert Ipfs_NotEnoughToMint();
        }
        requestId = i_vrfCoordinatorv2.requestRandomWords(i_gasLane,
        i_subscriptionId,
        REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS);

            s_requestIdToOwner[requestId] = msg.sender;

            emit requestedNft(requestId, msg.sender );

    }
    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override{

        address dogOwner = s_requestIdToOwner[requestId];
        uint tokenId = s_tokenCounter;

        

        uint256 moddedRng = randomWords[0] % MAX_CHANCE_VALUE;

        s_tokenCounter += s_tokenCounter;
        breed dogBreed = getBreedByModdedRng(moddedRng);
        _safeMint(dogOwner, tokenId);
        _setTokenURI(tokenId, s_dogTokenUris[uint256(dogBreed)]);

        emit NftMinted(dogBreed, dogOwner);

    }
    
    function getBreedByModdedRng(uint256 moddedRng) public pure returns(breed){
        uint cumilativeSum = 0;
        uint[3] memory chanceArray = getArrayChance();
        for(uint i = 0 ; i < chanceArray.length ; i++ ){
            if(moddedRng > cumilativeSum && moddedRng < cumilativeSum + chanceArray[i]){
                return breed(i);
            }
            cumilativeSum += chanceArray[i];
        }
        revert ipfs_RangeOutOfBound();
    }



    function getArrayChance() public pure returns(uint[3] memory){
        return [10, 30, MAX_CHANCE_VALUE];
    }
     modifier onlyOwner(){
        if(msg.sender != i_owner) revert ipfs_Not_Owner();
        _;
    }

    function withdraw() onlyOwner payable public {
        uint256 amount = address(this).balance;
        (bool success,) = payable(msg.sender).call{value: amount}("");
        if(!success){
            revert ipfs_TransferFailed();
        }
    }

        function getMintFee() public view returns(uint256){
            return i_mintFee;
        }
        function getDogTokenUris(uint index) public view returns(string memory){
            return s_dogTokenUris[index];
        }
        function getTokenCounter() public view returns(uint256){
            return s_tokenCounter;
        }
        

   

}
