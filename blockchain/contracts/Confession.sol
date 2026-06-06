// SPDX-License-Identifier: UNLICENSED 
pragma solidity ^0.8.28;
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "hardhat/console.sol"; 

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

    function addConfessionDelegated(
        address _user,               // 真實使用者的地址
        string calldata _content,    // 加密後的告解
        bytes calldata _signature    // 使用者在前端簽的名
    ) external {
        // 1. 重建使用者在前端簽署的訊息 Hash
        bytes32 messageHash = keccak256(abi.encodePacked(_user, _content));
        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(messageHash);

        // 2. 利用 ECDSA 還原出是誰簽了這個名
        address signer = ECDSA.recover(ethSignedMessageHash, _signature);

        console.log(signer);
        console.log(_user);
        // 3. 驗證防偽：確認簽名的人，真的是傳進來的 _user
        require(signer == _user, "Invalid signature!");

        // 4. 驗證通過，幫該使用者寫入告解 (注意這裡是存進 _user 的陣列，不是 msg.sender)
        userConfessions[_user].push(Confession({
            encryptedContent: _content,
            timestamp: block.timestamp
        }));
    }
}