const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const regex = /<div class="modal-backdrop" id="([^"]+)"/g;
let m;
while ((m = regex.exec(html)) !== null) {
  console.log(m[1]);
}

