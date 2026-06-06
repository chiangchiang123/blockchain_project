from fastapi import FastAPI, HTTPException
from web3 import Web3
from config import settings
from fastapi.middleware.cors import CORSMiddleware
import json

app = FastAPI()

# 1. 定義允許跨域請求的來源（你的前端網址）
origins = [
    "http://localhost:5173",
    # 如果未來有部署，把正式網域也加進來，例如 "https://my-frontend.com"
]

# 2. 加入 CORS 中介軟體
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,      # 允許的來源
    allow_credentials=True,     # 是否允許攜帶 Cookie 等憑證
    allow_methods=["*"],        # 允許的 HTTP 方法 (GET, POST, PUT, DELETE, OPTIONS 等)
    allow_headers=["*"],        # 允許的 HTTP 標頭
)

# 連線到本地 Hardhat 節點
w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:8545"))
SERVER_PRIVATE_KEY = settings.server_private_key
SERVER_ADDRESS = settings.server_address
CONTRACT_ADDRESS = settings.contract_address
ABI = json.loads('''
    [
        {
        "inputs": [],
        "name": "ECDSAInvalidSignature",
        "type": "error"
        },
        {
        "inputs": [
            {
            "internalType": "uint256",
            "name": "length",
            "type": "uint256"
            }
        ],
        "name": "ECDSAInvalidSignatureLength",
        "type": "error"
        },
        {
        "inputs": [
            {
            "internalType": "bytes32",
            "name": "s",
            "type": "bytes32"
            }
        ],
        "name": "ECDSAInvalidSignatureS",
        "type": "error"
        },
        {
        "anonymous": false,
        "inputs": [
            {
            "indexed": true,
            "internalType": "address",
            "name": "user",
            "type": "address"
            },
            {
            "indexed": false,
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
            }
        ],
        "name": "ConfessionAdded",
        "type": "event"
        },
        {
        "inputs": [
            {
            "internalType": "string",
            "name": "_encryptedContent",
            "type": "string"
            }
        ],
        "name": "addConfession",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
        },
        {
        "inputs": [
            {
            "internalType": "address",
            "name": "_user",
            "type": "address"
            },
            {
            "internalType": "string",
            "name": "_content",
            "type": "string"
            },
            {
            "internalType": "bytes",
            "name": "_signature",
            "type": "bytes"
            }
        ],
        "name": "addConfessionDelegated",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
        },
        {
        "inputs": [],
        "name": "getMyConfessions",
        "outputs": [
            {
            "components": [
                {
                "internalType": "string",
                "name": "encryptedContent",
                "type": "string"
                },
                {
                "internalType": "uint256",
                "name": "timestamp",
                "type": "uint256"
                }
            ],
            "internalType": "struct ConfessionContract.Confession[]",
            "name": "",
            "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
        }
    ]
''')

@app.post("/api/relay-confession")
async def relay_confession(data: dict):
    try:
        contract = w3.eth.contract(address=Web3.to_checksum_address(CONTRACT_ADDRESS), abi=ABI)

        transaction = contract.functions.addConfessionDelegated(
            Web3.to_checksum_address(data['userAddress']),
            data['content'],
            bytes.fromhex(data['signature'].removeprefix('0x'))
        ).build_transaction({
            'from': Web3.to_checksum_address(SERVER_ADDRESS),
            'nonce': w3.eth.get_transaction_count(Web3.to_checksum_address(SERVER_ADDRESS)),
            'gas': 2000000,
            'gasPrice': w3.eth.gas_price
        })

        signed_txn = w3.eth.account.sign_transaction(transaction, private_key=SERVER_PRIVATE_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)

        return {"status": "success", "tx_hash": tx_hash.hex()}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))