// SPDX-License-Identifier: UNLICENSED 
pragma solidity ^0.8.28;

contract Confession {

struct Note {
    string content;
    uint timestamp;
}

// address public owner;

mapping(address => Note[]) private userNotes;

event ConfessionAdded(
    address user,
    uint timestamp
);

// constructor() {
//     owner = msg.sender;
// }

// modifier onlyOwner() {
//     require(msg.sender == owner, "Not owner");
//     _;
// }

function addConfession(string memory _content) public {
    userNotes[msg.sender].push(
        Note(_content, block.timestamp)
    );

    emit ConfessionAdded(
        msg.sender,
        block.timestamp
    );
}

function getMyConfession(uint index) public view returns(string memory){
    return userNotes[msg.sender][index].content;
}

// function clearAll(address user)
//     public
//     onlyOwner
// {
//     delete userNotes[user];
// }

}
