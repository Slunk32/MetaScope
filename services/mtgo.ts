import { Card, Deck, Event } from '@/types';
import { ArchetypeService } from './archetype';

// For dev: Use your machine's IP (e.g. 192.168.1.X) or:
// Android Emulator: 10.0.2.2
// iOS Simulator: localhost
// We'll trust the user to set this or use an environment variable later.
// For now, let's stick to direct MTGO fetching until the backend is actually deployed, 
// OR we can try to hit the local backend if the user runs it.
// The user asked to "set up the server". 
// To allow them to test the server, we should probably toggle this.

// CURRENT STATE: Still fetching from MTGO directly to keep the app working while they deploy.
// I will add a comment on how to switch.
const BASE_URL = 'https://www.mtgo.com';
// const BASE_URL = 'http://localhost:3000/api'; // (When running backend locally)

export const MtgoService = {
    async getLatestEvents(): Promise<Event[]> {
        try {
            console.log('Fetching latest events from MTGO...');
            const response = await fetch(`${BASE_URL}/decklists`);
            const html = await response.text();
            console.log(`Received HTML length: ${html.length}`);

            const events: Event[] = [];

            // Broader regex: look for any <a> tag with an href containing "/decklist/"
            // We don't enforce class="decklists-link" strictly or its order relative to href
            const linkRegex = /<a[^>]*href="([^"]*\/decklist\/[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;

            let match;
            while ((match = linkRegex.exec(html)) !== null) {
                const href = match[1];
                const innerHtml = match[2];

                // Extract Title: Look for <h3> or just use the text if no h3
                const titleMatch = /<h3[^>]*>(.*?)<\/h3>/i.exec(innerHtml);
                const title = titleMatch ? titleMatch[1].trim() : innerHtml.replace(/<[^>]+>/g, '').trim();

                // Extract Date: Look for <time>
                const dateMatch = /<time[^>]+datetime="([^"]+)"/.exec(innerHtml);
                const date = dateMatch ? dateMatch[1] : new Date().toISOString();

                if (href && title) {
                    const id = href.split('/').pop() || '';

                    if (!id) continue;

                    const format = title.split(' ')[0] || 'Unknown';
                    const type = title.includes('Challenge') ? 'Challenge'
                        : title.includes('League') ? 'League'
                            : title.includes('Showcase') ? 'Showcase'
                                : 'Tournament';

                    // dedupe checks could go here
                    events.push({
                        id,
                        name: title,
                        date,
                        format,
                        type,
                        decks: [],
                    });
                }
            }

            console.log(`Parsed ${events.length} events.`);
            return events;
        } catch (error) {
            console.error('Error fetching latest events:', error);
            return [];
        }
    },

    async getEvent(id: string): Promise<Event | null> {
        try {
            const response = await fetch(`${BASE_URL}/decklist/${id}`);
            const html = await response.text();

            // Extract JSON data from window.MTGO.decklists.data
            const jsonMatch = html.match(/window\.MTGO\.decklists\.data\s*=\s*({.*?});/s);

            if (!jsonMatch || !jsonMatch[1]) {
                console.error('Could not find decklist JSON data');
                return null;
            }

            const data = JSON.parse(jsonMatch[1]);

            const decks: Deck[] = (data.decklists || []).map((d: any) => {
                const mainboard: Card[] = (d.main_deck || []).map((c: any) => ({
                    name: c.card_attributes.card_name,
                    quantity: parseInt(c.qty, 10),
                }));

                const sideboard: Card[] = (d.sideboard_deck || []).map((c: any) => ({
                    name: c.card_attributes.card_name,
                    quantity: parseInt(c.qty, 10),
                }));

                const rawDeck: Deck = {
                    id: d.loginid || d.player,
                    player: d.player,
                    result: d.wins ? `${d.wins} wins` : '', // MTGO JSON sometimes has wins/losses or rank
                    mainboard,
                    sideboard,
                };

                // Classify
                const format = data.format || 'Standard'; // Fallback
                rawDeck.archetype = ArchetypeService.classify(rawDeck, format);

                return rawDeck;
            });

            return {
                id,
                name: data.description || 'Unknown Event',
                date: data.starttime || new Date().toISOString(),
                format: data.format || 'Unknown',
                type: data.type || 'Tournament',
                decks,
            };

        } catch (error) {
            console.error(`Error fetching event ${id}:`, error);
            return null;
        }
    }
};
