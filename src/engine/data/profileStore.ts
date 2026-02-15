export interface PlayerProfile {
  id: string;
  name: string;
  wins: number;
  losses: number;
  createdCharacters: string[];
}

const STORAGE_KEY = 'pw-game.profile';

export function loadProfile(): PlayerProfile {
  const fallback: PlayerProfile = {
    id: 'local',
    name: 'Player 1',
    wins: 0,
    losses: 0,
    createdCharacters: [],
  };

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return fallback;

  try {
    return { ...fallback, ...(JSON.parse(raw) as Partial<PlayerProfile>) };
  } catch {
    return fallback;
  }
}

export function saveProfile(profile: PlayerProfile): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}
