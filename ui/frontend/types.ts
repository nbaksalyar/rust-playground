export type Page = 'index' | 'help';

export interface Position {
  line: number;
  column: number;
}

export const makePosition = (line: string | number, column: string | number): Position =>
  ({ line: +line, column: +column });

export interface Selection {
  start?: Position;
  end?: Position;
}

export interface Crate {
  id: string;
  name: string;
  version: string;
}

export interface Version {
  version: string;
  hash: string;
  date: string;
}

export interface CommonEditorProps {
  code: string;
  execute: () => any;
  onEditCode: (_: string) => any;
  position: Position;
  selection: Selection;
  crates: Crate[];
}

export enum Editor {
  Simple = 'simple',
  Advanced = 'advanced',
}

export enum PairCharacters {
  Enabled = 'enabled',
  Disabled = 'disabled',
}

export enum Orientation {
  Automatic = 'automatic',
  Horizontal = 'horizontal',
  Vertical = 'vertical',
}

export enum PrimaryActionAuto {
  Auto = 'auto',
}

export enum PrimaryActionCore {
  Execute = 'execute',
}

export type PrimaryAction = PrimaryActionCore | PrimaryActionAuto;

export enum Focus {
  Clippy = 'clippy',
  Miri = 'miri',
  MacroExpansion = 'macro-expansion',
  LlvmIr = 'llvm-ir',
  Mir = 'mir',
  Wasm = 'wasm',
  Asm = 'asm',
  Execute = 'execute',
  Format = 'format',
  Gist = 'gist',
}

export enum Notification {
  Rust2018IsDefault = 'rust-2018-is-default',
}
