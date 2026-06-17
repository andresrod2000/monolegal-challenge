const API_URL = process.env.API_URL ?? 'http://localhost:4000';

async function proxyRequest(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const res = await fetch(`${API_URL}${path}`, { cache: 'no-store', ...init });
  const body = await res.text();
  return new Response(body, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;
  return proxyRequest(`/api/invoices/${id}`);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;
  const body = await request.text();
  return proxyRequest(`/api/invoices/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;
  const res = await fetch(`${API_URL}/api/invoices/${id}`, {
    method: 'DELETE',
    cache: 'no-store',
  });
  return new Response(null, { status: res.status });
}
