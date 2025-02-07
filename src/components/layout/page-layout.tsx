interface PageLayoutProps {
  children: React.ReactNode;
  showDiagonal?: boolean;
}

export function PageLayout({ children, showDiagonal = true }: PageLayoutProps) {
  return (
    <div className="tehnopol-layout">
      {/* Diagonal gradient overlay */}
      {showDiagonal && (
        <div className="tehnopol-layout-diagonal-overlay">
          <div className="tehnopol-layout-diagonal-overlay-inner" />
        </div>
      )}

      {/* Main content */}
      <main className="tehnopol-layout-content">
        {children}
      </main>

      {/* Bottom diagonal accent */}
      {showDiagonal && (
        <div className="tehnopol-layout-bottom-accent">
          <div className="tehnopol-layout-bottom-accent-inner" />
        </div>
      )}
    </div>
  );
} 