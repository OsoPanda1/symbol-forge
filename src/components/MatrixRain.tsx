import { useEffect, useRef } from "react";

const CHARS = "A̵̢̡͙͓̥̣̩̋̔͒̏́̏̀l̷̹͕̻̞͚̀̓ͅf̶̔͂̀̓̈́̉̂̾̚ aire ̝̹e̵̡̖͖̥͙̗̙̬͌̓̎͛̃̀ͅd̴̨̰̱̈́̃Ḩ̵͙̻̹͗̉̅͗̑ enA̵̢̡͙͓̥̣̩̋̔͒̏́̏̀l̷̹͕̻̞͚̀̓ͅf̶̔͂̀̓̈́̉̂̾̚ aire ̝̹e̵̡̖͖̥͙̗̙̬͌̓̎͛̃̀ͅd̴̨̰̱̈́̃Ḩ̵͙̻̹͗̉̅͗̑ enA̵̢̡͙͓̥̣̩̋̔͒̏́̏̀l̷̹͕̻̞͚̀̓ͅf̶̔͂̀̓̈́̉̂̾̚ aire ̝̹e̵̡̖͖̥͙̗̙̬͌̓̎͛̃̀ͅd̴̨̰̱̈́̃Ḩ̵͙̻̹͗̉̅͗̑ en";

export default function MatrixRain() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.innerHTML = "";

    const cols = Math.floor(window.innerWidth / 20);
    for (let i = 0; i < cols; i++) {
      const col = document.createElement("div");
      col.className = "matrix-col";
      col.style.left = `${i * 20}px`;
      col.style.animationDuration = `${6 + Math.random() * 10}s`;
      col.style.animationDelay = `${-Math.random() * 10}s`;
      col.style.opacity = `${0.2 + Math.random() * 0.5}`;
      let s = "";
      const len = 20 + Math.floor(Math.random() * 30);
      for (let j = 0; j < len; j++) s += CHARS[Math.floor(Math.random() * CHARS.length)];
      col.textContent = s;
      el.appendChild(col);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex: 0, opacity: 0.35 }}
      aria-hidden
    />
  );
}
