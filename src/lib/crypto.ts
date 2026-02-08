/**
 * Beacon Protocol - Cryptographic Utilities
 * 
 * Brain Wallet implementation:
 * Password + Salt → Argon2id hash → Ed25519 seed → KeyPair
 */

import { argon2id } from 'hash-wasm'
import { toString, fromString } from 'uint8arrays'

// ============================================================================
// TYPES
// ============================================================================

export interface KeyPair {
    publicKey: Uint8Array
    privateKey: Uint8Array
}

// ============================================================================
// CONSTANTS
// ============================================================================

const ARGON2_CONFIG = {
    parallelism: 1,
    iterations: 2,
    memorySize: 4096,
    hashLength: 32,
} as const

// ============================================================================
// KEY DERIVATION
// ============================================================================

/**
 * Derive an Ed25519 keypair from username, password, and salt.
 * This is the "Brain Wallet" - deterministic key generation from credentials.
 */
export async function deriveKeyPair(
    _username: string,
    password: string,
    salt: string
): Promise<KeyPair> {
    // Convert salt from base64 to Uint8Array
    const saltBytes = fromString(salt, 'base64')
    const passwordBytes = new TextEncoder().encode(password)

    // 1. Hash password with Argon2id using hash-wasm
    const hashHex = await argon2id({
        password: passwordBytes,
        salt: saltBytes,
        ...ARGON2_CONFIG,
        outputType: 'hex',
    })

    // 2. Convert hex to bytes for Ed25519 seed
    const seed = fromString(hashHex, 'base16')

    // 3. Generate Ed25519 keypair from seed
    const keyPair = await generateEd25519FromSeed(seed)

    return keyPair
}

/**
 * Generate Ed25519 keypair from a 32-byte seed.
 */
async function generateEd25519FromSeed(seed: Uint8Array): Promise<KeyPair> {
    const { generateKeyPairFromSeed } = await import('@libp2p/crypto/keys')

    const privateKey = await generateKeyPairFromSeed('Ed25519', seed)

    return {
        publicKey: privateKey.publicKey.raw,
        privateKey: privateKey.raw,
    }
}

// ============================================================================
// SALT GENERATION
// ============================================================================

/**
 * Generate a cryptographically secure random salt.
 */
export function generateSalt(): string {
    const bytes = new Uint8Array(16)
    crypto.getRandomValues(bytes)
    return toString(bytes, 'base64')
}

// ============================================================================
// ENCODING HELPERS
// ============================================================================

/**
 * Convert bytes to hex string.
 */
export function toHex(bytes: Uint8Array): string {
    return toString(bytes, 'base16')
}

/**
 * Convert hex string to bytes.
 */
export function fromHex(hex: string): Uint8Array {
    return fromString(hex, 'base16')
}

/**
 * Convert bytes to base64 string.
 */
export function toBase64(bytes: Uint8Array): string {
    return toString(bytes, 'base64')
}

/**
 * Convert base64 string to bytes.
 */
export function fromBase64(base64: string): Uint8Array {
    return fromString(base64, 'base64')
}

/**
 * Get a short display version of a public key (first 8 chars).
 */
export function shortKey(publicKey: Uint8Array): string {
    return toHex(publicKey).slice(0, 8)
}
