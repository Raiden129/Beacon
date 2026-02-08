import { useState } from 'react'
import { useHeliaNode } from './hooks/useHeliaNode'
import { useIdentity } from './hooks/useIdentity'
import { Search, Plus, Bell, User, Wifi, WifiOff, List, Grid, ExternalLink, Inbox, X, LogOut } from 'lucide-react'

// ============================================================================
// TYPES
// ============================================================================

interface Series {
  id: string
  title: string
  cover: string
  latestChapter: number
  updatedAt: string
  source: string
  verified: boolean
}

interface ActivityRow {
  time: string
  series: string
  event: string
  user: string
}

interface NavBarProps {
  peerCount: number
  isConnected: boolean
  isAuthenticated: boolean
  username: string | null
  publicKeyShort: string | null
  onConnectClick: () => void
  onLogout: () => void
}

interface IdentityModalProps {
  isOpen: boolean
  onClose: () => void
  onLogin: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>
  onRegister: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>
}

// ============================================================================
// IDENTITY MODAL
// ============================================================================

function IdentityModal({ isOpen, onClose, onLogin, onRegister }: IdentityModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const result = mode === 'login'
      ? await onLogin(username, password)
      : await onRegister(username, password)

    setLoading(false)

    if (result.ok) {
      setUsername('')
      setPassword('')
      onClose()
    } else {
      setError(result.error ?? 'Unknown error')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-bg border border-border rounded-lg w-full max-w-sm mx-4">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-sm font-medium text-text">
            {mode === 'login' ? 'Login' : 'Create Account'}
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-text">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-xs text-text-muted mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full h-9 bg-bg-subtle border border-border rounded px-3 text-sm text-text focus:outline-none focus:border-accent"
              placeholder="Enter username"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-text-muted mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-9 bg-bg-subtle border border-border rounded px-3 text-sm text-text focus:outline-none focus:border-accent"
              placeholder="Enter password"
              required
            />
          </div>

          {error && (
            <div className="text-xs text-red-400 bg-red-400/10 px-3 py-2 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-9 bg-accent hover:bg-accent/80 rounded text-sm font-medium text-text disabled:opacity-50"
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Login' : 'Register'}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login')
                setError(null)
              }}
              className="text-xs text-text-muted hover:text-text"
            >
              {mode === 'login' ? "Don't have an account? Register" : 'Already have an account? Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ============================================================================
// NAVBAR
// ============================================================================

function NavBar({ peerCount, isConnected, isAuthenticated, username, publicKeyShort, onConnectClick, onLogout }: NavBarProps) {
  return (
    <nav className="sticky top-0 z-50 h-14 bg-bg border-b border-border">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left: Logo + Search */}
        <div className="flex items-center gap-6">
          <span className="text-xl font-bold text-accent tracking-tight">Beacon</span>
          <div className="hidden sm:block w-64 lg:w-80">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search series..."
                className="w-full h-9 bg-bg-subtle border border-border rounded px-3 pl-9 text-sm text-text placeholder-text-muted focus:outline-none focus:border-accent"
              />
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-xs text-text-muted">
            {isConnected ? (
              <Wifi className="w-4 h-4 text-accent" />
            ) : (
              <WifiOff className="w-4 h-4" />
            )}
            <span>{peerCount} peers</span>
          </div>

          <button className="w-8 h-8 flex items-center justify-center bg-accent rounded" title="Add Series">
            <Plus className="w-4 h-4 text-text" />
          </button>

          <button className="w-8 h-8 flex items-center justify-center hover:bg-bg-subtle rounded" title="Notifications">
            <Bell className="w-4 h-4 text-text-muted" />
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs text-text">{username}</span>
                <span className="text-xs text-text-muted font-mono">{publicKeyShort}</span>
              </div>
              <button
                onClick={onLogout}
                className="w-8 h-8 flex items-center justify-center hover:bg-bg-subtle rounded"
                title="Logout"
              >
                <LogOut className="w-4 h-4 text-text-muted" />
              </button>
            </div>
          ) : (
            <button
              onClick={onConnectClick}
              className="h-8 px-3 flex items-center gap-2 border border-border rounded hover:border-text-muted"
            >
              <User className="w-4 h-4 text-text-muted" />
              <span className="hidden sm:inline text-sm text-text-muted">Connect</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}

// ============================================================================
// CONTENT COMPONENTS
// ============================================================================

function SeriesCard({ series }: { series: Series }) {
  return (
    <div className="bg-bg-subtle border border-border rounded overflow-hidden cursor-pointer hover:border-text-muted transition-colors">
      <div className="aspect-[2/3] relative">
        <img src={series.cover} alt={series.title} className="w-full h-full object-cover" />
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-bg to-transparent">
          <p className="text-sm font-medium text-text truncate">{series.title}</p>
          <div className="flex items-center justify-between mt-1 text-xs text-text-muted">
            <span>Ch. {series.latestChapter}</span>
            <span>{series.updatedAt}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <Inbox className="w-10 h-10 text-text-muted mb-3" />
      <p className="text-sm text-text-muted">{message}</p>
    </div>
  )
}

function LatestUpdatesGrid({ series }: { series: Series[] }) {
  if (series.length === 0) {
    return <EmptyState message="No series yet" />
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {series.map((s) => (
        <SeriesCard key={s.id} series={s} />
      ))}
    </div>
  )
}

function ActivityLog({ activity }: { activity: ActivityRow[] }) {
  if (activity.length === 0) {
    return <EmptyState message="No activity yet" />
  }

  return (
    <div className="border border-border rounded overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-bg-subtle border-b border-border">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-text-muted">Time</th>
            <th className="px-4 py-3 text-left font-medium text-text-muted">Series</th>
            <th className="px-4 py-3 text-left font-medium text-text-muted">Event</th>
            <th className="px-4 py-3 text-left font-medium text-text-muted">Source</th>
          </tr>
        </thead>
        <tbody>
          {activity.map((row, i) => (
            <tr key={i} className="border-b border-border last:border-0 hover:bg-bg-subtle">
              <td className="px-4 py-3 font-mono text-xs text-text-muted">{row.time}</td>
              <td className="px-4 py-3 text-text">{row.series}</td>
              <td className="px-4 py-3 text-accent">{row.event}</td>
              <td className="px-4 py-3 text-text-muted">{row.user}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ============================================================================
// APP
// ============================================================================

type ViewMode = 'grid' | 'list'

function App() {
  const { isReady, registryReady, peerCount } = useHeliaNode()
  const { isAuthenticated, username, publicKeyShort, login, register, logout } = useIdentity()
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [showIdentityModal, setShowIdentityModal] = useState(false)

  const [series] = useState<Series[]>([
    { id: '1', title: 'Solo Leveling', cover: 'https://placehold.co/200x300/141414/3d3b8e?text=SL', latestChapter: 179, updatedAt: '2m ago', source: '@reaperscans.com', verified: true },
    { id: '2', title: 'One Piece', cover: 'https://placehold.co/200x300/141414/3d3b8e?text=OP', latestChapter: 1108, updatedAt: '15m ago', source: '@tcbscans.com', verified: true },
    { id: '3', title: 'Jujutsu Kaisen', cover: 'https://placehold.co/200x300/141414/3d3b8e?text=JJK', latestChapter: 256, updatedAt: '1h ago', source: '@mangaplus.com', verified: true },
    { id: '4', title: 'Omniscient Reader', cover: 'https://placehold.co/200x300/141414/3d3b8e?text=ORV', latestChapter: 198, updatedAt: '3h ago', source: '@flamescans.org', verified: false },
    { id: '5', title: 'Tower of God', cover: 'https://placehold.co/200x300/141414/3d3b8e?text=ToG', latestChapter: 590, updatedAt: '5h ago', source: '@webtoon.com', verified: true },
    { id: '6', title: 'The Beginning After The End', cover: 'https://placehold.co/200x300/141414/3d3b8e?text=TBATE', latestChapter: 187, updatedAt: '1d ago', source: '@tapas.io', verified: true },
    { id: '7', title: 'Chainsaw Man', cover: 'https://placehold.co/200x300/141414/3d3b8e?text=CSM', latestChapter: 165, updatedAt: '2d ago', source: '@mangaplus.com', verified: true },
    { id: '8', title: 'Spy x Family', cover: 'https://placehold.co/200x300/141414/3d3b8e?text=SxF', latestChapter: 98, updatedAt: '3d ago', source: '@mangaplus.com', verified: true },
  ])
  const [activity] = useState<ActivityRow[]>([
    { time: '10:45', series: 'One Piece', event: 'New Chapter', user: '@tcbscans.com' },
    { time: '10:32', series: 'Solo Leveling', event: 'Metadata Edit', user: 'User_123' },
    { time: '10:15', series: 'Jujutsu Kaisen', event: 'Status Update', user: '@mangaplus.com' },
    { time: '09:58', series: 'Omniscient Reader', event: 'New Chapter', user: '@flamescans.org' },
    { time: '09:30', series: 'Tower of God', event: 'Delay Notice', user: '@webtoon.com' },
  ])

  const handleConnectClick = () => {
    if (!registryReady) {
      console.log('[App] Registry not ready yet')
      return
    }
    setShowIdentityModal(true)
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <NavBar
        peerCount={peerCount}
        isConnected={isReady}
        isAuthenticated={isAuthenticated}
        username={username}
        publicKeyShort={publicKeyShort}
        onConnectClick={handleConnectClick}
        onLogout={logout}
      />

      <main className="flex-1 px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-medium text-text">Latest Updates</h2>
          <div className="flex border border-border rounded overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`w-8 h-8 flex items-center justify-center ${viewMode === 'grid' ? 'bg-accent' : 'hover:bg-bg-subtle'}`}
            >
              <Grid className="w-4 h-4 text-text" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`w-8 h-8 flex items-center justify-center border-l border-border ${viewMode === 'list' ? 'bg-accent' : 'hover:bg-bg-subtle'}`}
            >
              <List className="w-4 h-4 text-text" />
            </button>
          </div>
        </div>

        {viewMode === 'grid' ? <LatestUpdatesGrid series={series} /> : <ActivityLog activity={activity} />}
      </main>

      <footer className="border-t border-border">
        <div className="px-6 py-4 flex items-center justify-between text-xs text-text-muted">
          <span>Beacon Protocol</span>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-text">
            <ExternalLink className="w-3 h-3" />
            <span>GitHub</span>
          </a>
        </div>
      </footer>

      <IdentityModal
        isOpen={showIdentityModal}
        onClose={() => setShowIdentityModal(false)}
        onLogin={login}
        onRegister={register}
      />
    </div>
  )
}

export default App
