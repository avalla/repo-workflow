import * as fs from 'node:fs';
import * as path from 'node:path';
import {createHash, randomUUID} from 'node:crypto';
import Ajv2020 from 'ajv/dist/2020.js';

export const SOURCE = path.resolve(import.meta.dir, '..');
export const VERSION = '0.1.0';
export const GENERATOR = '0.2.0';
// JSON contracts are the runtime authority; dynamic document fields stay at this boundary.
export type Document = Record<string, any>;
export function requireThat(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
export const digest = (value: string | Buffer) => createHash('sha256').update(value).digest('hex');
function sorted(value: any): any {
  if (Array.isArray(value)) return value.map(sorted);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(k => [k, sorted(value[k])]));
  return value;
}
export const canonical = (value: unknown) => JSON.stringify(sorted(value), null, 2) + '\n';
export function decode(value: string | Buffer): any {
  const text = value.toString();
  // Scan valid JSON first to detect duplicate members that JSON.parse would silently replace.
  const parsed = JSON.parse(text);
  const tokens = text.match(/"(?:\\.|[^"\\])*"|[{}\[\]:,]|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null/g)!;
  let i = 0;
  function scan(): void {
    const token = tokens[i++];
    if (token === '{') {
      const keys = new Set<string>();
      while (tokens[i] !== '}') {
        const key = JSON.parse(tokens[i++]);
        requireThat(!keys.has(key), 'duplicate-json-key: ' + key); keys.add(key);
        i++; scan(); if (tokens[i] !== ',') break; i++;
      }
      i++;
    } else if (token === '[') {
      while (tokens[i] !== ']') {scan(); if (tokens[i] !== ',') break; i++;} i++;
    } else if (token && /^-?\d/.test(token)) requireThat(Number.isFinite(Number(token)), 'invalid-json-number');
  }
  scan(); return parsed;
}
export function relative(name: string, dot = false): string {
  requireThat(typeof name === 'string' && name.length > 0 && ((dot && name === '.') ||
    (!name.startsWith('/') && !/[\\\x00-\x1f\x7f]/.test(name) &&
    name.split('/').every(p => p && p !== '.' && p !== '..' && p.toLowerCase() !== '.git' && !p.includes(':')))), 'unsafe-path: ' + name);
  return name;
}
export function checked(root: string, name: string): string {
  relative(name, true);
  requireThat(fs.statSync(root).isDirectory() && !fs.lstatSync(root).isSymbolicLink(), 'unsafe-root');
  let current = root;
  for (const part of name === '.' ? [] : name.split('/')) {
    if (fs.existsSync(current) && fs.statSync(current).isDirectory()) {
      requireThat(!fs.readdirSync(current).some(p => p.toLowerCase() === part.toLowerCase() && p !== part), 'path-collision: ' + name);
    }
    current = path.join(current, part);
    const stat = fs.lstatSync(current, {throwIfNoEntry: false});
    requireThat(!stat?.isSymbolicLink(), 'symlink-collision: ' + name);
    if (stat && current !== path.join(root, name)) requireThat(stat.isDirectory(), 'parent-not-directory: ' + name);
  }
  return current;
}
export type Snapshot = {kind: 'absent'} | {kind: 'directory'; mode: number} | {kind: 'file'; mode: number; sha256: string};
export function snapshot(root: string, name: string): Snapshot {
  const file = checked(root, name), stat = fs.statSync(file, {throwIfNoEntry: false});
  if (!stat) return {kind: 'absent'};
  const mode = stat.mode & 0o777;
  if (stat.isDirectory()) return {kind: 'directory', mode};
  requireThat(stat.isFile(), 'unsupported-file: ' + name);
  return {kind: 'file', mode, sha256: digest(fs.readFileSync(file))};
}
export class Inputs {
  reads: Record<string, Snapshot> = {};
  constructor(public root: string) {}
  track(name: string) {
    relative(name, true);
    let parent = path.posix.dirname(name);
    while (parent !== '.') {this.reads[parent] = snapshot(this.root, parent); parent = path.posix.dirname(parent);}
    this.reads['.'] = snapshot(this.root, '.');
    this.reads[name] = snapshot(this.root, name);
    return checked(this.root, name);
  }
  text(name: string): string {
    const file = this.track(name);
    requireThat(fs.statSync(file, {throwIfNoEntry: false})?.isFile(), 'missing-file: ' + name);
    return new TextDecoder('utf-8', {fatal: true}).decode(fs.readFileSync(file));
  }
  json(name: string): any {return decode(this.text(name));}
}
export function validate(source: Inputs, name: string, value: unknown) {
  const ajv = new Ajv2020({strict: false, unicodeRegExp: false});
  ajv.addFormat('date-time', (s: string) => {
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(s)) return false;
    const date = new Date(s);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 19) === s.slice(0, 19);
  });
  ajv.addSchema(source.json('schemas/common.schema.json'));
  const check = ajv.compile(source.json('schemas/' + name + '.schema.json'));
  requireThat(check(value), 'schema-validation: ' + name + ': ' + ajv.errorsText(check.errors));
}
export function atomic(file: string, content: string, mode = 0o644) {
  const temporary = path.join(path.dirname(file), '.repo-workflow-' + randomUUID());
  const fd = fs.openSync(temporary, 'wx', mode);
  try {fs.writeFileSync(fd, content); fs.fsyncSync(fd); fs.closeSync(fd); fs.chmodSync(temporary, mode); fs.renameSync(temporary, file);}
  catch (error) {try {fs.closeSync(fd);} catch {} throw error;}
  finally {fs.rmSync(temporary, {force: true});}
}
export function sourceCommit(root = SOURCE): string {
  let git = path.join(root, '.git');
  if (fs.statSync(git).isFile()) git = path.resolve(root, fs.readFileSync(git, 'utf8').trim().replace(/^gitdir: /, ''));
  const commonFile = path.join(git, 'commondir');
  const common = fs.existsSync(commonFile) ? path.resolve(git, fs.readFileSync(commonFile, 'utf8').trim()) : git;
  let head = fs.readFileSync(path.join(git, 'HEAD'), 'utf8').trim();
  if (head.startsWith('ref: ')) {
    const ref = head.slice(5), file = [path.join(git, ref), path.join(common, ref)].find(p => fs.existsSync(p));
    const packed = path.join(common, 'packed-refs');
    head = file ? fs.readFileSync(file, 'utf8').trim() : fs.existsSync(packed) ?
      fs.readFileSync(packed, 'utf8').split('\n').find(l => l.endsWith(' ' + ref))?.split(' ')[0] ?? '' : '';
  }
  requireThat(/^[a-f0-9]{40}$/.test(head), 'unresolved-source-commit'); return head;
}
