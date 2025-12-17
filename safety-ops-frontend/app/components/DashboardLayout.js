import Link from 'next/link';

export default function DashboardLayout({ children, title }) {
  return (
    <div className="flex min-h-screen font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-cyber-black border-r border-cyber-border hidden md:flex flex-col fixed h-full z-10">
        <div className="p-6 border-b border-cyber-border">
          <h1 className="text-2xl font-bold tracking-wider text-white">
            SC<span className="text-cyber-primary">OPS</span>
          </h1>
          <div className="mt-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs text-green-500 font-mono">SYSTEM ONLINE</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <p className="px-2 text-xs font-bold text-cyber-muted uppercase tracking-widest mb-3 mt-2">Module 1</p>
          <NavLink href="/dashboard" label="Overview" />
          <NavLink href="/report" label="Report Incident" active />
          
          <p className="px-2 text-xs font-bold text-cyber-muted uppercase tracking-widest mb-3 mt-6">Module 2</p>
          <NavLink href="/live-feed" label="Live Feed" />
          <NavLink href="/map" label="Intel Map" />
          <p className="px-2 text-xs font-bold text-cyber-muted uppercase tracking-widest mb-3 mt-6">
  Module 3
</p>

<NavLink href="/admin/risk-assessment" label="Predictive Risk" />

        </nav>

        <div className="p-4 border-t border-cyber-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-cyber-panel border border-cyber-border flex items-center justify-center font-bold text-xs">AI</div>
            <div className="text-sm">
              <p className="font-medium">Admin User</p>
              <p className="text-xs text-cyber-muted">ID: 8821</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-8 relative">
        <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">{title}</h2>
                    <p className="text-cyber-muted mt-1">Authorized Personnel Only</p>
                </div>
            </div>
            
            {/* Content Slot */}
            {children}
        </div>
      </main>
    </div>
  );
}

// Simple link component
function NavLink({ label, href, active }) {
    return (
        <Link href={href || "#"} className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${active ? 'bg-cyber-primary text-white shadow-lg shadow-blue-900/50' : 'text-cyber-muted hover:bg-cyber-panel hover:text-white'}`}>
            {label}
        </Link>
    );
}