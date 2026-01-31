const SCRYFALL_API = 'https://api.scryfall.com';

export const ScryfallService = {
    // Fetch card image URL by exact name
    async getCardImage(cardName: string): Promise<string | null> {
        try {
            // Scryfall fuzzy or exact search
            // Using named endpoint (cacheable)
            const encodedName = encodeURIComponent(cardName);
            const url = `${SCRYFALL_API}/cards/named?exact=${encodedName}`;

            const response = await fetch(url);
            if (!response.ok) return null;

            const data = await response.json();

            // Check for image_uris.normal or image_uris.large
            if (data.image_uris) {
                return data.image_uris.normal;
            }
            // Handle double-faced cards (card_faces)
            else if (data.card_faces && data.card_faces[0].image_uris) {
                return data.card_faces[0].image_uris.normal;
            }

            return null;
        } catch (error) {
            console.warn(`Error fetching image for ${cardName}:`, error);
            return null;
        }
    },

    // Batch fetch card details for sorting
    async getCards(cardNames: string[]): Promise<any[]> {
        // Scryfall collection endpoint limit is 75. We might need to chunk if a deck is huge, 
        // but unique cards in a deck rarely exceed 75. 
        // Just in case, we'll slice to 75 for MVP.
        const uniqueNames = [...new Set(cardNames)].slice(0, 75);

        try {
            const response = await fetch(`${SCRYFALL_API}/cards/collection`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    identifiers: uniqueNames.map(name => ({ name }))
                })
            });

            if (!response.ok) return [];

            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('Error fetching batch cards:', error);
            return [];
        }
    }
};
