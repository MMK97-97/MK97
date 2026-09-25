export type Layer = {
  id: string; type: 'text'|'image'|'shape'; name: string; text?: string; src?: string;
  x?: number; y?: number; width?: number; height?: number; fontSize?: number; fontWeight?: number;
  lineHeight?: number; letterSpacing?: number; color?: string; align?: 'left'|'center'|'right';
  position?: string; opacity?: number; blend?: string; locked?: boolean; hidden?: boolean;
};
export type TemplatePreset = {
  id:string; category:string; title:string; subtitle:string; premium:boolean;
  palette:{name:string;bg:string;secondary:string;accent:string;text:string};
  background:string; texture:string; overlays:string[]; logoPosition:string; alignment:string; layers:Layer[];
};
