// import hre from "hardhat";

// async function main() {
//   const { ethers } = hre;

//   const Confession = await ethers.getContractFactory("Confession");

//   const confession = await Confession.deploy();

//   await confession.waitForDeployment();

//   const address = await confession.getAddress();

//   console.log("Contract deployed to:", address);
// }

// main().catch((error) => {
//   console.error(error);
//   process.exitCode = 1;
// });