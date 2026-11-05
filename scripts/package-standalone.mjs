#!/usr/bin/env node
/**
 * scripts/package-standalone.mjs
 * 
 * Packages the Next.js standalone build into a production-ready ZIP file
 * designed for direct, one-click upload & extraction to cPanel.
 */

import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT_DIR = process.cwd();
const STANDALONE_DIR = path.join(ROOT_DIR, '.next', 'standalone');
const STATIC_SRC = path.join(ROOT_DIR, '.next', 'static');
const STATIC_DEST = path.join(STANDALONE_DIR, '.next', 'static');
const PUBLIC_SRC = path.join(ROOT_DIR, 'public');
const PUBLIC_DEST = path.join(STANDALONE_DIR, 'public');
const ZIP_OUTPUT = path.join(ROOT_DIR, 'a2-standalone-deploy.zip');

async function copyDir(src, dest) {
  if (!fsSync.existsSync(src)) return;
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

async function copyFile(src, dest) {
  if (!fsSync.existsSync(src)) return;
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.copyFile(src, dest);
}

async function main() {
  console.log('🚀 Starting Standalone Deployment Package Builder...');

  // 1. Check if standalone build exists
  if (!fsSync.existsSync(STANDALONE_DIR)) {
    console.error('❌ Error: .next/standalone directory not found.');
    console.log('👉 Please run "npm run build" first with output: "standalone" enabled in next.config.ts');
    process.exit(1);
  }

  // 2. Copy static files into standalone (required by Next.js standalone server)
  console.log('📦 1/5: Copying static assets (.next/static)...');
  await copyDir(STATIC_SRC, STATIC_DEST);

  // 3. Copy public folder into standalone
  console.log('🖼️  2/5: Copying public directory...');
  await copyDir(PUBLIC_SRC, PUBLIC_DEST);

  // 4. Copy database schema and configuration templates
  console.log('🗄️  3/5: Copying database schema, environment template & image loader...');
  await copyFile(path.join(ROOT_DIR, 'database', 'schema.sql'), path.join(STANDALONE_DIR, 'database', 'schema.sql'));
  await copyFile(path.join(ROOT_DIR, '.env.example'), path.join(STANDALONE_DIR, '.env.example'));
  await copyFile(path.join(ROOT_DIR, 'src', 'lib', 'image-loader.ts'), path.join(STANDALONE_DIR, 'src', 'lib', 'image-loader.ts'));

  // Ensure preview-props.json exists in .next/server (required by Next.js server runtime)
  try {
    const prerenderPath = path.join(ROOT_DIR, '.next', 'prerender-manifest.json');
    if (fsSync.existsSync(prerenderPath)) {
      const manifest = JSON.parse(await fs.readFile(prerenderPath, 'utf8'));
      if (manifest.preview) {
        const previewProps = JSON.stringify(manifest.preview, null, 2);
        const serverDest = path.join(STANDALONE_DIR, '.next', 'server', 'preview-props.json');
        await fs.mkdir(path.dirname(serverDest), { recursive: true });
        await fs.writeFile(serverDest, previewProps);
        await fs.writeFile(path.join(ROOT_DIR, '.next', 'server', 'preview-props.json'), previewProps);
      }
    }
  } catch (e) {
    console.warn('⚠️ Could not generate preview-props.json:', e.message);
  }

  // 5. Ensure mysql2 and its dependencies are present in standalone node_modules
  console.log('🔌 4/5: Bundling mysql2 and required database drivers into standalone...');
  const mysqlDeps = [
    'mysql2',
    'aws-ssl-profiles',
    'denque',
    'generate-function',
    'iconv-lite',
    'long',
    'lru.min',
    'named-placeholders',
    'seq-queue',
    'sqlstring',
    'safer-buffer'
  ];

  const standaloneModules = path.join(STANDALONE_DIR, 'node_modules');
  for (const dep of mysqlDeps) {
    const srcModule = path.join(ROOT_DIR, 'node_modules', dep);
    const destModule = path.join(standaloneModules, dep);
    if (fsSync.existsSync(srcModule) && !fsSync.existsSync(destModule)) {
      await copyDir(srcModule, destModule);
    }
  }

  // 6. Make paths in server.js portable for Linux hosting (replace Windows local absolute paths)
  const standaloneServerJs = path.join(STANDALONE_DIR, 'server.js');
  if (fsSync.existsSync(standaloneServerJs)) {
    let content = await fs.readFile(standaloneServerJs, 'utf8');
    // Escape backslashes for root dir regex
    const escapedRoot = ROOT_DIR.replace(/[.*+?^${}()|[\]\\]/g, '\\\\');
    const regex = new RegExp(escapedRoot, 'g');
    content = content.replace(regex, '.');
    await fs.writeFile(standaloneServerJs, content, 'utf8');
  }

  // 7. Add quick-start deployment guide inside the package
  const readmeText = `=====================================================
A2 Protective Agro Care - Standalone cPanel Deployment
=====================================================

QUICK ACTIVATION INSTRUCTIONS:
1. In cPanel -> "Software" -> "Setup Node.js App":
   - Node.js version: 20.x or 22.x
   - Application mode: Production
   - Application root: a2-care (or your chosen folder name)
   - Application URL: your domain / subdomain
   - Application startup file: server.js
   - Click "Create" then click "Stop App"

2. In cPanel File Manager:
   - Go to your application root directory (/home/username/a2-care).
   - Upload this ZIP file and click "Extract".
   - Create or edit ".env" in this directory:
     (Use .env.example as a reference and update your MySQL credentials and WhatsApp number).

3. In cPanel MySQL Databases & phpMyAdmin:
   - Create your MySQL database and user.
   - In phpMyAdmin, select your database and import "database/schema.sql" (skipping CREATE DATABASE line).

4. In cPanel -> "Setup Node.js App":
   - Click "Start App" (or "Restart").
   - Visit your website!
=====================================================
`;
  await fs.writeFile(path.join(STANDALONE_DIR, 'README-CPANEL.txt'), readmeText, 'utf8');

  // 8. Create CloudLinux cPanel compliant ZIP archive (excludes node_modules)
  console.log('🗜️  5/5: Compressing into cPanel-compatible ZIP archive (excluding node_modules)...');
  if (fsSync.existsSync(ZIP_OUTPUT)) {
    await fs.unlink(ZIP_OUTPUT);
  }

  // CloudLinux NodeJS Selector forbids a physical node_modules directory in application root.
  // It manages its own symlink to the nodevenv directory.
  try {
    execSync(`tar.exe -a -c --exclude="node_modules" -f "${ZIP_OUTPUT}" -C "${STANDALONE_DIR}" .`, { stdio: 'inherit' });
  } catch {
    // Fallback to powershell Compress-Archive excluding node_modules
    execSync(`powershell -Command "Get-ChildItem -Path '${STANDALONE_DIR}' -Exclude 'node_modules' | Compress-Archive -DestinationPath '${ZIP_OUTPUT}' -Force"`, { stdio: 'inherit' });
  }

  const stats = await fs.stat(ZIP_OUTPUT);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

  console.log('\n======================================================');
  console.log(`✅ SUCCESS: Standalone deployment archive ready!`);
  console.log(`📁 File: ${ZIP_OUTPUT}`);
  console.log(`⚖️  Size: ${sizeMB} MB`);
  console.log('======================================================\n');
}

main().catch((err) => {
  console.error('❌ Failed to package standalone build:', err);
  process.exit(1);
});
