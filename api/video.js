// Video helper for the Reels tab.
// X doesn't let other websites download its video files directly, so the page asks this function
// to fetch the video and pass it straight through. Only X's own media servers are allowed,
// so it can't be used to fetch anything else.
export const config = { runtime: "edge" };

const ALLOWED_HOSTS = new Set(["video.twimg.com", "pbs.twimg.com"]);

export default async function handler(req) {
  const target = new URL(req.url).searchParams.get("url") || "";
  let url;
  try { url = new URL(target); } catch { return new Response("Bad link", { status: 400 }); }
  if (url.protocol !== "https:" || !ALLOWED_HOSTS.has(url.hostname)) {
    return new Response("Only X video links are allowed", { status: 400 });
  }
  const upstream = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" } });
  if (!upstream.ok || !upstream.body) return new Response("Couldn't get the video", { status: 502 });
  return new Response(upstream.body, {
    headers: {
      "content-type": upstream.headers.get("content-type") || "video/mp4",
      "cache-control": "public, max-age=86400",
    },
  });
}
