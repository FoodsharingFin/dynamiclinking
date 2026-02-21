const fetch = require('node-fetch');

exports.handler = async (event) => {
    // Only allow POST requests
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // Picked up from Netlify's "Vault"
    const REPO = 'foodsharingfin/dynamiclinking';
    const FILE_PATH = 'chains.json';

    try {
        // 1. Get the current file SHA from GitHub
        const getFile = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`, {
            headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}` }
        });
        
        let sha = null;
        if (getFile.ok) {
            const fileData = await getFile.json();
            sha = fileData.sha;
        }

        // 2. Prepare the commit
        const body = JSON.parse(event.body);
        const content = Buffer.from(JSON.stringify(body, null, 2)).toString('base64');

        const commitData = {
            message: `Update chains via Netlify - ${new Date().toLocaleString()}`,
            content: content,
            sha: sha // Required to update an existing file
        };

        // 3. Push to GitHub
        const pushResponse = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(commitData)
        });

        if (!pushResponse.ok) {
            const err = await pushResponse.json();
            return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Success" })
        };

    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
