export type HttpRequestOptions = {
  baseUrl?: string;
  path: string;
  method?: "GET" | "POST";
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  token: string;
};

function buildUrl(
  baseUrl: string,
  path: string,
  query?: HttpRequestOptions["query"]
): string {
  const base = baseUrl.replace(/\/+$/, "");
  const p = path.replace(/^\/+/, "");
  const url = `${base}/${p}`;
  if (!query) return url;
  const qs = Object.entries(query)
    .filter(([, v]) => v !== undefined)
    .map(
      ([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`
    )
    .join("&");
  return qs ? `${url}?${qs}` : url;
}

export async function httpRequest<T = unknown>(
  opts: HttpRequestOptions
): Promise<T> {
  const {
    baseUrl = "https://api.figma.com/",
    path,
    method = "GET",
    query,
    body,
    token,
  } = opts;
  const url = buildUrl(baseUrl, path, query);

  const res = await fetch(url, {
    method,
    headers: {
      "X-FIGMA-TOKEN": token,
      "Content-Type": "application/json",
    },
    body:
      method === "POST" ? JSON.stringify(body != null ? body : {}) : undefined,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${text}`);
  }

  // 204 no content
  if (res.status === 204) return undefined as unknown as T;

  return (await res.json()) as T;
}
