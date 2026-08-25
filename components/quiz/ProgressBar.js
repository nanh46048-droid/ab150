export default function ProgressBar({ current, total }) {
  const pct = Math.round((current / total) * 100);

  return (
    <div className="progress-wrap" role="progressbar" aria-valuenow={current} aria-valuemin={1} aria-valuemax={total}>
      <div className="progress-label">
        <span>Tiến độ</span>
        <span>
          {current}/{total} câu ({pct}%)
        </span>
      </div>
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
