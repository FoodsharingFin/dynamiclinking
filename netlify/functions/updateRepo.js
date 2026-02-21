const fetch = require('node-fetch');

exports.handler = async (event) => {
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const REPO = 'FoodsharingFin/dynlink';
    const FILE_PATH = 'chains.json';

    // --- HANDLE GET REQUEST (LOADING DATA) ---
    if (event.httpMethod === "GET") {
        try {
            const response = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`, {
                headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}` }
            });

            if (!response.ok) {
                return { statusCode: response.status, body: JSON.stringify({ chains: [] }) };
            }

            const fileData = await response.json();
            const content = Buffer.from(fileData.content, 'base64').toString();
            
            return {
                statusCode: 200,
                headers: { "Content-Type": "application/json" },
                body: content // This returns your JSON file content directly
            };
        } catch (err) {
            return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
        }
    }

    // --- HANDLE POST REQUEST (SAVING DATA) ---
    if (event.httpMethod === "POST") {
        try {
            // Get current file SHA to allow update
            const getFile = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`, {
                headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}` }
            });
            
            let sha = null;
            if (getFile.ok) {
                const fileData = await getFile.json();
                sha = fileData.sha;
            }

            const body = JSON.parse(event.body);
            const content = Buffer.from(JSON.stringify(body, null, 2)).toString('base64');

            const commitData = {
                message: `Update chains via Netlify - ${new Date().toLocaleString()}`,
                content: content,
                sha: sha 
            };

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

            return { statusCode: 200, body: JSON.stringify({ message: "Success" }) };

        } catch (error) {
            return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
        }
    }

    return { statusCode: 405, body: "Method Not Allowed" };
};
