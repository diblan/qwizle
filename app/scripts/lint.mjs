import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const srcRoot = join(root, 'src');
const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const errors = [];

function walkFiles(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) {
      return walkFiles(path);
    }
    return [path];
  });
}

const sourceFiles = walkFiles(srcRoot).filter((path) => /\.(ts|html|scss)$/.test(path));
const forbiddenPatterns = [
  { label: 'Spartan UI', pattern: /spartan|@spartan-ng|brn[A-Z]|brn[A-Za-z-]*\b/i },
  { label: 'Angular Material', pattern: /@angular\/material|mat-[a-z-]+/i },
  { label: 'Tailwind import', pattern: /tailwindcss/i },
];

for (const file of sourceFiles) {
  const content = readFileSync(file, 'utf8');
  for (const { label, pattern } of forbiddenPatterns) {
    if (pattern.test(content)) {
      errors.push(`${relative(root, file)} references ${label}.`);
    }
  }
}

const componentFiles = sourceFiles.filter((file) => file.endsWith('.component.ts'));
for (const componentFile of componentFiles) {
  const content = readFileSync(componentFile, 'utf8');
  const basePath = componentFile.replace(/\.component\.ts$/, '.component');
  const relativeComponent = relative(root, componentFile);

  if (/template\s*:/.test(content)) {
    errors.push(`${relativeComponent} uses an inline template.`);
  }
  if (/styles?\s*:/.test(content)) {
    errors.push(`${relativeComponent} uses inline styles.`);
  }

  for (const extension of ['.ts', '.html', '.scss', '.spec.ts']) {
    const requiredFile = `${basePath}${extension}`;
    if (!existsSync(requiredFile)) {
      errors.push(`${relativeComponent} is missing ${relative(root, requiredFile)}.`);
    }
  }
}

if (!packageJson.dependencies?.bootstrap) {
  errors.push('package.json is missing the Bootstrap dependency.');
}

for (const dependencyName of ['@spartan-ng/brain', '@spartan-ng/cli', 'tailwindcss', '@tailwindcss/postcss', '@angular/material']) {
  if (packageJson.dependencies?.[dependencyName] || packageJson.devDependencies?.[dependencyName]) {
    errors.push(`package.json still declares ${dependencyName}.`);
  }
}

if (errors.length > 0) {
  throw new Error(`Frontend lint failed:\n${errors.map((error) => `- ${error}`).join('\n')}`);
}

console.log('Frontend conventions passed.');
