const fs = require('fs');

const out = fs.createWriteStream('big.csv');
out.write('id,name,value\n');

const total = 1_000_000;

for (let i = 1; i <= total; i++) {
  const line = `${i},name_${i},${(Math.random() * 1000).toFixed(2)}\n`;
  const ok = out.write(line);
  if (!ok) {
    // если буфер переполнился — ждём и продолжаем
    require('deasync').loopWhile(() => !out.write(''));
  }
}

out.end();
