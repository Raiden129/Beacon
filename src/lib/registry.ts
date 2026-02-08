/**
 * Beacon Protocol - OrbitDB Registry
 * 
 * Implements the "First-Write-Wins" pattern for username registration.
 * Uses OrbitDB KeyValue store with a custom access controller.
 */

import type { Helia } from 'helia'
import type { RegistryEntry } from '../types/identity'

// ============================================================================
// TYPES
// ============================================================================

interface OrbitDBInstance {
    open: (name: string, options?: object) => Promise<KeyValueStore>
    stop: () => Promise<void>
}

interface KeyValueStore {
    put: (key: string, value: unknown) => Promise<string>
    get: (key: string) => Promise<unknown>
    all: () => Promise<Array<{ key: string; value: unknown }>>
    address: { toString: () => string }
}

// ============================================================================
// REGISTRY CLASS
// ============================================================================

export class Registry {
    private db: KeyValueStore | null = null
    private orbitdb: OrbitDBInstance | null = null

    /**
     * Initialize the registry with a Helia node.
     */
    async init(helia: Helia): Promise<void> {
        // Dynamic import to avoid bundling issues
        const { createOrbitDB } = await import('@orbitdb/core')

        this.orbitdb = await createOrbitDB({ ipfs: helia })

        // Open or create the global registry database
        this.db = await this.orbitdb.open('beacon-registry', {
            type: 'keyvalue',
            // First-Write-Wins is enforced in the write method
        }) as KeyValueStore

        console.log('[Registry] Initialized:', this.db?.address.toString() ?? 'unknown')
    }

    /**
     * Lookup a username in the registry.
     */
    async lookup(username: string): Promise<RegistryEntry | null> {
        if (!this.db) throw new Error('Registry not initialized')

        const entry = await this.db.get(username)
        return entry as RegistryEntry | null
    }

    /**
     * Register a username (First-Write-Wins).
     * Returns false if username already exists.
     */
    async register(username: string, entry: RegistryEntry): Promise<boolean> {
        if (!this.db) throw new Error('Registry not initialized')

        // First-Write-Wins: Check if key exists
        const existing = await this.db.get(username)
        if (existing) {
            console.log('[Registry] Username already taken:', username)
            return false
        }

        // Write the entry
        await this.db.put(username, entry)
        console.log('[Registry] Registered:', username)
        return true
    }

    /**
     * Get all registered usernames.
     */
    async all(): Promise<Array<{ username: string; entry: RegistryEntry }>> {
        if (!this.db) throw new Error('Registry not initialized')

        const entries = await this.db.all()
        return entries.map(({ key, value }) => ({
            username: key,
            entry: value as RegistryEntry,
        }))
    }

    /**
     * Stop the registry and OrbitDB.
     */
    async stop(): Promise<void> {
        if (this.orbitdb) {
            await this.orbitdb.stop()
            this.orbitdb = null
            this.db = null
        }
    }
}

// Singleton instance
export const registry = new Registry()
