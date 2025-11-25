/**
 * Simple Express server
 * - serves static public/
 * - POST /api/upload  -> temporary local storage (for dev). In prod move to S3/Backblaze.
 * - GET  /r/:id      -> redirect to affiliate (server side tracking)
 *
 * Run: npm init -y
 * npm i express multer dotenv helmet uuid
 * node server.js
 */

require('dotenv').config();
const express = require('express');
const multer = require('multer');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended:true }));

const PUBLIC = path.join(__dirname, '..', 'public');
app.use(express.static(PUBLIC));

// storage (dev): ./uploads
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if(!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

const storage = multer.diskStorage({
  destination: (req,file,cb)=> cb(null, UPLOAD_DIR),
  filename: (req,file,cb)=> {
    const id = uuidv4();
    const ext = path.extname(file.originalname) || '';
    cb(null, id + ext);
  }
});
const upload = multer({ storage, limits: { fileSize: 1024*1024*1024 } }); // 1GB limit, tune as needed

// simple in-memory affiliate map (in prod put in DB)
const AFF = {
  '1': 'https://example-affiliate-1.com/?ref=YOUR_AFF_ID',
  '2': 'https://example-affiliate-2.com/?ref=YOUR_AFF_ID',
  '3': 'https://example-affiliate-3.com/?ref=YOUR_AFF_ID',
  '4': 'https://example-affiliate-4.com/?ref=YOUR_AFF_ID'
};

// Upload endpoint (stores file + metadata for moderation)
app.post('/api/upload', upload.single('file'), (req,res)=>{
  try{
    const f = req.file;
    if(!f) return res.status(400).json({ ok:false, error:'no file' });
    // create metadata
    const meta = {
      id: path.basename(f.filename, path.extname(f.filename)),
      originalName: f.originalname,
      filename: f.filename,
      path: f.path,
      size: f.size,
      mimetype: f.mimetype,
      uploaderIp: req.ip,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    // persist meta JSON
    fs.writeFileSync(path.join(UPLOAD_DIR, meta.id + '.json'), JSON.stringify(meta, null, 2));
    // TODO: send to moderation queue (AI flagging + human review)
    return res.json({ ok:true, id: meta.id });
  }catch(e){
    console.error(e);
    return res.status(500).json({ ok:false, error:'server error' });
  }
});

// Redirect affiliate with tracking
app.get('/r/:id', (req,res)=>{
  const id = req.params.id;
  const target = AFF[id];
  if(!target) return res.status(404).send('Not found');
  // log click (append to file)
  const logLine = JSON.stringify({ id, ip: req.ip, ua: req.get('User-Agent'), ts: new Date().toISOString() }) + '\n';
  fs.appendFile(path.join(__dirname, 'clicks.log'), logLine, ()=>{});
  // redirect 302 to keep referrer sometimes; you can use 301 if permanent
  res.redirect(302, target);
});

// health
app.get('/health', (req,res)=> res.json({ ok:true, time: new Date().toISOString() }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`Server running on ${PORT}`));
