// Answers byte-range requests for the reel videos, because iPhone Safari won't play an MP4 unless the
// server replies "206 Partial Content". Cloudflare static assets always send the whole file, so this
// Worker runs only for /assets/reels/* (see run_worker_first in wrangler.jsonc). Every other file,
// and the _redirects short links, are served by static assets as before.
const MAX_BYTES = 20 * 1024 * 1024; // the web copies are ~2 MB; anything bigger is sent whole

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.endsWith(".mp4") || !["GET", "HEAD"].includes(request.method)) {
      return env.ASSETS.fetch(request);
    }

    const range = request.headers.get("Range");
    const ifRange = request.headers.get("If-Range");
    const fwd = new Headers(request.headers);
    fwd.delete("Range");
    fwd.delete("If-Range");
    if (range) { fwd.delete("If-None-Match"); fwd.delete("If-Modified-Since"); }
    const full = await env.ASSETS.fetch(new Request(url, { method: "GET", headers: fwd }));
    if (full.status !== 200) return full; // 304, 404…

    const headers = new Headers(full.headers);
    headers.set("Accept-Ranges", "bytes");
    const size = Number(full.headers.get("Content-Length")) || 0;
    const m = range && /^bytes=(\d*)-(\d*)$/.exec(range.trim());
    const ifRangeOk = !ifRange || ifRange === full.headers.get("ETag");

    if (!m || (m[1] === "" && m[2] === "") || !ifRangeOk || size > MAX_BYTES) {
      return new Response(request.method === "HEAD" ? null : full.body, { status: 200, headers });
    }

    const buf = await full.arrayBuffer();
    const total = buf.byteLength;
    let start, end;
    if (m[1] === "") { start = Math.max(0, total - Number(m[2])); end = total - 1; }          // bytes=-500
    else { start = Number(m[1]); end = m[2] === "" ? total - 1 : Math.min(Number(m[2]), total - 1); }

    if (start >= total || start > end) {
      return new Response(null, { status: 416, headers: { "Content-Range": "bytes */" + total, "Accept-Ranges": "bytes" } });
    }
    headers.set("Content-Range", "bytes " + start + "-" + end + "/" + total);
    headers.set("Content-Length", String(end - start + 1));
    return new Response(request.method === "HEAD" ? null : buf.slice(start, end + 1), { status: 206, headers });
  }
};
