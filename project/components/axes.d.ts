/* Typings for components/axes.js. Kept beside the add-on until the next versioned build folds them into index.d.ts. */
/** components/axes.js: the five-axis strip (plan D2). */
type DfAxisId = 'x' | 'depth' | 'time' | 'look' | 'memory';
interface DfAxis { id: string; label?: string; min: number; max: number; step: number; }
interface DfAxesOptions {
  /** rename, re-range or drop axes; default: x, depth, time, look, memory */
  axes?: DfAxis[];
  /** the readout, in the world's own terms: '042%', '×1.00', 'rain', '07' */
  text?(id: string, value: number): string;
  get?(id: string): number;
  set?(id: string, value: number): void;
  /** the axis the scene is teaching now; it takes the accent */
  live?: string;
  /** the strip's accessible name (default 'Five axes') */
  label?: string;
  readonly?: boolean;
}
interface DfAxesStrip {
  el: Element; version: string;
  /** call once a frame; writes to the page only when a value changed */
  update(live?: string | null): DfAxesStrip;
  set(id: string, value: number): DfAxesStrip;
  destroy(): void;
}
interface DepthfieldAxesAddOn {
  axes: { (el: Element, state?: Partial<Record<DfAxisId, number>> | null, opts?: DfAxesOptions): DfAxesStrip; five: DfAxisId[] };
  axesVersion: string;
}
