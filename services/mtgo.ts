import { Deck, Event } from '@/types';
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
            console.error('FAILED TO LOAD EVENTS:', error);
            // Temporary: throw so the UI shows 'Error' instead of empty list
            throw error;
        }
    },

    async getEvent(id: string): Promise<Event | null> {
        try {
            console.log(`Fetching event ${id} from Backend...`);
            // Use our backend proxy which handles the suffix stripping/caching
            const response = await fetch(`https://meta-scope-backend.vercel.app/api/event/${id}`);

            if (!response.ok) {
                let errorMessage = `Backend returned status ${response.status}`;
                try {
                    const errorData = await response.json();
                    if (errorData.error) {
                        errorMessage = errorData.error;
                        if (errorData.debug_html) {
                            errorMessage += ` (Debug: ${errorData.debug_html.substring(0, 50)}...)`;
                        }
                    }
                } catch (e) { /* ignore json parse error */ }
                throw new Error(errorMessage);
            }

            const eventData: Event = await response.json();

            // Client-side enrichment: Classify Archetypes
            // The backend currently returns 'Unknown' for archetypes, so we run our classifier here.
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
