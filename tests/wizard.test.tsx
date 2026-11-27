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
  for (let i = 0; i < 500; i++) {if (predicate()) return; await Bun.sleep(10);} throw new Error('Ink render timed out');
}
test('Ink wizard handles input, validation, confirmation and completion', async () => {
  const tty = terminal(); let config: any;
  const app = render(<Wizard root={process.cwd()} onComplete={value => {config = value;}} />, {...tty, debug: true, exitOnCtrlC: false, patchConsole: false});
  try {
    await until(() => tty.output().includes('Project name'));
    tty.stdin.write('\x15'); await Bun.sleep(20); tty.stdin.write('INVALID'); await Bun.sleep(20); tty.stdin.write('\r');
    await until(() => tty.output().includes('invalid-project-name'));
    tty.stdin.write('\x15'); await Bun.sleep(20); tty.stdin.write('demo'); await Bun.sleep(20); tty.stdin.write('\r');
    await until(() => tty.output().includes('2/12'));
    for (const step of ['3/12', '4/12', '5/12']) {tty.stdin.write('\r'); await until(() => tty.output().includes(step));}
    tty.stdin.write('\x1b[B'); await until(() => tty.output().includes('› orchestrated'));
    tty.stdin.write('\r'); await until(() => tty.output().includes('6/13'));
    for (const step of ['7/13', '8/13']) {tty.stdin.write('\r'); await until(() => tty.output().includes(step));}
    tty.stdin.write('\x1b[B'); await Bun.sleep(20); tty.stdin.write('\x1b[B'); await until(() => tty.output().includes('› direct-merge'));
    tty.stdin.write('\r'); await until(() => tty.output().includes('9/14'));
    for (const step of ['10/14', '11/14']) {tty.stdin.write('\r'); await until(() => tty.output().includes(step));}
    tty.stdin.write('bun test'); await Bun.sleep(20); tty.stdin.write('\r'); await until(() => tty.output().includes('12/15'));
    for (const step of ['13/15', '14/15', '15/15', 'Type yes']) {tty.stdin.write('\r'); await until(() => tty.output().includes(step));}
    expect(config).toBeUndefined(); tty.stdin.write('\x15'); await Bun.sleep(20); tty.stdin.write('yes'); await Bun.sleep(20); tty.stdin.write('\r');
    await app.waitUntilExit(); expect(config.project.name).toBe('demo');
    expect(config.execution).toEqual({mode: 'orchestrated', maxParallel: 2});
    expect(config.delivery).toEqual({integration: 'direct-merge', base: 'main', mergeMethod: 'squash'});
    expect(config.approvals.map((a: any) => a.id)).toEqual(['publish', 'merge']);
    expect(config.review.external).toEqual({provider: 'codex', policy: 'optional'});
    expect(config.commands.test.argv).toEqual(['bun', 'test']); expect(config.state.tasks).toBe('docs/tasks.json');
  } finally {app.unmount(); tty.stdin.end(); tty.stdout.end(); tty.stderr.end();}
}, 30000);
test('Ink multi-select toggles harnesses and rejects an empty selection', async () => {
  const tty = terminal(); let config: any;
  const app = render(<Wizard root={process.cwd()} onComplete={value => {config = value;}} />, {...tty, debug: true, exitOnCtrlC: false, patchConsole: false});
  try {
    await until(() => tty.output().includes('Project name'));
    for (const step of ['2/12', '3/12', '4/12']) {tty.stdin.write('\r'); await until(() => tty.output().includes(step));}
    tty.stdin.write(' '); await until(() => tty.output().includes('[ ] generic'));
    tty.stdin.write('\x1b[B'); await Bun.sleep(20); tty.stdin.write(' '); await until(() => tty.output().includes('[ ] codex'));
    tty.stdin.write('\r'); await until(() => tty.output().includes('Enter a value.'));
    tty.stdin.write('\x1b[B'); await Bun.sleep(20); tty.stdin.write(' '); await until(() => tty.output().includes('[x] claude-code'));
    tty.stdin.write('\r'); await until(() => tty.output().includes('5/13'));
    tty.stdin.write('\r'); await until(() => tty.output().includes('6/13'));
    expect(tty.output()).toContain('Generate Claude Code worker/reviewer agents');
    tty.stdin.write('\x1b[B'); await Bun.sleep(20);
    for (const step of ['7/13', '8/13', '9/13', '10/13', '11/13', '12/13', '13/13', 'Type yes']) {tty.stdin.write('\r'); await until(() => tty.output().includes(step));}
    tty.stdin.write('\x15'); await Bun.sleep(20); tty.stdin.write('yes'); await Bun.sleep(20); tty.stdin.write('\r');
    await app.waitUntilExit();
    expect(config.harnesses).toEqual(['claude-code']); expect(config.execution).toEqual({mode: 'single-agent', nativeEntryPoints: true});
    expect(config.commands).toEqual({}); expect(config.delivery.integration).toBe('pr');
  } finally {app.unmount(); tty.stdin.end(); tty.stdout.end(); tty.stderr.end();}
}, 30000);
test('Ink cancellation exits without invoking writes', async () => {
  const tty = terminal(); let called = false;
  const app = render(<Wizard root={process.cwd()} onComplete={() => {called = true;}} />, {...tty, debug: true, exitOnCtrlC: false, patchConsole: false});
  const exited = app.waitUntilExit();
  try {
    await until(() => tty.output().includes('Project name')); tty.stdin.write('\x03');
    await expect(exited).rejects.toThrow('cancelled: no files written'); expect(called).toBe(false);
  } finally {app.unmount(); tty.stdin.end(); tty.stdout.end(); tty.stderr.end();}
});
