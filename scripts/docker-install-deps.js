import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const packages = [
  'packages/shared',
  'packages/domain',
  'packages/application',
  'packages/infrastructure',
];

for (const pkg of packages) {
  const pkgRoot = path.join(root, pkg);
  if (!fs.existsSync(path.join(pkgRoot, 'package.json'))) continue;

  console.log(`Installing ${pkg}...`);
  execSync('npm install --ignore-scripts', {
    cwd: pkgRoot,
    stdio: 'inherit',
  });
}

execSync('node scripts/link-workspaces.js', {
  cwd: root,
  stdio: 'inherit',
});

console.log('Docker deps ready.');
