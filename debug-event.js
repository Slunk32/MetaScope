const fetch = require('node-fetch');

async function debugEvent() {
    // Testing a known large event from the dump file
    const id = 'modern-challenge-64-2026-01-2912831701';
    const url = `https://www.mtgo.com/decklist/${id}`;
    console.log(`Debug Fetching: ${url}`);

    try {
        const response = await fetch(url, {
            headers: {
                // Same headers as app
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            }
        });

        console.log(`Status: ${response.status}`);
        const html = await response.text();
        console.log(`HTML Size: ${html.length} chars`);
        console.log(`Title: ${html.match(/<title>(.*?)<\/title>/)?.[1]}`);

        // Count occurrences
        const globalRegex = /window\.MTGO\.decklists\.data\s*=/g;
        const count = (html.match(globalRegex) || []).length;
        console.log(`Occurrences of 'window.MTGO.decklists.data': ${count}`);

        // Check Regex
        const regex = /window\.MTGO\.decklists\.data\s*=\s*({[\s\S]*?});/;

        const match = html.match(regex);

        if (!match) {
            console.error("❌ Regex Match FAILED. Pattern not found.");
            // Log a snippet to see if the structure changed
            const snippetIndex = html.indexOf("window.MTGO.decklists.data");
            if (snippetIndex !== -1) {
                console.log("Snippet found in HTML:", html.substring(snippetIndex, snippetIndex + 200));
            }
            return;
        }

        console.log(`✅ Regex Match Found. JSON String Length: ${match[1].length}`);

        try {
            const data = JSON.parse(match[1]);
            const decks = data.decklists || [];
            console.log(`\n🎉 Parse Success!`);
            console.log(`Total Decks Found: ${decks.length}`);

            console.log("\n--- Player List ---");
            decks.forEach((d, i) => {
                console.log(`${i + 1}. ${d.player} (${d.wins?.wins || d.wins} wins)`);
            });
            console.log("-------------------\n");

        } catch (e) {
            console.error("❌ JSON Parse Error:", e.message);
            console.error("JSON snippet leading to failure:", match[1].slice(-100));
        }

    } catch (e) {
        console.error("Fetch/Network Error:", e.message);
    }
}

debugEvent();
