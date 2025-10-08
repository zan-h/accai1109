// Utility function to make requests to the /api/responses endpoint
// Replacement for the fetchResponsesMessage function from chatSupervisor
export async function fetchResponsesMessage(body: any): Promise<any> {
  try {
    const response = await fetch('/api/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error('Response error:', response.status, response.statusText);
      return { error: 'API request failed' };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    return { error: 'Network request failed' };
  }
}


