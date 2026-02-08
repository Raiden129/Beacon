declare module 'argon2-browser' {
    export enum ArgonType {
        Argon2d = 0,
        Argon2i = 1,
        Argon2id = 2,
    }

    export interface ArgonOptions {
        pass: string
        salt: string
        time?: number
        mem?: number
        hashLen?: number
        type?: ArgonType
        parallelism?: number
    }

    export interface ArgonResult {
        hash: Uint8Array
        hashHex: string
        encoded: string
    }

    export function hash(options: ArgonOptions): Promise<ArgonResult>
}

declare module '@orbitdb/core' {
    import type { Helia } from 'helia'

    export interface KeyValueStore {
        put(key: string, value: unknown): Promise<string>
        get(key: string): Promise<unknown>
        all(): Promise<Array<{ key: string; value: unknown }>>
        address: { toString(): string }
    }

    export interface OrbitDB {
        open(name: string, options?: { type?: string }): Promise<KeyValueStore>
        stop(): Promise<void>
    }

    export function createOrbitDB(options: { ipfs: Helia }): Promise<OrbitDB>
}
