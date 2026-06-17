const API_URL = process.env.API_URL ?? 'http://localhost:4000';

export async function POST(): Promise<Response> {
  const res = await fetch(`${API_URL}/api/reminders/process`, {
    method: 'POST',
    cache: 'no-store',
  });
  const body = await res.text();
  return new Response(body, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
