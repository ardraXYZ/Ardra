export async function loadAnime() {
  const mod = await import("animejs")
  return (mod as any).default ?? mod
}
