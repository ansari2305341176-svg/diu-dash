import { getStore } from "@netlify/blobs";

export default async (req) => {
  const store = getStore("diu-dash");
  let list = (await store.get("top", { type: "json" })) || [];

  if (req.method === "POST") {
    const { name, score } = await req.json();
    const n = String(name || "Anonymous").replace(/[<>]/g, "").trim().slice(0, 16) || "Anonymous";
    const s = Number(score);
    if (!Number.isFinite(s) || s < 0 || s > 2600) {
      return Response.json({ error: "bad score" }, { status: 400 });
    }
    list.push({ name: n, score: Math.floor(s) });
    list.sort((a, b) => b.score - a.score);
    list = list.slice(0, 10);
    await store.setJSON("top", list);
  }
  return Response.json(list);
};

export const config = { path: "/api/scores" };