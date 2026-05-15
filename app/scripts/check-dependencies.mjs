import { readFileSync } from 'node:fs';

const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const dependencies = packageJson.dependencies ?? {};
const devDependencies = packageJson.devDependencies ?? {};

const angularRuntimePackages = [
  '@angular/animations',
  '@angular/cdk',
  '@angular/common',
  '@angular/compiler',
  '@angular/core',
  '@angular/forms',
  '@angular/platform-browser',
  '@angular/router',
];

function majorOf(range) {
  const match = String(range).match(/\d+/);
  return match ? Number(match[0]) : null;
}

const missingRuntimePackages = angularRuntimePackages.filter((name) => !dependencies[name]);
if (missingRuntimePackages.length > 0) {
  throw new Error(`Missing Angular runtime dependencies: ${missingRuntimePackages.join(', ')}`);
}

const angularMajors = new Map(
  angularRuntimePackages.map((name) => [name, majorOf(dependencies[name])]),
);
const expectedMajor = angularMajors.get('@angular/common');
const mismatchedPackages = [...angularMajors.entries()].filter(([, major]) => major !== expectedMajor);
if (mismatchedPackages.length > 0) {
  throw new Error(
    `Angular runtime packages must stay on the same major as @angular/common (${expectedMajor}): ${mismatchedPackages
      .map(([name, major]) => `${name}@${major ?? 'unknown'}`)
      .join(', ')}`,
  );
}

for (const name of ['@angular/build', '@angular/cli', '@angular/compiler-cli']) {
  const range = devDependencies[name];
  const major = majorOf(range);
  if (major !== expectedMajor) {
    throw new Error(`${name} (${range ?? 'missing'}) must stay on Angular major ${expectedMajor}.`);
  }
}

console.log(`Angular dependency majors are pinned to ${expectedMajor}.`);
