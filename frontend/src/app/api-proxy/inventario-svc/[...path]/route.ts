import { NextRequest, NextResponse } from 'next/server';

const INVENTARIO_BASE = process.env.INVENTARIO_SERVICE_URL ?? process.env.NEXT_PUBLIC_INVENTARIO_API_URL ?? '';
const STRIP_HEADERS = new Set(['content-encoding', 'transfer-encoding', 'connection', 'keep-alive']);

async function proxy(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: pathSegments } = await params;
  const path = pathSegments.join('/');

  if (!INVENTARIO_BASE) {
    return NextResponse.json(
      { detail: 'Configura INVENTARIO_SERVICE_URL para habilitar el proxy de inventario' },
      { status: 503 }
    );
  }

  const url = new URL(`${INVENTARIO_BASE}/${path}`);
  url.search = req.nextUrl.search;

  const forwardHeaders: Record<string, string> = {};
  const auth = req.headers.get('authorization');
  if (auth) forwardHeaders['authorization'] = auth;
  const ct = req.headers.get('content-type');
  if (ct) forwardHeaders['content-type'] = ct;

  const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
  const body = hasBody ? await req.arrayBuffer() : undefined;

  try {
    const upstream = await fetch(url.toString(), {
      method: req.method,
      headers: forwardHeaders,
      body: body ? Buffer.from(body) : undefined,
      signal: AbortSignal.timeout(30_000),
    });

    const resHeaders = new Headers();
    upstream.headers.forEach((value, key) => {
      if (!STRIP_HEADERS.has(key.toLowerCase())) resHeaders.set(key, value);
    });

    return new NextResponse(upstream.body, { status: upstream.status, headers: resHeaders });
  } catch (err) {
    const isTimeout = err instanceof Error && (err.name === 'TimeoutError' || err.name === 'AbortError');
    return NextResponse.json(
      { detail: isTimeout ? 'El servicio tardó demasiado en responder' : 'No se pudo conectar con el servicio de inventario' },
      { status: 503 }
    );
  }
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE };