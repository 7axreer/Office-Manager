'use strict';
/* JSON fayl asosidagi oddiy va ishonchli saqlash (atomik yozish + zaxira nusxa). */
const fs = require('fs');
const path = require('path');
const Core = require('../shared/core.js');

class Store {
  constructor(dir) {
    this.dir = dir;
    this.file = path.join(dir, 'db.json');
    fs.mkdirSync(dir, { recursive: true });
    this.state = this.load();
    this.lastBackup = 0;
  }

  load() {
    for (const f of [this.file, this.file + '.bak']) {
      try {
        if (fs.existsSync(f)) return Core.normalize(JSON.parse(fs.readFileSync(f, 'utf8')));
      } catch (e) {
        console.error(`[store] ${f} o‘qilmadi:`, e.message);
      }
    }
    return Core.normalize(null);
  }

  save() {
    const data = JSON.stringify(this.state, null, 1);
    const tmp = this.file + '.tmp';
    fs.writeFileSync(tmp, data);
    // kuniga bir marta oldingi holatni .bak ga saqlaymiz
    if (Date.now() - this.lastBackup > 6 * 3600e3 && fs.existsSync(this.file)) {
      try { fs.copyFileSync(this.file, this.file + '.bak'); this.lastBackup = Date.now(); } catch (e) { /* e’tiborsiz */ }
    }
    fs.renameSync(tmp, this.file);
  }
}

module.exports = Store;
