'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function QuizPage() {
  const [ALL_QUESTIONS, setAllQuestions] = useState([]);
  const [ALL_CHAPTERS, setAllChapters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [mode, setMode] = useState('home'); // 'home' | 'quiz' | 'result'
  const [selectedChapter, setSelectedChapter] = useState(null); // null = all
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [answers, setAnswers] = useState([]); // { id, selected, correct }
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [savedForReview, setSavedForReview] = useState(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [chRes, qRes] = await Promise.all([
          fetch('/api/quiz/chapters'),
          fetch('/api/quiz')
        ]);
        const chaptersData = await chRes.json();
        const questionsData = await qRes.json();
        
        setAllChapters(chaptersData);
        setAllQuestions(questionsData.questions || []);
      } catch (err) {
        console.error('Error fetching quiz data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const currentQ = quizQuestions[currentIdx];

  const startQuiz = (chapterId) => {
    const filtered = chapterId
      ? ALL_QUESTIONS.filter((q) => q.chapterId === chapterId)
      : ALL_QUESTIONS;
    
    if (filtered.length === 0) {
      alert("Không có câu hỏi nào trong chương này.");
      return;
    }
    
    setQuizQuestions(filtered);
    setSelectedChapter(chapterId);
    setCurrentIdx(0);
    setSelected(null);
    setSubmitted(false);
    setResult(null);
    setAnswers([]);
    setSavedForReview(new Set());
    setMode('quiz');
  };

  const handleDeleteChapter = async (e, chapterId) => {
    e.stopPropagation(); // Ngăn không cho click vào card
    if (!confirm('Bạn có chắc muốn xóa chương này? Toàn bộ câu hỏi trong chương sẽ bị xóa.')) return;
    
    try {
      const res = await fetch(`/api/quiz/chapters/${chapterId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setAllChapters(prev => prev.filter(c => c.id !== chapterId));
        setAllQuestions(prev => prev.filter(q => q.chapterId !== chapterId));
      } else {
        alert('Có lỗi xảy ra khi xóa');
      }
    } catch (err) {
      console.error(err);
      alert('Không thể kết nối đến máy chủ');
    }
  };

  const handleSubmit = async () => {
    if (!selected || !currentQ) return;
    try {
      const res = await fetch(`/api/quiz/${currentQ.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: selected }),
      });
      const data = await res.json();
      setResult(data);
      setSubmitted(true);
      setAnswers((prev) => [
        ...prev,
        { id: currentQ.id, selected, correct: data.correct, correctAnswer: data.correctAnswer },
      ]);
    } catch {
      // offline fallback using embedded data
      const correct = selected === currentQ.correctAnswer;
      const data = {
        correct,
        correctAnswer: currentQ.correctAnswer,
        explanation: currentQ.explanation,
      };
      setResult(data);
      setSubmitted(true);
      setAnswers((prev) => [...prev, { id: currentQ.id, selected, correct, correctAnswer: currentQ.correctAnswer }]);
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 >= quizQuestions.length) {
      setMode('result');
    } else {
      setCurrentIdx((i) => i + 1);
      setSelected(null);
      setSubmitted(false);
      setResult(null);
    }
  };

  const toggleSaveReview = () => {
    setSavedForReview((prev) => {
      const next = new Set(prev);
      if (next.has(currentQ.id)) next.delete(currentQ.id);
      else next.add(currentQ.id);
      return next;
    });
  };

  const progress = quizQuestions.length > 0 ? ((currentIdx + (submitted ? 1 : 0)) / quizQuestions.length) * 100 : 0;
  const correctCount = answers.filter((a) => a.correct).length;

  if (isLoading) {
    return (
      <>
        <Header breadcrumb={[{ label: 'Trắc nghiệm Luật Viên chức 129/2025' }]} />
        <main style={{ padding: '100px 20px', textAlign: 'center' }}>
          <h2>Đang tải dữ liệu...</h2>
        </main>
        <Footer />
      </>
    );
  }

  if (mode === 'home') {
    return (
      <>
        <Header breadcrumb={[{ label: 'Trắc nghiệm tổng hợp' }]} />
        <main>
          <div className="quiz-home">
            {/* Hero */}
            <div className="quiz-hero-card">
              <div className="quiz-hero-badge">📚 LUYỆN THI TRẮC NGHIỆM</div>
              <h1 className="quiz-hero-title">Hệ Thống Trắc Nghiệm Thông Minh</h1>
              <p className="quiz-hero-subtitle">
                Được tổng hợp từ các bộ câu hỏi và sinh tự động bằng AI từ tài liệu của bạn
              </p>
              <div className="quiz-hero-stats">
                <div className="hero-stat">
                  <span className="hero-stat-num">{ALL_QUESTIONS.length}</span>
                  <span className="hero-stat-label">Câu hỏi</span>
                </div>
                <div className="hero-stat">
                  <span className="hero-stat-num">{ALL_CHAPTERS.length}</span>
                  <span className="hero-stat-label">Chương</span>
                </div>
              </div>
              <button className="btn btn-primary btn-lg" onClick={() => startQuiz(null)} id="btn-start-all">
                🚀 Bắt đầu luyện tập tất cả
              </button>
            </div>

            {/* Chapters */}
            <h2 className="quiz-chapters-title">Hoặc chọn luyện theo chương</h2>
            <div className="quiz-chapters-grid">
              {ALL_CHAPTERS.map((ch) => {
                const count = ALL_QUESTIONS.filter((q) => q.chapterId === ch.id).length;
                return (
                  <button
                    key={ch.id}
                    className="quiz-chapter-card"
                    style={{ '--ch-color': ch.color }}
                    onClick={() => startQuiz(ch.id)}
                    id={`btn-chapter-${ch.id}`}
                  >
                    <div className="ch-icon">{ch.icon}</div>
                    <div className="ch-content">
                      <div className="ch-title">{ch.title}</div>
                      <div className="ch-subtitle">{ch.subtitle}</div>
                      <div className="ch-count">{count} câu hỏi</div>
                    </div>
                    {ch.title.startsWith('Chương AI') ? (
                      <div className="ch-delete" onClick={(e) => handleDeleteChapter(e, ch.id)} title="Xóa chương này">
                        🗑️
                      </div>
                    ) : (
                      <div className="ch-arrow">→</div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (mode === 'result') {
    const pct = Math.round((correctCount / quizQuestions.length) * 100);
    const grade = pct >= 90 ? 'Xuất sắc 🏆' : pct >= 75 ? 'Tốt 🌟' : pct >= 50 ? 'Đạt ✅' : 'Cần cố gắng 📖';
    const gradeColor = pct >= 90 ? '#22c55e' : pct >= 75 ? '#3b82f6' : pct >= 50 ? '#f59e0b' : '#ef4444';
    return (
      <>
        <Header breadcrumb={[{ label: 'Trắc nghiệm' }, { label: 'Kết quả' }]} />
        <main>
          <div className="result-page">
            <div className="result-card">
              <div className="result-circle" style={{ '--grade-color': gradeColor }}>
                <span className="result-pct">{pct}%</span>
              </div>
              <h2 className="result-grade">{grade}</h2>
              <p className="result-summary">
                Bạn trả lời đúng <strong>{correctCount}</strong> / <strong>{quizQuestions.length}</strong> câu hỏi
              </p>

              <div className="result-breakdown">
                <div className="rb-item rb-correct">
                  <span className="rb-icon">✅</span>
                  <span className="rb-val">{correctCount}</span>
                  <span className="rb-lab">Đúng</span>
                </div>
                <div className="rb-item rb-wrong">
                  <span className="rb-icon">❌</span>
                  <span className="rb-val">{quizQuestions.length - correctCount}</span>
                  <span className="rb-lab">Sai</span>
                </div>
                <div className="rb-item rb-saved">
                  <span className="rb-icon">🔖</span>
                  <span className="rb-val">{savedForReview.size}</span>
                  <span className="rb-lab">Đã lưu</span>
                </div>
              </div>

              <div className="result-actions">
                <button className="btn btn-primary" onClick={() => startQuiz(selectedChapter)} id="btn-retry">
                  🔄 Làm lại
                </button>
                <button className="btn btn-outline" onClick={() => setMode('home')} id="btn-home">
                  🏠 Trang chủ
                </button>
              </div>
            </div>

            {/* Wrong answers review */}
            {answers.filter((a) => !a.correct).length > 0 && (
              <div className="wrong-review">
                <h3>📋 Xem lại câu sai</h3>
                {answers
                  .filter((a) => !a.correct)
                  .map((a) => {
                    const q = ALL_QUESTIONS.find((q) => q.id === a.id);
                    return (
                      <div key={a.id} className="review-item">
                        <div className="review-q-num">Câu {a.id}</div>
                        <div className="review-content">{q?.content}</div>
                        <div className="review-answers">
                          <span className="review-wrong">
                            ❌ Bạn chọn: <strong>{a.selected}</strong> —{' '}
                            {q?.options.find((o) => o.id === a.selected)?.text}
                          </span>
                          <span className="review-correct">
                            ✅ Đáp án đúng: <strong>{a.correctAnswer}</strong> —{' '}
                            {q?.options.find((o) => o.id === a.correctAnswer)?.text}
                          </span>
                        </div>
                        {q?.explanation && (
                          <div className="review-explanation">💡 {q.explanation}</div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Quiz mode
  if (!currentQ) return null;

  const chapterInfo = ALL_CHAPTERS.find((c) => c.id === currentQ.chapterId);

  return (
    <>
      <Header
        breadcrumb={[
          { label: 'Trắc nghiệm', href: '/quiz' },
          { label: currentQ.chapterTitle },
        ]}
      />
      <main>
        <div className="quiz-layout">
          {/* Top bar */}
          <div className="quiz-topbar">
            <button className="btn btn-ghost btn-sm" onClick={() => setMode('home')} id="btn-back">
              ← Quay lại
            </button>
            <div className="quiz-chapter-badge" style={{ '--ch-color': chapterInfo?.color || 'var(--primary)' }}>
              {chapterInfo?.icon} {currentQ.chapterTitle}
            </div>
            <div className="quiz-counter">
              Câu <strong>{currentIdx + 1}</strong> / {quizQuestions.length}
            </div>
          </div>

          {/* Progress bar */}
          <div className="progress-bar-wrap">
            <div className="progress-fill-new" style={{ width: `${progress}%` }} />
          </div>

          {/* Topic */}
          <div className="quiz-topic">{currentQ.topic}</div>

          {/* Question */}
          <div className="quiz-question" role="region" aria-label="Nội dung câu hỏi">
            {currentQ.content}
          </div>

          {/* Result banner */}
          {submitted && result && (
            <div
              className={`result-banner ${result.correct ? 'correct-banner' : 'incorrect-banner'}`}
              role="alert"
              aria-live="assertive"
            >
              {result.correct ? (
                <>✅ Chính xác! Bạn đã chọn đúng đáp án.</>
              ) : (
                <>
                  ❌ Chưa đúng. Đáp án đúng là <strong>{result.correctAnswer}</strong>.
                </>
              )}
            </div>
          )}

          {/* Explanation */}
          {submitted && result?.explanation && (
            <div className="quiz-explanation">
              <span className="explanation-icon">💡</span>
              <div>
                <strong>Giải thích:</strong> {result.explanation}
              </div>
            </div>
          )}

          {/* Options */}
          <div className="quiz-options" role="radiogroup" aria-label="Chọn đáp án">
            {currentQ.options.map((opt) => {
              let cls = 'quiz-option';
              if (submitted) {
                if (opt.id === result?.correctAnswer) cls += ' correct';
                else if (opt.id === selected && !result?.correct) cls += ' incorrect';
                else cls += ' disabled';
              } else if (opt.id === selected) {
                cls += ' selected';
              }
              return (
                <button
                  key={opt.id}
                  className={cls}
                  onClick={() => !submitted && setSelected(opt.id)}
                  disabled={submitted}
                  id={`option-${opt.id}`}
                  role="radio"
                  aria-checked={selected === opt.id}
                >
                  <div className="option-label">{opt.id}</div>
                  <div className="option-content">
                    <span className="option-text">{opt.text}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Actions */}
          <div className="quiz-actions">
            <div className="quiz-actions-left">
              <button
                id="btn-save-review"
                className={`btn btn-ghost ${savedForReview.has(currentQ.id) ? 'saved' : ''}`}
                onClick={toggleSaveReview}
                aria-pressed={savedForReview.has(currentQ.id)}
              >
                {savedForReview.has(currentQ.id) ? '🔖 Đã lưu' : '🔖 Lưu lại'}
              </button>
            </div>

            {submitted ? (
              <button
                id="btn-next"
                className="btn btn-primary"
                onClick={handleNext}
              >
                {currentIdx + 1 >= quizQuestions.length ? 'Xem kết quả 🏁' : 'Câu tiếp theo →'}
              </button>
            ) : (
              <button
                id="btn-submit"
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={!selected}
                style={{ opacity: selected ? 1 : 0.5, cursor: selected ? 'pointer' : 'not-allowed' }}
              >
                Xác nhận đáp án
              </button>
            )}
          </div>

          {/* Mini progress dots */}
          <div className="quiz-dots-wrap">
            {quizQuestions.map((_, i) => {
              const ans = answers[i];
              let dotClass = 'dot';
              if (ans) dotClass += ans.correct ? ' dot-correct' : ' dot-wrong';
              else if (i === currentIdx) dotClass += ' dot-current';
              return <span key={i} className={dotClass} title={`Câu ${i + 1}`} />;
            })}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
