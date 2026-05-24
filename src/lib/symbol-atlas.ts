export type SymbolGroup = {
  id: string;
  label: string;
  symbols: string[];
};

export const SYMBOL_ATLAS: SymbolGroup[] = [
  { id: "arcane", label: "Arcano", symbols: ["𓂀", "⟁", "⛧", "☥", "⌬", "⌁", "⸸", "☬", "✶", "✷", "✹", "✺"] },
  { id: "tech", label: "Tecno", symbols: ["⌘", "⎋", "⏣", "⚙", "⏻", "⌬", "⌗", "⎔", "⛶", "⌖", "⌁", "⎈"] },
  { id: "runes", label: "Rúnico", symbols: ["ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ", "ᚷ", "ᛉ", "ᛋ", "ᛏ", "ᛟ", "ᛞ"] },
  { id: "cjk", label: "CJK", symbols: ["々", "〆", "〇", "々", "仝", "〄", "※", "〒", "㊙", "㊗", "〠", "ゞ"] },
  { id: "math", label: "Matemático", symbols: ["∴", "∵", "∑", "∫", "∮", "∞", "≈", "≠", "≤", "≥", "⊕", "⊗"] },
  { id: "ornamental", label: "Ornamental", symbols: ["❖", "❂", "❈", "✥", "✢", "✤", "❉", "✦", "✧", "✩", "✪", "❋"] },
];

export function buildIdentitySigil(input: string): string {
  const clean = input.trim();
  if (!clean) return "";
  const seeds = [...clean].map((c) => c.codePointAt(0) ?? 0);
  const flat = SYMBOL_ATLAS.flatMap((g) => g.symbols);
  const picks = seeds.slice(0, 4).map((n, i) => flat[(n + i * 17) % flat.length]);
  return `${picks[0] ?? "𓂀"}${picks[1] ?? "⟁"} ${clean} ${picks[2] ?? "⛧"}${picks[3] ?? "⌬"}`;
}
