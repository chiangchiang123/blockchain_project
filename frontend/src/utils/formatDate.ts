// timestamp：Solidity block.timestamp，單位是秒，需乘 1000 轉成毫秒
export function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp * 1000));
}
