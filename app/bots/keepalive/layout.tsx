export default function KeepaliveLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff" }}>
      {children}
    </div>
  )
}
