import crypto from "crypto";

// Function to generate an 8-character alphanumeric code
export const generateUniqueCode = (): string => {
  return crypto.randomBytes(4).toString("hex").toUpperCase(); // Generates 8-character unique string
};