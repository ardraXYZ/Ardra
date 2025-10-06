export const revalidate = 0
export const dynamic = "force-dynamic"

export default function KeepalivePage() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <div style={{ textAlign: "center", opacity: 0.9 }}>
        <div style={{ fontSize: 16, marginBottom: 8 }}>Ardra Keepalive</div>
        <div style={{ fontSize: 12, color: "#aaa" }}>This tab keeps the extension active. You can minimize it.</div>
      </div>
    </main>
  )
}

