import Link from 'next/link';

export default function Header({ breadcrumb }) {
  return (
    <header className="site-header">
      <div className="container header-inner">
        {/* Logo */}
        <Link href="/course" className="logo">
          <div className="logo-icon" aria-hidden="true">🎓</div>
          EduSmart
        </Link>

        {/* Breadcrumb */}
        {breadcrumb && (
          <nav className="breadcrumb" aria-label="Breadcrumb">
            {breadcrumb.map((item, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {i > 0 && <span aria-hidden="true">/</span>}
                {item.href ? (
                  <Link href={item.href}>{item.label}</Link>
                ) : (
                  <span style={{ color: 'var(--text-primary)' }}>{item.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}

        {/* Right actions */}
        <div className="header-right">
          <Link href="/upload" className="btn" style={{ padding: '7px 16px', fontSize: '13px', background: '#ecfdf5', color: '#059669', border: '1px solid #10b981' }}>
            ✨ Tạo Quiz bằng AI
          </Link>
          <Link href="/quiz" className="btn btn-outline" style={{ padding: '7px 16px', fontSize: '13px' }}>
            Làm bài
          </Link>
          <div className="avatar" title="Tài khoản của bạn">T</div>
        </div>
      </div>
    </header>
  );
}
