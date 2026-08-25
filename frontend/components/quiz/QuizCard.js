'use client';

export default function QuizCard({ option, selected, submitted, correct, onSelect }) {
  let stateClass = '';
  if (submitted) {
    if (option.id === correct) stateClass = 'correct';
    else if (selected === option.id) stateClass = 'incorrect';
  } else if (selected === option.id) {
    stateClass = 'selected';
  }

  return (
    <button
      id={`option-${option.id}`}
      className={`quiz-option ${stateClass}`}
      onClick={() => !submitted && onSelect(option.id)}
      disabled={submitted}
      aria-pressed={selected === option.id}
      aria-label={`Đáp án ${option.id}: ${option.text}`}
    >
      <span className="option-label" aria-hidden="true">
        {submitted && option.id === correct
          ? '✓'
          : submitted && selected === option.id && option.id !== correct
          ? '✗'
          : option.id}
      </span>

      <div className="option-content">
        <p className="option-text">{option.text}</p>
        <div className="option-meta">
          {option.votes !== null && (
            <span className="option-votes">
              {option.votes === 0 ? '0 votes' : `${option.votes} votes`}
            </span>
          )}
          {option.tag && (
            <span className="tag tag-recommended">{option.tag}</span>
          )}
        </div>
      </div>
    </button>
  );
}
