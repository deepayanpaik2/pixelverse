export interface StaticCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon_name: string;
  color: string;
}

export const STATIC_CATEGORIES: StaticCategory[] = [
  { id: 'cat-arcade', slug: 'arcade', name: 'Arcade', description: 'Retro coin-op style classics and instant-action arcade games.', icon_name: 'Gamepad2', color: '#ff2a85' },
  { id: 'cat-action', slug: 'action', name: 'Action', description: 'Fast-paced action, shooters, brawlers, and reflex tests.', icon_name: 'Zap', color: '#00f3ff' },
  { id: 'cat-puzzle', slug: 'puzzle', name: 'Puzzle', description: 'Brain teasers, physics puzzles, and relaxing logic challenges.', icon_name: 'Puzzle', color: '#c084fc' },
  { id: 'cat-driving', slug: 'driving', name: 'Driving', description: 'High-speed racing, drift tracks, and parking challenges.', icon_name: 'Car', color: '#ff7b00' },
  { id: 'cat-shooting', slug: 'shooting', name: 'Shooting', description: 'Sniper, target, and first-person browser shooting games.', icon_name: 'Crosshair', color: '#ff1e42' },
  { id: 'cat-adventure', slug: 'adventure', name: 'Adventure', description: 'Quests, platformers, and narrative exploration.', icon_name: 'Compass', color: '#10b981' },
  { id: 'cat-board', slug: 'board', name: 'Board', description: 'Chess, checkers, dominoes, and classic tabletop pastimes.', icon_name: 'Grid', color: '#f59e0b' },
  { id: 'cat-card', slug: 'card', name: 'Card', description: 'Solitaire, blackjack, poker, and memory card classics.', icon_name: 'Layers', color: '#a855f7' },
  { id: 'cat-casual', slug: 'casual', name: 'Casual', description: 'Easy pick-up-and-play casual titles for quick breaks.', icon_name: 'Smile', color: '#4ade80' },
];
