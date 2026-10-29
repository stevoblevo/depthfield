/* Depthfield 2 — types as documentation. Components are HTML + bundle.css classes; behaviors are window.Depthfield.
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
