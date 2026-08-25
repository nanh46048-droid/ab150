import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <h3>🎓 Về EduSmart</h3>
            <p>
              EduSmart cung cấp lộ trình học tập theo chương trình, bài giải tương tác
              và câu hỏi liên quan đến chương trình ngân hàng.
            </p>
          </div>

          {/* Quick links */}
          <div className="footer-col">
            <h4>Kết nhanh</h4>
            <ul>
              <li><Link href="/course">Trang chủ</Link></li>
              <li><Link href="/course">Học</Link></li>
              <li><a href="#">Hỗ trợ</a></li>
              <li><a href="#">Hệ thống</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-col footer-contact">
            <h4>Hệ thống</h4>
            <p>
              Email:{' '}
              <a href="mailto:support@edusmart.vn">support@edusmart.vn</a>
            </p>
            <p>Đường dây nóng: 1900 1234</p>
            <div className="footer-social">
              <a href="#" className="social-link" aria-label="Facebook">📘</a>
              <a href="#" className="social-link" aria-label="YouTube">▶️</a>
              <a href="#" className="social-link" aria-label="Instagram">📷</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 EduSmart Education — Mọi quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
}
