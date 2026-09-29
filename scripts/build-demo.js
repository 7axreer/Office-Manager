// Bir faylli demo sahifa yig‘adi: dist/demo.html
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const safe = (js) => js.replace(/<\/script/gi, '<\\/script');
const html = `<title>Office Manager</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap">
<style>
${read('public/styles.css')}
</style>
<script>try { var t = localStorage.getItem('om-theme'); if (t) document.documentElement.dataset.theme = t; } catch (e) {}</script>
<div id="root"></div>
<div id="modal-root"></div>
<div id="toast-root" aria-live="polite"></div>
<div id="tip" class="tip" hidden></div>
<script>
${safe(read('shared/core.js'))}
</script>
<script>
${safe(read('demo/demo-api.js'))}
</script>
<script>
${safe(read('public/app.js'))}
</script>
`;
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist', 'demo.html'), html);
console.log('dist/demo.html', (html.length / 1024).toFixed(0) + ' KB');
