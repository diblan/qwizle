import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const configPath = resolve('public/qwizle-config.json');
const apiBaseUrl = process.env.QWIZLE_API_BASE_URL || 'http://localhost:8080/api';
const config = `${JSON.stringify({ apiBaseUrl }, null, 2)}\n`;

await mkdir(dirname(configPath), { recursive: true });
await writeFile(configPath, config, 'utf8');

const [command, ...args] = process.argv.slice(2);
if (!command) {
  process.exit(0);
}

const child = spawn(command, args, { stdio: 'inherit' });

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => child.kill(signal));
}

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
