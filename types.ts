export interface Card {
    name: string;
    quantity: number;
    imageUrl?: string;
    highlighted?: boolean; // For archetype breakdown
}

export interface Deck {
    id: string; // Unique ID (e.g., "playername-ranking")
    player: string;
    result: string; // "1st", "5-0", etc.
    archetype?: string; // Calculated field
    mainboard: Card[];
    sideboard: Card[];
    url?: string;
    rank?: number; // 1 for 1st place, etc.
}

export interface Event {
    id: string; // URL slug or ID
    name: string;
    date: string;
    format: string; // "Modern", "Pioneer", etc.
    type: string; // "Challenge", "League", "Showcase"
    decks: Deck[];
}

export interface ArchetypeRule {
    name: string;
    format: string;
    mustContain: string[]; // Card names
    minQuantity?: Record<string, number>;
    score: number;
}
