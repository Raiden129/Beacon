/**
 * Beacon Protocol - Identity Management
 * 
 * Handles user registration and login using the Brain Wallet pattern.
 */

import { deriveKeyPair, generateSalt, toHex } from './crypto'
import type { RegistryEntry, KeyPair, Result } from '../types/identity'

// ============================================================================
// TYPES
// ============================================================================

export interface IdentityState {
    username: string
    keyPair: KeyPair
    publicKeyHex: string
}

// ============================================================================
// IDENTITY FUNCTIONS
// ============================================================================

/**
 * Register a new username.
 * 
 * 1. Check if username exists (via registry lookup)
 * 2. If not, generate salt and derive keys
 * 3. Write to registry (First-Write-Wins)
 */
export async function register(
    username: string,
    password: string,
    lookupFn: (username: string) => Promise<RegistryEntry | null>,
    writeFn: (username: string, entry: RegistryEntry) => Promise<boolean>
): Promise<Result<IdentityState, string>> {
    // Check if username is taken
    const existing = await lookupFn(username)
    if (existing) {
        return { ok: false, error: 'Username already taken' }
    }

    // Generate new salt
    const salt = generateSalt()

    // Derive keypair
    const keyPair = await deriveKeyPair(username, password, salt)
    const publicKeyHex = toHex(keyPair.publicKey)

    // Create registry entry
    const entry: RegistryEntry = {
        publicKey: publicKeyHex,
        salt,
        profileCid: null,
        createdAt: Date.now(),
    }

    // Write to registry
    const success = await writeFn(username, entry)
    if (!success) {
        return { ok: false, error: 'Failed to register (username may have been claimed)' }
    }

    return {
        ok: true,
        value: { username, keyPair, publicKeyHex },
    }
}

/**
 * Login with existing credentials.
 * 
 * 1. Lookup username to get salt
 * 2. Derive keys using stored salt
 * 3. Verify derived public key matches stored key
 */
export async function login(
    username: string,
    password: string,
    lookupFn: (username: string) => Promise<RegistryEntry | null>
): Promise<Result<IdentityState, string>> {
    // Lookup username
    const entry = await lookupFn(username)
    if (!entry) {
        return { ok: false, error: 'Username not found' }
    }

    // Derive keypair using stored salt
    const keyPair = await deriveKeyPair(username, password, entry.salt)
    const publicKeyHex = toHex(keyPair.publicKey)

    // Verify keys match
    if (publicKeyHex !== entry.publicKey) {
        return { ok: false, error: 'Invalid password' }
    }

    return {
        ok: true,
        value: { username, keyPair, publicKeyHex },
    }
}
