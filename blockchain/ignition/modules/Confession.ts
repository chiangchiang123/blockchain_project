import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ConfessionModule", (m) => {
  const confession = m.contract("ConfessionContract");

  return { confession };
});