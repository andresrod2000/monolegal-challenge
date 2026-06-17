const API_URL = process.env.API_URL ?? 'http://localhost:4000';

export async function GET(): Promise<Response> {
  const res = await fetch(`${API_URL}/api/invoices`, { cache: 'no-store' });
  const body = await res.text();

  return new Response(body, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
