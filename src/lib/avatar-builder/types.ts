export type SkinToneId =
  | 'fair'
  | 'tan'
  | 'warm'
  | 'deep'
  | 'cyber-blue'
  | 'gold-mecha'
  | 'neon-violet'
  | 'shadow-noir'
  | 'emerald-alien'
  | 'hologram';

export type FaceId =
  | 'gamer-smile'
  | 'cool-smirk'
  | 'anime-eyes'
  | 'cyber-visor'
  | 'pixel-shades'
  | 'cat-face'
  | 'ninja-mask'
  | 'cyber-eye'
  | 'fire-eyes';

export type HairStyleId =
  | 'anime-spiky'
  | 'cyber-fade'
  | 'wolf-cut'
  | 'dreadlocks'
  | 'flowing-locks'
  | 'punk-mohawk'
  | 'side-swept'
  | 'afro-puff'
  | 'curly-top'
  | 'twin-tails'
  | 'bald-clean';

export type HairColorId =
  | 'neon-cyan'
  | 'platinum-white'
  | 'hot-pink'
  | 'midnight-blue'
  | 'golden-sun'
  | 'toxic-green'
  | 'void-purple'
  | 'jet-black'
  | 'flame-orange';

export type OutfitId =
  | 'neon-hoodie'
  | 'mecha-armor'
  | 'ninja-shinobi'
  | 'royal-emperor'
  | 'space-suit'
  | 'esports-pro'
  | 'cyber-jacket'
  | 'matrix-coat'
  | 'stealth-vest'
  | 'dragon-kimono'
  | 'vaporwave-tracksuit'
  | 'reaper-cloak';

export type HeadwearId =
  | 'none'
  | 'rgb-headset'
  | 'cat-headset'
  | 'cyber-crown'
  | 'neon-horns'
  | 'cyber-halo'
  | 'ninja-band'
  | 'pixel-cap'
  | 'cyber-goggles';

export type BackGearId =
  | 'none'
  | 'cyber-wings'
  | 'dual-katanas'
  | 'plasma-jetpack'
  | 'cyber-ring'
  | 'thunder-aura'
  | 'angel-wings';

export type BackgroundStageId =
  | 'neon-city'
  | 'cyber-grid'
  | 'cosmic-stars'
  | 'bloodforge'
  | 'emerald-matrix'
  | 'deep-void'
  | 'golden-hall';

export interface AvatarConfig {
  skin: SkinToneId;
  face: FaceId;
  hair: HairStyleId;
  hairColor: HairColorId;
  outfit: OutfitId;
  headwear: HeadwearId;
  backGear: BackGearId;
  background: BackgroundStageId;
}

export interface OptionItem<T extends string> {
  id: T;
  name: string;
  tagline?: string;
  previewColor?: string;
  previewSecondary?: string;
  isNew?: boolean;
}

export const SKIN_TONES: OptionItem<SkinToneId>[] = [
  { id: 'fair', name: 'Fair Light', previewColor: '#ffd8be', previewSecondary: '#f7ba9e' },
  { id: 'warm', name: 'Warm Honey', previewColor: '#f1b88e', previewSecondary: '#d89462' },
  { id: 'tan', name: 'Golden Tan', previewColor: '#cf9164', previewSecondary: '#ad6c3f' },
  { id: 'deep', name: 'Rich Bronze', previewColor: '#8a532f', previewSecondary: '#5e3419' },
  { id: 'cyber-blue', name: 'Cyber Azure', previewColor: '#6ee7b7', previewSecondary: '#00f3ff', isNew: true },
  { id: 'gold-mecha', name: 'Cyborg Chrome', previewColor: '#fef08a', previewSecondary: '#eab308' },
  { id: 'neon-violet', name: 'Neon Synth', previewColor: '#e879f9', previewSecondary: '#a855f7', isNew: true },
  { id: 'shadow-noir', name: 'Obsidian Void', previewColor: '#334155', previewSecondary: '#0f172a' },
  { id: 'emerald-alien', name: 'Bio Matrix', previewColor: '#86efac', previewSecondary: '#10b981' },
  { id: 'hologram', name: 'Ghost Holo', previewColor: '#bae6fd', previewSecondary: '#38bdf8' },
];

export const HAIR_COLORS: OptionItem<HairColorId>[] = [
  { id: 'neon-cyan', name: 'Neon Cyan', previewColor: '#00f3ff' },
  { id: 'platinum-white', name: 'Pure Platinum', previewColor: '#f8fafc' },
  { id: 'hot-pink', name: 'Hyper Rose', previewColor: '#ff2a85' },
  { id: 'flame-orange', name: 'Solar Flame', previewColor: '#ff7b00' },
  { id: 'golden-sun', name: 'Cyber Gold', previewColor: '#facc15' },
  { id: 'toxic-green', name: 'Matrix Green', previewColor: '#10b981' },
  { id: 'void-purple', name: 'Arcane Purple', previewColor: '#a855f7' },
  { id: 'midnight-blue', name: 'Midnight Azure', previewColor: '#38bdf8' },
  { id: 'jet-black', name: 'Obsidian Black', previewColor: '#18181b' },
];

export const HAIR_STYLES: OptionItem<HairStyleId>[] = [
  { id: 'anime-spiky', name: 'Anime Spiky', tagline: 'Protagonist power' },
  { id: 'cyber-fade', name: 'Cyber Fade', tagline: 'Crisp gamer taper' },
  { id: 'wolf-cut', name: 'Neon Wolf Cut', tagline: 'Layered cyberpunk' },
  { id: 'dreadlocks', name: 'Cyber Dreads', tagline: 'High-top dreads' },
  { id: 'punk-mohawk', name: 'Plasma Mohawk', tagline: 'Street rebel punk' },
  { id: 'flowing-locks', name: 'Flowing Waves', tagline: 'Silky anime locks' },
  { id: 'side-swept', name: 'Side Swept Undercut', tagline: 'Sleek & charismatic' },
  { id: 'afro-puff', name: 'Afro Crown', tagline: 'Bold royal volume' },
  { id: 'curly-top', name: 'Curly Top Fade', tagline: 'Bouncy street curls' },
  { id: 'twin-tails', name: 'Twin Tails', tagline: 'Cute anime twin pigtails' },
  { id: 'bald-clean', name: 'Clean Shaved', tagline: 'Pure chrome finish' },
];

export const FACES: OptionItem<FaceId>[] = [
  { id: 'gamer-smile', name: 'Confident Smile', tagline: 'Ready for action' },
  { id: 'cool-smirk', name: 'Cyber Smirk', tagline: 'Playful challenger' },
  { id: 'anime-eyes', name: 'Anime Sparkle', tagline: 'Heroic starry eyes' },
  { id: 'cyber-visor', name: 'Neon Visor HUD', tagline: 'Tactical holographic scanner', isNew: true },
  { id: 'pixel-shades', name: 'Deal With It Shades', tagline: '8-Bit pixel sunglasses' },
  { id: 'cat-face', name: 'Neko Whiskers', tagline: 'Cute blushing gamer' },
  { id: 'ninja-mask', name: 'Shadow Shinobi Mask', tagline: 'Silent stealth veil' },
  { id: 'cyber-eye', name: 'Cyborg Glowing Eye', tagline: 'Target-locked laser vision', isNew: true },
  { id: 'fire-eyes', name: 'Flame Passion', tagline: 'Fiery blazing gaze' },
];

export const OUTFITS: OptionItem<OutfitId>[] = [
  { id: 'neon-hoodie', name: 'Cyber Neon Hoodie', tagline: 'Classic oversized gamer streetwear', isNew: true },
  { id: 'mecha-armor', name: 'Titan Mecha Exosuit', tagline: 'Heavy power core titanium chest', isNew: true },
  { id: 'ninja-shinobi', name: 'Shadow Shinobi Robes', tagline: 'Black silk assassin vest & cords' },
  { id: 'royal-emperor', name: 'Golden Emperor Cloak', tagline: 'Velvet royal robes with gold trim' },
  { id: 'space-suit', name: 'Cosmic Astro Suit', tagline: 'NASA pressurized deep space rig' },
  { id: 'esports-pro', name: 'Champion Esports Jersey', tagline: 'Pixelverse Pro League uniform' },
  { id: 'cyber-jacket', name: 'Neo-Tokyo Street Jacket', tagline: 'High collar bomber with neon patches' },
  { id: 'matrix-coat', name: 'Matrix Trenchcoat', tagline: 'Sleek black hacker leather duster' },
  { id: 'stealth-vest', name: 'Tactical Recon Vest', tagline: 'MOLLE pouches & holographic badge' },
  { id: 'dragon-kimono', name: 'Dragon Flame Kimono', tagline: 'Silk haori with golden flame trims' },
  { id: 'vaporwave-tracksuit', name: 'Vaporwave Tracksuit', tagline: 'Retro 80s pink & teal retro windbreaker' },
  { id: 'reaper-cloak', name: 'Void Reaper Shroud', tagline: 'Ethereal dark cloaked silhouette' },
];

export const HEADWEAR: OptionItem<HeadwearId>[] = [
  { id: 'none', name: 'None', tagline: 'Show natural hair' },
  { id: 'rgb-headset', name: 'RGB Pro Gamer Headset', tagline: 'Pulsing LED earcups & boom mic', isNew: true },
  { id: 'cat-headset', name: 'Cute Cat Ear Headset', tagline: 'Glowing kawaii cat ears', isNew: true },
  { id: 'cyber-crown', name: 'Holographic Crown', tagline: 'Floating neon royal tiara' },
  { id: 'neon-horns', name: 'Cyber Demon Horns', tagline: 'Molten plasma curved horns' },
  { id: 'cyber-halo', name: 'Angel Cyber Halo', tagline: 'Floating golden ring of light' },
  { id: 'ninja-band', name: 'Shinobi Headband', tagline: 'Polished metal symbol plate' },
  { id: 'pixel-cap', name: 'Pixelverse Snapback', tagline: 'Backwards flat-brim street cap' },
  { id: 'cyber-goggles', name: 'Night-Vision Goggles', tagline: 'Triple-lens tactical optic visor' },
];

export const BACK_GEAR: OptionItem<BackGearId>[] = [
  { id: 'none', name: 'None', tagline: 'Clean silhouette' },
  { id: 'cyber-wings', name: 'Holographic Cyber Wings', tagline: 'Hardlight feather flight wings', isNew: true },
  { id: 'dual-katanas', name: 'Crossed Dual Katanas', tagline: 'Twin samurai swords on scabbards' },
  { id: 'plasma-jetpack', name: 'Twin Jetpack Thrusters', tagline: 'High-velocity ion boost engines' },
  { id: 'cyber-ring', name: 'Floating Arcane Ring', tagline: 'Spinning digital runic halo' },
  { id: 'thunder-aura', name: 'Lightning Thunder Aura', tagline: 'Crackling electric blue sparks' },
  { id: 'angel-wings', name: 'Golden Seraph Wings', tagline: 'Luminous feathered archangel wings' },
];

export const BACKGROUND_STAGES: OptionItem<BackgroundStageId>[] = [
  { id: 'neon-city', name: 'Neo Tokyo City', previewColor: '#0f172a', previewSecondary: '#00f3ff' },
  { id: 'cyber-grid', name: 'Synthwave 80s Grid', previewColor: '#1e1035', previewSecondary: '#ff2a85' },
  { id: 'cosmic-stars', name: 'Deep Cosmic Nebula', previewColor: '#050816', previewSecondary: '#a855f7' },
  { id: 'bloodforge', name: 'Bloodforge Mecha', previewColor: '#200508', previewSecondary: '#ff1e42' },
  { id: 'emerald-matrix', name: 'Emerald Matrix', previewColor: '#021f14', previewSecondary: '#10b981' },
  { id: 'deep-void', name: 'Arcane Obsidian Void', previewColor: '#0a0a0c', previewSecondary: '#ffffff' },
  { id: 'golden-hall', name: 'Celestial Golden Hall', previewColor: '#1c1503', previewSecondary: '#facc15' },
];

export const DEFAULT_AVATAR_CONFIG: AvatarConfig = {
  skin: 'fair',
  face: 'gamer-smile',
  hair: 'anime-spiky',
  hairColor: 'neon-cyan',
  outfit: 'neon-hoodie',
  headwear: 'rgb-headset',
  backGear: 'cyber-wings',
  background: 'neon-city',
};

export interface AvatarPreset {
  name: string;
  tagline: string;
  config: AvatarConfig;
}

export const PRESET_AVATARS: AvatarPreset[] = [
  {
    name: 'Cyberpunk Ronin',
    tagline: 'High-tech neon samurai',
    config: {
      skin: 'cyber-blue',
      face: 'cyber-visor',
      hair: 'wolf-cut',
      hairColor: 'neon-cyan',
      outfit: 'cyber-jacket',
      headwear: 'ninja-band',
      backGear: 'dual-katanas',
      background: 'neon-city',
    },
  },
  {
    name: 'Kawaii Pro Gamer',
    tagline: 'Cute & lethal streamer',
    config: {
      skin: 'fair',
      face: 'anime-eyes',
      hair: 'twin-tails',
      hairColor: 'hot-pink',
      outfit: 'neon-hoodie',
      headwear: 'cat-headset',
      backGear: 'cyber-wings',
      background: 'cyber-grid',
    },
  },
  {
    name: 'Titan Mecha Ace',
    tagline: 'Heavy armored combat pilot',
    config: {
      skin: 'gold-mecha',
      face: 'cyber-eye',
      hair: 'cyber-fade',
      hairColor: 'platinum-white',
      outfit: 'mecha-armor',
      headwear: 'cyber-goggles',
      backGear: 'plasma-jetpack',
      background: 'bloodforge',
    },
  },
  {
    name: 'Matrix Ghost Hacker',
    tagline: 'Shadow operative behind the grid',
    config: {
      skin: 'shadow-noir',
      face: 'pixel-shades',
      hair: 'punk-mohawk',
      hairColor: 'toxic-green',
      outfit: 'matrix-coat',
      headwear: 'cyber-halo',
      backGear: 'cyber-ring',
      background: 'emerald-matrix',
    },
  },
  {
    name: 'Solar Phoenix Emperor',
    tagline: 'Gilded divine ruler',
    config: {
      skin: 'warm',
      face: 'fire-eyes',
      hair: 'flowing-locks',
      hairColor: 'flame-orange',
      outfit: 'royal-emperor',
      headwear: 'cyber-crown',
      backGear: 'angel-wings',
      background: 'golden-hall',
    },
  },
  {
    name: 'Vaporwave Street Skater',
    tagline: 'Chill retro arcade master',
    config: {
      skin: 'tan',
      face: 'cool-smirk',
      hair: 'curly-top',
      hairColor: 'midnight-blue',
      outfit: 'vaporwave-tracksuit',
      headwear: 'pixel-cap',
      backGear: 'thunder-aura',
      background: 'cyber-grid',
    },
  },
];
