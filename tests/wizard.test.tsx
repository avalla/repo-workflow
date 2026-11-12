import {expect, test} from 'bun:test';
import {PassThrough} from 'node:stream';
import {render} from 'ink';
import {Wizard} from '../src/init';

function terminal() {
  const stdin = new PassThrough() as any;
  stdin.isTTY = true; stdin.setRawMode = () => {}; stdin.ref = () => {}; stdin.unref = () => {};
  const stdout = new PassThrough() as any; stdout.columns = 100; stdout.rows = 40;
  const stderr = new PassThrough() as any;
  let output = ''; stdout.on('data', (chunk: Buffer) => {output += chunk.toString();});
  return {stdin, stdout, stderr, output: () => output};
}
async function until(predicate: () => boolean) {
  for (let i = 0; i < 100; i++) {if (predicate()) return; await Bun.sleep(10);} throw new Error('Ink render timed out');
}
test('Ink wizard handles input, validation, confirmation and completion', async () => {
  const tty = terminal(); let config: any;
  const app = render(<Wizard root={process.cwd()} onComplete={value => {config = value;}} />, {...tty, debug: true, exitOnCtrlC: false, patchConsole: false});
  try {
    await until(() => tty.output().includes('Project name'));
    tty.stdin.write('\x15'); await Bun.sleep(20); tty.stdin.write('INVALID'); await Bun.sleep(20); tty.stdin.write('\r');
    await until(() => tty.output().includes('invalid-project-name'));
    tty.stdin.write('\x15'); await Bun.sleep(20); tty.stdin.write('demo'); await Bun.sleep(20); tty.stdin.write('\r');
    await until(() => tty.output().includes('2/5'));
    for (const step of ['3/5', '4/5', '5/5', 'Type yes']) {tty.stdin.write('\r'); await until(() => tty.output().includes(step));}
    expect(config).toBeUndefined(); tty.stdin.write('\x15'); await Bun.sleep(20); tty.stdin.write('yes'); await Bun.sleep(20); tty.stdin.write('\r');
    await app.waitUntilExit(); expect(config.project.name).toBe('demo'); expect(config.commands).toEqual({});
  } finally {app.unmount(); tty.stdin.end(); tty.stdout.end(); tty.stderr.end();}
});
test('Ink cancellation exits without invoking writes', async () => {
  const tty = terminal(); let called = false;
  const app = render(<Wizard root={process.cwd()} onComplete={() => {called = true;}} />, {...tty, debug: true, exitOnCtrlC: false, patchConsole: false});
  const exited = app.waitUntilExit();
  try {
    await until(() => tty.output().includes('Project name')); tty.stdin.write('\x03');
    await expect(exited).rejects.toThrow('cancelled: no files written'); expect(called).toBe(false);
  } finally {app.unmount(); tty.stdin.end(); tty.stdout.end(); tty.stderr.end();}
});
