/**
 * Beacon Protocol - TypeScript Type Definitions
 */

// ============================================================================
// IDENTITY
// ============================================================================

export interface KeyPair {
    publicKey: Uint8Array
    privateKey: Uint8Array
}

export interface RegistryEntry {
    publicKey: string      // Hex-encoded public key
    salt: string           // Base64-encoded salt
    profileCid: string | null
    createdAt: number      // Unix timestamp
}

export interface Profile {
    displayName: string
    description: string
    avatar: string | null  // IPFS CID
    website: string | null
}

// ============================================================================
// RESULT PATTERN
// ============================================================================

export type Result<T, E = Error> =
    | { ok: true; value: T }
    | { ok: false; error: E }

export const Result = {
    success: <T>(value: T): Result<T, never> => ({ ok: true, value }),
    failure: <E>(error: E): Result<never, E> => ({ ok: false, error }),
}
