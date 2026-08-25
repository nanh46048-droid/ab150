'use client';

import { useState } from 'react';

function DiffToggle({ label, checked, onChange }) {
  return (
    <div className="diff-item">
      <span>{label}</span>
      <label className="toggle" aria-label={`Toggle ${label}`}>
        <input type="checkbox" checked={checked} onChange={onChange} />
        <span className="toggle-track" />
        <span className="toggle-thumb" />
      </label>
    </div>
  );
}

export default function Sidebar({ difficulty, chaptersWithoutQuestions }) {
  const [diff, setDiff] = useState(
    difficulty || { remote: true, trungBinh: true, kho: true }
  );

  const toggle = (key) => {
    setDiff((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <aside className="sidebar" aria-label="Sidebar thông tin">
      {/* Difficulty */}
      <div className="sidebar-card">
        <h3>Bộ đề khó</h3>
        <div className="diff-list">
          <DiffToggle label="Remote" checked={diff.remote} onChange={() => toggle('remote')} />
          <DiffToggle label="Trung bình" checked={diff.trungBinh} onChange={() => toggle('trungBinh')} />
          <DiffToggle label="Khó" checked={diff.kho} onChange={() => toggle('kho')} />
        </div>
      </div>

      {/* Upload */}
      <div className="sidebar-card">
        <h3>Tải lên tài liệu cho chương trình</h3>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
          Kéo &amp; thả hoặc chọn file PDF, PPT, DOC (tối đa 10MB)
        </p>
        <div className="upload-area" role="button" tabIndex={0} aria-label="Khu vực tải file lên">
          <div className="upload-icon">📁</div>
          <p>Kéo file vào đây hoặc</p>
        </div>
        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} id="btn-upload-doc">
          Chọn tài liệu
        </button>
      </div>

      {/* Chapters without questions */}
      <div className="sidebar-card">
        <h3>Chương trình chưa có câu hỏi</h3>
        <div className="chapter-status-list">
          {(chaptersWithoutQuestions || []).map((ch) => (
            <div key={ch.id} className="chapter-status-item">
              <p className="chapter-status-name">{ch.title}</p>
              <p className="chapter-status-label">{ch.statusLabel}</p>
            </div>
          ))}
        </div>
        <p className="sidebar-note">
          Hiện tại các chương chưa có câu hỏi đề bài để dàng bổ sung nội dung.
        </p>
        <div className="sidebar-actions">
          {(chaptersWithoutQuestions || []).map((ch) => (
            <button key={ch.id} id={`sidebar-choose-${ch.id}`}>
              Chọn
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
