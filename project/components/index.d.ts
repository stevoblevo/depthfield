/* Depthfield 2.2 — types as documentation. Components are HTML + bundle.css classes; behaviors are window.Depthfield.
   Each <Comp>Props names the markup contract a page provides (classes, attributes, data); the functions are the JS API. */

export type Face = 'night' | 'day';
export type Skin = 'mint' | 'peach' | 'thread' | 'contrast';
export type ThemeId = 'night' | 'day' | 'peach-night' | 'peach-day' | 'thread-night' | 'thread-day' | 'contrast';
export type WeatherId = 'peach' | 'rain' | 'mint' | 'night';

/** Actions */
export interface ButtonProps { variant: 'primary' | 'ghost' | 'text' | 'mono'; size?: 'md' | 'sm' | 'icon'; label: string; arrow?: '→' | '↑' | '↗'; disabled?: boolean; busy?: boolean; href?: string }
export interface ToolProps { label: string; icon: string; pressed?: boolean; solid?: boolean; round?: boolean; role?: 'face' | 'sound' | 'lens' | 'open'; keepLabel?: boolean }

/** Narrative */
export interface SceneProps { anchor?: 'bottom' | 'top'; align?: 'start' | 'end'; narrow?: boolean; overArt?: boolean; chapter?: boolean; pinnedBeats?: number }
export interface ChapterMarkerProps { eyebrow: string; title: string; emphasis?: string; level?: 1 | 2 }
export interface SceneCaptionProps { label?: string; title: string; body: string; live?: boolean }
export interface HotspotProps { u: number; v: number; plane?: 0 | 1 | 2; kicker?: string; title: string; body: string; visible?: boolean; shape?: boolean }
export interface DoorProps { href: string; name: string; kicker: string; color?: 'accent' | 'peach' | 'rain' | 'mint' | 'frost' }
export interface EyeProps { autoWink?: boolean; label?: string }
export interface WorldCanvasProps { mode: 'glasshouse' | 'weather'; eye?: boolean; contained?: boolean; poster?: string }
export interface WeatherProps { states: WeatherId[] }

/** HUD */
export interface ScrollProgressProps { form: 'track' | 'ticks'; chapters: number; label?: string }
export interface HudChipProps { label: string; value: string; keep?: boolean }
export interface ReelHudProps { shots: number; stopLabel?: string }
export interface TiltChipProps { state?: 'off' | 'on' | 'rolling' | 'ask' }
export interface RibbonProps { mark: string; versions: { numeral: string; name: string; href: string; current?: boolean }[]; tools?: ('lens' | 'face' | 'archive')[] }
export interface LensBannerProps { text: string }

/** Overlays */
export interface DrawerProps { title: string; items: { n: string; title: string; small?: string; href: string }[]; note?: string }
export interface DialogProps { title: string; body: string; confirm: string; cancel?: string }
export interface FoundCardProps { kicker: string; title: string; line?: string; fact?: string; more?: string }
export interface LoaderProps { name: string; percent: number; skip?: boolean }

/** Content */
export type RealityStatus = 'observed' | 'partial' | 'progress' | 'proposed' | 'missing' | 'rejected' | 'candidate';
export interface ChipProps { status: RealityStatus; label: string }
export interface TagProps { tone: 'gold' | 'rose' | 'violet' | 'sea' | 'peach' | 'accent'; label: string }
export interface WorldCardProps { title: string; small: string; href: string; image?: string; icon?: string; ownerOnly?: boolean }
export interface VersionCardProps { numeral: string; title: string; date: string; blurb: string; href: string; image?: string; current?: boolean }
export interface ReadoutProps { items: { label: string; value: string }[]; columns?: 1 | 2 | 3 | 4 }
export interface StationProps { numeral: string; kicker: string; title: string; body: string[]; aside?: string }
export interface FooterProps { statement: string; note?: string; links: { label: string; href: string }[] }

/** Inputs */
export interface ToggleProps { label: string; checked?: boolean; disabled?: boolean }
export interface SliderProps { label: string; min: number; max: number; value: number; step?: number }
export interface CursorRingProps { over?: boolean }

/** The behavior API (window.Depthfield) */
export interface WorldApi {
  canvas: HTMLCanvasElement; mode: 'glasshouse' | 'weather';
  ridgeY(plane: 0 | 1 | 2, x: number): number; size(): { W: number; H: number };
  ripple(x: number, y: number, strength?: number): void; setWeather(f: number | null): void; setScroll(s: number): void; setTilt(x: number, y: number): void;
  eye(): { x: number; y: number; r: number } | null; wink(): void; redraw(): void; destroy(): void;
}
export interface WorldOptions { mode?: 'glasshouse' | 'weather'; weather?: number | null; eye?: boolean; shafts?: boolean; interactive?: boolean; scroll?: boolean; accent?: boolean; contained?: boolean; maxParticles?: number;
  onWeather?(w: { id: WeatherId; name: string }, index: number): void; draw?(ctx: CanvasRenderingContext2D, plane: { plane: number; ridgeY(p: number, x: number): number; W: number; H: number; t: number; scroll: number; weights: number[] | null }): void; onFrame?(api: WorldApi): void }
export interface ReelShot { name: string; tune?: string; cap?: string; d?: number; go?(): void; at?: [number, () => void][] }
export interface DepthfieldApi {
  version: string; reducedMotion(): boolean; token(name: string, el?: Element): string; haptic(ms?: number): void;
  theme: { get(): { face: Face; skin: Skin }; set(o: { face?: Face; skin?: Skin }, persist?: boolean): ThemeId; toggleFace(): ThemeId; init(o?: { face?: Face; skin?: Skin; followSystem?: boolean }): void; id(face: Face, skin: Skin): ThemeId };
  story(o?: { chapters?: string; progress?: string; onProgress?(p: number, chapter: number): void }): { state: { progress: number; chapter: number; count: number }; update(): void; destroy(): void };
  reveal(scope?: Element): IntersectionObserver | null;
  world(canvas: HTMLCanvasElement, o?: WorldOptions): WorldApi | null;
  weathers: { id: WeatherId; name: string; accent: string }[];
  hotspots(spots: HotspotProps[], o?: { world?: WorldApi; caption?: HTMLElement; host?: HTMLElement; visible?: boolean; onFound?(spot: HotspotProps, found: number, total: number): void }): { buttons: HTMLButtonElement[]; place(): void; found(): number; destroy(): void };
  eye(el: HTMLElement): { wink(): void; destroy(): void } | null;
  tilt(o?: { chip?: HTMLElement; world?: WorldApi; onTilt?(x: number, y: number): void; off?: boolean }): { ask(): Promise<string>; level(): void; off(v?: boolean): void };
  sound(btn: HTMLElement, o?: { onChange?(on: boolean): void }): { readonly on: boolean };
  lens(btn: HTMLElement, banner?: HTMLElement | null): { set(on: boolean): void };
  drawer(el: HTMLElement, opener?: HTMLElement): { open(): void; close(): void };
  dialog(el: HTMLDialogElement): { open(): void; close(): void } | null;
  found(el: HTMLElement, o?: { hold?: number }): { show(item: FoundCardProps): void };
  reel(shots: ReelShot[], o?: { hud?: HTMLElement; onStart?(): void; onStop?(done: boolean): void; onShot?(s: ReelShot, i: number): void }): { start(): void; stop(done?: boolean): void; readonly on: boolean; readonly shot: number; total: number };
  focus(planes: HTMLElement[], index: number): void;
  cursor(): HTMLElement | null;
  slider(input: HTMLInputElement): { sync(): void };
  init(o?: { theme?: { face?: Face; skin?: Skin; followSystem?: boolean }; cursor?: boolean; world?: WorldOptions; story?: object; sound?: object }): DepthfieldApi;
}
declare global { interface Window { Depthfield: DepthfieldApi } }
/** Events on window: df:theme, df:progress, df:chapter, df:weather, df:ripple, df:found, df:wink, df:tilt, df:sound, df:lens, df:drawer, df:reel, df:ready (detail objects as named above). */

/** Added in 2.1: folds, the stack, secrets, the field, pop-ups and letters */
export interface FoldProps { variant: 'letter' | 'fan' | 'gate'; tab: string; panels: string[]; open?: boolean }
export interface StackProps { planes: { name: string; note: string; texture?: string }[]; legend?: string }
export interface SecretProps { id: string; name: string; after?: number; nameAfter?: number; word?: string; revealAt?: string; watch?: string; hint?: string; hintTarget?: string; echoes?: string[] }
export interface FieldProps { lattice?: 'diamond' | 'square'; cell?: number; pace?: number; light?: number; paint?: boolean; on?: string; off?: string }
export interface PopUpProps { spreads: { left: { x: string; y: string; w: string; lift?: number; html: string }[]; right: { x: string; y: string; w: string; lift?: number; html: string }[]; caption?: string }[]; shut?: boolean }
export interface LetterProps { subject: string; preheader: string; eyebrow: string; title: string; dek: string; sections: { eyebrow: string; title: string; body: string }[]; action?: { label: string; href: string }; sources?: { label: string; href: string }[] }
export interface FoldApi { open(): void; close(): void; toggle(): void }
export interface StackApi { focus(index: number | null): void; update(): void }
export interface SecretApi { open(): void; stage(): number; reveal(): void; name(): void }
export interface FieldApi { step(): number; soup(p?: number): void; clear(): void; run(on?: boolean): boolean; pace(ms: number): void; light(v: number): void; alive(): number; readonly gen: number }
export interface PopUpApi { open(ms?: number): void; close(ms?: number): void; to(value: number, ms?: number, done?: () => void): void; readonly value: number }
export interface DepthfieldApi {
  fold(el: HTMLDetailsElement): FoldApi | null;
  stack(el: HTMLElement, o?: { legend?: HTMLElement }): StackApi | null;
  secret(o: { id: string; chip: HTMLElement; echoes?: HTMLElement[]; after?: number | null; nameAfter?: number | null; word?: string | null; revealAt?: Element | null; watch?: Element | null; hint?: (() => void) | null; onOpen?(): void }): SecretApi | null;
  field(canvas: HTMLCanvasElement, o?: FieldProps & { run?: boolean; seed?: number | false; onStep?(gen: number, alive: number, flips: number): void }): FieldApi | null;
  popup(el: HTMLElement, o?: { open?: number; auto?: boolean; delay?: number }): PopUpApi | null;
}
/** Events added in 2.1: df:fold {el, open}, df:stack {el, focus}, df:secret {id, stage: 1 glyph | 2 named | 3 opened}, df:field {canvas, gen, alive, flips} or {canvas, gen, painted}, df:popup {el, open}. */

/** Added in 2.2: the cloth, the lamp, stretch type, sense, the guide, the guardian, tone and taste */
export interface ClothThread { name: string; href?: string; color: string; line?: string }
export interface ClothProps { view?: 'hang' | 'lay'; threads: ClothThread[]; bands?: { name: string; color: string }[]; weather?: 0 | 1 | 2 | 3 }
export interface ClothOptions extends ClothProps { cols?: number; rows?: number; intro?: boolean; tip?: boolean; rejectAt?: number; holdMs?: number;
  frame?(view: 'hang' | 'lay', W: number, H: number, tall: boolean): { x: number; y: number; w: number; h: number };
  onPluck?(thread: ClothThread, index: number): void; onPull?(): void; onReject?(): void; onHold?(on: boolean, x?: number, y?: number): void; onRipple?(x: number, y: number): void;
  onHover?(info: { kind: 'thread' | 'band'; item: ClothThread; color: string } | null, x?: number, y?: number): void; onFrame?(ctx: CanvasRenderingContext2D, api: ClothApi): void }
export interface ClothApi { canvas: HTMLCanvasElement; threads: ClothThread[]; readonly view: 'hang' | 'lay'; readonly weather: number; rows: number;
  setView(v: 'hang' | 'lay'): void; setWeather(n: number): { id: WeatherId; name: string }; pluck(index: number): void; ripple(x: number, y: number, strength?: number): void;
  threadAt(x: number, y: number, within?: number): number; screen(row: number, col: number): [number, number]; columnOf(index: number): number; redraw(): void; layout(): void; destroy(): void }
export interface LampApi { light(u: number, v: number): number; at(u: number, v: number): void; set(room: number): void; readonly room: number; readonly u: number; readonly v: number; destroy(): void }
export interface StretchApi { to(v: number): void; bind(map?: Partial<Record<SenseState, number>>): StretchApi; unbind(): void; readonly value: number }
export type SenseState = 'arriving' | 'still' | 'calm' | 'curious' | 'caffeinated';
export interface SenseDetail { state: SenseState; label: string; speed: number; jerk: number; inferred: true }
export interface GuideApi { find(id: string): boolean; has(id: string): boolean; count(): number; next(): { id: string; hint: string } | null; paint(): void; reset(): void; total: number }
export interface GuardianApi { el: HTMLButtonElement; say(text: string, ms?: number): void; place(x: number, y: number): void; wink(): void; readonly x: number; readonly y: number; readonly mode: 'follow' | 'held' | 'fly'; destroy(): void }
export interface TasteFinding { rule: string; severity: 'warn' | 'info'; count: number; sample: string; fix: string }
export interface DepthfieldApi {
  cloth(canvas: HTMLCanvasElement, o: ClothOptions): ClothApi | null;
  lamp(el?: HTMLElement, o?: { input?: HTMLInputElement; radius?: number; floor?: number; lag?: number; room?: number; u?: number; v?: number; onMove?(u: number, v: number, room: number): void }): LampApi;
  stretch(el: HTMLElement, o?: { value?: number; min?: number; max?: number; intro?: boolean; extra?: string }): StretchApi | null;
  sense(o?: { el?: HTMLElement; labels?: Partial<Record<SenseState, string>>; still?: number; prefix?: string }): { readonly state: SenseState; on(fn: (d: SenseDetail) => void): unknown; destroy(): void };
  guide(o: { id: string; steps: { id: string; hint: string }[]; count?: HTMLElement; hint?: HTMLElement; label?: string; done?: string; onFind?(id: string, found: number, total: number): void; onDone?(): void }): GuideApi;
  guardian(o?: { host?: HTMLElement; home?: [number, number]; hello?: string; lines?: string[]; miss?: string; label?: string; svg?: string | ((id: string) => string);
    follow?(pointer: { x: number; y: number; on: boolean }): { x: number; y: number } | null; onLand?(x: number, y: number): string | false | null | void; onPress?(): void }): GuardianApi;
  tone: { scale: number[]; freq(k: number): number; pluck(k: number, volume?: number): void; thump(): void; readonly on: boolean; enable(on?: boolean): boolean };
  taste: ((o?: { scope?: Element; log?: boolean }) => TasteFinding[]) & { badge(findings?: TasteFinding[]): HTMLDetailsElement };
}
/** Events added in 2.2: df:cloth {canvas, type: 'pluck' | 'pull' | 'reject' | 'view' | 'weather', …}, df:lamp {el, room}, df:stretch {el, value}, df:sense SenseDetail, df:guide {id, step, found, total}, df:guardian {say} or {landed}, df:taste {findings}. */
