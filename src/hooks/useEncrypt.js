import CryptoJS from "crypto-js";
import { useCallback } from "react";

const useEncrypt = () => {
  const secretKeyBase64 = "ZWRlYmEzMzI4ZWM2YzFhM2JkODc1YjU2YmIxMjJlM2M=";
  const secretKey = CryptoJS.enc.Base64.parse(secretKeyBase64);

  const encrypt = useCallback(
    (data) => {
      try {
        if (data === null || data === undefined) {
          throw new Error("Data to encrypt cannot be empty.");
        }

        // 🔥 FIX UTAMA: HANDLE ARRAY & OBJECT
        const stringData =
          typeof data === "string" ? data : JSON.stringify(data);

        const encrypted = CryptoJS.AES.encrypt(stringData, secretKey, {
          mode: CryptoJS.mode.ECB,
          padding: CryptoJS.pad.Pkcs7,
        });

        // 🔥 URL SAFE
        const safe_encrypt = encrypted
          .toString()
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=+$/, "");

        return safe_encrypt;
      } catch (error) {
        console.error("Encrypt error:", error);
        return null;
      }
    },
    [secretKey]
  );

  return { encrypt };
};

export default useEncrypt;