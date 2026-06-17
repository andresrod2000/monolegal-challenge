interface ApiErrorBody {
  error?: { message?: string };
}

export async function parseApiError(response: Response): Promise<string> {
  try {
    const json = (await response.json()) as ApiErrorBody;
    return json.error?.message ?? `Error ${response.status}`;
  } catch {
    return `Error ${response.status}`;
  }
}
