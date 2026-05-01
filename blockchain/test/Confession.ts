import { describe, it } from "node:test";
import assert from "node:assert";
import hre from "hardhat";

const { viem, networkHelpers } = await hre.network.create();

describe("告解區塊鏈合約測試 (ConfessionContract)", () => {
  
  // 1. 定義「測試環境快照 (Fixture)」
  // 這個函式負責部屬合約，並把需要的工具回傳。
  // Hardhat 會在每次測試前「重置」到這個剛部屬好的乾淨狀態，讓測試互相不干擾且執行極快。
  async function deployConfessionFixture() {
    // 取得本地端的測試錢包 (預設會給 20 個)
    const [owner, user1, user2] = await viem.getWalletClients();

    // 透過 Hardhat Viem 插件部屬合約
    const confessionRegistry = await viem.deployContract("ConfessionContract");

    // 取得 Public Client (用來查詢區塊鏈狀態，例如區塊時間)
    const publicClient = await viem.getPublicClient();

    return { confessionRegistry, owner, user1, user2, publicClient };
  }

  // 2. 測試案例：寫入與讀取
  it("應該要能讓使用者寫入告解，並且只能讀取自己的告解", async () => {
    // 載入乾淨的合約狀態與測試錢包
    const { confessionRegistry, user1, user2 } = await networkHelpers.loadFixture(deployConfessionFixture);

    // 模擬前端傳來的加密字串
    const mockEncryptedContent1 = "U2FsdGVkX19+user1_secret_confession";
    const mockEncryptedContent2 = "U2FsdGVkX19+user2_secret_confession";

    // --- [行動 1] User 1 寫入告解 ---
    // 使用 user1.account 發送交易 (Write)
    await confessionRegistry.write.addConfession([mockEncryptedContent1], {
      account: user1.account,
    });

    // --- [行動 2] User 2 寫入告解 ---
    await confessionRegistry.write.addConfession([mockEncryptedContent2], {
      account: user2.account,
    });

    // --- [驗證 1] User 1 讀取自己的告解 ---
    // 使用 user1.account 查詢 (Read)
    const user1Confessions = await confessionRegistry.read.getMyConfessions({
      account: user1.account,
    });

    // 斷言 (Assert)：確認 User 1 只拿到 1 篇告解，且內容正確
    assert.strictEqual(user1Confessions.length, 1, "User 1 應該只有一篇告解");
    assert.strictEqual(user1Confessions[0].encryptedContent, mockEncryptedContent1, "告解內容不符合");
    // 確認時間戳記存在且大於 0 (因為型別是 bigint，所以用 > 0n 判斷)
    assert.ok(user1Confessions[0].timestamp > 0n, "應該要有時間戳記");

    // --- [驗證 2] User 2 讀取自己的告解 ---
    const user2Confessions = await confessionRegistry.read.getMyConfessions({
      account: user2.account,
    });

    // 斷言：確認 User 2 拿到的是自己的，沒有偷看到 User 1 的
    assert.strictEqual(user2Confessions.length, 1, "User 2 應該只有一篇告解");
    assert.strictEqual(user2Confessions[0].encryptedContent, mockEncryptedContent2, "User 2 的告解內容不符合");
  });

  // 3. 測試案例：空狀態測試
  it("如果使用者沒有寫過告解，應該回傳空陣列", async () => {
    const { confessionRegistry, user1 } = await networkHelpers.loadFixture(deployConfessionFixture);

    const emptyConfessions = await confessionRegistry.read.getMyConfessions({
      account: user1.account,
    });

    assert.strictEqual(emptyConfessions.length, 0, "沒有寫過告解應該回傳空陣列");
  });
});