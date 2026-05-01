export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

export const ABI = [
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
] as const