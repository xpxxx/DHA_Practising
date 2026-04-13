import { useMemo, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { getDisplayMode, setDisplayMode, type DisplayMode } from '../displayMode'

function NavItem(props: { to: string; label: string }) {
  return (
    <NavLink
      to={props.to}
      className={({ isActive }) => (isActive ? 'navItem navItemActive' : 'navItem')}
      end
    >
      {props.label}
    </NavLink>
  )
}

export function Layout() {
  const [displayMode, setMode] = useState<DisplayMode>(() => getDisplayMode())

  const displayLabel = useMemo(() => {
    if (displayMode === 'bilingual') return 'EN + 中文'
    return 'EN-only'
  }, [displayMode])

  return (
    <div className="appShell">
      <header className="topBar">
        <Link to="/" className="brand">
          DHA Interview Prep
        </Link>
        <div className="row">
          <span className="muted" style={{ fontSize: 12 }}>
            Display
          </span>
          <button
            className={displayMode === 'en' ? 'chip chipOn' : 'chip'}
            onClick={() => {
              setMode('en')
              setDisplayMode('en')
            }}
            aria-pressed={displayMode === 'en'}
            title="Show English only"
          >
            EN
          </button>
          <button
            className={displayMode === 'bilingual' ? 'chip chipOn' : 'chip'}
            onClick={() => {
              setMode('bilingual')
              setDisplayMode('bilingual')
            }}
            aria-pressed={displayMode === 'bilingual'}
            title="Show English + Chinese"
          >
            EN+ZH
          </button>
          <span className="muted" style={{ fontSize: 12 }}>
            {displayLabel}
          </span>
        </div>
        <nav className="nav">
          <NavItem to="/bank" label="Question Bank" />
          <NavItem to="/mock" label="Mock Oral" />
          <NavItem to="/progress" label="Progress" />
          <NavItem to="/about" label="About" />
        </nav>
      </header>
      <main className="main">
        <Outlet context={{ displayMode }} />
      </main>
      <footer className="footer">
        <span>For study and interview practice only. Not medical advice.</span>
      </footer>
    </div>
  )
}

