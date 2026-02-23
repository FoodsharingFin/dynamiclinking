interface Env {
  GITHUB_TOKEN: string;
  GITHUB_REPO: string;
}

// CORS headers for all responses
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: CORS_HEADERS,
      });
    }

    const url = new URL(request.url);
    
    // Route: GET /chains - Fetch current chains.json
    if (url.pathname === '/chains' && request.method === 'GET') {
      return handleGetChains(env);
    }
    
    // Route: POST /chains - Update chains.json
    if (url.pathname === '/chains' && request.method === 'POST') {
      return handleUpdateChains(request, env);
    }
    
    return new Response('Not Found', { status: 404 });
  },
};

async function handleGetChains(env: Env): Promise<Response> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${env.GITHUB_REPO}/contents/chains.json`,
      {
        headers: {
          'Authorization': `token ${env.GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'dynlink-worker',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json() as any;
    
    // Decode base64 content
    const content = atob(data.content);
    
    return new Response(content, {
      headers: {
        'Content-Type': 'application/json',
        ...CORS_HEADERS,
      },
    });
  } catch (error) {
    console.error('Error fetching chains:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch chains' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...CORS_HEADERS,
        },
      }
    );
  }
}

async function handleUpdateChains(request: Request, env: Env): Promise<Response> {
  try {
    const newChains = await request.json();
    
    // First, get the current file to get its SHA (required for updates)
    const currentFile = await fetch(
      `https://api.github.com/repos/${env.GITHUB_REPO}/contents/chains.json`,
      {
        headers: {
          'Authorization': `token ${env.GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'dynlink-worker',
        },
      }
    );

    if (!currentFile.ok) {
      throw new Error(`Failed to get current file: ${currentFile.status}`);
    }

    const currentData = await currentFile.json() as any;
    const currentSha = currentData.sha;

    // Encode new content as base64
    const content = btoa(JSON.stringify(newChains, null, 2));

    // Update the file
    const updateResponse = await fetch(
      `https://api.github.com/repos/${env.GITHUB_REPO}/contents/chains.json`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${env.GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'dynlink-worker',
        },
        body: JSON.stringify({
          message: 'Update chains via dynlink manager',
          content: content,
          sha: currentSha,
        }),
      }
    );

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      throw new Error(`GitHub update failed: ${updateResponse.status} - ${errorText}`);
    }

    const result = await updateResponse.json();

    return new Response(
      JSON.stringify({ success: true, commit: result }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...CORS_HEADERS,
        },
      }
    );
  } catch (error) {
    console.error('Error updating chains:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to update chains',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...CORS_HEADERS,
        },
      }
    );
  }
}
