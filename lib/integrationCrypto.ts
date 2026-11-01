import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const PREFIX = "enc:v1:";

function encryptionKey(): Buffer {
  const raw = process.env.INTEGRATION_ENCRYPTION_KEY;
  if (!raw) throw new Error("INTEGRATION_ENCRYPTION_KEY non configurata");
  if (!/^[a-fA-F0-9]{64}$/.test(raw)) {
    throw new Error("INTEGRATION_ENCRYPTION_KEY deve contenere 64 caratteri esadecimali (32 byte)");
  }
  return Buffer.from(raw, "hex");
}

export function encryptIntegrationConfig(config: Record<string, string>): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(config), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return PREFIX + [iv, tag, ciphertext].map((part) => part.toString("hex")).join(":");
}

/**
 * Supports legacy plaintext JSON in social_accounts.config during migration.
 * New writes always use authenticated AES-256-GCM encryption.
 */
export function readIntegrationConfig(
  encryptedValue: string | null | undefined,
  legacyConfig: unknown
): Record<string, string> {
  if (encryptedValue?.startsWith(PREFIX)) {
    const parts = encryptedValue.slice(PREFIX.length).split(":");
    if (parts.length !== 3) throw new Error("Configurazione integrazione cifrata non valida");
    const [ivHex, tagHex, dataHex] = parts;
    const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(ivHex, "hex"));
    decipher.setAuthTag(Buffer.from(tagHex, "hex"));
    const clear = Buffer.concat([
      decipher.update(Buffer.from(dataHex, "hex")),
      decipher.final(),
    ]).toString("utf8");
    return JSON.parse(clear) as Record<string, string>;
  }

  if (legacyConfig && typeof legacyConfig === "object" && !Array.isArray(legacyConfig)) {
    return legacyConfig as Record<string, string>;
  }

  // Older deployments stored JSON directly in access_token_encrypted.
  if (encryptedValue) {
    try {
      const parsed = JSON.parse(encryptedValue);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, string>;
      }
    } catch {
      // Do not expose credential contents in errors.
    }
  }

  throw new Error("Configurazione integrazione assente o non leggibile");
}
