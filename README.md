# Confession App

匿名告解系統。使用者透過 Web3Auth 錢包登入，輸入告解後加密存入區塊鏈，並收到一首對應的歌曲。

---

## 系統架構

```
使用者
  │
  ├─ 1. Web3Auth 登入（Google / Email 等社交登入）
  │
  ├─ 2. 錢包簽名固定訊息 → 推導加密 key（不需輸入密碼）
  │
  ├─ 3. 在本地用 AES 加密告解內容
  │
  ├─ 4. 對「地址 + 密文」進行數位簽章（不花 Gas）
  │
  ├─ 5. 將簽名與密文送往後端
  │
  └─ 後端（FastAPI）
        │ 驗證簽名並代付 Gas
        └─ 寫入區塊鏈（ConfessionContract）
```

### 加密流程

```
signMessage("confession-encrypt-v1")
        │
        ▼
  signature（65 bytes，確定性簽名，跨裝置一致）
        │
        ├─ PBKDF2(signature, randomSalt, 10000 次)
        │         │
        │         ▼
        │      AES Key
        │         │
        │         ▼
        │   AES.encrypt(confession)
        │         │
        └─► { encryptedMood, salt } ─► 上鏈儲存
```

**加密 key 直接從錢包簽名推導，無需密碼、無需 localStorage，任何裝置登入同一個錢包都能解密。**

### Meta-transaction（代付 Gas）

使用者本身不需持有任何加密貨幣。流程如下：

1. 前端讓使用者對 `(userAddress, encryptedContent)` 進行 ECDSA 簽章
2. 後端收到後，用自己的私鑰發送交易，呼叫合約的 `addConfessionDelegated`
3. 合約在鏈上驗證簽名，確認是使用者本人授權，再以使用者地址儲存資料

---

## 技術棧

| 層 | 技術 |
|---|---|
| 前端 | React 19、TypeScript、Vite、viem、Web3Auth |
| 加密 | CryptoJS（AES + PBKDF2） |
| 後端 | Python 3、FastAPI、web3.py |
| 區塊鏈 | Hardhat 3、Solidity 0.8.28、OpenZeppelin ECDSA |

---

## 環境需求

- Node.js >= 18
- Python >= 3.10
- npm

---

## 快速開始

### 1. 安裝所有依賴

```bash
make setup
```

這會依序執行：
- 建立 Python 虛擬環境並安裝後端套件
- 安裝 blockchain 的 npm 套件
- 安裝 frontend 的 npm 套件

### 2. 設定環境變數

**後端** `backend/.env`：

```env
SERVER_PRIVATE_KEY="0x..."   # Hardhat 預設帳號的私鑰（帳號 #19）
SERVER_ADDRESS="0x..."       # 對應的錢包地址
CONTRACT_ADDRESS="0x..."     # 部署後的合約地址
```

**前端** `frontend/.env`：

```env
VITE_CONTRACT_ADDRESS="0x..."  # 與後端 CONTRACT_ADDRESS 相同
```

> 每次重啟 Hardhat 節點並重新部署後，合約地址都會改變，需同步更新兩個 `.env`。

### 3. 啟動開發環境

```bash
make dev
```

依序自動完成：
1. 啟動 Hardhat 本地節點（port 8545）
2. 部署合約到本地節點
3. 啟動 FastAPI 後端（port 8000）
4. 啟動前端（port 5173）

瀏覽器打開 `http://localhost:5173`

### 4. 停止所有服務

```bash
make stop
```

---

## 單獨執行各服務

```bash
make node        # 只啟動 Hardhat 節點
make deploy      # 只部署合約（節點需已在執行）
make backend     # 只啟動後端
make frontend    # 只啟動前端
```

---

## 專案結構

```
blockchain_project/
├── Makefile
│
├── blockchain/
│   ├── contracts/
│   │   └── Confession.sol          # 主合約
│   ├── ignition/modules/
│   │   └── Confession.ts           # 部署腳本
│   ├── test/
│   │   └── Confession.ts           # 合約測試
│   └── hardhat.config.ts
│
├── backend/
│   ├── main.py                     # FastAPI，relay 端點
│   ├── config.py                   # 環境變數讀取
│   ├── requirements.txt
│   └── .env
│
└── frontend/
    └── src/
        ├── pages/
        │   ├── LoginPage.tsx       # 錢包連接 + 簽名
        │   ├── HomePage.tsx        # 輸入告解 + 上鏈
        │   └── PlayerPage.tsx      # 解密 + 顯示歌曲
        ├── context/
        │   └── AuthContext.tsx     # 全域 walletAddress + encryptionKey
        └── utils/
            ├── cryptoMood.ts       # AES 加解密
            └── pickSongs.ts        # 隨機選歌
```

---

## 合約介面

```solidity
// 直接寫入（使用者自付 Gas）
function addConfession(string calldata _encryptedContent) external

// 委託寫入（後端代付 Gas）
function addConfessionDelegated(
    address _user,
    string calldata _content,
    bytes calldata _signature
) external

// 讀取自己的告解
function getMyConfessions() external view returns (Confession[] memory)
```
