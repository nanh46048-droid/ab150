import '../styles/globals.css';

export const metadata = {
  title: 'EduSmart — Nền tảng học tập thông minh',
  description:
    'EduSmart cung cấp lộ trình học tập theo chương trình, bài giải tương tác và câu hỏi liên quan đến chương trình ngân hàng.',
  keywords: 'edusmart, học toán, luyện thi, toán học lớp 8',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
