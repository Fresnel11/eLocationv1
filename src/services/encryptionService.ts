// Service de chiffrement E2E
class EncryptionService {
  private keyPair: CryptoKeyPair | null = null;

  // Générer une paire de clés RSA
  async generateKeyPair(): Promise<CryptoKeyPair> {
    if (this.keyPair) return this.keyPair;
    
    this.keyPair = await window.crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true,
      ["encrypt", "decrypt"]
    );
    
    return this.keyPair;
  }

  // Exporter la clé publique
  async exportPublicKey(): Promise<string> {
    const keyPair = await this.generateKeyPair();
    const exported = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
    return btoa(String.fromCharCode(...new Uint8Array(exported)));
  }

  // Importer une clé publique
  async importPublicKey(publicKeyString: string): Promise<CryptoKey> {
    const keyData = Uint8Array.from(atob(publicKeyString), c => c.charCodeAt(0));
    return await window.crypto.subtle.importKey(
      "spki",
      keyData,
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      false,
      ["encrypt"]
    );
  }

  // Chiffrer un message
  async encryptMessage(message: string, recipientPublicKey: string): Promise<string> {
    const publicKey = await this.importPublicKey(recipientPublicKey);
    const encoded = new TextEncoder().encode(message);
    const encrypted = await window.crypto.subtle.encrypt(
      { name: "RSA-OAEP" },
      publicKey,
      encoded
    );
    return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
  }

  // Déchiffrer un message
  async decryptMessage(encryptedMessage: string): Promise<string> {
    const keyPair = await this.generateKeyPair();
    const encrypted = Uint8Array.from(atob(encryptedMessage), c => c.charCodeAt(0));
    const decrypted = await window.crypto.subtle.decrypt(
      { name: "RSA-OAEP" },
      keyPair.privateKey,
      encrypted
    );
    return new TextDecoder().decode(decrypted);
  }

  // Sauvegarder les clés dans localStorage
  async saveKeysToStorage() {
    const keyPair = await this.generateKeyPair();
    const privateKey = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
    const publicKey = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
    
    localStorage.setItem('privateKey', btoa(String.fromCharCode(...new Uint8Array(privateKey))));
    localStorage.setItem('publicKey', btoa(String.fromCharCode(...new Uint8Array(publicKey))));
  }

  // Charger les clés depuis localStorage
  async loadKeysFromStorage(): Promise<boolean> {
    const privateKeyString = localStorage.getItem('privateKey');
    const publicKeyString = localStorage.getItem('publicKey');
    
    if (!privateKeyString || !publicKeyString) return false;

    try {
      const privateKeyData = Uint8Array.from(atob(privateKeyString), c => c.charCodeAt(0));
      const publicKeyData = Uint8Array.from(atob(publicKeyString), c => c.charCodeAt(0));

      const privateKey = await window.crypto.subtle.importKey(
        "pkcs8",
        privateKeyData,
        { name: "RSA-OAEP", hash: "SHA-256" },
        false,
        ["decrypt"]
      );

      const publicKey = await window.crypto.subtle.importKey(
        "spki",
        publicKeyData,
        { name: "RSA-OAEP", hash: "SHA-256" },
        false,
        ["encrypt"]
      );

      this.keyPair = { privateKey, publicKey };
      return true;
    } catch {
      return false;
    }
  }
}

export const encryptionService = new EncryptionService();