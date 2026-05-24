// Unicode style transformers for the Aesthetics generator. All client-side.

type CharMap = Record<string, string>;

const buildMap = (from: string, to: string): CharMap => {
  const m: CharMap = {};
  const fromArr = [...from];
  const toArr = [...to];
  for (let i = 0; i < fromArr.length; i++) m[fromArr[i]] = toArr[i] ?? fromArr[i];
  return m;
};

const A = "abcdefghijklmnopqrstuvwxyz";
const U = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const D = "0123456789";

const apply = (text: string, ...maps: CharMap[]) =>
  [...text]
    .map((c) => {
      for (const m of maps) if (m[c]) return m[c];
      return c;
    })
    .join("");

const fraktur = buildMap(A, "𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷");
const frakturU = buildMap(U, "𝔄𝔅ℭ𝔇𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜ℨ");
const frakturB = buildMap(A, "𝖆𝖇𝖈𝖉𝖊𝖋𝖌𝖍𝖎𝖏𝖐𝖑𝖒𝖓𝖔𝖕𝖖𝖗𝖘𝖙𝖚𝖛𝖜𝖝𝖞𝖟");
const frakturBU = buildMap(U, "𝕬𝕭𝕮𝕯𝕰𝕱𝕲𝕳𝕴𝕵𝕶𝕷𝕸𝕹𝕺𝕻𝕼𝕽𝕾𝕿𝖀𝖁𝖂𝖃𝖄𝖅");
const bold = buildMap(A, "𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳");
const boldU = buildMap(U, "𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙");
const boldD = buildMap(D, "𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗");
const italic = buildMap(A, "𝑎𝑏𝑐𝑑𝑒𝑓𝑔ℎ𝑖𝑗𝑘𝑙𝑚𝑛𝑜𝑝𝑞𝑟𝑠𝑡𝑢𝑣𝑤𝑥𝑦𝑧");
const italicU = buildMap(U, "𝐴𝐵𝐶𝐷𝐸𝐹𝐺𝐻𝐼𝐽𝐾𝐿𝑀𝑁𝑂𝑃𝑄𝑅𝑆𝑇𝑈𝑉𝑊𝑋𝑌𝑍");
const boldItalic = buildMap(A, "𝒂𝒃𝒄𝒅𝒆𝒇𝒈𝒉𝒊𝒋𝒌𝒍𝒎𝒏𝒐𝒑𝒒𝒓𝒔𝒕𝒖𝒗𝒘𝒙𝒚𝒛");
const boldItalicU = buildMap(U, "𝑨𝑩𝑪𝑫𝑬𝑭𝑮𝑯𝑰𝑱𝑲𝑳𝑴𝑵𝑶𝑷𝑸𝑹𝑺𝑻𝑼𝑽𝑾𝑿𝒀𝒁");
const script = buildMap(A, "𝒶𝒷𝒸𝒹ℯ𝒻ℊ𝒽𝒾𝒿𝓀𝓁𝓂𝓃ℴ𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏");
const scriptU = buildMap(U, "𝒜ℬ𝒞𝒟ℰℱ𝒢ℋℐ𝒥𝒦ℒℳ𝒩𝒪𝒫𝒬ℛ𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵");
const dbl = buildMap(A, "𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫");
const dblU = buildMap(U, "𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ");
const dblD = buildMap(D, "𝟘𝟙𝟚𝟛𝟜𝟝𝟞𝟟𝟠𝟡");
const mono = buildMap(A, "𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣");
const monoU = buildMap(U, "𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉");
const monoD = buildMap(D, "𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿");
const smallCaps = buildMap(A, "ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ");
const superscript = buildMap(A, "ᵃᵇᶜᵈᵉᶠᵍʰⁱʲᵏˡᵐⁿᵒᵖᵠʳˢᵗᵘᵛʷˣʸᶻ");
const subscript = buildMap(A, "ₐᵦ𝒸𝒹ₑ𝒻𝓰ₕᵢⱼₖₗₘₙₒₚ𝓆ᵣₛₜᵤᵥ𝓌ₓᵧ𝓏");
const cursed = (t: string) => {
  const marks = [
    "\u0300","\u0301","\u0302","\u0303","\u0304","\u0306","\u0307","\u0308",
    "\u030A","\u030B","\u030C","\u0327","\u0328","\u0334","\u0335","\u0336","\u0337","\u0338",
  ];
  // Deterministic seeded pseudo-random — avoids SSR/CSR hydration mismatch.
  let seed = 0;
  for (let i = 0; i < t.length; i++) seed = (seed * 31 + t.charCodeAt(i)) >>> 0;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0xffffffff;
  };
  return [...t]
    .map((c) => {
      if (c === " ") return c;
      let out = c;
      const n = 3 + Math.floor(rand() * 5);
      for (let i = 0; i < n; i++) out += marks[Math.floor(rand() * marks.length)];
      return out;
    })
    .join("");
};


const wrap = (t: string, l: string, r: string, sep = " ") => `${l}${sep}${t}${sep}${r}`;

export type Style = {
  id: string;
  label: string;
  tag: string;
  transform: (text: string) => string;
};

const sovereignMap = buildMap(A, "λβ¢đεƒğħįʝκℓɱŋøρզřşŧµνωжყž");
const sovereignUpperMap = buildMap(U, "Λß₵ÐΞƑǤĦĮJҠŁΜŊØƤǪŘŞŦɄƲŴЖ¥Ȥ");

export const STYLES: Style[] = [
  {
    id: "anubis-sovereign",
    label: "Alfabeto Soberano",
    tag: "ANUBIS.IDENTITY",
    transform: (t) => `𓂀⟁ ${apply(t, sovereignUpperMap, sovereignMap, dblD)} ⟁𓂀`,
  },
  {
    id: "fraktur-bold",
    label: "Fraktur Sangre",
    tag: "GOTHIC.BOLD",
    transform: (t) => wrap(apply(t, frakturBU, frakturB), "⸸", "⸸"),
  },
  {
    id: "fraktur",
    label: "Fraktur Ritual",
    tag: "GOTHIC.LIGHT",
    transform: (t) => apply(t, frakturU, fraktur),
  },
  {
    id: "double",
    label: "Hueco Cuántico",
    tag: "VOID.DOUBLE",
    transform: (t) => apply(t, dblU, dbl, dblD),
  },
  {
    id: "mono",
    label: "Consola Forense",
    tag: "TERMINAL.MONO",
    transform: (t) => `> ${apply(t, monoU, mono, monoD)} _`,
  },
  {
    id: "bold",
    label: "Acero Tipográfico",
    tag: "WEIGHT.HEAVY",
    transform: (t) => apply(t, boldU, bold, boldD),
  },
  {
    id: "italic",
    label: "Susurro Inclinado",
    tag: "SLANT.ITAL",
    transform: (t) => apply(t, italicU, italic),
  },
  {
    id: "bold-italic",
    label: "Lengua de Fuego",
    tag: "BOLD.ITAL",
    transform: (t) => apply(t, boldItalicU, boldItalic),
  },
  {
    id: "script",
    label: "Códice Manuscrito",
    tag: "SCRIPT.CURSIVE",
    transform: (t) => apply(t, scriptU, script),
  },
  {
    id: "small-caps",
    label: "Versales Espías",
    tag: "CAPS.MICRO",
    transform: (t) => apply(t.toLowerCase(), smallCaps),
  },
  {
    id: "supersub",
    label: "Órbita Superior",
    tag: "RAISE.SUP",
    transform: (t) => apply(t.toLowerCase(), superscript),
  },
  {
    id: "subscript",
    label: "Subterráneo",
    tag: "DROP.SUB",
    transform: (t) => apply(t.toLowerCase(), subscript),
  },
  { id: "cursed", label: "Texto Maldito", tag: "ZALGO.CURSED", transform: (t) => cursed(t) },
  {
    id: "runes",
    label: "Sigilo Rúnico",
    tag: "GLYPH.RUNIC",
    // IMPORTANT: spread by code points — `.split("")` shatters surrogate pairs
    // of mathematical bold chars and triggers SSR/CSR hydration mismatch.
    transform: (t) => `ᚱ ${[...apply(t, boldU, bold)].join("·")} ᚱ`,
  },
  {
    id: "tribal",
    label: "Brasa Tribal",
    tag: "FLAME.TRIBAL",
    transform: (t) => `▰▰▰ ${apply(t, frakturBU, frakturB)} ▰▰▰`,
  },
  {
    id: "hacker",
    label: "Modo Hacker",
    tag: "L33T.HACK",
    transform: (t) =>
      `[ ${t.toUpperCase().replace(/A/g, "4").replace(/E/g, "3").replace(/I/g, "1").replace(/O/g, "0").replace(/S/g, "5").replace(/T/g, "7")} ]`,
  },
  {
    id: "occult",
    label: "Sello Ocultista",
    tag: "SEAL.OCCULT",
    transform: (t) => `𓂀 ${apply(t, frakturBU, frakturB)} 𓂀`,
  },
  {
    id: "deepweb",
    label: "Firma Deep Web",
    tag: "DARKNET.SIG",
    transform: (t) => `⟁⟁⟁ ${apply(t, monoU, mono)} ⟁⟁⟁`,
  },
  {
    id: "legion",
    label: "Estandarte Legión",
    tag: "LEGION.BANNER",
    transform: (t) => `⸸⛧⸸ ${apply(t, frakturBU, frakturB)} ⸸⛧⸸`,
  },
];

export function generateAll(text: string): { style: Style; output: string }[] {
  if (!text.trim()) return [];
  return STYLES.map((style) => ({ style, output: style.transform(text) }));
}
