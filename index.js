const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// 从环境变量读取数据库连接地址，无需把密码写进代码
const MONGODB_URI = process.env.MONGODB_URI;

const app = express();
app.use(cors());
app.use(express.json());

// 存档数据模型
const SaveSchema = new mongoose.Schema({
  playerId: String,
  saveData: Object,
  updateTime: { type: Date, default: Date.now }
});
const Save = mongoose.model('Save', SaveSchema);

// 连接数据库，指定存档专属数据库名
mongoose.connect(MONGODB_URI, {
  dbName: 'ming_dynasty_save'
})
  .then(() => console.log('✅ 数据库连接成功'))
  .catch(err => console.log('❌ 数据库连接失败:', err));

// 健康检查接口
app.get('/', (req, res) => {
  res.send({ status: 'ok', message: '明朝时代存档服务运行中' });
});

// 保存存档接口
app.post('/api/save', async (req, res) => {
  const { playerId, saveData } = req.body;
  try {
    let doc = await Save.findOne({ playerId });
    if (doc) {
      doc.saveData = saveData;
      doc.updateTime = Date.now();
    } else {
      doc = new Save({ playerId, saveData });
    }
    await doc.save();
    res.send({ success: true, message: '存档成功' });
  } catch (e) {
    res.status(500).send({ success: false, message: e.message });
  }
});

// 读取存档接口
app.get('/api/load/:playerId', async (req, res) => {
  try {
    const doc = await Save.findOne({ playerId: req.params.playerId });
    res.send({ success: true, saveData: doc?.saveData || null });
  } catch (e) {
    res.status(500).send({ success: false, message: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ 后端启动成功，端口: ${PORT}`);
});
