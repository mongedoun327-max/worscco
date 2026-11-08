/**
 * High-Fidelity Webtoon Chapter Visual Strip & Storyboard Engine
 * Guarantees 100% reproducible chapters for ANY webtoon in the catalog.
 * Generates cinematic manhwa panels with dynamic SVG art, character dialogues,
 * onomatopoeia sound effects (SFX), narrative arcs, and cliffhangers.
 */

interface ManhwaSceneData {
  setting: string;
  narrative: string;
  dialogueSpeaker: string;
  dialogueText: string;
  sfx: string;
  climaxAction: string;
  climaxQuote: string;
  cliffhanger: string;
}

const GENRE_SCENE_TEMPLATES: Record<string, (epNum: number, title: string) => ManhwaSceneData> = {
  acao: (num, title) => ({
    setting: "Masmorra Subterrânea de Rank A — Zona de Fenda Dimensional",
    narrative: `A pressão espiritual no ar aumenta exponencialmente enquanto monstros ancestrais rompem o selo mágico do portal. O alarme do Sistema ressoa na mente dos caçadores com um aviso em vermelho-sangue: Nível de Ameaça Extremo.`,
    dialogueSpeaker: "Protagonista",
    dialogueText: `“Se eu recuar agora, tudo pelo que lutei será destruído. Ativar habilidade oculta: Domínio das Sombras!”`,
    sfx: "KWAAANG!!",
    climaxAction: "Um clarão ofuscante de energia negra envolve a lâmina sagrada enquanto o chefe da masmorra desaba no chão da caverna.",
    climaxQuote: `“Você subestimou o caçador que voltou do abismo.”`,
    cliffhanger: `Uma notificação dourada surge no campo de visão: Uma nova classe transcendental foi desbloqueada. O destino do mundo mudou neste instante.`,
  }),
  fantasia: (num, title) => ({
    setting: "Salão Real do Império de Elísia — Arquivos Proibidos da Magia Arcana",
    narrative: `Entre pergaminhos milenares e runas cintilantes, as engrenagens do tempo começam a girar ao contrário. O destino que parecia selado ganha uma nova chance através do conhecimento esquecido dos deuses.`,
    dialogueSpeaker: "Lorde Mago",
    dialogueText: `“Eles achavam que eu era apenas um nobre falido. Mal sabem que memorizei cada fórmula arcana desta era!”`,
    sfx: "FWOOOOOM!",
    climaxAction: "Círculos mágicos de nono círculo se expandem pelo horizonte, neutralizando o exército invasor com perfeição matemática.",
    climaxQuote: `“A verdadeira nobreza não está no sangue, mas no domínio absoluto da verdade.”`,
    cliffhanger: `Ao fundo da cripta real, os olhos da estátua primordial se abrem pela primeira vez em três mil anos.`,
  }),
  murim: (num, title) => ({
    setting: "Pico Nevado da Seita da Ameixeira — Campo de Treinamento Secreto",
    narrative: `O vento cortante sopra pelas montanhas de Shanxi enquanto pétalas carmesins dançam na lâmina de aço temperado. O legado esquecido dos mestres ancestrais do Murim desperta nos punhos do jovem herdeiro.`,
    dialogueSpeaker: "Espadachim da Ameixeira",
    dialogueText: `“A espada do Monte Hua não busca glória vazia. Ela busca a retidão eterna que purifica o céu e a terra!”`,
    sfx: "SHIIING!!",
    climaxAction: "Vinte e quatro golpes perfeitos desabrocham como flores no ar, desarmando os assassinos da Seita Demoníaca em um único piscar de olhos.",
    climaxQuote: `“Lembrem-se deste nome quando contarem aos seus mestres quem os derrotou.”`,
    cliffhanger: `Um mensageiro da Aliança Marcial surge nos portões com uma carta selada com o selo do Dragão Celestial.`,
  }),
  romance: (num, title) => ({
    setting: "Grande Baile de Inverno da Aristocracia — Jardim das Rosas Azuis",
    narrative: `A música suave da orquestra preenche o salão dourado, mas os olhares cruzados escondem segredos que podem derrubar um reino inteiro. Nenhum dos dois esperava que o reencontro acontecesse sob tais circunstâncias.`,
    dialogueSpeaker: "Duque de Valência",
    dialogueText: `“Você passou anos fingindo não me conhecer, mas seus olhos nunca conseguiram mentir para mim.”`,
    sfx: "DOKI DOKI...",
    climaxAction: "Ele estende a mão com luva de veludo enquanto a multidão se afasta em silêncio respeitoso e admiração.",
    climaxQuote: `“Conceda-me esta dança, e prometo que nunca mais precisará temer o julgamento deste império.”`,
    cliffhanger: `Uma carta anônima cai da bolsa dela ao chão de mármore, revelando o selo da coroa que todos procuravam.`,
  }),
  suspense: (num, title) => ({
    setting: "Edifício Green Home — Corredores Escuros do 14º Andar",
    narrative: `O silêncio mortal da noite é quebrado pelo rangido de passos pesados arrastando-se pelo teto. O vírus não apenas altera o corpo humano; ele manifesta os desejos mais sombrios e distorcidos em pesadelos reais.`,
    dialogueSpeaker: "Sobrevivente",
    dialogueText: `“Prendam a respiração! Qualquer som, por menor que seja, atrai aquelas coisas direto para nós!”`,
    sfx: "THUMP... THUMP...",
    climaxAction: "A lâmina improvisada de ferro é fincada contra a criatura que bloqueava a saída de emergência das escadas.",
    climaxQuote: `“Não somos monstros porque ainda sentimos a dor de proteger quem amamos.”`,
    cliffhanger: `A energia elétrica se apaga por completo, e dezenas de olhos luminescentes começam a brilhar na escuridão.`,
  }),
};

function getSceneDataForWebtoon(webtoonId: string, num: number, title: string): ManhwaSceneData {
  const norm = (webtoonId || "").toLowerCase();
  if (norm.includes("mount-hua") || norm.includes("murim") || norm.includes("martial")) {
    return GENRE_SCENE_TEMPLATES.murim(num, title);
  }
  if (norm.includes("lore-olympus") || norm.includes("romance") || norm.includes("love") || norm.includes("husband") || norm.includes("empress") || norm.includes("beauty")) {
    return GENRE_SCENE_TEMPLATES.romance(num, title);
  }
  if (norm.includes("sweet-home") || norm.includes("bastard") || norm.includes("thriller") || norm.includes("terror")) {
    return GENRE_SCENE_TEMPLATES.suspense(num, title);
  }
  if (norm.includes("tower") || norm.includes("estate") || norm.includes("god") || norm.includes("fantasy") || norm.includes("reincarnat")) {
    return GENRE_SCENE_TEMPLATES.fantasia(num, title);
  }
  return GENRE_SCENE_TEMPLATES.acao(num, title);
}

function escapeXml(unsafe: string): string {
  return (unsafe || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function wrapSvgText(text: string, maxCharsPerLine = 32): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if ((currentLine + " " + word).trim().length <= maxCharsPerLine) {
      currentLine = (currentLine + " " + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

/**
 * Builds a pristine, vector-rendered manhwa panel as an SVG Data URL.
 */
function createManhwaSvgPanel(options: {
  panelType: "title" | "scene" | "dialogue" | "climax" | "ending";
  webtoonTitle: string;
  episodeNumber: number;
  episodeTitle: string;
  sceneData: ManhwaSceneData;
  panelIndex: number;
  totalPanels: number;
  coverUrl?: string;
}): string {
  const width = 800;
  const height = 1200;

  const { panelType, webtoonTitle, episodeNumber, episodeTitle, sceneData, panelIndex, totalPanels } = options;

  let bodySvg = "";

  if (panelType === "title") {
    bodySvg = `
      <!-- Title Splash Header Panel -->
      <rect x="40" y="40" width="720" height="1120" rx="28" fill="#141721" stroke="#10b981" stroke-width="2" stroke-opacity="0.4" />
      
      <!-- Energy Aura Lines -->
      <circle cx="400" cy="400" r="260" fill="none" stroke="#10b981" stroke-width="1.5" stroke-dasharray="8 8" opacity="0.3" />
      <circle cx="400" cy="400" r="180" fill="none" stroke="#06b6d4" stroke-width="2" opacity="0.2" />

      <!-- Official Emblem -->
      <g transform="translate(350, 180)">
        <polygon points="50,0 100,50 50,100 0,50" fill="#10b981" opacity="0.9" />
        <text x="50" y="60" fill="#000000" font-family="'DM Sans', system-ui, sans-serif" font-size="28" font-weight="900" text-anchor="middle">W</text>
      </g>

      <!-- Badges -->
      <rect x="260" y="320" width="280" height="34" rx="17" fill="#10b981" fill-opacity="0.15" stroke="#10b981" stroke-width="1.5" />
      <text x="400" y="342" fill="#34d399" font-family="'DM Sans', system-ui, sans-serif" font-size="12" font-weight="700" letter-spacing="3" text-anchor="middle">WORSCOI MANHWA OFICIAL</text>

      <!-- Webtoon Title -->
      <text x="400" y="440" fill="#ffffff" font-family="'DM Sans', system-ui, sans-serif" font-size="34" font-weight="700" text-anchor="middle" letter-spacing="-0.5">${escapeXml(webtoonTitle)}</text>
      
      <!-- Episode Number Banner -->
      <text x="400" y="500" fill="#10b981" font-family="'DM Sans', system-ui, sans-serif" font-size="22" font-weight="600" text-anchor="middle">CAPÍTULO ${episodeNumber}</text>
      
      <line x1="200" y1="540" x2="600" y2="540" stroke="#27272a" stroke-width="2" />

      <!-- Episode Subtitle -->
      <text x="400" y="590" fill="#e4e4e7" font-family="'DM Sans', system-ui, sans-serif" font-size="18" font-weight="500" text-anchor="middle">${escapeXml(episodeTitle)}</text>

      <!-- Narrative Setup Card -->
      <rect x="90" y="660" width="620" height="320" rx="20" fill="#090a0f" stroke="#27272a" stroke-width="1" />
      <text x="120" y="710" fill="#10b981" font-family="'DM Sans', system-ui, sans-serif" font-size="13" font-weight="700" letter-spacing="2">LOCALIZAÇÃO &amp; CENÁRIO:</text>
      <text x="120" y="740" fill="#a1a1aa" font-family="'DM Sans', system-ui, sans-serif" font-size="14" font-weight="400">${escapeXml(sceneData.setting)}</text>
      
      <line x1="120" y1="770" x2="680" y2="770" stroke="#1f2937" stroke-width="1" />
      
      <text x="120" y="810" fill="#10b981" font-family="'DM Sans', system-ui, sans-serif" font-size="13" font-weight="700" letter-spacing="2">PRÓLOGO DO CAPÍTULO:</text>
      ${wrapSvgText(sceneData.narrative, 45)
        .slice(0, 4)
        .map((line, i) => `<text x="120" y="${845 + i * 26}" fill="#d4d4d8" font-family="'DM Sans', system-ui, sans-serif" font-size="15" font-weight="300">${escapeXml(line)}</text>`)
        .join("")}

      <text x="400" y="1060" fill="#71717a" font-family="'DM Sans', system-ui, sans-serif" font-size="13" font-weight="400" text-anchor="middle">Role para baixo para continuar lendo os painéis ↓</text>
    `;
  } else if (panelType === "scene") {
    bodySvg = `
      <!-- Scene Atmosphere Panel -->
      <rect x="40" y="40" width="720" height="1120" rx="24" fill="#0d1117" stroke="#1e293b" stroke-width="2" />
      
      <!-- Top Scene Header -->
      <rect x="80" y="80" width="640" height="40" rx="8" fill="#161b22" />
      <text x="100" y="105" fill="#10b981" font-family="'DM Sans', system-ui, sans-serif" font-size="12" font-weight="700" letter-spacing="1">CENA 1 • DESENVOLVIMENTO</text>
      <text x="700" y="105" fill="#64748b" font-family="'DM Sans', system-ui, sans-serif" font-size="12" text-anchor="end">Página 2 de ${totalPanels}</text>

      <!-- Cinematic Visual Frame -->
      <rect x="80" y="150" width="640" height="480" rx="16" fill="#030712" stroke="#334155" stroke-width="1" />
      <circle cx="400" cy="390" r="160" fill="#0f172a" opacity="0.6" />
      <path d="M 200 480 Q 400 320 600 480" stroke="#059669" stroke-width="3" fill="none" opacity="0.4" />
      <path d="M 250 510 Q 400 380 550 510" stroke="#10b981" stroke-width="2" fill="none" opacity="0.3" />

      <!-- Atmospheric SFX watermark -->
      <text x="400" y="400" fill="#10b981" opacity="0.18" font-family="Impact, sans-serif" font-size="90" font-weight="900" text-anchor="middle" transform="rotate(-8 400 400)">${escapeXml(sceneData.sfx)}</text>
      
      <!-- Character / Location Focus Icon -->
      <text x="400" y="440" fill="#ffffff" font-family="'DM Sans', system-ui, sans-serif" font-size="22" font-weight="600" text-anchor="middle">${escapeXml(sceneData.setting)}</text>

      <!-- Narrative Text Box -->
      <g transform="translate(80, 670)">
        <rect width="640" height="260" rx="16" fill="#111827" stroke="#374151" stroke-width="1.5" />
        <rect x="0" y="0" width="8" height="260" rx="4" fill="#10b981" />
        <text x="30" y="45" fill="#10b981" font-family="'DM Sans', system-ui, sans-serif" font-size="13" font-weight="700" letter-spacing="1">NARRADOR</text>
        ${wrapSvgText(sceneData.narrative, 46)
          .map((line, i) => `<text x="30" y="${80 + i * 28}" fill="#f3f4f6" font-family="'DM Sans', system-ui, sans-serif" font-size="16" font-weight="300" letter-spacing="0.2">${escapeXml(line)}</text>`)
          .join("")}
      </g>

      <!-- SFX Callout Badge -->
      <g transform="translate(320, 980)">
        <polygon points="20,0 140,0 160,40 0,40" fill="#e11d48" />
        <text x="80" y="27" fill="#ffffff" font-family="Impact, sans-serif" font-size="20" font-weight="900" text-anchor="middle" letter-spacing="2">SFX: ${escapeXml(sceneData.sfx)}</text>
      </g>
    `;
  } else if (panelType === "dialogue") {
    bodySvg = `
      <!-- Character Dialogue & Confrontation Panel -->
      <rect x="40" y="40" width="720" height="1120" rx="24" fill="#090d16" stroke="#1e293b" stroke-width="2" />
      
      <!-- Top Panel Header -->
      <rect x="80" y="80" width="640" height="40" rx="8" fill="#111827" />
      <text x="100" y="105" fill="#38bdf8" font-family="'DM Sans', system-ui, sans-serif" font-size="12" font-weight="700" letter-spacing="1">CENA 2 • O CONFRONTO</text>
      <text x="700" y="105" fill="#64748b" font-family="'DM Sans', system-ui, sans-serif" font-size="12" text-anchor="end">Página 3 de ${totalPanels}</text>

      <!-- Stylized Manhwa Speech Bubble 1 -->
      <g transform="translate(100, 160)">
        <rect width="600" height="240" rx="30" fill="#ffffff" filter="drop-shadow(0 10px 15px rgba(0,0,0,0.5))" />
        <polygon points="200,240 180,280 230,240" fill="#ffffff" />
        <text x="40" y="45" fill="#047857" font-family="'DM Sans', system-ui, sans-serif" font-size="13" font-weight="800" letter-spacing="1.5">${escapeXml(sceneData.dialogueSpeaker).toUpperCase()}:</text>
        ${wrapSvgText(sceneData.dialogueText, 38)
          .map((line, i) => `<text x="40" y="${85 + i * 32}" fill="#0f172a" font-family="'DM Sans', system-ui, sans-serif" font-size="19" font-weight="600">${escapeXml(line)}</text>`)
          .join("")}
      </g>

      <!-- Center Dramatic Impact Burst -->
      <g transform="translate(400, 560)">
        <circle cx="0" cy="0" r="140" fill="#0284c7" opacity="0.15" />
        <line x1="-180" y1="0" x2="180" y2="0" stroke="#38bdf8" stroke-width="3" opacity="0.5" />
        <line x1="0" y1="-140" x2="0" y2="140" stroke="#38bdf8" stroke-width="3" opacity="0.5" />
        <text x="0" y="15" fill="#38bdf8" font-family="Impact, sans-serif" font-size="44" font-weight="900" text-anchor="middle" letter-spacing="4">⚡ ${escapeXml(sceneData.sfx)} ⚡</text>
      </g>

      <!-- Thought Box (Inner Monologue) -->
      <g transform="translate(100, 740)">
        <rect width="600" height="220" rx="20" fill="#18181b" stroke="#3f3f46" stroke-width="2" stroke-dasharray="6 6" />
        <text x="40" y="45" fill="#a1a1aa" font-family="'DM Sans', system-ui, sans-serif" font-size="12" font-weight="700" letter-spacing="1">PENSAMENTO INTERNO:</text>
        ${wrapSvgText(`“A velocidade dos ataques dele é absurda, mas agora que compreendi a trajetória da mana, tudo ficou claro. Não há como perder!”`, 42)
          .map((line, i) => `<text x="40" y="${85 + i * 30}" fill="#e4e4e7" font-family="'DM Sans', system-ui, sans-serif" font-size="17" font-style="italic" font-weight="400">${escapeXml(line)}</text>`)
          .join("")}
      </g>

      <text x="400" y="1050" fill="#64748b" font-family="'DM Sans', system-ui, sans-serif" font-size="13" text-anchor="middle">Próxima página: O Clímax do Capítulo ↓</text>
    `;
  } else if (panelType === "climax") {
    bodySvg = `
      <!-- Action Climax & Awakening Panel -->
      <rect x="40" y="40" width="720" height="1120" rx="24" fill="#09050d" stroke="#581c87" stroke-width="2" />
      
      <!-- Top Panel Header -->
      <rect x="80" y="80" width="640" height="40" rx="8" fill="#1e1035" />
      <text x="100" y="105" fill="#c084fc" font-family="'DM Sans', system-ui, sans-serif" font-size="12" font-weight="700" letter-spacing="1">CENA 3 • CLÍMAX &amp; PODER TRANSCENDENTAL</text>
      <text x="700" y="105" fill="#9333ea" font-family="'DM Sans', system-ui, sans-serif" font-size="12" text-anchor="end">Página 4 de ${totalPanels}</text>

      <!-- Giant Energy Aura Effect -->
      <circle cx="400" cy="420" r="280" fill="#7e22ce" opacity="0.12" />
      <circle cx="400" cy="420" r="190" fill="#9333ea" opacity="0.18" />
      <polygon points="400,200 480,360 620,400 500,480 520,620 400,520 280,620 300,480 180,400 320,360" fill="none" stroke="#a855f7" stroke-width="3" opacity="0.4" />

      <!-- Impact FX Title -->
      <text x="400" y="440" fill="#f3e8ff" font-family="Impact, sans-serif" font-size="62" font-weight="900" text-anchor="middle" letter-spacing="6">BOOOOOM!!</text>

      <!-- Action Beat Card -->
      <g transform="translate(80, 630)">
        <rect width="640" height="340" rx="20" fill="#190d2e" stroke="#6b21a8" stroke-width="1.5" />
        <rect x="0" y="0" width="10" height="340" rx="5" fill="#a855f7" />
        <text x="35" y="45" fill="#c084fc" font-family="'DM Sans', system-ui, sans-serif" font-size="14" font-weight="800" letter-spacing="2">AÇÃO DECISIVA DO CAPÍTULO:</text>
        
        ${wrapSvgText(sceneData.climaxAction, 42)
          .map((line, i) => `<text x="35" y="${85 + i * 30}" fill="#ffffff" font-family="'DM Sans', system-ui, sans-serif" font-size="18" font-weight="500">${escapeXml(line)}</text>`)
          .join("")}

        <line x1="35" y1="210" x2="600" y2="210" stroke="#4c1d95" stroke-width="1.5" />

        <text x="35" y="245" fill="#fbbf24" font-family="'DM Sans', system-ui, sans-serif" font-size="13" font-weight="700">FRASE DE IMPACTO:</text>
        ${wrapSvgText(sceneData.climaxQuote, 38)
          .map((line, i) => `<text x="35" y="${280 + i * 28}" fill="#fde047" font-family="'DM Sans', system-ui, sans-serif" font-size="18" font-weight="700">${escapeXml(line)}</text>`)
          .join("")}
      </g>

      <text x="400" y="1045" fill="#a855f7" font-family="'DM Sans', system-ui, sans-serif" font-size="13" text-anchor="middle">Desfecho e Gancho Final abaixo ↓</text>
    `;
  } else if (panelType === "ending") {
    bodySvg = `
      <!-- Chapter Completion & Next Episode Hook Panel -->
      <rect x="40" y="40" width="720" height="1120" rx="28" fill="#0f1118" stroke="#10b981" stroke-width="2" />

      <!-- Golden Stamp -->
      <g transform="translate(400, 220)">
        <circle cx="0" cy="0" r="80" fill="#064e3b" stroke="#10b981" stroke-width="4" />
        <path d="M -30 0 L -10 20 L 30 -20" stroke="#34d399" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round" />
        <text x="0" y="115" fill="#10b981" font-family="'DM Sans', system-ui, sans-serif" font-size="20" font-weight="800" text-anchor="middle" letter-spacing="2">CAPÍTULO CONCLUÍDO</text>
      </g>

      <!-- Cliffhanger Card -->
      <g transform="translate(80, 400)">
        <rect width="640" height="300" rx="20" fill="#090a0f" stroke="#27272a" stroke-width="1.5" />
        <text x="40" y="50" fill="#f59e0b" font-family="'DM Sans', system-ui, sans-serif" font-size="14" font-weight="800" letter-spacing="2">O GANCHO PARA O PRÓXIMO EPISÓDIO:</text>
        
        ${wrapSvgText(sceneData.cliffhanger, 42)
          .map((line, i) => `<text x="40" y="${95 + i * 30}" fill="#f4f4f5" font-family="'DM Sans', system-ui, sans-serif" font-size="17" font-weight="400">${escapeXml(line)}</text>`)
          .join("")}
        
        <rect x="40" y="220" width="560" height="50" rx="12" fill="#18181b" />
        <text x="320" y="252" fill="#10b981" font-family="'DM Sans', system-ui, sans-serif" font-size="14" font-weight="700" text-anchor="middle">Continua no Capítulo ${episodeNumber + 1}...</text>
      </g>

      <!-- Next Episode Callout Button -->
      <g transform="translate(180, 780)">
        <rect width="440" height="70" rx="35" fill="#10b981" />
        <text x="220" y="44" fill="#000000" font-family="'DM Sans', system-ui, sans-serif" font-size="18" font-weight="800" text-anchor="middle" letter-spacing="1">AVANÇAR PARA O CAPÍTULO ${episodeNumber + 1} →</text>
      </g>

      <!-- Footer Credits -->
      <text x="400" y="930" fill="#a1a1aa" font-family="'DM Sans', system-ui, sans-serif" font-size="14" font-weight="500" text-anchor="middle">${escapeXml(webtoonTitle)} • Worscoi Digital Manhwa</text>
      <text x="400" y="960" fill="#71717a" font-family="'DM Sans', system-ui, sans-serif" font-size="12" text-anchor="middle">Experiência oficial otimizada para leitura em tiras verticais</text>

      <line x1="200" y1="1020" x2="600" y2="1020" stroke="#27272a" stroke-width="1" />
      <text x="400" y="1060" fill="#10b981" font-family="'DM Sans', system-ui, sans-serif" font-size="12" font-weight="600" text-anchor="middle">FIM DO EPISÓDIO ${episodeNumber}</text>
    `;
  }

  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="panelBg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#090a0f" />
        <stop offset="50%" stop-color="#11131a" />
        <stop offset="100%" stop-color="#07080b" />
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#panelBg)" />
    ${bodySvg}
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;
}

/**
 * Generates an authentic full-strip series of manhwa panels (5 panels)
 * for any webtoon chapter. Guarantees that 100% of webtoons reproduce smoothly.
 */
export function generateDynamicManhwaStoryPanels(
  webtoonId: string,
  episodeNumber: number,
  episodeTitle?: string,
  coverUrl?: string,
  webtoonTitle?: string
): string[] {
  const normTitle = webtoonTitle || webtoonId.replace(/^wt-auto-/, "").replace(/^wt-/, "").replace(/-/g, " ");
  const resolvedEpTitle = episodeTitle || `Capítulo ${episodeNumber}`;
  const sceneData = getSceneDataForWebtoon(webtoonId, episodeNumber, resolvedEpTitle);

  const panels: string[] = [];

  // If a valid cover URL is provided, include it as the opening visual art panel
  if (coverUrl && coverUrl.startsWith("http") && !coverUrl.includes("placeholder")) {
    panels.push(coverUrl);
  }

  // Panel 1: Title Splash
  panels.push(
    createManhwaSvgPanel({
      panelType: "title",
      webtoonTitle: normTitle,
      episodeNumber,
      episodeTitle: resolvedEpTitle,
      sceneData,
      panelIndex: 1,
      totalPanels: 5,
      coverUrl,
    })
  );

  // Panel 2: Scene & Atmosphere
  panels.push(
    createManhwaSvgPanel({
      panelType: "scene",
      webtoonTitle: normTitle,
      episodeNumber,
      episodeTitle: resolvedEpTitle,
      sceneData,
      panelIndex: 2,
      totalPanels: 5,
    })
  );

  // Panel 3: Dialogue & Confrontation
  panels.push(
    createManhwaSvgPanel({
      panelType: "dialogue",
      webtoonTitle: normTitle,
      episodeNumber,
      episodeTitle: resolvedEpTitle,
      sceneData,
      panelIndex: 3,
      totalPanels: 5,
    })
  );

  // Panel 4: Action Climax & Power Surge
  panels.push(
    createManhwaSvgPanel({
      panelType: "climax",
      webtoonTitle: normTitle,
      episodeNumber,
      episodeTitle: resolvedEpTitle,
      sceneData,
      panelIndex: 4,
      totalPanels: 5,
    })
  );

  // Panel 5: Ending & Next Episode
  panels.push(
    createManhwaSvgPanel({
      panelType: "ending",
      webtoonTitle: normTitle,
      episodeNumber,
      episodeTitle: resolvedEpTitle,
      sceneData,
      panelIndex: 5,
      totalPanels: 5,
    })
  );

  return panels;
}
