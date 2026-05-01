// SPDX-License-Identifier: UNLICENSED 
pragma solidity ^0.8.28;

contract ConfessionContract {

    struct Confession {
        string encryptedContent; // 存放前端加密過後的 AES 密文字串
        uint256 timestamp;       // 紀錄寫入區塊鏈的時間戳記
    }

    mapping(address => Confession[]) private userConfessions;

    event ConfessionAdded(address indexed user, uint256 timestamp);


    function addConfession(string calldata _encryptedContent) external {
        // 將新的告解推入該使用者的陣列中
        userConfessions[msg.sender].push(Confession({
            encryptedContent: _encryptedContent,
            timestamp: block.timestamp
        }));

        emit ConfessionAdded(msg.sender, block.timestamp);
    }


    function getMyConfessions() external view returns (Confession[] memory) {
        return userConfessions[msg.sender];
    }
}