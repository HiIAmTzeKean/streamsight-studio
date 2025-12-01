import React from 'react'
import { BrowserRouter, Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import CreateStream from './pages/CreateStream'
import History from './pages/History'
import Evaluation from './pages/Evaluation'
import { ThemeToggle } from './components/ThemeToggle'
import { AuthProvider, useAuth } from './contexts/AuthContext'

function NavGreeting() {
  const { username, loading, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = React.useState(false)

  if (loading) return null

  function handleLogout() {
    logout()
    setOpen(false)
    navigate('/')
  }

  if (!username) {
    return (
      <NavLink
        to="/login"
        className={({ isActive }) =>
          `px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${isActive
            ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-50'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 hover:bg-slate-50 dark:hover:bg-slate-900'
          }`
        }
      >
        Login
      </NavLink>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((s) => !s)}
        className="px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50"
      >
        Hello, {username} ▾
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md shadow z-50">
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  )
}

function AppContent() {
  const { username } = useAuth()

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50">
        {/* Navbar */}
        <nav className="fixed top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo - Left */}
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                  Streamsight
                </h1>
              </div>

              {/* Navigation Links - Center/Right */}
              <div className="flex items-center gap-1">
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${isActive
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-50'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 hover:bg-slate-50 dark:hover:bg-slate-900'
                    }`
                  }
                >
                  Home
                </NavLink>

                {username && (
                  <>
                    <NavLink
                      to="/create-stream"
                      className={({ isActive }) =>
                        `px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${isActive
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-50'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 hover:bg-slate-50 dark:hover:bg-slate-900'
                        }`
                      }
                    >
                      Create Stream
                    </NavLink>
                    <NavLink
                      to="/history"
                      className={({ isActive }) =>
                        `px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${isActive
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-50'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 hover:bg-slate-50 dark:hover:bg-slate-900'
                        }`
                      }
                    >
                      History
                    </NavLink>
                    <NavLink
                      to="/evaluation"
                      className={({ isActive }) =>
                        `px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${isActive
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-50'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 hover:bg-slate-50 dark:hover:bg-slate-900'
                        }`
                      }
                    >
                      Evaluation
                    </NavLink>
                  </>
                )}

                <NavGreeting />

                {/* Divider */}
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2" />

                {/* Theme Toggle */}
                <ThemeToggle />
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-16 pb-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/create-stream" element={<CreateStream />} />
            <Route path="/history" element={<History />} />
            <Route path="/evaluation" element={<Evaluation />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
