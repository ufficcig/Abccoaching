// ============================================================
// ABC Coaching Centre — Backend Server
// Node.js + Express + MongoDB Atlas
// Deploy on Railway.app
// ============================================================

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'abc_coaching_secret_key_2024';

// ─── Middleware ───────────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Frontend files

// ─── Mongoose Schemas ─────────────────────────────────────────

const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const ClassSchema = new mongoose.Schema({
  class_name: String,
  class_id: { type: Number, unique: true }
});

const SubjectSchema = new mongoose.Schema({
  class_id: Number,
  subject_name: String,
  subject_key: String,
  icon: String,
  color: String
});

const ChapterSchema = new mongoose.Schema({
  subject_id: String,
  class_id: Number,
  chapter_name: String,
  order: { type: Number, default: 1 },
  created_at: { type: Date, default: Date.now }
});

const VideoSchema = new mongoose.Schema({
  chapter_id: String,
  video_title: String,
  teacher_name: String,
  youtube_url: String,
  embed_url: String,
  thumbnail: String,
  order_no: { type: Number, default: 1 },
  created_at: { type: Date, default: Date.now }
});

const NoteSchema = new mongoose.Schema({
  chapter_id: String,
  content: String,
  updated_at: { type: Date, default: Date.now }
});

const AnnouncementSchema = new mongoose.Schema({
  title: String,
  body: String,
  type: { type: String, default: 'info' },
  active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now }
});

const Admin        = mongoose.model('Admin', AdminSchema);
const Class        = mongoose.model('Class', ClassSchema);
const Subject      = mongoose.model('Subject', SubjectSchema);
const Chapter      = mongoose.model('Chapter', ChapterSchema);
const Video        = mongoose.model('Video', VideoSchema);
const Note         = mongoose.model('Note', NoteSchema);
const Announcement = mongoose.model('Announcement', AnnouncementSchema);

// ─── Auth Middleware ──────────────────────────────────────────
function auth(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.admin = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// ─── YouTube URL → Embed URL ──────────────────────────────────
function toEmbedUrl(url) {
  if (!url) return '';
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return `https://www.youtube.com/embed/${m[1]}?rel=0&modestbranding=1`;
  }
  return url;
}

function autoThumb(url) {
  const embed = toEmbedUrl(url);
  const m = embed.match(/embed\/([a-zA-Z0-9_-]{11})/);
  return m ? `https://img.youtube.com/vi/${m[1]}/mqdefault.jpg` : '';
}

// ============================================================
// PUBLIC ROUTES (Students)
// ============================================================

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// Get all classes
app.get('/api/classes', async (req, res) => {
  try {
    const classes = await Class.find().sort({ class_id: 1 });
    res.json(classes);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Get subjects by class
app.get('/api/subjects/:classId', async (req, res) => {
  try {
    const subjects = await Subject.find({ class_id: parseInt(req.params.classId) });
    res.json(subjects);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Get chapters by subject_key
app.get('/api/chapters/:subjectKey', async (req, res) => {
  try {
    const chapters = await Chapter.find({ subject_id: req.params.subjectKey }).sort({ order: 1 });
    res.json(chapters);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Get videos by chapter
app.get('/api/videos/:chapterId', async (req, res) => {
  try {
    const videos = await Video.find({ chapter_id: req.params.chapterId }).sort({ order_no: 1 });
    res.json(videos);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Get note by chapter
app.get('/api/notes/:chapterId', async (req, res) => {
  try {
    const note = await Note.findOne({ chapter_id: req.params.chapterId });
    res.json(note || {});
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Get all notes (as object map)
app.get('/api/notes', async (req, res) => {
  try {
    const notes = await Note.find();
    const map = {};
    notes.forEach(n => { map[n.chapter_id] = n.content; });
    res.json(map);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Get active announcements
app.get('/api/announcements', async (req, res) => {
  try {
    const anns = await Announcement.find({ active: true }).sort({ created_at: -1 });
    res.json(anns);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Search
app.get('/api/search', async (req, res) => {
  try {
    const q = req.query.q;
    const classId = parseInt(req.query.classId) || null;
    if (!q) return res.json({ chapters: [], videos: [] });
    const regex = new RegExp(q, 'i');
    const chapterQuery = { chapter_name: regex };
    if (classId) chapterQuery.class_id = classId;
    const chapters = await Chapter.find(chapterQuery).limit(10);
    const chapterIds = chapters.map(c => c._id.toString());
    const videos = await Video.find({
      $or: [{ video_title: regex }, { teacher_name: regex }],
      chapter_id: { $in: chapterIds }
    }).limit(10);
    res.json({ chapters, videos });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ============================================================
// ADMIN AUTH
// ============================================================

app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: admin._id, username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, username });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ============================================================
// ADMIN ROUTES (Protected)
// ============================================================

// Add Chapter
app.post('/api/chapters', auth, async (req, res) => {
  try {
    const { subject_id, class_id, chapter_name, order } = req.body;
    if (!subject_id || !chapter_name) return res.status(400).json({ error: 'subject_id and chapter_name required' });
    const count = await Chapter.countDocuments({ subject_id });
    const chapter = new Chapter({ subject_id, class_id, chapter_name, order: order || count + 1 });
    await chapter.save();
    res.status(201).json(chapter);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Delete Chapter
app.delete('/api/chapters/:id', auth, async (req, res) => {
  try {
    await Chapter.findByIdAndDelete(req.params.id);
    await Video.deleteMany({ chapter_id: req.params.id });
    await Note.deleteOne({ chapter_id: req.params.id });
    res.json({ message: 'Chapter and its videos deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Add Video
app.post('/api/videos', auth, async (req, res) => {
  try {
    const { chapter_id, video_title, teacher_name, youtube_url, thumbnail, order_no } = req.body;
    if (!chapter_id || !video_title || !youtube_url) return res.status(400).json({ error: 'Required fields missing' });
    const embed_url = toEmbedUrl(youtube_url);
    const thumb = thumbnail || autoThumb(youtube_url);
    const video = new Video({ chapter_id, video_title, teacher_name, youtube_url, embed_url, thumbnail: thumb, order_no: order_no || 1 });
    await video.save();
    res.status(201).json(video);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Update Video
app.put('/api/videos/:id', auth, async (req, res) => {
  try {
    const { video_title, teacher_name, youtube_url, thumbnail, order_no } = req.body;
    const update = { video_title, teacher_name, order_no };
    if (youtube_url) {
      update.youtube_url = youtube_url;
      update.embed_url = toEmbedUrl(youtube_url);
      update.thumbnail = thumbnail || autoThumb(youtube_url);
    }
    const video = await Video.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!video) return res.status(404).json({ error: 'Video not found' });
    res.json(video);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Delete Video
app.delete('/api/videos/:id', auth, async (req, res) => {
  try {
    await Video.findByIdAndDelete(req.params.id);
    res.json({ message: 'Video deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Save/Update Note
app.post('/api/notes', auth, async (req, res) => {
  try {
    const { chapter_id, content } = req.body;
    if (!chapter_id) return res.status(400).json({ error: 'chapter_id required' });
    const note = await Note.findOneAndUpdate(
      { chapter_id },
      { content, updated_at: new Date() },
      { upsert: true, new: true }
    );
    res.json(note);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Delete Note
app.delete('/api/notes/:chapterId', auth, async (req, res) => {
  try {
    await Note.deleteOne({ chapter_id: req.params.chapterId });
    res.json({ message: 'Note deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Add Announcement
app.post('/api/announcements', auth, async (req, res) => {
  try {
    const { title, body, type } = req.body;
    if (!title || !body) return res.status(400).json({ error: 'title and body required' });
    const ann = new Announcement({ title, body, type: type || 'info' });
    await ann.save();
    res.status(201).json(ann);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Delete Announcement
app.delete('/api/announcements/:id', auth, async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Get all chapters (admin)
app.get('/api/admin/chapters', auth, async (req, res) => {
  try {
    const classId = req.query.classId ? parseInt(req.query.classId) : null;
    const query = classId ? { class_id: classId } : {};
    const chapters = await Chapter.find(query).sort({ class_id: 1, order: 1 });
    res.json(chapters);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Get all videos (admin)
app.get('/api/admin/videos', auth, async (req, res) => {
  try {
    const chapterId = req.query.chapterId || null;
    const query = chapterId ? { chapter_id: chapterId } : {};
    const videos = await Video.find(query).sort({ order_no: 1 });
    res.json(videos);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Get all announcements (admin)
app.get('/api/admin/announcements', auth, async (req, res) => {
  try {
    const anns = await Announcement.find().sort({ created_at: -1 });
    res.json(anns);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── DB Seed ─────────────────────────────────────────────────
async function seedDB() {
  // Admin
  const adminExists = await Admin.findOne({ username: 'admin' });
  if (!adminExists) {
    const hashed = await bcrypt.hash('admin123', 10);
    await Admin.create({ username: 'admin', password: hashed });
    console.log('✅ Admin created: admin / admin123');
  }

  // Classes
  if (!(await Class.countDocuments())) {
    await Class.insertMany([
      { class_id: 9,  class_name: 'Class 9'  },
      { class_id: 10, class_name: 'Class 10' },
      { class_id: 11, class_name: 'Class 11' },
      { class_id: 12, class_name: 'Class 12' }
    ]);
    console.log('✅ Classes seeded');
  }

  // Subjects
  if (!(await Subject.countDocuments())) {
    const subjects = [
      { class_id: 9,  subject_name: 'Maths',     subject_key: 's9m',   icon: '📐', color: '#4f8ef7' },
      { class_id: 9,  subject_name: 'Science',   subject_key: 's9sc',  icon: '🔬', color: '#3fcf8e' },
      { class_id: 9,  subject_name: 'English',   subject_key: 's9en',  icon: '📖', color: '#f7a94f' },
      { class_id: 9,  subject_name: 'SST',        subject_key: 's9ss',  icon: '🌍', color: '#7c5cfc' },
      { class_id: 9,  subject_name: 'Hindi',     subject_key: 's9hi',  icon: '🖊️', color: '#f7574f' },
      { class_id: 10, subject_name: 'Maths',     subject_key: 's10m',  icon: '📐', color: '#4f8ef7' },
      { class_id: 10, subject_name: 'Science',   subject_key: 's10sc', icon: '🔬', color: '#3fcf8e' },
      { class_id: 10, subject_name: 'English',   subject_key: 's10en', icon: '📖', color: '#f7a94f' },
      { class_id: 10, subject_name: 'SST',        subject_key: 's10ss', icon: '🌍', color: '#7c5cfc' },
      { class_id: 10, subject_name: 'Hindi',     subject_key: 's10hi', icon: '🖊️', color: '#f7574f' },
      { class_id: 11, subject_name: 'Physics',   subject_key: 's11ph', icon: '⚡', color: '#4f8ef7' },
      { class_id: 11, subject_name: 'Chemistry', subject_key: 's11ch', icon: '🧪', color: '#3fcf8e' },
      { class_id: 11, subject_name: 'Maths',     subject_key: 's11m',  icon: '📐', color: '#f7a94f' },
      { class_id: 11, subject_name: 'Biology',   subject_key: 's11bi', icon: '🌿', color: '#7c5cfc' },
      { class_id: 11, subject_name: 'English',   subject_key: 's11en', icon: '📖', color: '#f7574f' },
      { class_id: 12, subject_name: 'Physics',   subject_key: 's12ph', icon: '⚡', color: '#4f8ef7' },
      { class_id: 12, subject_name: 'Chemistry', subject_key: 's12ch', icon: '🧪', color: '#3fcf8e' },
      { class_id: 12, subject_name: 'Maths',     subject_key: 's12m',  icon: '📐', color: '#f7a94f' },
      { class_id: 12, subject_name: 'Biology',   subject_key: 's12bi', icon: '🌿', color: '#7c5cfc' },
      { class_id: 12, subject_name: 'English',   subject_key: 's12en', icon: '📖', color: '#f7574f' },
    ];
    await Subject.insertMany(subjects);
    console.log('✅ Subjects seeded');
  }

  // Sample announcement
  if (!(await Announcement.countDocuments())) {
    await Announcement.create({
      title: 'Welcome to ABC Coaching! 🎉',
      body: 'New videos added for Class 9 Maths — Real Numbers chapter. Check it out!',
      type: 'new'
    });
    console.log('✅ Sample announcement added');
  }
}

// ─── Start Server ─────────────────────────────────────────────
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB Atlas Connected!');
    await seedDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Open: http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB Error:', err.message);
    console.error('Check your MONGO_URI in .env file');
    process.exit(1);
  });
