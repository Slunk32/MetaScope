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
    }
};
