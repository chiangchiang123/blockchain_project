import CryptoJS from "crypto-js";

export function encryptText(text: string, secret: string) {
  const salt = CryptoJS.lib.WordArray.random(16).toString();

  const key = CryptoJS.PBKDF2(secret, salt, {
    keySize: 256 / 32,
    iterations: 10000,
  }).toString();

  const encrypted = CryptoJS.AES.encrypt(text, key).toString();

  return { encrypted, salt };
}

export function decryptText(encrypted: string, secret: string, salt: string) {
  const key = CryptoJS.PBKDF2(secret, salt, {
    keySize: 256 / 32,
    iterations: 10000,
  }).toString();

  const bytes = CryptoJS.AES.decrypt(encrypted, key); 
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);

  if (!decrypted) {
    throw new Error("Wrong PIN");
  }

  return decrypted;
}