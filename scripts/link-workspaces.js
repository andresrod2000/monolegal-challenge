import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const links = [
  ['packages/shared', 'node_modules/@monolegal/shared'],
  ['packages/domain', 'node_modules/@monolegal/domain'],
  ['packages/application', 'node_modules/@monolegal/application'],
  ['packages/infrastructure', 'node_modules/@monolegal/infrastructure'],
];

function removeIfExists(linkPath) {
  if (!fs.existsSync(linkPath)) return;

  const stat = fs.lstatSync(linkPath);
  if (stat.isSymbolicLink() || stat.isDirectory()) {
    fs.rmSync(linkPath, { recursive: true, force: true });
  } else {
    fs.unlinkSync(linkPath);
  }
}

function removeNestedMonolegalDeps(linkPath) {
  const nested = path.join(linkPath, 'node_modules', '@monolegal');
  if (fs.existsSync(nested)) {
    fs.rmSync(nested, { recursive: true, force: true });
  }
}

function copyWorkspacePackage(target, linkPath, relativeTarget, relativeLink) {
  if (!fs.existsSync(path.join(target, 'dist'))) {
    throw new Error(`Missing dist/ in ${relativeTarget}. Run npm run build:packages first.`);
  }

  fs.cpSync(target, linkPath, { recursive: true });

  const srcPath = path.join(linkPath, 'src');
  if (fs.existsSync(srcPath)) {
    fs.rmSync(srcPath, { recursive: true, force: true });
  }

  removeNestedMonolegalDeps(linkPath);

  console.log(`Copied ${relativeLink} <- ${relativeTarget} (without src, nested @monolegal deps)`);
}

function linkOrCopy(target, linkPath, relativeTarget, relativeLink) {
  removeIfExists(linkPath);
  fs.mkdirSync(path.dirname(linkPath), { recursive: true });

  if (process.platform === 'win32') {
    try {
      fs.symlinkSync(target, linkPath, 'junction');
      console.log(`Linked ${relativeLink} -> ${relativeTarget}`);
      return;
    } catch {
      // Windows sin permisos de symlink: copiar solo artefactos compilados.
    }
  } else {
    try {
      fs.symlinkSync(target, linkPath, 'dir');
      console.log(`Linked ${relativeLink} -> ${relativeTarget}`);
      return;
    } catch {
      // Fallback a copia si el symlink falla.
    }
  }

  copyWorkspacePackage(target, linkPath, relativeTarget, relativeLink);
}

for (const [relativeTarget, relativeLink] of links) {
  const target = path.join(root, relativeTarget);
  const linkPath = path.join(root, relativeLink);
  linkOrCopy(target, linkPath, relativeTarget, relativeLink);
}

console.log('Workspace links ready.');
