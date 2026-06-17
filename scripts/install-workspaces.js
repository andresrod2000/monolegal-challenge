import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const workspaces = [
  'packages/shared',
  'packages/domain',
  'packages/application',
  'packages/infrastructure',
  'apps/api',
  'apps/worker',
  'apps/frontend',
];

for (const workspace of workspaces) {
  const workspaceRoot = path.join(root, workspace);
  if (!fs.existsSync(path.join(workspaceRoot, 'package.json'))) continue;

  console.log(`Installing ${workspace}...`);
  execSync('npm install --ignore-scripts --install-links', {
    cwd: workspaceRoot,
    stdio: 'inherit',
  });
}

execSync('node scripts/link-workspaces.js', {
  cwd: root,
  stdio: 'inherit',
});
