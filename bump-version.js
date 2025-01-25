const fs = require('fs');
const semver = require('semver');

// 读取 package.json 文件
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// 更新版本号，选择 'patch'、'minor' 或 'major'
packageJson.version = semver.inc(packageJson.version, 'patch'); // 你可以根据需要更改为 'minor' 或 'major'

// 将更新后的内容写回 package.json
fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));