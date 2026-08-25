'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [count, setCount] = useState(10);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Vui lòng chọn một file (PDF, DOCX, TXT)');
      return;
    }
    
    setIsUploading(true);
    setError('');
    setMessage('Đang phân tích tài liệu và sinh câu hỏi, vui lòng chờ trong giây lát (có thể mất 15-30 giây)...');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('count', count);

    try {
      const res = await fetch('http://localhost:4000/api/generate', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setMessage(`Thành công! ${data.message}. Đang chuyển hướng sang trang làm bài...`);
        setTimeout(() => {
          router.push('/quiz');
        }, 3000);
      } else {
        setError(data.error || 'Có lỗi xảy ra khi xử lý file');
        setMessage('');
      }
    } catch (err) {
      console.error(err);
      setError('Không thể kết nối đến máy chủ API');
      setMessage('');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <Header breadcrumb={[{ label: 'Upload tài liệu tạo Quiz' }]} />
      <main className="upload-page">
        <div className="upload-container">
          <h1 className="upload-title">✨ Tạo Trắc Nghiệm Bằng AI</h1>
          <p className="upload-subtitle">
            Tải lên tài liệu của bạn (PDF, DOCX, TXT). AI sẽ đọc hiểu và tự động sinh ra bộ câu hỏi trắc nghiệm kèm đáp án và giải thích chi tiết.
          </p>

          <div className="upload-card">
            <div className="upload-zone">
              <div className="upload-icon">📄</div>
              <input 
                type="file" 
                id="file-upload" 
                accept=".pdf,.docx,.txt"
                onChange={handleFileChange}
                disabled={isUploading}
                className="file-input"
              />
              <label htmlFor="file-upload" className="file-label">
                {file ? file.name : 'Nhấn để chọn file hoặc kéo thả vào đây'}
              </label>
              <div className="file-hint">Hỗ trợ định dạng: PDF, DOCX, TXT (Tối đa 10MB)</div>
            </div>

            <div className="upload-options">
              <label className="option-label">Số lượng câu hỏi muốn sinh:</label>
              <div className="count-selector">
                {[5, 10, 15, 20].map((num) => (
                  <button 
                    key={num}
                    className={`count-btn ${count === num ? 'active' : ''}`}
                    onClick={() => setCount(num)}
                    disabled={isUploading}
                  >
                    {num} câu
                  </button>
                ))}
              </div>
            </div>

            {error && <div className="upload-error">{error}</div>}
            {message && <div className="upload-message">{message}</div>}

            <button 
              className={`btn btn-primary btn-upload ${isUploading ? 'loading' : ''}`}
              onClick={handleUpload}
              disabled={isUploading || !file}
            >
              {isUploading ? (
                <span className="spinner-wrap">
                  <span className="spinner"></span> Đang xử lý...
                </span>
              ) : 'Bắt Đầu Sinh Câu Hỏi'}
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
