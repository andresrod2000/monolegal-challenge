const API_URL = process.env.API_URL ?? 'http://localhost:4000';

async function proxyRequest(path: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(`${API_URL}${path}`, { cache: 'no-store', ...init });
  const body = await res.text();
  return new Response(body, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function GET(): Promise<Response> {
  return proxyRequest('/api/clients');
}

export async function POST(request: Request): Promise<Response> {
  const body = await request.text();
  return proxyRequest('/api/clients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
}
