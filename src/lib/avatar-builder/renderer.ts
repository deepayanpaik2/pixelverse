import {
  AvatarConfig,
  SkinToneId,
  FaceId,
  HairStyleId,
  HairColorId,
  OutfitId,
  HeadwearId,
  BackGearId,
  BackgroundStageId,
} from './types';

// Helper color lookups
const SKIN_PALETTE: Record<SkinToneId, { main: string; shadow: string; line: string }> = {
  fair: { main: '#ffd8be', shadow: '#f4b896', line: '#d89470' },
  warm: { main: '#f3bc92', shadow: '#d69766', line: '#b57442' },
  tan: { main: '#d19467', shadow: '#ad6c3f', line: '#884b23' },
  deep: { main: '#8d5632', shadow: '#613417', line: '#43200b' },
  'cyber-blue': { main: '#38e1d7', shadow: '#15ada3', line: '#00f3ff' },
  'gold-mecha': { main: '#fcd34d', shadow: '#d97706', line: '#fef08a' },
  'neon-violet': { main: '#e879f9', shadow: '#a855f7', line: '#f43f5e' },
  'shadow-noir': { main: '#334155', shadow: '#1e293b', line: '#818cf8' },
  'emerald-alien': { main: '#86efac', shadow: '#10b981', line: '#34d399' },
  hologram: { main: '#7dd3fc', shadow: '#0284c7', line: '#38bdf8' },
};

const HAIR_PALETTE: Record<HairColorId, { main: string; dark: string; light: string; glow: string }> = {
  'neon-cyan': { main: '#00f3ff', dark: '#0891b2', light: '#a5f3fc', glow: 'rgba(0, 243, 255, 0.6)' },
  'platinum-white': { main: '#f1f5f9', dark: '#94a3b8', light: '#ffffff', glow: 'rgba(255, 255, 255, 0.5)' },
  'hot-pink': { main: '#ff2a85', dark: '#be123c', light: '#fbcfe8', glow: 'rgba(255, 42, 133, 0.6)' },
  'flame-orange': { main: '#ff7b00', dark: '#c2410c', light: '#fed7aa', glow: 'rgba(255, 123, 0, 0.6)' },
  'golden-sun': { main: '#facc15', dark: '#a16207', light: '#fef08a', glow: 'rgba(250, 204, 21, 0.5)' },
  'toxic-green': { main: '#10b981', dark: '#047857', light: '#a7f3d0', glow: 'rgba(16, 185, 129, 0.6)' },
  'void-purple': { main: '#a855f7', dark: '#6b21a8', light: '#e9d5ff', glow: 'rgba(168, 85, 247, 0.6)' },
  'midnight-blue': { main: '#38bdf8', dark: '#1d4ed8', light: '#bae6fd', glow: 'rgba(56, 189, 248, 0.5)' },
  'jet-black': { main: '#18181b', dark: '#09090b', light: '#3f3f46', glow: 'rgba(39, 39, 42, 0.5)' },
};

function renderBackground(bg: BackgroundStageId): string {
  switch (bg) {
    case 'cyber-grid':
      return `
        <defs>
          <linearGradient id="bg-synth" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#180728" />
            <stop offset="60%" stop-color="#3b0764" />
            <stop offset="100%" stop-color="#ff2a85" />
          </linearGradient>
          <radialGradient id="sun-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#ffedd5" />
            <stop offset="60%" stop-color="#fb7185" />
            <stop offset="100%" stop-color="#ff2a85" stop-opacity="0" />
          </radialGradient>
        </defs>
        <rect width="400" height="400" fill="url(#bg-synth)" />
        <circle cx="200" cy="180" r="110" fill="url(#sun-glow)" opacity="0.65" />
        <path d="M0,280 L400,280 M0,305 L400,305 M0,335 L400,335 M0,370 L400,370" stroke="#00f5d4" stroke-width="1.2" opacity="0.4" />
        <path d="M200,270 L0,400 M200,270 L80,400 M200,270 L140,400 M200,270 L200,400 M200,270 L260,400 M200,270 L320,400 M200,270 L400,400" stroke="#00f5d4" stroke-width="1.2" opacity="0.35" />
      `;
    case 'cosmic-stars':
      return `
        <defs>
          <radialGradient id="bg-nebula" cx="60%" cy="40%" r="70%">
            <stop offset="0%" stop-color="#7c3aed" stop-opacity="0.8" />
            <stop offset="50%" stop-color="#1e1b4b" stop-opacity="0.9" />
            <stop offset="100%" stop-color="#020617" />
          </radialGradient>
        </defs>
        <rect width="400" height="400" fill="#020617" />
        <circle cx="260" cy="160" r="160" fill="url(#bg-nebula)" />
        <circle cx="80" cy="60" r="2" fill="#ffffff" opacity="0.8" />
        <circle cx="340" cy="80" r="1.5" fill="#a5f3fc" opacity="0.9" />
        <circle cx="310" cy="240" r="2.5" fill="#fbcfe8" opacity="0.7" />
        <circle cx="50" cy="220" r="1.5" fill="#fef08a" opacity="0.8" />
        <circle cx="160" cy="30" r="1.8" fill="#ffffff" opacity="0.9" />
        <circle cx="370" cy="320" r="2" fill="#67e8f9" opacity="0.6" />
        <circle cx="110" cy="360" r="1.2" fill="#ffffff" opacity="0.7" />
      `;
    case 'bloodforge':
      return `
        <defs>
          <linearGradient id="bg-forge" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#1a0508" />
            <stop offset="70%" stop-color="#450a0a" />
            <stop offset="100%" stop-color="#ff1e42" />
          </linearGradient>
        </defs>
        <rect width="400" height="400" fill="url(#bg-forge)" />
        <polygon points="50,400 90,320 130,400" fill="#ff7b00" opacity="0.25" />
        <polygon points="270,400 310,310 350,400" fill="#ff1e42" opacity="0.3" />
        <polygon points="170,400 200,340 230,400" fill="#facc15" opacity="0.2" />
        <circle cx="70" cy="140" r="3" fill="#ff7b00" opacity="0.6" />
        <circle cx="330" cy="170" r="2.5" fill="#ff1e42" opacity="0.7" />
      `;
    case 'emerald-matrix':
      return `
        <rect width="400" height="400" fill="#02140d" />
        <path d="M40,0 L40,400 M90,0 L90,400 M140,0 L140,400 M190,0 L190,400 M240,0 L240,400 M290,0 L290,400 M340,0 L340,400" stroke="#10b981" stroke-width="1" stroke-dasharray="6,12" opacity="0.25" />
        <circle cx="200" cy="200" r="150" fill="none" stroke="#10b981" stroke-width="1.5" stroke-dasharray="10,25" opacity="0.3" />
      `;
    case 'golden-hall':
      return `
        <defs>
          <radialGradient id="bg-gold" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stop-color="#78350f" />
            <stop offset="60%" stop-color="#291e0a" />
            <stop offset="100%" stop-color="#0c0a04" />
          </radialGradient>
        </defs>
        <rect width="400" height="400" fill="url(#bg-gold)" />
        <circle cx="200" cy="120" r="130" fill="#facc15" opacity="0.12" />
        <line x1="200" y1="0" x2="100" y2="400" stroke="#facc15" stroke-width="1.5" opacity="0.15" />
        <line x1="200" y1="0" x2="300" y2="400" stroke="#facc15" stroke-width="1.5" opacity="0.15" />
      `;
    case 'deep-void':
      return `
        <rect width="400" height="400" fill="#090a0f" />
        <circle cx="200" cy="200" r="140" fill="none" stroke="#ffffff" stroke-width="1" opacity="0.1" />
        <circle cx="200" cy="200" r="160" fill="none" stroke="#818cf8" stroke-width="0.75" stroke-dasharray="8,16" opacity="0.2" />
      `;
    case 'neon-city':
    default:
      return `
        <defs>
          <linearGradient id="bg-city" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#050814" />
            <stop offset="65%" stop-color="#0c1733" />
            <stop offset="100%" stop-color="#00f3ff" stop-opacity="0.2" />
          </linearGradient>
        </defs>
        <rect width="400" height="400" fill="url(#bg-city)" />
        <rect x="30" y="220" width="45" height="180" fill="#030712" opacity="0.8" />
        <rect x="90" y="170" width="55" height="230" fill="#040b1e" opacity="0.9" />
        <rect x="260" y="190" width="50" height="210" fill="#040b1e" opacity="0.9" />
        <rect x="325" y="240" width="50" height="160" fill="#030712" opacity="0.8" />
        <line x1="115" y1="185" x2="115" y2="380" stroke="#00f3ff" stroke-width="1" stroke-dasharray="4,8" opacity="0.5" />
        <line x1="285" y1="205" x2="285" y2="380" stroke="#f43f5e" stroke-width="1" stroke-dasharray="4,8" opacity="0.5" />
      `;
  }
}

function renderBackGear(gear: BackGearId): string {
  switch (gear) {
    case 'cyber-wings':
      return `
        <g id="gear-cyber-wings" opacity="0.95">
          <!-- Left Wing -->
          <polygon points="120,210 20,130 50,180 15,220 70,230 40,270 120,250" fill="#00f3ff" opacity="0.3" />
          <polygon points="120,210 30,140 60,185 30,220 80,230 120,245" fill="none" stroke="#00f3ff" stroke-width="2.5" />
          <line x1="120" y1="215" x2="40" y2="150" stroke="#ffffff" stroke-width="1.8" />
          <line x1="120" y1="225" x2="50" y2="200" stroke="#f43f5e" stroke-width="1.8" />
          <!-- Right Wing -->
          <polygon points="280,210 380,130 350,180 385,220 330,230 360,270 280,250" fill="#00f3ff" opacity="0.3" />
          <polygon points="280,210 370,140 340,185 370,220 320,230 280,245" fill="none" stroke="#00f3ff" stroke-width="2.5" />
          <line x1="280" y1="215" x2="360" y2="150" stroke="#ffffff" stroke-width="1.8" />
          <line x1="280" y1="225" x2="350" y2="200" stroke="#f43f5e" stroke-width="1.8" />
        </g>
      `;
    case 'dual-katanas':
      return `
        <g id="gear-dual-katanas">
          <!-- Katana 1 (\) -->
          <rect x="70" y="60" width="10" height="280" rx="3" transform="rotate(-35 75 200)" fill="#1e293b" stroke="#facc15" stroke-width="1.5" />
          <rect x="70" y="60" width="10" height="70" rx="2" transform="rotate(-35 75 200)" fill="#0f172a" />
          <line x1="30" y1="120" x2="50" y2="135" stroke="#facc15" stroke-width="4" stroke-linecap="round" />
          <!-- Katana 2 (/) -->
          <rect x="320" y="60" width="10" height="280" rx="3" transform="rotate(35 325 200)" fill="#1e293b" stroke="#facc15" stroke-width="1.5" />
          <rect x="320" y="60" width="10" height="70" rx="2" transform="rotate(35 325 200)" fill="#0f172a" />
          <line x1="370" y1="120" x2="350" y2="135" stroke="#facc15" stroke-width="4" stroke-linecap="round" />
        </g>
      `;
    case 'plasma-jetpack':
      return `
        <g id="gear-plasma-jetpack">
          <!-- Thruster Left -->
          <rect x="90" y="170" width="35" height="90" rx="10" fill="#334155" stroke="#00f3ff" stroke-width="2" />
          <polygon points="95,260 107,310 120,260" fill="#00f3ff" opacity="0.8" />
          <polygon points="100,260 107,295 115,260" fill="#ffffff" />
          <!-- Thruster Right -->
          <rect x="275" y="170" width="35" height="90" rx="10" fill="#334155" stroke="#00f3ff" stroke-width="2" />
          <polygon points="280,260 292,310 305,260" fill="#00f3ff" opacity="0.8" />
          <polygon points="285,260 292,295 300,260" fill="#ffffff" />
        </g>
      `;
    case 'cyber-ring':
      return `
        <g id="gear-cyber-ring">
          <circle cx="200" cy="200" r="145" fill="none" stroke="#a855f7" stroke-width="3" stroke-dasharray="14,10" opacity="0.8" />
          <circle cx="200" cy="200" r="130" fill="none" stroke="#00f3ff" stroke-width="1.5" opacity="0.5" />
          <rect x="195" y="50" width="10" height="10" transform="rotate(45 200 55)" fill="#00f3ff" />
          <rect x="195" y="340" width="10" height="10" transform="rotate(45 200 345)" fill="#00f3ff" />
          <rect x="50" y="195" width="10" height="10" transform="rotate(45 55 200)" fill="#a855f7" />
          <rect x="340" y="195" width="10" height="10" transform="rotate(45 345 200)" fill="#a855f7" />
        </g>
      `;
    case 'thunder-aura':
      return `
        <g id="gear-thunder-aura" stroke="#38bdf8" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path d="M70,160 L90,190 L75,210 L100,240" />
          <path d="M330,160 L310,190 L325,210 L300,240" />
          <path d="M110,100 L130,130 L120,145" stroke="#ffffff" />
          <path d="M290,100 L270,130 L280,145" stroke="#ffffff" />
        </g>
      `;
    case 'angel-wings':
      return `
        <g id="gear-angel-wings" fill="#fef08a" opacity="0.85">
          <path d="M120,220 C60,180 20,130 50,70 C80,120 90,160 120,190 Z" />
          <path d="M120,240 C50,220 30,170 50,120 C80,160 90,190 120,210 Z" fill="#ffffff" />
          <path d="M280,220 C340,180 380,130 350,70 C320,120 310,160 280,190 Z" />
          <path d="M280,240 C350,220 370,170 350,120 C320,160 310,190 280,210 Z" fill="#ffffff" />
        </g>
      `;
    case 'none':
    default:
      return '';
  }
}

function renderBody(skin: SkinToneId): string {
  const c = SKIN_PALETTE[skin];
  return `
    <g id="avatar-body">
      <!-- Neck -->
      <rect x="175" y="240" width="50" height="45" rx="8" fill="${c.shadow}" />
      
      <!-- Head / Face Base Shape (Roblox-style iconic rounded cube) -->
      <rect x="125" y="105" width="150" height="145" rx="38" fill="${c.main}" />
      
      <!-- Subtle 3D Cheek/Jaw Shading -->
      <path d="M125,210 C140,245 260,245 275,210 L275,225 C260,255 140,255 125,225 Z" fill="${c.shadow}" opacity="0.6" />
      
      <!-- Ears -->
      <rect x="115" y="155" width="14" height="28" rx="6" fill="${c.shadow}" />
      <rect x="271" y="155" width="14" height="28" rx="6" fill="${c.shadow}" />
      
      <!-- Cyber Seams for Cyber Skins -->
      ${skin === 'cyber-blue' || skin === 'gold-mecha' || skin === 'emerald-alien' || skin === 'shadow-noir'
        ? `<line x1="140" y1="130" x2="140" y2="180" stroke="${c.line}" stroke-width="1.8" opacity="0.8" />
           <circle cx="140" cy="180" r="3" fill="${c.line}" />
           <line x1="260" y1="130" x2="260" y2="180" stroke="${c.line}" stroke-width="1.8" opacity="0.8" />
           <circle cx="260" cy="180" r="3" fill="${c.line}" />`
        : ''
      }
    </g>
  `;
}

function renderFace(face: FaceId, skin: SkinToneId): string {
  const c = SKIN_PALETTE[skin];
  switch (face) {
    case 'cool-smirk':
      return `
        <g id="face-cool-smirk">
          <!-- Left Eye -->
          <ellipse cx="162" cy="165" rx="10" ry="12" fill="#0f172a" />
          <circle cx="165" cy="162" r="3.5" fill="#ffffff" />
          <path d="M150,148 Q165,142 175,150" stroke="#0f172a" stroke-width="3" fill="none" stroke-linecap="round" />
          <!-- Right Eye (Winking / Cocked) -->
          <path d="M225,165 Q237,158 248,165" stroke="#0f172a" stroke-width="3.5" fill="none" stroke-linecap="round" />
          <path d="M224,146 Q236,140 248,145" stroke="#0f172a" stroke-width="3" fill="none" stroke-linecap="round" />
          <!-- Smirk Mouth -->
          <path d="M185,210 Q205,218 222,204" stroke="#0f172a" stroke-width="3.5" fill="none" stroke-linecap="round" />
          <!-- Blush -->
          <circle cx="150" cy="182" r="7" fill="#f43f5e" opacity="0.25" />
          <circle cx="250" cy="182" r="7" fill="#f43f5e" opacity="0.25" />
        </g>
      `;
    case 'anime-eyes':
      return `
        <g id="face-anime-eyes">
          <!-- Left Eye -->
          <ellipse cx="162" cy="165" rx="14" ry="18" fill="#1e1b4b" />
          <ellipse cx="162" cy="168" rx="11" ry="12" fill="#38bdf8" />
          <circle cx="158" cy="158" r="5" fill="#ffffff" />
          <circle cx="167" cy="172" r="2.5" fill="#ffffff" />
          <path d="M146,144 Q162,136 178,144" stroke="#0f172a" stroke-width="3.5" fill="none" stroke-linecap="round" />
          <!-- Right Eye -->
          <ellipse cx="238" cy="165" rx="14" ry="18" fill="#1e1b4b" />
          <ellipse cx="238" cy="168" rx="11" ry="12" fill="#38bdf8" />
          <circle cx="234" cy="158" r="5" fill="#ffffff" />
          <circle cx="243" cy="172" r="2.5" fill="#ffffff" />
          <path d="M222,144 Q238,136 254,144" stroke="#0f172a" stroke-width="3.5" fill="none" stroke-linecap="round" />
          <!-- Cute Mouth -->
          <path d="M192,208 Q200,215 208,208" stroke="#0f172a" stroke-width="3" fill="none" stroke-linecap="round" />
          <!-- Blushes -->
          <ellipse cx="148" cy="188" rx="9" ry="5" fill="#f43f5e" opacity="0.4" />
          <ellipse cx="252" cy="188" rx="9" ry="5" fill="#f43f5e" opacity="0.4" />
        </g>
      `;
    case 'cyber-visor':
      return `
        <g id="face-cyber-visor">
          <!-- Visor Frame -->
          <polygon points="135,150 265,150 258,182 142,182" fill="#030712" stroke="#00f3ff" stroke-width="2.5" />
          <polygon points="139,154 261,154 255,178 145,178" fill="#00f3ff" opacity="0.85" />
          <line x1="150" y1="166" x2="250" y2="166" stroke="#ffffff" stroke-width="2" />
          <circle cx="240" cy="166" r="3" fill="#ff2a85" />
          <!-- Mouth -->
          <line x1="188" y1="210" x2="212" y2="210" stroke="#0f172a" stroke-width="3" stroke-linecap="round" />
        </g>
      `;
    case 'pixel-shades':
      return `
        <g id="face-pixel-shades">
          <!-- Pixel Glasses Left -->
          <rect x="142" y="152" width="48" height="24" fill="#09090b" />
          <rect x="146" y="155" width="8" height="8" fill="#ffffff" />
          <rect x="154" y="163" width="8" height="8" fill="#ffffff" />
          <!-- Pixel Glasses Right -->
          <rect x="210" y="152" width="48" height="24" fill="#09090b" />
          <rect x="214" y="155" width="8" height="8" fill="#ffffff" />
          <rect x="222" y="163" width="8" height="8" fill="#ffffff" />
          <!-- Bridge -->
          <rect x="190" y="156" width="20" height="6" fill="#09090b" />
          <!-- Confident Mouth -->
          <path d="M185,210 Q200,222 215,210" stroke="#0f172a" stroke-width="3.5" fill="none" stroke-linecap="round" />
        </g>
      `;
    case 'cat-face':
      return `
        <g id="face-cat-face">
          <!-- Eyes -->
          <ellipse cx="162" cy="165" rx="9" ry="11" fill="#0f172a" />
          <circle cx="165" cy="163" r="3" fill="#ffffff" />
          <ellipse cx="238" cy="165" rx="9" ry="11" fill="#0f172a" />
          <circle cx="241" cy="163" r="3" fill="#ffffff" />
          <!-- Cat Mouth :3 -->
          <path d="M190,206 Q195,214 200,208 Q205,214 210,206" stroke="#0f172a" stroke-width="3" fill="none" stroke-linecap="round" />
          <!-- Whiskers Left -->
          <line x1="145" y1="185" x2="125" y2="180" stroke="#0f172a" stroke-width="2" stroke-linecap="round" />
          <line x1="145" y1="192" x2="125" y2="195" stroke="#0f172a" stroke-width="2" stroke-linecap="round" />
          <!-- Whiskers Right -->
          <line x1="255" y1="185" x2="275" y2="180" stroke="#0f172a" stroke-width="2" stroke-linecap="round" />
          <line x1="255" y1="192" x2="275" y2="195" stroke="#0f172a" stroke-width="2" stroke-linecap="round" />
        </g>
      `;
    case 'ninja-mask':
      return `
        <g id="face-ninja-mask">
          <!-- Determined Eyes -->
          <path d="M150,158 Q165,152 178,162" stroke="#0f172a" stroke-width="3.5" fill="none" stroke-linecap="round" />
          <ellipse cx="164" cy="166" rx="8" ry="6" fill="#0f172a" />
          <path d="M222,162 Q235,152 250,158" stroke="#0f172a" stroke-width="3.5" fill="none" stroke-linecap="round" />
          <ellipse cx="236" cy="166" rx="8" ry="6" fill="#0f172a" />
          <!-- Mask Fabric covering lower face -->
          <path d="M130,180 Q200,192 270,180 L270,250 L130,250 Z" fill="#0f172a" />
          <path d="M130,180 Q200,192 270,180" stroke="#ff1e42" stroke-width="2.5" fill="none" />
        </g>
      `;
    case 'cyber-eye':
      return `
        <g id="face-cyber-eye">
          <!-- Normal Left Eye -->
          <ellipse cx="162" cy="165" rx="10" ry="12" fill="#0f172a" />
          <circle cx="165" cy="162" r="3.5" fill="#ffffff" />
          <!-- Cyborg Right Eye Lens -->
          <circle cx="238" cy="165" r="15" fill="#030712" stroke="#ff1e42" stroke-width="2" />
          <circle cx="238" cy="165" r="9" fill="#ff1e42" />
          <circle cx="238" cy="165" r="4" fill="#fef08a" />
          <line x1="220" y1="165" x2="256" y2="165" stroke="#ff1e42" stroke-width="1" />
          <line x1="238" y1="147" x2="238" y2="183" stroke="#ff1e42" stroke-width="1" />
          <!-- Mouth -->
          <line x1="186" y1="210" x2="214" y2="208" stroke="#0f172a" stroke-width="3.5" stroke-linecap="round" />
        </g>
      `;
    case 'fire-eyes':
      return `
        <g id="face-fire-eyes">
          <!-- Fire Eyes -->
          <polygon points="152,168 165,152 176,168" fill="#ff7b00" />
          <polygon points="156,168 165,158 172,168" fill="#facc15" />
          <polygon points="224,168 235,152 248,168" fill="#ff7b00" />
          <polygon points="228,168 235,158 244,168" fill="#facc15" />
          <!-- Fierce Brows -->
          <path d="M148,148 L178,156" stroke="#0f172a" stroke-width="3.5" stroke-linecap="round" />
          <path d="M252,148 L222,156" stroke="#0f172a" stroke-width="3.5" stroke-linecap="round" />
          <!-- Fierce Grin -->
          <path d="M185,212 Q200,224 215,212" stroke="#0f172a" stroke-width="3.5" fill="none" stroke-linecap="round" />
        </g>
      `;
    case 'gamer-smile':
    default:
      return `
        <g id="face-gamer-smile">
          <!-- Left Eye -->
          <ellipse cx="162" cy="165" rx="10" ry="12" fill="#0f172a" />
          <circle cx="165" cy="162" r="3.5" fill="#ffffff" />
          <path d="M150,146 Q162,140 174,146" stroke="#0f172a" stroke-width="3" fill="none" stroke-linecap="round" />
          <!-- Right Eye -->
          <ellipse cx="238" cy="165" rx="10" ry="12" fill="#0f172a" />
          <circle cx="241" cy="162" r="3.5" fill="#ffffff" />
          <path d="M226,146 Q238,140 250,146" stroke="#0f172a" stroke-width="3" fill="none" stroke-linecap="round" />
          <!-- Confident Smile -->
          <path d="M184,206 Q200,222 216,206" stroke="#0f172a" stroke-width="3.5" fill="#ffffff" />
          <!-- Blushes -->
          <circle cx="148" cy="184" r="6" fill="#f43f5e" opacity="0.25" />
          <circle cx="252" cy="184" r="6" fill="#f43f5e" opacity="0.25" />
        </g>
      `;
  }
}

function renderOutfit(outfit: OutfitId): string {
  switch (outfit) {
    case 'mecha-armor':
      return `
        <g id="outfit-mecha-armor">
          <!-- Base Armor -->
          <path d="M85,320 L135,270 L265,270 L315,320 L330,400 L70,400 Z" fill="#1e293b" stroke="#475569" stroke-width="2.5" />
          <!-- Shoulder Pauldrons -->
          <polygon points="65,340 115,270 145,285 105,370" fill="#334155" stroke="#f59e0b" stroke-width="2" />
          <polygon points="335,340 285,270 255,285 295,370" fill="#334155" stroke="#f59e0b" stroke-width="2" />
          <!-- Glowing Arc Reactor Core -->
          <circle cx="200" cy="330" r="22" fill="#030712" stroke="#00f3ff" stroke-width="3" />
          <circle cx="200" cy="330" r="14" fill="#00f3ff" />
          <circle cx="200" cy="330" r="7" fill="#ffffff" />
          <!-- Chest Trim Lines -->
          <line x1="165" y1="285" x2="140" y2="350" stroke="#f59e0b" stroke-width="2" />
          <line x1="235" y1="285" x2="260" y2="350" stroke="#f59e0b" stroke-width="2" />
        </g>
      `;
    case 'ninja-shinobi':
      return `
        <g id="outfit-ninja-shinobi">
          <path d="M90,320 L140,270 L260,270 L310,320 L330,400 L70,400 Z" fill="#09090b" />
          <polygon points="140,270 200,350 260,270" fill="#7f1d1d" />
          <!-- Crossed Straps -->
          <line x1="110" y1="290" x2="290" y2="390" stroke="#dc2626" stroke-width="3.5" />
          <line x1="290" y1="290" x2="110" y2="390" stroke="#dc2626" stroke-width="3.5" />
          <!-- Silver Clasp -->
          <circle cx="200" cy="340" r="9" fill="#e2e8f0" stroke="#0f172a" stroke-width="2" />
        </g>
      `;
    case 'royal-emperor':
      return `
        <g id="outfit-royal-emperor">
          <path d="M80,320 L135,270 L265,270 L320,320 L340,400 L60,400 Z" fill="#4c0519" stroke="#facc15" stroke-width="3" />
          <!-- Gold Medallion & Chain -->
          <path d="M140,285 Q200,335 260,285" stroke="#facc15" stroke-width="4" fill="none" />
          <polygon points="200,320 215,345 185,345" fill="#facc15" />
          <circle cx="200" cy="337" r="4" fill="#00f3ff" />
          <!-- White Ermine Trim -->
          <path d="M130,270 L160,400 L125,400 Z" fill="#f8fafc" />
          <path d="M270,270 L240,400 L275,400 Z" fill="#f8fafc" />
        </g>
      `;
    case 'space-suit':
      return `
        <g id="outfit-space-suit">
          <!-- Heavy Space Fabric -->
          <path d="M85,320 L135,270 L265,270 L315,320 L330,400 L70,400 Z" fill="#f1f5f9" stroke="#94a3b8" stroke-width="2.5" />
          <!-- Neck Ring Collar -->
          <ellipse cx="200" cy="270" rx="65" ry="16" fill="#cbd5e1" stroke="#475569" stroke-width="3" />
          <!-- Chest Control Unit -->
          <rect x="160" y="315" width="80" height="50" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="2" />
          <circle cx="178" cy="340" r="6" fill="#22c55e" />
          <circle cx="196" cy="340" r="6" fill="#ef4444" />
          <rect x="210" y="334" width="20" height="12" rx="2" fill="#0284c7" />
          <!-- Mission Badge -->
          <polygon points="120,310 135,335 105,335" fill="#38bdf8" />
        </g>
      `;
    case 'esports-pro':
      return `
        <g id="outfit-esports-pro">
          <!-- Athletic Jersey -->
          <path d="M90,320 L140,270 L260,270 L310,320 L330,400 L70,400 Z" fill="#0f172a" stroke="#00f3ff" stroke-width="2" />
          <!-- Dynamic Chevron Stripes -->
          <polygon points="140,270 200,325 260,270 235,270 200,305 165,270" fill="#00f3ff" />
          <!-- Pixelverse Logo on Chest -->
          <circle cx="200" cy="355" r="14" fill="#ff2a85" />
          <polygon points="195,348 207,355 195,362" fill="#ffffff" />
        </g>
      `;
    case 'cyber-jacket':
      return `
        <g id="outfit-cyber-jacket">
          <!-- High Collar Bomber -->
          <path d="M80,320 L130,265 L270,265 L320,320 L335,400 L65,400 Z" fill="#18181b" stroke="#a855f7" stroke-width="2.5" />
          <!-- Open Flaps & Inner Shirt -->
          <polygon points="155,270 200,350 245,270 200,285" fill="#ff2a85" />
          <path d="M130,265 L165,400 L115,400 Z" fill="#27272a" />
          <path d="M270,265 L235,400 L285,400 Z" fill="#27272a" />
          <!-- Glowing Lapel Lines -->
          <line x1="150" y1="270" x2="175" y2="400" stroke="#00f3ff" stroke-width="2.5" />
          <line x1="250" y1="270" x2="225" y2="400" stroke="#00f3ff" stroke-width="2.5" />
        </g>
      `;
    case 'matrix-coat':
      return `
        <g id="outfit-matrix-coat">
          <!-- Hacker Trenchcoat -->
          <path d="M75,320 L130,260 L270,260 L325,320 L345,400 L55,400 Z" fill="#09090b" stroke="#10b981" stroke-width="1.8" />
          <!-- Tall Dramatic Collar -->
          <polygon points="130,260 115,225 155,260" fill="#18181b" stroke="#10b981" stroke-width="1.5" />
          <polygon points="270,260 285,225 245,260" fill="#18181b" stroke="#10b981" stroke-width="1.5" />
          <!-- Buckles -->
          <rect x="180" y="320" width="40" height="7" rx="2" fill="#334155" />
          <rect x="180" y="355" width="40" height="7" rx="2" fill="#334155" />
        </g>
      `;
    case 'stealth-vest':
      return `
        <g id="outfit-stealth-vest">
          <path d="M90,320 L140,270 L260,270 L310,320 L330,400 L70,400 Z" fill="#1e293b" />
          <!-- Tactical Plates -->
          <rect x="145" y="290" width="110" height="40" rx="6" fill="#0f172a" stroke="#64748b" stroke-width="1.5" />
          <rect x="145" y="340" width="110" height="45" rx="6" fill="#0f172a" stroke="#64748b" stroke-width="1.5" />
          <circle cx="165" cy="310" r="4" fill="#38bdf8" />
        </g>
      `;
    case 'dragon-kimono':
      return `
        <g id="outfit-dragon-kimono">
          <path d="M85,320 L140,270 L260,270 L315,320 L335,400 L65,400 Z" fill="#172554" stroke="#facc15" stroke-width="2" />
          <!-- Cross Wrap -->
          <polygon points="140,270 250,400 200,400 115,290" fill="#b91c1c" />
          <polygon points="260,270 170,400 210,400 285,290" fill="#b91c1c" />
          <!-- Golden Dragon Claw Motif -->
          <circle cx="200" cy="340" r="16" fill="none" stroke="#facc15" stroke-width="3" stroke-dasharray="8,6" />
        </g>
      `;
    case 'vaporwave-tracksuit':
      return `
        <g id="outfit-vaporwave-tracksuit">
          <path d="M85,320 L135,270 L265,270 L315,320 L330,400 L70,400 Z" fill="#2e1065" />
          <polygon points="135,270 200,340 100,400 70,400" fill="#00f5d4" />
          <polygon points="265,270 200,340 300,400 330,400" fill="#ff2a85" />
          <!-- White Center Zip -->
          <line x1="200" y1="270" x2="200" y2="400" stroke="#ffffff" stroke-width="3.5" />
        </g>
      `;
    case 'reaper-cloak':
      return `
        <g id="outfit-reaper-cloak">
          <path d="M70,330 L130,260 L270,260 L330,330 L350,400 L50,400 Z" fill="#09090b" />
          <path d="M130,260 C150,320 250,320 270,260 L250,350 C230,320 170,320 150,350 Z" fill="#581c87" opacity="0.6" />
          <!-- Ethereal Soul Orb -->
          <circle cx="200" cy="335" r="10" fill="#a855f7" />
          <circle cx="200" cy="335" r="5" fill="#f3e8ff" />
        </g>
      `;
    case 'neon-hoodie':
    default:
      return `
        <g id="outfit-neon-hoodie">
          <!-- Main Hoodie Body -->
          <path d="M80,320 L135,265 L265,265 L320,320 L335,400 L65,400 Z" fill="#0f172a" stroke="#00f3ff" stroke-width="2" />
          <!-- Hood Collar folded behind -->
          <path d="M135,265 Q200,295 265,265 L250,300 Q200,325 150,300 Z" fill="#1e293b" stroke="#00f3ff" stroke-width="1.5" />
          <!-- Drawstrings -->
          <line x1="180" y1="290" x2="175" y2="350" stroke="#00f3ff" stroke-width="2.5" stroke-linecap="round" />
          <circle cx="175" cy="352" r="3" fill="#ff2a85" />
          <line x1="220" y1="290" x2="225" y2="350" stroke="#00f3ff" stroke-width="2.5" stroke-linecap="round" />
          <circle cx="225" cy="352" r="3" fill="#ff2a85" />
          <!-- Kangaroo Pocket & Seams -->
          <rect x="145" y="360" width="110" height="35" rx="8" fill="#1e293b" stroke="#00f3ff" stroke-width="1.2" />
        </g>
      `;
  }
}

function renderHair(hair: HairStyleId, color: HairColorId): string {
  const c = HAIR_PALETTE[color];
  switch (hair) {
    case 'cyber-fade':
      return `
        <g id="hair-cyber-fade">
          <!-- Top textured crop -->
          <path d="M125,120 Q200,65 275,120 L275,140 Q200,110 125,140 Z" fill="${c.main}" />
          <path d="M135,115 Q200,80 265,115" stroke="${c.light}" stroke-width="4" fill="none" stroke-linecap="round" />
          <!-- Side Fade with Lightning Razor Line -->
          <rect x="120" y="130" width="12" height="40" fill="${c.dark}" opacity="0.6" />
          <rect x="268" y="130" width="12" height="40" fill="${c.dark}" opacity="0.6" />
          <path d="M269,145 L276,152 L271,155 L277,163" stroke="${c.light}" stroke-width="1.8" fill="none" />
        </g>
      `;
    case 'wolf-cut':
      return `
        <g id="hair-wolf-cut">
          <!-- Shaggy layered anime hair -->
          <path d="M110,135 Q200,55 290,135 L280,180 L260,140 Q200,120 140,140 L120,180 Z" fill="${c.main}" />
          <!-- Jagged Forehead Bangs -->
          <polygon points="140,125 155,160 165,130" fill="${c.dark}" />
          <polygon points="160,125 185,165 195,125" fill="${c.main}" />
          <polygon points="190,125 215,165 225,125" fill="${c.dark}" />
          <polygon points="220,125 245,158 255,125" fill="${c.main}" />
          <path d="M140,105 Q200,80 260,105" stroke="${c.light}" stroke-width="3.5" fill="none" />
        </g>
      `;
    case 'dreadlocks':
      return `
        <g id="hair-dreadlocks">
          <!-- Tied top knot -->
          <circle cx="200" cy="80" r="28" fill="${c.dark}" />
          <rect x="180" y="85" width="40" height="12" rx="4" fill="#facc15" />
          <!-- Hanging Dreads -->
          <rect x="120" y="100" width="14" height="90" rx="7" fill="${c.main}" />
          <rect x="138" y="95" width="14" height="75" rx="7" fill="${c.dark}" />
          <rect x="156" y="90" width="14" height="60" rx="7" fill="${c.main}" />
          <rect x="230" y="90" width="14" height="60" rx="7" fill="${c.main}" />
          <rect x="248" y="95" width="14" height="75" rx="7" fill="${c.dark}" />
          <rect x="266" y="100" width="14" height="90" rx="7" fill="${c.main}" />
          <!-- Golden Bead Rings -->
          <rect x="120" y="150" width="14" height="6" fill="#facc15" />
          <rect x="266" y="150" width="14" height="6" fill="#facc15" />
        </g>
      `;
    case 'punk-mohawk':
      return `
        <g id="hair-punk-mohawk">
          <!-- Spiked crest center -->
          <polygon points="180,125 195,35 205,35 220,125" fill="${c.main}" />
          <polygon points="185,125 200,40 215,125" fill="${c.light}" />
          <polygon points="170,130 185,60 195,120" fill="${c.dark}" />
          <polygon points="205,120 215,60 230,130" fill="${c.dark}" />
          <!-- Shaved sides -->
          <rect x="120" y="115" width="45" height="40" fill="#09090b" opacity="0.75" />
          <rect x="235" y="115" width="45" height="40" fill="#09090b" opacity="0.75" />
        </g>
      `;
    case 'flowing-locks':
      return `
        <g id="hair-flowing-locks">
          <!-- Crown & Long flow down past shoulders -->
          <path d="M110,130 Q200,50 290,130 L295,280 L265,270 L275,150 Q200,115 125,150 L135,270 L105,280 Z" fill="${c.main}" />
          <!-- Hair Sheen -->
          <path d="M135,115 Q200,80 265,115" stroke="${c.light}" stroke-width="4.5" fill="none" />
          <!-- Bangs -->
          <polygon points="140,120 165,160 175,125" fill="${c.dark}" />
          <polygon points="225,125 235,160 260,120" fill="${c.dark}" />
        </g>
      `;
    case 'side-swept':
      return `
        <g id="hair-side-swept">
          <!-- High dramatic sweep to the left -->
          <path d="M100,130 Q180,45 280,115 L275,140 Q180,95 130,155 Z" fill="${c.main}" />
          <path d="M125,105 Q190,70 265,110" stroke="${c.light}" stroke-width="3.5" fill="none" />
          <!-- Shaved Right Side -->
          <rect x="255" y="115" width="22" height="45" rx="4" fill="${c.dark}" opacity="0.7" />
        </g>
      `;
    case 'afro-puff':
      return `
        <g id="hair-afro-puff">
          <!-- Voluminous Rounded Afro Crown -->
          <circle cx="200" cy="115" r="88" fill="${c.main}" />
          <circle cx="160" cy="100" r="50" fill="${c.dark}" opacity="0.4" />
          <circle cx="240" cy="100" r="50" fill="${c.dark}" opacity="0.4" />
          <circle cx="200" cy="80" r="55" fill="${c.light}" opacity="0.2" />
        </g>
      `;
    case 'curly-top':
      return `
        <g id="hair-curly-top">
          <!-- Clustered Curls -->
          <circle cx="160" cy="95" r="24" fill="${c.main}" />
          <circle cx="190" cy="85" r="26" fill="${c.light}" />
          <circle cx="225" cy="88" r="25" fill="${c.main}" />
          <circle cx="145" cy="120" r="20" fill="${c.dark}" />
          <circle cx="245" cy="118" r="20" fill="${c.dark}" />
          <circle cx="175" cy="115" r="22" fill="${c.main}" />
          <circle cx="210" cy="115" r="22" fill="${c.light}" />
        </g>
      `;
    case 'twin-tails':
      return `
        <g id="hair-twin-tails">
          <!-- Center Top Hair -->
          <path d="M125,125 Q200,60 275,125 Q200,105 125,125 Z" fill="${c.main}" />
          <!-- Bangs -->
          <polygon points="145,115 160,155 175,120" fill="${c.dark}" />
          <polygon points="185,115 200,160 215,115" fill="${c.main}" />
          <polygon points="225,120 240,155 255,115" fill="${c.dark}" />
          <!-- Left Tail with Ribbon -->
          <circle cx="110" cy="115" r="10" fill="#f43f5e" />
          <path d="M110,115 C70,150 60,230 85,270 C95,230 90,170 110,125 Z" fill="${c.main}" />
          <!-- Right Tail with Ribbon -->
          <circle cx="290" cy="115" r="10" fill="#f43f5e" />
          <path d="M290,115 C330,150 340,230 315,270 C305,230 310,170 290,125 Z" fill="${c.main}" />
        </g>
      `;
    case 'bald-clean':
      return `
        <!-- High gloss reflection on bald crown -->
        <ellipse cx="175" cy="125" rx="18" ry="8" fill="#ffffff" opacity="0.3" transform="rotate(-20 175 125)" />
      `;
    case 'anime-spiky':
    default:
      return `
        <g id="hair-anime-spiky">
          <!-- Large Top Spikes -->
          <polygon points="120,130 135,50 160,115" fill="${c.dark}" />
          <polygon points="145,115 170,35 195,110" fill="${c.main}" />
          <polygon points="180,110 200,25 220,110" fill="${c.light}" />
          <polygon points="205,110 230,35 255,115" fill="${c.main}" />
          <polygon points="240,115 265,50 280,130" fill="${c.dark}" />
          <!-- Forehead bangs -->
          <polygon points="145,115 165,150 175,120" fill="${c.main}" />
          <polygon points="185,115 205,155 215,115" fill="${c.light}" />
          <polygon points="225,120 235,150 255,115" fill="${c.main}" />
        </g>
      `;
  }
}

function renderHeadwear(headwear: HeadwearId): string {
  switch (headwear) {
    case 'rgb-headset':
      return `
        <g id="headwear-rgb-headset">
          <!-- Headband across top of head -->
          <path d="M110,140 C110,70 290,70 290,140" stroke="#0f172a" stroke-width="12" fill="none" stroke-linecap="round" />
          <path d="M115,138 C115,75 285,75 285,138" stroke="#00f3ff" stroke-width="3" fill="none" />
          <!-- Left Earcup -->
          <rect x="100" y="130" width="24" height="48" rx="10" fill="#0f172a" stroke="#00f3ff" stroke-width="2.5" />
          <circle cx="112" cy="154" r="7" fill="#ff2a85" />
          <!-- Right Earcup -->
          <rect x="276" y="130" width="24" height="48" rx="10" fill="#0f172a" stroke="#00f3ff" stroke-width="2.5" />
          <circle cx="288" cy="154" r="7" fill="#ff2a85" />
          <!-- Boom Mic -->
          <path d="M112,165 Q130,210 160,205" stroke="#334155" stroke-width="3" fill="none" stroke-linecap="round" />
          <circle cx="162" cy="205" r="4.5" fill="#00f3ff" />
        </g>
      `;
    case 'cat-headset':
      return `
        <g id="headwear-cat-headset">
          <!-- Headband -->
          <path d="M110,140 C110,70 290,70 290,140" stroke="#ff2a85" stroke-width="10" fill="none" />
          <!-- Left Cat Ear -->
          <polygon points="125,95 145,35 175,80" fill="#0f172a" stroke="#ff2a85" stroke-width="2" />
          <polygon points="135,90 147,48 165,80" fill="#ff2a85" />
          <!-- Right Cat Ear -->
          <polygon points="275,95 255,35 225,80" fill="#0f172a" stroke="#ff2a85" stroke-width="2" />
          <polygon points="265,90 253,48 235,80" fill="#ff2a85" />
          <!-- Earcups -->
          <rect x="100" y="135" width="24" height="44" rx="10" fill="#ff2a85" />
          <rect x="276" y="135" width="24" height="44" rx="10" fill="#ff2a85" />
        </g>
      `;
    case 'cyber-crown':
      return `
        <g id="headwear-cyber-crown">
          <!-- Floating Cyber Tiara -->
          <polygon points="140,75 160,40 180,65 200,30 220,65 240,40 260,75 200,90" fill="#facc15" stroke="#00f3ff" stroke-width="2" />
          <circle cx="200" cy="55" r="6" fill="#00f3ff" />
          <circle cx="160" cy="62" r="4" fill="#ff2a85" />
          <circle cx="240" cy="62" r="4" fill="#ff2a85" />
        </g>
      `;
    case 'neon-horns':
      return `
        <g id="headwear-neon-horns">
          <!-- Left Horn -->
          <path d="M135,115 C110,85 105,40 130,25 C145,55 145,85 145,115 Z" fill="#7f1d1d" stroke="#ff1e42" stroke-width="2" />
          <path d="M125,75 Q135,60 135,45" stroke="#ff7b00" stroke-width="2" fill="none" />
          <!-- Right Horn -->
          <path d="M265,115 C290,85 295,40 270,25 C255,55 255,85 255,115 Z" fill="#7f1d1d" stroke="#ff1e42" stroke-width="2" />
          <path d="M275,75 Q265,60 265,45" stroke="#ff7b00" stroke-width="2" fill="none" />
        </g>
      `;
    case 'cyber-halo':
      return `
        <g id="headwear-cyber-halo">
          <ellipse cx="200" cy="55" rx="75" ry="18" fill="none" stroke="#facc15" stroke-width="4" stroke-dasharray="16,8" />
          <ellipse cx="200" cy="55" rx="65" ry="14" fill="none" stroke="#00f3ff" stroke-width="1.8" />
        </g>
      `;
    case 'ninja-band':
      return `
        <g id="headwear-ninja-band">
          <!-- Cloth Wrap -->
          <rect x="120" y="115" width="160" height="24" rx="4" fill="#0f172a" />
          <!-- Metal Emblem Plate -->
          <rect x="175" y="117" width="50" height="20" rx="3" fill="#e2e8f0" stroke="#0f172a" stroke-width="1.5" />
          <polygon points="195,124 205,124 200,132" fill="#0f172a" />
          <!-- Ribbon tails -->
          <path d="M280,125 Q305,135 315,160" stroke="#0f172a" stroke-width="4.5" fill="none" stroke-linecap="round" />
        </g>
      `;
    case 'pixel-cap':
      return `
        <g id="headwear-pixel-cap">
          <!-- Backwards Cap Crown -->
          <path d="M125,120 Q200,60 275,120 Z" fill="#1e1b4b" stroke="#38bdf8" stroke-width="2" />
          <!-- Flat Brim turned backwards -->
          <rect x="150" y="110" width="100" height="15" rx="4" fill="#ff2a85" />
          <!-- 8-Bit Pixelverse Button -->
          <rect x="195" y="80" width="10" height="10" fill="#00f3ff" />
        </g>
      `;
    case 'cyber-goggles':
      return `
        <g id="headwear-cyber-goggles">
          <!-- Strap on forehead -->
          <rect x="120" y="95" width="160" height="14" fill="#18181b" />
          <!-- Double Lenses -->
          <rect x="145" y="85" width="45" height="30" rx="8" fill="#334155" stroke="#10b981" stroke-width="2.5" />
          <circle cx="167" cy="100" r="10" fill="#10b981" />
          <circle cx="167" cy="100" r="4" fill="#ffffff" />
          <rect x="210" y="85" width="45" height="30" rx="8" fill="#334155" stroke="#10b981" stroke-width="2.5" />
          <circle cx="232" cy="100" r="10" fill="#10b981" />
          <circle cx="232" cy="100" r="4" fill="#ffffff" />
        </g>
      `;
    case 'none':
    default:
      return '';
  }
}

/**
 * High-performance, mathematically crisp SVG avatar generator
 * Output is pure, self-contained SVG without external assets.
 */
export function renderAvatarSvg(config: AvatarConfig, size = 320): string {
  const bgSvg = renderBackground(config.background);
  const backGearSvg = renderBackGear(config.backGear);
  const bodySvg = renderBody(config.skin);
  const outfitSvg = renderOutfit(config.outfit);
  const faceSvg = renderFace(config.face, config.skin);
  const hairSvg = renderHair(config.hair, config.hairColor);
  const headwearSvg = renderHeadwear(config.headwear);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="${size}" height="${size}" shape-rendering="geometricPrecision" text-rendering="geometricPrecision">
  <defs>
    <clipPath id="avatar-clip">
      <rect width="400" height="400" rx="40" />
    </clipPath>
  </defs>
  <g clip-path="url(#avatar-clip)">
    ${bgSvg}
    ${backGearSvg}
    ${bodySvg}
    ${outfitSvg}
    ${faceSvg}
    ${hairSvg}
    ${headwearSvg}
    
    <!-- Outer Holographic Bezel & Sheen -->
    <rect width="400" height="400" rx="40" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="3" />
    <polygon points="0,0 120,0 40,400 0,400" fill="rgba(255,255,255,0.04)" />
  </g>
</svg>`;
}

/** Converts an avatar configuration into a self-contained SVG data URL suitable for <img src="..." /> */
export function avatarConfigToDataUrl(config: AvatarConfig): string {
  const svg = renderAvatarSvg(config, 400);
  // UTF-8 safe data URI encoding
  const base64 = typeof window !== 'undefined'
    ? window.btoa(unescape(encodeURIComponent(svg)))
    : Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}
