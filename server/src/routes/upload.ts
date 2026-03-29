import express from 'express';
import upload from '../middleware/upload';

const router = express.Router();

router.post('/', upload.single('file'), (req: any, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    res.json({
      success: true,
      url: req.file.path || req.file.secure_url,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
});

export default router;
