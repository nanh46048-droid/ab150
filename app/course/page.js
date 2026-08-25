import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ChapterCard from '../../components/course/ChapterCard';
import Sidebar from '../../components/course/Sidebar';

export const metadata = {
  title: 'Khóa học Toán học lớp 8 — EduSmart',
  description:
    'Lộ trình học tập nắm chắc kiến thức cơ bản và làm chủ các kỹ năng giải toán lớp 8.',
};

// Server component: fetch data từ backend
async function getCourseData() {
  try {
    const res = await fetch('/api/course', {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error('API error');
    return res.json();
  } catch {
    // Fallback data when backend is not running
    return {
      title: 'Toán học lớp 8',
      description:
        'Bộ giải pháp được tổ chức theo chương trình hỗ trợ học tập nắm chắc kiến thức cơ bản và làm chủ các kỹ năng giải toán',
      difficulty: { remote: true, trungBinh: true, kho: true },
      chapters: [
        {
          id: 1,
          title: 'Chương 1: Số và Đại số',
          description: 'Các cơ sở toán học đại số, biểu thức đại số và phương pháp tính toán',
          status: 'new',
          statusLabel: 'Mới',
          documents: 3,
          hasQuestions: true,
        },
        {
          id: 2,
          title: 'Chương 2: Hình học cơ bản',
          description: 'Góc, đường thẳng, tam giác và nền tảng nền tảng',
          status: 'active',
          statusLabel: 'Đang học',
          documents: 3,
          hasQuestions: true,
        },
        {
          id: 3,
          title: 'Chương 3: Hàm số và đồ thị',
          description: '',
          status: 'pending',
          statusLabel: 'Chưa bắt đầu',
          documents: 3,
          hasQuestions: false,
        },
      ],
      chaptersWithoutQuestions: [
        { id: 1, title: 'Chương 1: Số và Đại số', statusLabel: 'Bắt đầu: Mới' },
        { id: 2, title: 'Chương 2: Hình học cơ bản', statusLabel: 'Khóa trạng: Đang' },
        { id: 3, title: 'Chương 3: Hàm số và đồ thị', statusLabel: 'Trạng thái: Chưa bắt đầu' },
      ],
      supportResources: {
        title: 'Tài nguyên hỗ trợ',
        description:
          'Tổng hợp các mẫu kiểm tra đề, bài tập tự luyện và chi tiết hướng dẫn cho từng chương trình.',
      },
    };
  }
}

export default async function CoursePage() {
  const course = await getCourseData();

  const breadcrumb = [
    { label: 'Khóa học', href: '/course' },
    { label: course.title },
  ];

  return (
    <>
      <Header breadcrumb={breadcrumb} />

      <main>
        <div className="course-layout">
          {/* ── Main Content ── */}
          <div>
            {/* Hero */}
            <section className="course-hero animate-in" aria-label="Giới thiệu khóa học">
              <div className="hero-inner">
                <div className="hero-content">
                  <h1>{course.title}</h1>
                  <p>{course.description}</p>
                  <div className="hero-cta">
                    <a href="#chapters" className="btn btn-primary" id="btn-start-learning">
                      Bắt đầu học
                    </a>
                    <a href="#chapters" className="btn btn-outline" id="btn-explore-path">
                      Khám phá lộ trình
                    </a>
                  </div>
                </div>
                {/* Decorative illustration */}
                <div
                  style={{
                    width: 220,
                    height: 160,
                    borderRadius: 'var(--radius-md)',
                    background: 'linear-gradient(135deg, #ff6b35 0%, #ffd166 50%, #06d6a0 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 64,
                    flexShrink: 0,
                  }}
                  aria-hidden="true"
                >
                  📚
                </div>
              </div>
            </section>

            {/* Chapters */}
            <section id="chapters" aria-label="Danh sách chương">
              <h2 className="chapters-title">Các chương học</h2>
              <div className="chapters-list">
                {course.chapters.map((ch) => (
                  <ChapterCard key={ch.id} chapter={ch} />
                ))}
              </div>
            </section>

            {/* Support Resources */}
            <section aria-label="Tài nguyên hỗ trợ">
              <div className="support-card animate-in">
                <div className="support-inner">
                  <div>
                    <h2>{course.supportResources.title}</h2>
                    <p>{course.supportResources.description}</p>
                  </div>
                  <div
                    style={{
                      width: 120,
                      height: 90,
                      borderRadius: 'var(--radius-md)',
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 40,
                      flexShrink: 0,
                    }}
                    aria-hidden="true"
                  >
                    ✏️
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* ── Sidebar ── */}
          <Sidebar
            difficulty={course.difficulty}
            chaptersWithoutQuestions={course.chaptersWithoutQuestions}
          />
        </div>
      </main>

      <Footer />
    </>
  );
}
