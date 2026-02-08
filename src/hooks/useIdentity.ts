/**
 * Beacon Protocol - Identity Hook
 * 
 * React hook for managing user identity state.
 */

import { useState, useCallback } from 'react'
import { login as loginFn, register as registerFn, type IdentityState } from '../lib/identity'
import { registry } from '../lib/registry'
import { shortKey } from '../lib/crypto'
import type { Result } from '../types/identity'

// ============================================================================
// TYPES
// ============================================================================

export interface UseIdentityReturn {
    isAuthenticated: boolean
    username: string | null
    publicKeyShort: string | null
    login: (username: string, password: string) => Promise<Result<void, string>>
    register: (username: string, password: string) => Promise<Result<void, string>>
    logout: () => void
}

// ============================================================================
// HOOK
// ============================================================================

export function useIdentity(): UseIdentityReturn {
    const [identity, setIdentity] = useState<IdentityState | null>(null)

    const login = useCallback(async (
        username: string,
        password: string
    ): Promise<Result<void, string>> => {
        const result = await loginFn(
            username,
            password,
            (u) => registry.lookup(u)
        )

        if (result.ok) {
            setIdentity(result.value)
            console.log('[Identity] Logged in:', username)
            return { ok: true, value: undefined }
        }

        return { ok: false, error: result.error }
    }, [])

    const register = useCallback(async (
        username: string,
        password: string
    ): Promise<Result<void, string>> => {
        const result = await registerFn(
            username,
            password,
            (u) => registry.lookup(u),
            (u, e) => registry.register(u, e)
        )

        if (result.ok) {
            setIdentity(result.value)
            console.log('[Identity] Registered:', username)
            return { ok: true, value: undefined }
        }

        return { ok: false, error: result.error }
    }, [])

    const logout = useCallback(() => {
        setIdentity(null)
        console.log('[Identity] Logged out')
    }, [])

    return {
        isAuthenticated: identity !== null,
        username: identity?.username ?? null,
        publicKeyShort: identity ? shortKey(identity.keyPair.publicKey) : null,
        login,
        register,
        logout,
    }
}
