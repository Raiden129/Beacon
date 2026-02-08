import { useState, useEffect, useRef } from 'react'
import { createHelia, type Helia } from 'helia'
import { createLibp2p } from 'libp2p'
import { webSockets } from '@libp2p/websockets'
import { webRTC } from '@libp2p/webrtc'
import { circuitRelayTransport } from '@libp2p/circuit-relay-v2'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { identify } from '@libp2p/identify'
import { MemoryBlockstore } from 'blockstore-core'
import { MemoryDatastore } from 'datastore-core'
import { registry } from '../lib/registry'

// Hook state interface
interface UseHeliaNodeReturn {
    helia: Helia | null
    isReady: boolean
    registryReady: boolean
    error: Error | null
    peerId: string | null
    peerCount: number
}

/**
 * React hook to initialize and manage a Helia IPFS node.
 * Configures libp2p with GossipSub for OrbitDB sync.
 */
export function useHeliaNode(): UseHeliaNodeReturn {
    const [helia, setHelia] = useState<Helia | null>(null)
    const [isReady, setIsReady] = useState(false)
    const [registryReady, setRegistryReady] = useState(false)
    const [error, setError] = useState<Error | null>(null)
    const [peerId, setPeerId] = useState<string | null>(null)
    const [peerCount, setPeerCount] = useState(0)

    // Prevent double initialization in React StrictMode
    const initRef = useRef(false)

    useEffect(() => {
        if (initRef.current) return
        initRef.current = true

        const initNode = async () => {
            try {
                console.log('[Helia] Starting node initialization...')

                // Create libp2p with GossipSub for OrbitDB
                const libp2p = await createLibp2p({
                    transports: [
                        webSockets(),
                        webRTC(),
                        circuitRelayTransport(),
                    ],
                    connectionEncrypters: [noise()],
                    streamMuxers: [yamux()],
                    services: {
                        identify: identify(),
                        // Type assertion needed due to libp2p version mismatch between packages
                        pubsub: gossipsub({ allowPublishToZeroTopicPeers: true }) as never,
                    },
                })

                // Create Helia node with custom libp2p
                const node = await createHelia({
                    libp2p,
                    blockstore: new MemoryBlockstore(),
                    datastore: new MemoryDatastore(),
                })

                const id = node.libp2p.peerId.toString()
                console.log('[Helia] Node ready. PeerId:', id)

                setHelia(node)
                setPeerId(id)
                setIsReady(true)

                // Track peer connections
                node.libp2p.addEventListener('peer:connect', () => {
                    setPeerCount(node.libp2p.getPeers().length)
                })

                node.libp2p.addEventListener('peer:disconnect', () => {
                    setPeerCount(node.libp2p.getPeers().length)
                })

                // Initialize OrbitDB registry
                console.log('[Registry] Initializing...')
                await registry.init(node)
                setRegistryReady(true)
                console.log('[Registry] Ready')

            } catch (err) {
                console.error('[Helia] Initialization failed:', err)
                setError(err instanceof Error ? err : new Error(String(err)))
            }
        }

        initNode()

        // Cleanup on unmount
        return () => {
            registry.stop().catch(console.error)
            if (helia) {
                console.log('[Helia] Stopping node...')
                helia.stop().catch(console.error)
            }
        }
    }, [])

    return { helia, isReady, registryReady, error, peerId, peerCount }
}
