const express = require('express');
const router = express.Router();

const courseData = {
  id: 1,
  title: 'Toán học lớp 8',
  description:
    'Bộ giải pháp được tổ chức theo chương trình hỗ trợ học tập nắm chắc kiến thức cơ bản và làm chủ các kỹ năng giải toán',
  difficulty: {
    remote: true,
    trungBinh: true,
    kho: true,
  },
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

// GET /api/course
router.get('/', (req, res) => res.json(courseData));

// GET /api/course/chapters
router.get('/chapters', (req, res) => res.json(courseData.chapters));

// PATCH /api/course/difficulty
router.patch('/difficulty', (req, res) => {
  const { remote, trungBinh, kho } = req.body;
  if (remote !== undefined) courseData.difficulty.remote = remote;
  if (trungBinh !== undefined) courseData.difficulty.trungBinh = trungBinh;
  if (kho !== undefined) courseData.difficulty.kho = kho;
  res.json(courseData.difficulty);
});

module.exports = router;
