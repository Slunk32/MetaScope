const fetch = require('node-fetch');

async function test() {
    const id = 'legacy-league-2026-01-3110172';
    const url = `https://www.mtgo.com/decklist/${id}`; // Fixed URL structure
    console.log(`Fetching ${url}...`);

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        const html = await response.text();

        console.log(`HTML Length: ${html.length}`);

        // The Regex currently used in backend
        const regex = /window\.MTGO\.decklists\.data\s*=\s*({[\s\S]*?});/;
        const match = html.match(regex);

        if (!match) {
            console.error("No match found!");
            return;
        }

        console.log(`Match found. Length: ${match[1].length}`);

        const data = JSON.parse(match[1]);
        console.log(`Parsed JSON successfully.`);
        console.log(`Decklists count: ${data.decklists?.length}`);

        if (data.decklists?.length < 10) {
            console.log("Decklists dump:", JSON.stringify(data.decklists, null, 2));
        }

    } catch (e) {
        console.error("Error:", e.message);
    }
}

test();
