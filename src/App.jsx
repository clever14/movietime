import { useState, useEffect, useCallback } from "react";

/* ══ SUPABASE ══ */
const SB_URL = "https://uangxffhqvokvqpfqyqq.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhbmd4ZmZocXZva3ZxcGZxeXFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4MDQyNDQsImV4cCI6MjA5NzM4MDI0NH0.tUsnvdgFhGNbaKqPiVcOXBUBO-NrxqDnq8LbE9zMA-M";
const H = {
  "Content-Type": "application/json",
  "apikey": SB_KEY,
  "Authorization": `Bearer ${SB_KEY}`,
  "Prefer": "return=minimal"
};

async function sb(path, opts = {}) {
  try {
    const r = await fetch(`${SB_URL}/rest/v1/${path}`, { headers: H, ...opts });
    const t = await r.text();
    return t ? JSON.parse(t) : null;
  } catch (e) { console.error(e); return null; }
}

const DB = {
  getRecords: () => sb("records?select=*&order=created_at.asc"),
  addRecords: (recs) => sb("records", { method: "POST", body: JSON.stringify(recs), headers: { ...H, "Prefer": "return=minimal" } }),
  serveOrder: (code, cat) => sb(`records?order_code=eq.${encodeURIComponent(code)}&category=eq.${encodeURIComponent(cat)}`, { method: "PATCH", body: JSON.stringify({ served: true }) }),
  deleteRecords: () => sb("records?id=neq.null", { method: "DELETE" }),
  getCounter: async () => { const d = await sb("app_counter?id=eq.1&select=value"); return d?.[0]?.value || 1; },
  setCounter: (n) => sb("app_counter?id=eq.1", { method: "PATCH", body: JSON.stringify({ value: n }) }),
  getUsers: () => sb("app_users?select=*"),
  addUser: (u) => sb("app_users", { method: "POST", body: JSON.stringify(u) }),
  toggleUser: (id, active) => sb(`app_users?id=eq.${id}`, { method: "PATCH", body: JSON.stringify({ active }) }),
  resetCounter: () => sb("app_counter?id=eq.1", { method: "PATCH", body: JSON.stringify({ value: 1 }) }),
};

/* ══ CONSTANTS ══ */
const T = { bg: "#080808", card: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.08)", gold: "#FFD700", green: "#10B981" };
const ADMIN_CREDS = { login: "Yannick_Douo", password: "adminMtsh2@26" };
const SERVER_PWD = "90901918";

const CATALOG = {
  Nourriture: [
    { id: "f1", name: "Attiéké + Porc", price: 2000, img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80" },
    { id: "f2", name: "Attiéké + Poulet", price: 2000, img: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400&q=80" },
    { id: "f3", name: "Alloco + Porc", price: 2000, img: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80" },
    { id: "f4", name: "Alloco + Poulet", price: 2000, img: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400&q=80" },
    { id: "f5", name: "Frite + Porc", price: 2000, img: "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=400&q=80" },
    { id: "f6", name: "Frite + Poulet", price: 2000, img: "https://images.unsplash.com/photo-1562967914-608f82629710?w=400&q=80" },
    { id: "f7", name: "Boule d'Attiéké", price: 100, img: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=80" },
  ],
  Popcorn: [
    { id: "p1", name: "Popcorn Sucré", price: 500, img: "https://images.unsplash.com/photo-1514190051997-0f6f39ca5cde?w=400&q=80" },
    { id: "p2", name: "Popcorn Salé", price: 500, img: "https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=400&q=80" },
  ],
  Boisson: [
    { id: "b1", name: "Short Liqueur", price: 500, img: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&q=80" },
    { id: "b2", name: "Bock", price: 500, img: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&q=80" },
    { id: "b3", name: "Castel", price: 500, img: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400&q=80" },
    { id: "b4", name: "Beaufort", price: 500, img: "https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=400&q=80" },
    { id: "b5", name: "Bouteille d'Eau", price: 100, img: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&q=80" },
  ],
};

const ALL_PRODUCTS = Object.values(CATALOG).flat();
const CAT_META = {
  Nourriture: { icon: "🍽️", color: "#FF6B35", glow: "rgba(255,107,53,0.35)" },
  Popcorn: { icon: "🍿", color: "#FFD700", glow: "rgba(255,215,0,0.3)" },
  Boisson: { icon: "🥤", color: "#00B4D8", glow: "rgba(0,180,216,0.3)" },
};

function getCategory(name) { for (const [cat, items] of Object.entries(CATALOG)) if (items.find(i => i.name === name)) return cat; return null; }
function getProduct(name) { return ALL_PRODUCTS.find(p => p.name === name); }
function fmt(v) { return new Intl.NumberFormat("fr-FR").format(v) + " Fr"; }
function fmtTime(iso) { return new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Abidjan" }).format(new Date(iso)); }
function elapsed(iso) { const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000); if (s < 60) return `${s}s`; const m = Math.floor(s / 60); if (m < 60) return `${m}min`; return `${Math.floor(m / 60)}h${m % 60}`; }

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
html,body{font-family:'Inter',sans-serif;background:#080808;color:#fff;overflow-x:hidden;}
::-webkit-scrollbar{width:4px;height:4px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:4px;}
input,button,select{font-family:'Inter',sans-serif;}
@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes glow{0%,100%{box-shadow:0 0 30px rgba(220,20,60,0.5)}50%{box-shadow:0 0 60px rgba(220,20,60,0.9)}}
@keyframes shimmer{0%{background-position:-300% 0}100%{background-position:300% 0}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes pop{0%{transform:scale(0.8);opacity:0}70%{transform:scale(1.05)}100%{transform:scale(1);opacity:1}}
.fu{animation:fadeUp 0.5s ease forwards;}
.pop{animation:pop 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards;}
`;

function Clock({ color = "#FFD700", size = 12 }) {
  const [t, setT] = useState("");
  useEffect(() => {
    const tick = () => setT(new Intl.DateTimeFormat("fr-FR", { timeZone: "Africa/Abidjan", weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date()));
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, []);
  return <span style={{ fontSize: size, color, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{t}</span>;
}

/* ══════════ ROOT ══════════ */
export default function App() {
  const [page, setPage] = useState("welcome");
  const [user, setUser] = useState(null);
  const [records, setRecords] = useState([]);
  const [counter, setCounter] = useState(1);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    const [recs, ctr, usr] = await Promise.all([DB.getRecords(), DB.getCounter(), DB.getUsers()]);
    if (recs) setRecords(recs);
    if (ctr) setCounter(ctr);
    if (usr && usr.length > 0) setUsers(usr);
    else setUsers([{ id: "u1", login: "Yannick_Douo", name: "Yannick Douo", role: "admin", active: true }]);
  };

  useEffect(() => {
    reload().finally(() => setLoading(false));
    const id = setInterval(reload, 5000);
    return () => clearInterval(id);
  }, []);

  const logout = () => { setUser(null); setPage("welcome"); };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#080808", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
      <div style={{ width: 50, height: 50, border: "3px solid rgba(220,20,60,0.2)", borderTopColor: "#DC143C", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>Connexion à la base de données…</p>
    </div>
  );

  return (
    <>
      <style>{CSS}</style>
      {page === "welcome" && <WelcomePage onSelect={setPage} />}
      {page === "admin-login" && <LoginPage role="admin" onBack={() => setPage("welcome")} onSuccess={u => { setUser(u); setPage("admin"); }} />}
      {page === "server-login" && <LoginPage role="server" onBack={() => setPage("welcome")} onSuccess={u => { setUser(u); setPage("server"); }} />}
      {page === "admin" && <AdminApp user={user} records={records} counter={counter} users={users} reload={reload} setCounter={setCounter} setUsers={setUsers} onLogout={logout} />}
      {page === "server" && <ServerApp user={user} records={records} reload={reload} onLogout={logout} />}
    </>
  );
}

/* ══════════ WELCOME ══════════ */
function WelcomePage({ onSelect }) {
  const [hov, setHov] = useState(null);
  return (
    <div style={{ minHeight: "100vh", background: "#080808", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg,#DC143C,#FFD700,#DC143C,#FFD700)", backgroundSize: "200% 100%", animation: "shimmer 4s linear infinite" }} />
      <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(220,20,60,0.1) 0%,transparent 70%)", top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none" }} />
      <div className="fu" style={{ textAlign: "center", marginBottom: "3rem" }}>
        <div style={{ width: 100, height: 100, borderRadius: 28, background: "linear-gradient(135deg,#DC143C,#6B0A1E)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 50, margin: "0 auto 20px", animation: "glow 3s ease infinite" }}>🎬</div>
        <h1 style={{ fontSize: "clamp(1.8rem,5vw,3rem)", fontWeight: 900, letterSpacing: -2, background: "linear-gradient(135deg,#fff 30%,#FFD700 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 8 }}>Movie Time Show</h1>
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, letterSpacing: 4, textTransform: "uppercase" }}>Système de Gestion · 2026</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16, width: "100%", maxWidth: 540, marginBottom: "2rem" }}>
        {[
          { key: "admin-login", icon: "🔐", label: "Caisse", sub: "Administration complète", grad: "linear-gradient(145deg,#DC143C,#6B0A1E)", shadow: "0 20px 50px rgba(220,20,60,0.4)" },
          { key: "server-login", icon: "🍿", label: "Service", sub: "Gestion des commandes", grad: "linear-gradient(145deg,#C9920A,#7a5a00)", shadow: "0 20px 50px rgba(201,146,10,0.4)" },
        ].map(c => (
          <button key={c.key} onClick={() => onSelect(c.key)} onMouseEnter={() => setHov(c.key)} onMouseLeave={() => setHov(null)}
            style={{ background: hov === c.key ? c.grad : "rgba(255,255,255,0.04)", border: `1px solid ${hov === c.key ? "transparent" : "rgba(255,255,255,0.08)"}`, borderRadius: 24, padding: "2rem 1.5rem", cursor: "pointer", textAlign: "center", transition: "all 0.35s cubic-bezier(0.34,1.56,0.64,1)", transform: hov === c.key ? "translateY(-8px) scale(1.02)" : "none", boxShadow: hov === c.key ? c.shadow : "0 4px 20px rgba(0,0,0,0.4)" }}>
            <div style={{ fontSize: 48, marginBottom: 12, animation: hov === c.key ? "float 2s ease infinite" : "none" }}>{c.icon}</div>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: "#fff", marginBottom: 4 }}>{c.label}</h2>
            <p style={{ fontSize: 12, color: hov === c.key ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.35)", marginBottom: 20 }}>{c.sub}</p>
            <div style={{ padding: "10px", borderRadius: 12, background: hov === c.key ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.05)", fontSize: 13, fontWeight: 700, color: "#fff" }}>{hov === c.key ? "Entrer →" : "Accéder"}</div>
          </button>
        ))}
      </div>
      <p style={{ color: "rgba(255,255,255,0.12)", fontSize: 10, letterSpacing: 3, textTransform: "uppercase" }}>Designed by Clever Design</p>
    </div>
  );
}

/* ══════════ LOGIN ══════════ */
const iSt = { width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "13px 16px", color: "#fff", fontSize: 14, outline: "none" };
function LoginPage({ role, onBack, onSuccess }) {
  const [login, setLogin] = useState(""); const [pass, setPass] = useState(""); const [err, setErr] = useState(""); const [loading, setLoading] = useState(false);
  const isAdmin = role === "admin";
  const handle = async () => {
    setLoading(true); setErr(""); await new Promise(r => setTimeout(r, 600));
    if (isAdmin) { if (login === ADMIN_CREDS.login && pass === ADMIN_CREDS.password) onSuccess({ name: "Yannick Douo", login, role: "admin" }); else { setErr("Identifiants incorrects."); setLoading(false); } }
    else { if (pass === SERVER_PWD) onSuccess({ name: "Serveur", login: "server", role: "server" }); else { setErr("Code incorrect."); setLoading(false); } }
  };
  return (
    <div style={{ minHeight: "100vh", background: "#080808", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div className="fu" style={{ width: "100%", maxWidth: 400 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 13, marginBottom: 24, cursor: "pointer" }}>← Retour</button>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 28, padding: 36 }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>{isAdmin ? "🔐" : "🍿"}</div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 4 }}>{isAdmin ? "Administration" : "Espace Serveur"}</h2>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}>{isAdmin ? "Accès caisse sécurisé" : "Zone service uniquement"}</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {isAdmin && <div><label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)", marginBottom: 5, letterSpacing: 1.5, textTransform: "uppercase" }}>Identifiant</label><input value={login} onChange={e => setLogin(e.target.value)} placeholder="Login ID" style={iSt} /></div>}
            <div><label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)", marginBottom: 5, letterSpacing: 1.5, textTransform: "uppercase" }}>{isAdmin ? "Mot de passe" : "Code d'accès"}</label><input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && handle()} style={iSt} /></div>
            {err && <div style={{ background: "rgba(220,20,60,0.1)", border: "1px solid rgba(220,20,60,0.3)", borderRadius: 10, padding: "10px 14px", color: "#ff6b6b", fontSize: 13 }}>⚠ {err}</div>}
            <button onClick={handle} disabled={loading} style={{ background: loading ? "rgba(255,255,255,0.05)" : isAdmin ? "linear-gradient(135deg,#DC143C,#6B0A1E)" : "linear-gradient(135deg,#C9920A,#7a5a00)", border: "none", borderRadius: 14, padding: "14px", color: "#fff", fontSize: 14, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer", marginTop: 4 }}>
              {loading ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />Vérification…</span> : "Connexion →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════ ADMIN APP ══════════ */
function AdminApp({ user, records, counter, users, reload, setCounter, setUsers, onLogout }) {
  const [tab, setTab] = useState("pos");
  const [sideOpen, setSideOpen] = useState(true);
  const pending = new Set(records.filter(r => !r.served).map(r => r.order_code)).size;
  const revenue = records.filter(r => r.served).reduce((s, r) => s + Number(r.total_price || 0), 0);
  const navItems = [
    { id: "pos", icon: "🛒", label: "Nouvelle Vente" },
    { id: "orders", icon: "📋", label: "Commandes", badge: pending },
    { id: "stats", icon: "📈", label: "Statistiques" },
    { id: "inventory", icon: "📦", label: "Inventaire" },
    { id: "users", icon: "👥", label: "Utilisateurs" },
    { id: "settings", icon: "⚙️", label: "Paramètres" },
  ];
  return (
    <div style={{ display: "flex", height: "100vh", background: "#080808", overflow: "hidden" }}>
      <aside style={{ width: sideOpen ? 240 : 64, flexShrink: 0, background: "rgba(255,255,255,0.025)", borderRight: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", transition: "width 0.3s", overflow: "hidden" }}>
        <div style={{ padding: "18px 14px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: 10, minHeight: 70 }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: "linear-gradient(135deg,#DC143C,#6B0A1E)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🎬</div>
          {sideOpen && <div><div style={{ fontSize: 13, fontWeight: 800, color: "#fff", whiteSpace: "nowrap" }}>Movie Time Show</div><div style={{ fontSize: 9, color: T.gold, letterSpacing: 1.5, textTransform: "uppercase" }}>Admin</div></div>}
        </div>
        <nav style={{ flex: 1, padding: "10px 8px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>
          {navItems.map(n => (
            <button key={n.id} onClick={() => setTab(n.id)} title={n.label}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12, border: "none", cursor: "pointer", background: tab === n.id ? "rgba(220,20,60,0.15)" : "transparent", color: tab === n.id ? "#fff" : "rgba(255,255,255,0.4)", fontWeight: tab === n.id ? 700 : 500, fontSize: 13, whiteSpace: "nowrap", transition: "all 0.2s", borderLeft: tab === n.id ? "2px solid #DC143C" : "2px solid transparent", justifyContent: sideOpen ? "flex-start" : "center" }}>
              <span style={{ fontSize: 17, flexShrink: 0 }}>{n.icon}</span>
              {sideOpen && <span style={{ flex: 1 }}>{n.label}</span>}
              {sideOpen && n.badge > 0 && <span style={{ background: "#DC143C", color: "#fff", borderRadius: 999, fontSize: 10, fontWeight: 800, padding: "2px 6px" }}>{n.badge}</span>}
            </button>
          ))}
        </nav>
        <div style={{ padding: "10px 8px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          {sideOpen && <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "9px 12px", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,#DC143C,#6B0A1E)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>👑</div>
            <div><div style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{user?.name}</div><div style={{ fontSize: 9, color: T.gold }}>Administrateur</div></div>
          </div>}
          <button onClick={onLogout} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 12, border: "none", cursor: "pointer", background: "transparent", color: "rgba(220,20,60,0.7)", fontSize: 13, fontWeight: 600, width: "100%", justifyContent: sideOpen ? "flex-start" : "center" }}>
            <span>🚪</span>{sideOpen && "Déconnexion"}
          </button>
        </div>
      </aside>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <header style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "0 18px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setSideOpen(x => !x)} style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)", cursor: "pointer", fontSize: 15, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>☰</button>
            <h1 style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{navItems.find(n => n.id === tab)?.label}</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 10, padding: "5px 10px", display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981", display: "inline-block", animation: "pulse 2s ease infinite" }} />
              <span style={{ fontSize: 11, color: "#10B981", fontWeight: 600 }}>Synchronisé</span>
            </div>
            <Clock size={11} />
            <div style={{ background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.15)", borderRadius: 10, padding: "5px 10px" }}>
              <span style={{ fontSize: 11, color: T.gold, fontWeight: 700 }}>{fmt(revenue)}</span>
            </div>
          </div>
        </header>
        <div style={{ flex: 1, overflowY: "auto", padding: 18 }}>
          {tab === "pos" && <POSView records={records} counter={counter} reload={reload} setCounter={setCounter} />}
          {tab === "orders" && <OrdersView records={records} reload={reload} />}
          {tab === "stats" && <StatsView records={records} />}
          {tab === "inventory" && <InventoryView />}
          {tab === "users" && <UsersView users={users} reload={reload} setUsers={setUsers} />}
          {tab === "settings" && <SettingsView reload={reload} setCounter={setCounter} />}
        </div>
      </div>
    </div>
  );
}

/* ══════════ POS ══════════ */
function POSView({ records, counter, reload, setCounter }) {
  const [cart, setCart] = useState(new Map());
  const [activeCat, setActiveCat] = useState("Nourriture");
  const [flash, setFlash] = useState(null);
  const [saving, setSaving] = useState(false);

  const addToCart = useCallback((product) => {
    setCart(prev => {
      const n = new Map(prev);
      if (n.has(product.id)) { const item = { ...n.get(product.id) }; item.qty++; item.total = item.qty * item.price; n.set(product.id, item); }
      else n.set(product.id, { ...product, qty: 1, total: product.price, category: getCategory(product.name) });
      return n;
    });
  }, []);

  const updateQty = (id, delta) => setCart(prev => {
    const n = new Map(prev); const item = { ...n.get(id) }; item.qty += delta;
    if (item.qty <= 0) n.delete(id); else { item.total = item.qty * item.price; n.set(id, item); }
    return n;
  });

  const cartItems = [...cart.values()];
  const cartTotal = cartItems.reduce((s, i) => s + i.total, 0);
  const cartEmpty = cartItems.length === 0;
  const m = CAT_META[activeCat];

  const handleSave = async () => {
    if (cartEmpty || saving) return;
    setSaving(true);
    const now = new Date().toISOString();
    const code = `MTSH#${counter}`;
    const newRecs = cartItems.map(item => ({
      id: `${code}-${item.id}-${Date.now()}`,
      item_name: item.name,
      category: item.category,
      quantity: item.qty,
      unit_price: item.price,
      total_price: item.total,
      created_at: now,
      order_code: code,
      served: false
    }));
    await DB.addRecords(newRecs);
    await DB.setCounter(counter + 1);
    setCounter(counter + 1);
    await reload();
    setCart(new Map());
    setSaving(false);
    setFlash(`✅ ${code} enregistrée !`);
    setTimeout(() => setFlash(null), 3000);
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16, height: "100%" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0, overflowY: "auto" }}>
        <div style={{ display: "flex", gap: 8 }}>
          {Object.entries(CAT_META).map(([cat, meta]) => (
            <button key={cat} onClick={() => setActiveCat(cat)}
              style={{ flex: 1, padding: "12px 8px", borderRadius: 16, border: `2px solid ${activeCat === cat ? meta.color : "rgba(255,255,255,0.07)"}`, cursor: "pointer", fontWeight: 800, fontSize: 13, background: activeCat === cat ? `${meta.color}18` : "rgba(255,255,255,0.03)", color: activeCat === cat ? meta.color : "rgba(255,255,255,0.4)", transition: "all 0.2s", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
              <span style={{ fontSize: 22 }}>{meta.icon}</span><span>{cat}</span>
            </button>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 12 }}>
          {CATALOG[activeCat].map(product => {
            const inCart = cart.get(product.id);
            return (
              <button key={product.id} onClick={() => addToCart(product)}
                style={{ background: "rgba(255,255,255,0.03)", border: `2px solid ${inCart ? m.color + "60" : "rgba(255,255,255,0.06)"}`, borderRadius: 18, overflow: "hidden", cursor: "pointer", textAlign: "left", padding: 0, transition: "all 0.2s", position: "relative" }}>
                {inCart && <div className="pop" style={{ position: "absolute", top: 6, right: 6, background: m.color, color: "#000", borderRadius: 999, fontSize: 11, fontWeight: 900, padding: "2px 7px", zIndex: 3 }}>{inCart.qty}</div>}
                <div style={{ height: 100, overflow: "hidden" }}><img src={product.img} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} /></div>
                <div style={{ padding: "8px 10px 10px" }}><p style={{ fontSize: 11, fontWeight: 700, color: "#fff", lineHeight: 1.3, marginBottom: 4 }}>{product.name}</p><p style={{ fontSize: 13, fontWeight: 900, color: m.color }}>{fmt(product.price)}</p></div>
              </button>
            );
          })}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 22, overflow: "hidden" }}>
        <div style={{ background: "rgba(220,20,60,0.12)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div><h3 style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>🧾 Commande #{counter}</h3><p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>{cartItems.length} article{cartItems.length !== 1 ? "s" : ""}</p></div>
          {!cartEmpty && <button onClick={() => setCart(new Map())} style={{ background: "rgba(220,20,60,0.15)", border: "none", borderRadius: 8, padding: "4px 10px", color: "#ff6b6b", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Vider</button>}
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "10px 12px", display: "flex", flexDirection: "column", gap: 7 }}>
          {cartEmpty ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, padding: "2rem 0" }}>
              <div style={{ fontSize: 40, animation: "float 3s ease infinite" }}>🛒</div>
              <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 12 }}>Panier vide</p>
            </div>
          ) : cartItems.map(item => (
            <div key={item.id} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "9px 11px", display: "flex", gap: 8, alignItems: "center" }}>
              <img src={item.img} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} onError={e => e.target.style.opacity = "0"} />
              <div style={{ flex: 1, minWidth: 0 }}><p style={{ fontSize: 11, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</p><p style={{ fontSize: 10, color: T.gold, fontWeight: 700, marginTop: 1 }}>{fmt(item.total)}</p></div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                <button onClick={() => updateQty(item.id, -1)} style={{ width: 24, height: 24, borderRadius: 7, border: "none", background: "rgba(255,255,255,0.08)", color: "#fff", cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#fff", minWidth: 18, textAlign: "center" }}>{item.qty}</span>
                <button onClick={() => updateQty(item.id, 1)} style={{ width: 24, height: 24, borderRadius: 7, border: "none", background: "rgba(220,20,60,0.3)", color: "#fff", cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
              </div>
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.15)", borderRadius: 12, padding: "10px 14px" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>TOTAL</span>
            <strong style={{ fontSize: 22, fontWeight: 900, color: T.gold }}>{fmt(cartTotal)}</strong>
          </div>
          {flash && <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: 10, padding: "9px 12px", color: "#10B981", fontSize: 12, fontWeight: 600, textAlign: "center" }}>{flash}</div>}
          <button onClick={handleSave} disabled={cartEmpty || saving}
            style={{ background: cartEmpty || saving ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg,#DC143C,#6B0A1E)", border: "none", borderRadius: 14, padding: "14px", color: cartEmpty || saving ? "rgba(255,255,255,0.2)" : "#fff", fontSize: 14, fontWeight: 800, cursor: cartEmpty || saving ? "not-allowed" : "pointer", transition: "all 0.2s" }}>
            {saving ? "Enregistrement…" : "✓ Valider la commande"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════ ORDERS ══════════ */
function OrdersView({ records, reload }) {
  const [filter, setFilter] = useState("pending");
  const pendingGroups = new Map();
  records.forEach(r => {
    const cat = getCategory(r.item_name);
    if (!cat || !r.order_code || r.served) return;
    const key = `${r.order_code}_${cat}`;
    if (!pendingGroups.has(key)) pendingGroups.set(key, { code: r.order_code, category: cat, created_at: r.created_at, items: [], key });
    pendingGroups.get(key).items.push(r);
  });
  const pList = [...pendingGroups.values()].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  const sGroups = new Map();
  records.filter(r => r.served && r.order_code).forEach(r => {
    if (!sGroups.has(r.order_code)) sGroups.set(r.order_code, { code: r.order_code, created_at: r.created_at, items: [] });
    sGroups.get(r.order_code).items.push(r);
  });
  const sList = [...sGroups.values()].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const handleServe = async (code, cat) => { await DB.serveOrder(code, cat); await reload(); };
  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {[{ id: "pending", l: `En attente (${pList.length})`, c: "#F59E0B" }, { id: "served", l: `Servies (${sList.length})`, c: "#10B981" }].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} style={{ padding: "9px 18px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12, background: filter === f.id ? `${f.c}18` : "rgba(255,255,255,0.04)", color: filter === f.id ? f.c : "rgba(255,255,255,0.4)", borderBottom: filter === f.id ? `2px solid ${f.c}` : "2px solid transparent" }}>{f.l}</button>
        ))}
      </div>
      {filter === "pending" && (pList.length === 0 ? <EmptyState icon="📋" text="Aucune commande en attente" /> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 14 }}>
          {pList.map(g => {
            const meta = CAT_META[g.category] || CAT_META.Nourriture;
            const firstP = getProduct(g.items[0].item_name);
            return (
              <div key={g.key} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${meta.color}30`, borderRadius: 18, overflow: "hidden" }}>
                <div style={{ position: "relative", height: 110, overflow: "hidden" }}>
                  <img src={firstP?.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,transparent,rgba(8,8,8,0.95))" }} />
                  <div style={{ position: "absolute", top: 8, left: 10, background: meta.color, color: "#000", borderRadius: 6, padding: "3px 8px", fontSize: 10, fontWeight: 800 }}>{meta.icon} {g.category}</div>
                  <div style={{ position: "absolute", bottom: 8, left: 12 }}><p style={{ fontSize: 20, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{g.code}</p><p style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 1 }}>⏱ {elapsed(g.created_at)}</p></div>
                </div>
                <div style={{ padding: "10px 12px 12px" }}>
                  {g.items.map((item, i) => <p key={i} style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.65)", marginBottom: 2 }}>{item.quantity} × {item.item_name}</p>)}
                  <button onClick={() => handleServe(g.code, g.category)} style={{ width: "100%", background: "linear-gradient(135deg,#10B981,#059669)", border: "none", borderRadius: 10, padding: "10px", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", marginTop: 10 }}>✓ Servie</button>
                </div>
              </div>
            );
          })}
        </div>
      ))}
      {filter === "served" && (sList.length === 0 ? <EmptyState icon="✅" text="Aucune commande servie" /> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 10 }}>
          {sList.map(o => (
            <div key={o.code} style={{ background: "rgba(16,185,129,0.04)", border: "1px solid rgba(16,185,129,0.12)", borderRadius: 14, padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><p style={{ fontWeight: 800, fontSize: 15, color: "#fff" }}>{o.code}</p><span style={{ background: "rgba(16,185,129,0.15)", color: "#10B981", padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 600 }}>✓</span></div>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>{fmtTime(o.created_at)}</p>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>{o.items.slice(0, 3).map(i => `${i.quantity}×${i.item_name}`).join(" · ")}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ══════════ STATS ══════════ */
function StatsView({ records }) {
  const served = records.filter(r => r.served);
  const catT = { Nourriture: 0, Popcorn: 0, Boisson: 0 };
  const pD = {}; const hourly = {};
  served.forEach(r => {
    const cat = getCategory(r.item_name);
    if (cat) catT[cat] += Number(r.total_price || 0);
    if (!pD[r.item_name]) pD[r.item_name] = { name: r.item_name, qty: 0, total: 0, img: getProduct(r.item_name)?.img };
    pD[r.item_name].qty += Number(r.quantity);
    pD[r.item_name].total += Number(r.total_price || 0);
    const h = new Date(r.created_at).toLocaleString("fr-FR", { timeZone: "Africa/Abidjan", hour: "2-digit", hour12: false });
    hourly[h] = (hourly[h] || 0) + Number(r.total_price || 0);
  });
  const grand = Object.values(catT).reduce((a, b) => a + b, 0) || 1;
  const top = Object.values(pD).sort((a, b) => b.total - a.total).slice(0, 6);
  const uO = new Set(served.map(r => r.order_code)).size;
  const tR = served.reduce((s, r) => s + Number(r.total_price || 0), 0);
  const allOrders = new Set(records.map(r => r.order_code)).size;
  const hrs = Object.keys(hourly).sort().slice(-12);
  const hVals = Object.values(hourly);
  const maxH = hVals.length > 0 ? Math.max(...hVals) : 1;
  const exportPDF = () => {
    const txt = ["MOVIE TIME SHOW — RAPPORT", new Date().toLocaleString("fr-FR", { timeZone: "Africa/Abidjan" }), "", `Revenu: ${fmt(tR)}`, `Commandes: ${allOrders}`, `Servies: ${uO}`, `Ticket moyen: ${uO > 0 ? fmt(Math.round(tR / uO)) : fmt(0)}`, "", `Nourriture: ${fmt(catT.Nourriture)}`, `Popcorn: ${fmt(catT.Popcorn)}`, `Boisson: ${fmt(catT.Boisson)}`, "", "TOP PRODUITS:", ...top.map((p, i) => `${i + 1}. ${p.name} ×${p.qty} — ${fmt(p.total)}`)].join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([txt], { type: "text/plain;charset=utf-8" })); a.download = `MTS_${new Date().toISOString().slice(0, 10)}.txt`; a.click();
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={exportPDF} style={{ background: "linear-gradient(135deg,#3B82F6,#1D4ED8)", border: "none", borderRadius: 10, padding: "10px 18px", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>📄 Exporter Rapport</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12 }}>
        {[{ l: "Revenu", v: fmt(tR), c: "#10B981" }, { l: "Commandes", v: allOrders, c: "#3B82F6" }, { l: "Articles", v: served.reduce((s, r) => s + Number(r.quantity), 0), c: "#8B5CF6" }, { l: "Ticket Moyen", v: uO > 0 ? fmt(Math.round(tR / uO)) : fmt(0), c: "#F59E0B" }].map(k => (
          <div key={k.l} style={{ background: `${k.c}10`, border: `1px solid ${k.c}20`, borderRadius: 14, padding: 14 }}><p style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{k.l}</p><p style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>{k.v}</p></div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, padding: 16 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 14 }}>📈 Ventes / heure</h3>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 110 }}>
            {hrs.length === 0 ? <EmptyState icon="📊" text="Aucune donnée" /> : hrs.map(h => (
              <div key={h} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, height: "100%" }}>
                <div style={{ width: "100%", background: "linear-gradient(to top,#DC143C,#FFD700)", borderRadius: "3px 3px 0 0", height: `${Math.max(5, Math.round(hourly[h] / maxH * 100))}%` }} />
                <span style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", fontWeight: 600 }}>{h}h</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, padding: 16 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 14 }}>🥧 Catégories</h3>
          {[["Nourriture", catT.Nourriture, "#FF6B35"], ["Popcorn", catT.Popcorn, "#FFD700"], ["Boisson", catT.Boisson, "#00B4D8"]].map(([cat, val, clr]) => {
            const pct = Math.round(val / grand * 100);
            return (
              <div key={cat} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>{cat}</span><span style={{ fontSize: 11, fontWeight: 700, color: clr }}>{pct}%</span></div>
                <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 99 }}><div style={{ height: "100%", width: `${pct}%`, background: clr, borderRadius: 99 }} /></div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, padding: 16 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 14 }}>⭐ Top Produits</h3>
        {top.length === 0 ? <EmptyState icon="📊" text="Aucune vente" /> : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(170px,1fr))", gap: 10 }}>
            {top.map((p, i) => (
              <div key={p.name} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, overflow: "hidden", display: "flex", gap: 10, alignItems: "center", padding: 10 }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <img src={p.img} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover" }} onError={e => e.target.style.opacity = "0"} />
                  <span style={{ position: "absolute", top: -4, left: -4, background: ["#FFD700", "#C0C0C0", "#CD7F32"][i] || "rgba(255,255,255,0.15)", color: "#000", borderRadius: 999, fontSize: 8, fontWeight: 800, padding: "1px 4px" }}>#{i + 1}</span>
                </div>
                <div style={{ minWidth: 0 }}><p style={{ fontSize: 11, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 2 }}>{p.name}</p><p style={{ fontSize: 10, color: T.gold, fontWeight: 700 }}>×{p.qty} · {fmt(p.total)}</p></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════ INVENTORY ══════════ */
function InventoryView() {
  const [items] = useState(() => ALL_PRODUCTS.map(p => ({ ...p, stock: Math.floor(Math.random() * 60) + 5, min: 10 })));
  return (
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 16 }}>📦 Inventaire</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(170px,1fr))", gap: 12 }}>
        {items.map(item => {
          const low = item.stock <= item.min;
          return (
            <div key={item.id} style={{ background: low ? "rgba(220,20,60,0.05)" : T.card, border: `1px solid ${low ? "rgba(220,20,60,0.25)" : T.border}`, borderRadius: 16, overflow: "hidden" }}>
              <div style={{ height: 80, overflow: "hidden" }}><img src={item.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.65 }} onError={e => e.target.style.display = "none"} /></div>
              <div style={{ padding: "8px 10px" }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#fff", lineHeight: 1.3, marginBottom: 4 }}>{item.name}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Stock</span><strong style={{ fontSize: 18, fontWeight: 900, color: low ? "#ff6b6b" : "#10B981" }}>{item.stock}</strong></div>
                {low && <p style={{ fontSize: 9, color: "#ff6b6b", fontWeight: 600, marginTop: 3 }}>⚠ Stock bas</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════ USERS ══════════ */
function UsersView({ users, reload, setUsers }) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ login: "", name: "", role: "server", password: "" });
  const [err, setErr] = useState("");
  const addUser = async () => {
    if (!form.login || !form.password || !form.name) { setErr("Tous les champs requis."); return; }
    await DB.addUser({ id: `u${Date.now()}`, login: form.login, name: form.name, role: form.role, active: true });
    await reload();
    setModal(false); setForm({ login: "", name: "", role: "server", password: "" }); setErr("");
  };
  const toggle = async id => {
    if (id === "u1") return;
    const u = users.find(x => x.id === id);
    await DB.toggleUser(id, !u.active);
    await reload();
  };
  const roleC = { admin: "#DC143C", server: "#3B82F6" };
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>👥 Utilisateurs</h2>
        <button onClick={() => setModal(true)} style={{ background: "linear-gradient(135deg,#DC143C,#6B0A1E)", border: "none", borderRadius: 10, padding: "8px 16px", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+ Ajouter</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 12 }}>
        {users.map(u => {
          const c = roleC[u.role] || "#666";
          return (
            <div key={u.id} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, padding: 18, opacity: u.active ? 1 : 0.55 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: `${c}18`, border: `1px solid ${c}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{u.role === "admin" ? "👑" : "🍿"}</div>
                <span style={{ background: `${c}15`, color: c, fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 7, height: "fit-content" }}>{u.role === "admin" ? "Admin" : "Serveur"}</span>
              </div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 2 }}>{u.name}</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 12 }}>@{u.login}</p>
              <button onClick={() => toggle(u.id)} disabled={u.id === "u1"} style={{ width: "100%", background: u.active ? "rgba(16,185,129,0.08)" : "rgba(220,20,60,0.08)", border: `1px solid ${u.active ? "rgba(16,185,129,0.2)" : "rgba(220,20,60,0.2)"}`, borderRadius: 10, padding: "8px", color: u.active ? "#10B981" : "#ff6b6b", fontSize: 11, fontWeight: 700, cursor: u.id === "u1" ? "not-allowed" : "pointer" }}>{u.active ? "✓ Actif" : "✗ Inactif"}</button>
            </div>
          );
        })}
      </div>
      {modal && (
        <Modal title="Créer un compte" onClose={() => { setModal(false); setErr(""); }}>
          {[["Nom", "name", "text"], ["Login", "login", "text"], ["Mot de passe", "password", "password"]].map(([l, k, t]) => (
            <div key={k} style={{ marginBottom: 10 }}><label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>{l}</label><input type={t} value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} style={iSt} /></div>
          ))}
          <div style={{ marginBottom: 12 }}><label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>Rôle</label><select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} style={{ ...iSt, appearance: "none" }}><option value="server">Serveur</option><option value="admin">Admin</option></select></div>
          {err && <p style={{ color: "#ff6b6b", fontSize: 11, marginBottom: 10 }}>⚠ {err}</p>}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => { setModal(false); setErr(""); }} style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 10, padding: "11px", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Annuler</button>
            <button onClick={addUser} style={{ flex: 1, background: "linear-gradient(135deg,#DC143C,#6B0A1E)", border: "none", borderRadius: 10, padding: "11px", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Créer</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ══════════ SETTINGS ══════════ */
function SettingsView({ reload, setCounter }) {
  const [modal, setModal] = useState(false);
  const [pwd, setPwd] = useState(""); const [err, setErr] = useState("");
  const doReset = async () => {
    if (pwd !== "09820443") { setErr("Code incorrect."); setPwd(""); return; }
    await DB.deleteRecords();
    await DB.resetCounter();
    setCounter(1);
    await reload();
    setModal(false); setPwd(""); setErr("");
  };
  return (
    <div style={{ maxWidth: 520 }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 16 }}>⚙️ Paramètres</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[{ i: "🏪", t: "Établissement", v: "Movie Time Show" }, { i: "🌍", t: "Fuseau horaire", v: "Africa/Abidjan (GMT+0)" }, { i: "💰", t: "Devise", v: "Franc CFA (Fr)" }].map(s => (
          <div key={s.t} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}><span style={{ fontSize: 20 }}>{s.i}</span><div><p style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>{s.t}</p><p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{s.v}</p></div></div>
            <button style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 7, padding: "5px 12px", color: "rgba(255,255,255,0.35)", fontSize: 11, cursor: "pointer" }}>Modifier</button>
          </div>
        ))}
        <div style={{ background: "rgba(220,20,60,0.05)", border: "1px solid rgba(220,20,60,0.18)", borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}><span style={{ fontSize: 20 }}>🗑️</span><div><p style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>Réinitialiser</p><p style={{ fontSize: 11, color: "#ff6b6b" }}>Action irréversible</p></div></div>
          <button onClick={() => setModal(true)} style={{ background: "rgba(220,20,60,0.15)", border: "1px solid rgba(220,20,60,0.3)", borderRadius: 7, padding: "5px 12px", color: "#ff6b6b", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Reset</button>
        </div>
      </div>
      {modal && (
        <Modal title="⚠️ Confirmation" onClose={() => { setModal(false); setErr(""); setPwd(""); }}>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginBottom: 12 }}>Entrez le code de sécurité.</p>
          <input type="password" placeholder="Code" value={pwd} onChange={e => setPwd(e.target.value)} style={{ ...iSt, marginBottom: 8 }} />
          {err && <p style={{ color: "#ff6b6b", fontSize: 11, marginBottom: 8 }}>⚠ {err}</p>}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => { setModal(false); setErr(""); setPwd(""); }} style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "none", borderRadius: 10, padding: "11px", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Annuler</button>
            <button onClick={doReset} style={{ flex: 1, background: "linear-gradient(135deg,#DC143C,#6B0A1E)", border: "none", borderRadius: 10, padding: "11px", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Confirmer</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ══════════ SERVER APP ══════════ */
function ServerApp({ user, records, reload, onLogout }) {
  const [cat, setCat] = useState("Nourriture");
  const [view, setView] = useState("prepare");

  useEffect(() => {
    const id = setInterval(reload, 5000);
    return () => clearInterval(id);
  }, []);

  const allPending = new Map();
  records.forEach(r => {
    const rcat = getCategory(r.item_name);
    if (!rcat || !r.order_code || r.served) return;
    const key = `${r.order_code}_${rcat}`;
    if (!allPending.has(key)) allPending.set(key, { code: r.order_code, category: rcat, created_at: r.created_at, items: [], key });
    allPending.get(key).items.push(r);
  });

  const servedMap = new Map();
  records.filter(r => r.served && r.order_code).forEach(r => {
    const rcat = getCategory(r.item_name);
    if (!servedMap.has(r.order_code)) servedMap.set(r.order_code, { code: r.order_code, created_at: r.created_at, items: [] });
    servedMap.get(r.order_code).items.push({ ...r, category: rcat });
  });

  const pendingByCat = {
    Nourriture: [...allPending.values()].filter(g => g.category === "Nourriture"),
    Popcorn: [...allPending.values()].filter(g => g.category === "Popcorn"),
    Boisson: [...allPending.values()].filter(g => g.category === "Boisson"),
  };
  const catGroups = pendingByCat[cat] || [];
  const totalPending = [...allPending.values()].length;
  const servedForCat = [...servedMap.values()].filter(o => o.items.some(i => i.category === cat)).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const handleServe = async (code, category) => {
    await DB.serveOrder(code, category);
    await reload();
  };

  const m = CAT_META[cat];
  return (
    <div style={{ minHeight: "100vh", background: "#080808", display: "flex", flexDirection: "column" }}>
      <div style={{ height: 3, background: "linear-gradient(90deg,#DC143C,#FFD700,#DC143C)", backgroundSize: "200% 100%", animation: "shimmer 4s linear infinite" }} />
      <header style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: "linear-gradient(135deg,#DC143C,#6B0A1E)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🎬</div>
            <div><div style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>Movie Time Show</div><div style={{ fontSize: 9, color: T.gold, letterSpacing: 2, textTransform: "uppercase" }}>Espace Service</div></div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ background: "rgba(220,20,60,0.12)", border: "1px solid rgba(220,20,60,0.25)", borderRadius: 10, padding: "6px 12px", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#DC143C", display: "inline-block", animation: "pulse 1.5s ease infinite" }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#DC143C" }}>{totalPending} à préparer</span>
            </div>
            <Clock size={11} />
            <button onClick={onLogout} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "6px 12px", color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Déco.</button>
          </div>
        </div>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          {Object.entries(CAT_META).map(([catName, meta]) => {
            const count = pendingByCat[catName]?.length || 0;
            const isActive = cat === catName;
            return (
              <button key={catName} onClick={() => setCat(catName)}
                style={{ flex: 1, padding: "13px 8px", background: isActive ? `${meta.color}12` : "transparent", border: "none", borderBottom: isActive ? `3px solid ${meta.color}` : "3px solid transparent", cursor: "pointer", transition: "all 0.2s", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 18 }}>{meta.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: isActive ? meta.color : "rgba(255,255,255,0.45)" }}>{catName.toUpperCase()}</span>
                  {count > 0 && <span style={{ background: meta.color, color: "#000", borderRadius: 999, fontSize: 10, fontWeight: 800, padding: "1px 6px" }}>{count}</span>}
                </div>
              </button>
            );
          })}
        </div>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "8px 16px", display: "flex", gap: 6 }}>
          {[{ id: "prepare", l: "À Préparer", count: catGroups.length, c: "#F59E0B" }, { id: "served", l: "Servies", count: servedForCat.length, c: "#10B981" }].map(v => (
            <button key={v.id} onClick={() => setView(v.id)} style={{ padding: "7px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 11, background: view === v.id ? `${v.c}15` : "rgba(255,255,255,0.03)", color: view === v.id ? v.c : "rgba(255,255,255,0.35)", borderBottom: view === v.id ? `2px solid ${v.c}` : "2px solid transparent" }}>
              {v.l} {v.count > 0 && `(${v.count})`}
            </button>
          ))}
        </div>
      </header>
      <main style={{ flex: 1, maxWidth: 1200, margin: "0 auto", width: "100%", padding: "16px" }}>
        {view === "prepare" && (
          catGroups.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem 2rem", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
              <div style={{ fontSize: 60, animation: "float 3s ease infinite" }}>{m.icon}</div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>Aucune commande {cat.toLowerCase()}</h3>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>Les nouvelles commandes apparaîtront ici automatiquement.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
              {catGroups.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)).map(group => (
                <ServerOrderCard key={group.key} group={group} meta={m} onServe={() => handleServe(group.code, group.category)} />
              ))}
            </div>
          )
        )}
        {view === "served" && (
          servedForCat.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem 2rem", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
              <div style={{ fontSize: 60 }}>✅</div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>Aucune commande {cat.toLowerCase()} servie</h3>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))", gap: 12 }}>
              {servedForCat.map(order => {
                const catItems = order.items.filter(i => i.category === cat);
                if (!catItems.length) return null;
                const firstP = getProduct(catItems[0].item_name);
                return (
                  <div key={order.code} style={{ background: "rgba(16,185,129,0.04)", border: "1px solid rgba(16,185,129,0.12)", borderRadius: 18, overflow: "hidden" }}>
                    <div style={{ position: "relative", height: 90, overflow: "hidden" }}>
                      <img src={firstP?.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.45)" }} onError={e => e.target.style.display = "none"} />
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,transparent,rgba(8,8,8,0.9))" }} />
                      <div style={{ position: "absolute", top: 6, right: 6, background: "rgba(16,185,129,0.9)", borderRadius: 6, padding: "3px 8px", fontSize: 10, fontWeight: 700, color: "#fff" }}>✓ Servie</div>
                      <div style={{ position: "absolute", bottom: 6, left: 10 }}><p style={{ fontSize: 16, fontWeight: 900, color: "#fff" }}>{order.code}</p></div>
                    </div>
                    <div style={{ padding: "8px 12px 12px" }}>
                      <p style={{ fontSize: 10, color: "rgba(16,185,129,0.7)", fontWeight: 600, marginBottom: 6 }}>{fmtTime(order.created_at)}</p>
                      {catItems.map((item, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                          <img src={getProduct(item.item_name)?.img} alt="" style={{ width: 24, height: 24, borderRadius: 5, objectFit: "cover", opacity: 0.7 }} onError={e => e.target.style.opacity = "0"} />
                          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.item_name}</span>
                          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 700 }}>×{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </main>
      <footer style={{ padding: "10px 16px", borderTop: "1px solid rgba(255,255,255,0.04)", textAlign: "center" }}>
        <p style={{ color: "rgba(255,255,255,0.12)", fontSize: 9, letterSpacing: 2, textTransform: "uppercase" }}>Designed by Clever Design · Movie Time Show 2026</p>
      </footer>
    </div>
  );
}

/* ══════════ SERVER ORDER CARD ══════════ */
function ServerOrderCard({ group, meta, onServe }) {
  const [serving, setServing] = useState(false);
  const [hov, setHov] = useState(false);
  const firstP = getProduct(group.items[0].item_name);
  const handle = async () => { setServing(true); await onServe(); };
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${hov ? meta.color + "70" : "rgba(255,255,255,0.07)"}`, borderRadius: 22, overflow: "hidden", transition: "all 0.3s", transform: hov ? "translateY(-4px)" : "none", boxShadow: hov ? `0 20px 50px ${meta.glow}` : "0 4px 16px rgba(0,0,0,0.4)" }}>
      <div style={{ position: "relative", height: 180, overflow: "hidden" }}>
        <img src={firstP?.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s", transform: hov ? "scale(1.06)" : "scale(1)" }} onError={e => e.target.style.display = "none"} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,transparent 30%,rgba(8,8,8,0.97) 100%)" }} />
        <div style={{ position: "absolute", top: 10, left: 10 }}><span style={{ background: meta.color, color: "#000", borderRadius: 8, padding: "4px 10px", fontSize: 11, fontWeight: 800 }}>{meta.icon} {group.category}</span></div>
        <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", borderRadius: 8, padding: "4px 10px", fontSize: 11, fontWeight: 700 }}>⏱ {elapsed(group.created_at)}</div>
        <div style={{ position: "absolute", bottom: 12, left: 14 }}>
          <p style={{ fontSize: 28, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{group.code}</p>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{fmtTime(group.created_at)}</p>
        </div>
      </div>
      <div style={{ padding: "12px 14px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
        {group.items.map((item, i) => {
          const p = getProduct(item.item_name);
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "8px 10px" }}>
              <img src={p?.img} alt="" style={{ width: 38, height: 38, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} onError={e => e.target.style.opacity = "0"} />
              <div style={{ flex: 1, minWidth: 0 }}><p style={{ fontSize: 12, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.item_name}</p></div>
              <div style={{ background: `${meta.color}20`, color: meta.color, borderRadius: 8, padding: "3px 10px", fontSize: 13, fontWeight: 900 }}>×{item.quantity}</div>
            </div>
          );
        })}
        <button onClick={handle} disabled={serving}
          style={{ width: "100%", background: serving ? "rgba(255,255,255,0.06)" : `linear-gradient(135deg,${meta.color},${meta.color}cc)`, border: "none", borderRadius: 14, padding: "14px", color: serving ? "rgba(255,255,255,0.3)" : "#000", fontSize: 14, fontWeight: 900, cursor: serving ? "not-allowed" : "pointer", transition: "all 0.2s", marginTop: 4 }}>
          {serving ? "Traitement…" : "✓ COMMANDE SERVIE"}
        </button>
      </div>
    </div>
  );
}

/* ══════════ SHARED ══════════ */
function EmptyState({ icon, text }) {
  return (
    <div style={{ textAlign: "center", padding: "2.5rem", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 40 }}>{icon}</span>
      <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>{text}</p>
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: 32, width: "100%", maxWidth: 400 }}>
        <h3 style={{ fontSize: 17, fontWeight: 800, color: "#fff", marginBottom: 20 }}>{title}</h3>
        {children}
      </div>
    </div>
  );
  }
