import Link from 'next/link';

const statusConfig = {
  new: 'tag-new',
  active: 'tag-active',
  pending: '',
};

export default function ChapterCard({ chapter }) {
  const tagClass = statusConfig[chapter.status] || '';

  return (
    <article className="chapter-card animate-in" id={`chapter-${chapter.id}`}>
      <div className="chapter-header">
        <h2 className="chapter-title">{chapter.title}</h2>
        {chapter.statusLabel && (
          <span className={`tag ${tagClass}`}>{chapter.statusLabel}</span>
        )}
      </div>

      {chapter.description && (
        <p className="chapter-desc">{chapter.description}</p>
      )}

      <div className="chapter-actions">
        <Link
          href={`/quiz?chapter=${chapter.id}`}
          className="btn btn-primary"
          style={{ padding: '9px 20px', fontSize: '13px' }}
          id={`chapter-${chapter.id}-start`}
        >
          Làm bài
        </Link>
        <button
          className="btn-docs"
          id={`chapter-${chapter.id}-docs`}
          aria-label={`Xem ${chapter.documents} tài liệu chương ${chapter.id}`}
        >
          📄 Tài liệu ({chapter.documents})
        </button>
      </div>
    </article>
  );
}
