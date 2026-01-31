import { Card, Deck, Event } from '@/types';
import { ArchetypeService } from './archetype';

const MTGO_URL = 'https://www.mtgo.com';

export const MtgoService = {
    async getLatestEvents(): Promise<Event[]> {
        try {
            // Using backend for index 
            const response = await fetch(`https://meta-scope-backend.vercel.app/api/events?_cb=${Date.now()}`);
            if (!response.ok) throw new Error('Backend network response was not ok');
            const data: Event[] = await response.json();
            return data.map(e => ({
                ...e,
                date: extractDateFromId(e.id) || e.date
            }));
        } catch (error) {
            console.error('Error fetching latest events from backend:', error);
            return [];
        }
    },

    async getEvent(id: string): Promise<Event | null> {
        try {
            console.log(`Fetching event ${id} directly from MTGO...`);
            const url = `${MTGO_URL}/decklist/${id}`;

            const response = await fetch(url, {
                headers: {
                    // Full browser emulation to avoid "partial content" or blocks
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Referer': 'https://www.mtgo.com/decklists',
                    'Cache-Control': 'max-age=0',
                    'Connection': 'keep-alive',
                    'Sec-Fetch-Dest': 'document',
                    'Sec-Fetch-Mode': 'navigate',
                    'Sec-Fetch-Site': 'same-origin',
                    'Sec-Fetch-User': '?1',
                    'Upgrade-Insecure-Requests': '1',
                }
            });

            if (!response.ok) {
                console.error(`MTGO returned status ${response.status}`);
                return null;
            }

            const html = await response.text();

            // Regex to find window.MTGO.decklists.data
            const regex = /window\.MTGO\.decklists\.data\s*=\s*({[\s\S]*?});/;
            const match = html.match(regex);

            if (!match) {
                console.error(`Failed to parse MTGO data. content-length: ${html.length}`);
                console.error('HTML Preview:', html.substring(0, 200));
                return null;
            }

            const data = JSON.parse(match[1]);

            // Create a map of loginid -> rank
            // We use two sources:
            // 1. 'standings' (Swiss results, usually cover everyone)
            // 2. 'final_rank' (Top 8 results, overwrites Swiss rank for playoffs)
            const rankMap = new Map<string, number>();

            if (data.standings && Array.isArray(data.standings)) {
                data.standings.forEach((s: any) => {
                    if (s.loginid && s.rank) {
                        rankMap.set(String(s.loginid), parseInt(s.rank, 10));
                    }
                });
            }

            if (data.final_rank && Array.isArray(data.final_rank)) {
                data.final_rank.forEach((r: any) => {
                    if (r.loginid && r.rank) {
                        rankMap.set(String(r.loginid), parseInt(r.rank, 10));
                    }
                });
            }

            // Clean weird MTGO naming (e.g. "CMODERN" -> "Modern")
            if (data.format && typeof data.format === 'string') {
                data.format = data.format.replace(/^c(modern|pioneer|standard|legacy|vintage|pauper)/i, '$1');
            }

            // Map to our Deck type
            const decks: Deck[] = (data.decklists || []).map((d: any, index: number) => {
                const mainboard: Card[] = (d.main_deck || []).map((c: any) => ({
                    name: c.card_attributes.card_name,
                    quantity: parseInt(c.qty, 10),
                }));

                const sideboard: Card[] = (d.sideboard_deck || []).map((c: any) => ({
                    name: c.card_attributes.card_name,
                    quantity: parseInt(c.qty, 10),
                }));

                // Handle wins/result format variation
                let result = '';
                let rank = 0;
                let cleanPlayer = d.player;

                // Priority 1: Check if player name has "1st Place" info (Fallback)
                const rankMatch = d.player.match(/(.*?)\s*\((\d+)(?:st|nd|rd|th)?\s+Place\)/i);

                // Priority 2: Check explicit rank map (using loginid for precision)
                // Note: d.loginid comes from the decklists object
                const standingRank = rankMap.get(String(d.loginid));

                if (rankMatch) {
                    cleanPlayer = rankMatch[1];
                    rank = parseInt(rankMatch[2], 10);
                } else if (standingRank) {
                    rank = standingRank;
                }

                if (rank > 0) {
                    result = `${rank}${getOrdinal(rank)}`; // "1st", "20th"
                }
                else if (d.wins && typeof d.wins === 'object') {
                    result = `${d.wins.wins}-${d.wins.losses}`;
                } else if (d.wins) {
                    result = `${d.wins} wins`;
                } else if (id.toLowerCase().includes('challenge')) {
                    // Fallback: If it's a Challenge and no explicit rank found, assume list order IS the rank
                    // (But only provided we didn't find any standings data at all, to avoid partial matches)
                    if (rankMap.size === 0) {
                        rank = index + 1;
                        result = `${rank}${getOrdinal(rank)}`;
                    } else if (!rankMap.has(String(d.loginid))) {
                        result = '-';
                    }
                }

                return {
                    id: `${id}-${cleanPlayer}`,
                    player: cleanPlayer,
                    result,
                    mainboard,
                    sideboard,
                    archetype: 'Unknown',
                    rank
                };
            });

            // If we parsed ranks, sort by rank
            const hasRanks = decks.some(d => d.rank && d.rank > 0);
            if (hasRanks) {
                decks.sort((a, b) => (a.rank || 999) - (b.rank || 999));
            }

            const parsedInfo = parseEventId(id);

            const eventData: Event = {
                id: id,
                name: data.description || 'Event',
                date: parsedInfo.date || data.starttime || new Date().toISOString(),
                format: data.format || parsedInfo.format,
                type: data.type || parsedInfo.type,
                decks,
            };

            // Client-side enrichment
            if (eventData && eventData.decks) {
                eventData.decks.forEach((d: Deck) => {
                    if (!d.archetype || d.archetype === 'Unknown') {
                        d.archetype = ArchetypeService.classify(d, eventData.format);
                    }
                });
            }

            return eventData;
        } catch (error) {
            console.error(`Error fetching event ${id}:`, error);
            return null;
        }
    }
};

function parseEventId(id: string) {
    if (!id) return { format: 'Unknown', type: 'Event', date: null };

    // Regex to capture parts: (format)-(type)-(date)-(id)
    // Example: modern-challenge-32-2026-01-3012831718
    // Extract Date: YYYY-MM-DD
    const dateMatch = id.match(/(\d{4}-\d{2}-\d{2})/);
    const date = dateMatch ? dateMatch[0] : null;

    // Remove numbers/date from end to get the name part
    const namePart = id.split(/\d{4}-\d{2}-\d{2}/)[0].replace(/-$/, '');
    // e.g. "modern-challenge-32" (sometimes has number suffix like 32 or 64)
    // or "legacy-league"

    const parts = namePart.split('-');

    // Capitalize helper
    const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

    // Format is usually first part
    const format = cap(parts[0]);

    // Type is usually second part (or rest)
    // If namePart is "modern-challenge-32", format=Modern, type=Challenge 32?
    // Let's just join the rest
    const type = parts.slice(1).map(cap).join(' ');

    return { format: format || 'Unknown', type: type || 'Event', date };
}

function extractDateFromId(id: string): string | null {
    return parseEventId(id).date;
}

function getOrdinal(n: number): string {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
}
