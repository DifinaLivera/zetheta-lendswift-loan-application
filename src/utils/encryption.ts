/**
 * Utility for client-side AES-256-GCM encryption and decryption.
 * Uses the Web Crypto API (window.crypto.subtle).
 */

const PASSPHRASE = "LendSwift_Secure_State_2026_Key";

// Helper to convert array buffer to base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Helper to convert base64 to array buffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Derives a CryptoKey using SHA-256 hash of the passphrase for AES-GCM
 */
async function getCryptoKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const rawKeyMaterial = enc.encode(PASSPHRASE);
  
  // Use SubtleCrypto to hash the passphrase and derive a 256-bit key
  const hash = await window.crypto.subtle.digest("SHA-256", rawKeyMaterial);
  return window.crypto.subtle.importKey(
    "raw",
    hash,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypts a plain text string into a combined base64 layout (IV + Ciphertext)
 */
export async function encryptData(plainText: string): Promise<string> {
  try {
    const key = await getCryptoKey();
    const enc = new TextEncoder();
    const encodedData = enc.encode(plainText);
    
    // Generate a secure 12-byte initialization vector (IV) for AES-GCM
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      key,
      encodedData
    );
    
    // Package IV and encrypted ciphertext together
    const ivBase64 = arrayBufferToBase64(iv.buffer);
    const ciphertextBase64 = arrayBufferToBase64(encryptedBuffer);
    
    // Return combined format iv:ciphertext
    return `${ivBase64}:${ciphertextBase64}`;
  } catch (error) {
    console.error("Encryption failed", error);
    throw new Error("Failed to encrypt form state");
  }
}

/**
 * Decrypts a combined format string (iv:ciphertext) back to plain text
 */
export async function decryptData(encryptedStr: string): Promise<string> {
  try {
    const parts = encryptedStr.split(":");
    if (parts.length !== 2) {
      throw new Error("Invalid encrypted layout format");
    }
    
    const ivBase64 = parts[0];
    const ciphertextBase64 = parts[1];
    
    const iv = new Uint8Array(base64ToArrayBuffer(ivBase64));
    const ciphertext = base64ToArrayBuffer(ciphertextBase64);
    const key = await getCryptoKey();
    
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      key,
      ciphertext
    );
    
    const dec = new TextDecoder();
    return dec.decode(decryptedBuffer);
  } catch (error) {
    console.error("Decryption failed", error);
    throw new Error("Failed to decrypt form state (draft might be corrupted)");
  }
}
