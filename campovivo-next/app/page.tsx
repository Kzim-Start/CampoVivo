"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  Activity, AlertCircle, ArrowDownRight, ArrowRight, ArrowUpRight,
  BarChart3, Bell, CalendarDays, Check, CheckCircle2, ChevronDown,
  ChevronRight, CircleDollarSign, ClipboardList, Clock3, Download,
  Droplets, Fuel, HeartPulse, Leaf, Menu, MoreHorizontal, NotebookPen,
  Pencil, Plus, Search, Settings2, ShieldCheck, Sparkles, Syringe,
  Trash2, TrendingUp, Wallet, X, Beef, Tractor, RotateCcw, Upload,
  type LucideIcon,
} from "lucide-react";

type Page = "dashboard" | "animals" | "health" | "vaccines" | "expenses" | "fuel" | "notes" | "settings";
type Kind = "animal" | "health" | "vaccine" | "expense" | "fuel" | "note";
type AnimalStatus = "Saudável" | "Em observação" | "Em tratamento";
type Animal = { id: string; tag: string; name: string; breed: string; sex: "Macho" | "Fêmea"; weight: number; birthDate: string; status: AnimalStatus; note: string };
type HealthCase = { id: string; animalId: string; title: string; severity: "Baixa" | "Média" | "Alta"; date: string; status: "Aberta" | "Em acompanhamento" | "Resolvida"; symptoms: string; note: string };
type Vaccine = { id: string; animalId: string; name: string; scheduledAt: string; appliedAt: string; status: "Pendente" | "Aplicada"; batch: string; note: string };
type Expense = { id: string; title: string; category: string; amount: number; date: string; note: string };
type FuelLog = { id: string; vehicle: string; liters: number; price: number; date: string; hourmeter: string; note: string };
type FarmNote = { id: string; title: string; category: string; body: string; date: string };
type FarmData = { farmName: string; animals: Animal[]; health: HealthCase[]; vaccines: Vaccine[]; expenses: Expense[]; fuel: FuelLog[]; notes: FarmNote[] };

type MenuItem = { id: Page; title: string; icon: LucideIcon };
const navItems: MenuItem[] = [
  { id: "dashboard", title: "Visão geral", icon: BarChart3 },
  { id: "animals", title: "Meu rebanho", icon: Beef },
  { id: "health", title: "Saúde animal", icon: HeartPulse },
  { id: "vaccines", title: "Vacinação", icon: Syringe },
  { id: "expenses", title: "Financeiro", icon: Wallet },
  { id: "fuel", title: "Combustível", icon: Fuel },
  { id: "notes", title: "Anotações", icon: NotebookPen },
];
const pageNames: Record<Page, string> = {
  dashboard: "Visão geral", animals: "Meu rebanho", health: "Saúde animal", vaccines: "Vacinação",
  expenses: "Financeiro", fuel: "Combustível", notes: "Anotações", settings: "Configurações",
};
const pageToKind: Partial<Record<Page, Kind>> = {
  animals: "animal", health: "health", vaccines: "vaccine", expenses: "expense", fuel: "fuel", notes: "note",
};
const kindTitles: Record<Kind, string> = {
  animal: "animal", health: "ocorrência", vaccine: "vacina", expense: "despesa", fuel: "abastecimento", note: "anotação",
};
const expenseCategories = ["Alimentação", "Veterinária", "Manutenção", "Mão de obra", "Insumos", "Equipamentos", "Outros"];
const categoryColors: Record<string, string> = {
  "Alimentação": "#43a884", "Veterinária": "#9b82d9", "Manutenção": "#e9a458", "Mão de obra": "#6eade3", "Insumos": "#95b968", "Equipamentos": "#e4888d", "Outros": "#a0aaac",
};
const initialAvatars = ["B", "F", "G", "M", "P", "V", "C", "T"];
const money = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
const number = (value: number, digits = 0) => new Intl.NumberFormat("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);
const dateISO = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const offsetDays = (amount: number) => { const d = new Date(); d.setDate(d.getDate() + amount); return dateISO(d); };
const offsetMonths = (amount: number) => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() + amount); return dateISO(d); };
const dateLabel = (s: string) => s ? new Date(`${s}T12:00:00`).toLocaleDateString("pt-BR") : "—";
const dateShort = (s: string) => s ? new Date(`${s}T12:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }) : "—";
const monthKey = (s: string) => s.slice(0, 7);
const makeId = () => typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;

function blankData(farmName = "Minha Fazenda"): FarmData {
  return { farmName, animals: [], health: [], vaccines: [], expenses: [], fuel: [], notes: [] };
}

function seedData(): FarmData {
  const names = ["Estrela", "Mimosa", "Trovão", "Pérola", "Bento", "Canela", "Fumaça", "Aurora", "Jade", "Sereno", "Safira", "Balu", "Princesa", "Gaúcho", "Lua", "Faísca", "Nina", "Sultão", "Jasmim", "Valente", "Mel", "Branco", "Morena", "Zeca"];
  const breeds = ["Nelore", "Angus", "Nelore", "Brahman", "Nelore", "Girolando"];
  const animals: Animal[] = names.map((name, i) => ({
    id: `a${i + 1}`, tag: `BR-${String(1001 + i)}`, name, breed: breeds[i % breeds.length],
    sex: i % 4 === 2 ? "Macho" : "Fêmea", weight: 290 + ((i * 37) % 225),
    birthDate: offsetDays(-(250 + 47 * i)), status: i === 2 ? "Em tratamento" : i === 5 ? "Em observação" : "Saudável",
    note: i === 0 ? "Animal de boa condição corporal. Lote A, pasto norte." : i === 2 ? "Acompanhar evolução e orientações veterinárias." : "",
  }));
  const expenses: Expense[] = [
    ["Compra de ração", "Alimentação", 2840, -2], ["Consulta veterinária", "Veterinária", 680, -4],
    ["Reparo na cerca", "Manutenção", 1240, -6], ["Sal mineral", "Alimentação", 895, -9],
    ["Peças do trator", "Equipamentos", 1480, -13], ["Mão de obra extra", "Mão de obra", 2100, -17],
    ["Adubo de pastagem", "Insumos", 1950, -30], ["Manutenção de bomba", "Manutenção", 720, -37],
    ["Ração para bezerros", "Alimentação", 1710, -48], ["Medicamentos", "Veterinária", 930, -64],
    ["Roçadeira", "Equipamentos", 2600, -83], ["Serviço de curral", "Mão de obra", 1920, -109],
    ["Sal e suplementos", "Alimentação", 1630, -145], ["Insumos diversos", "Insumos", 1220, -174],
  ].map(([title, category, amount, day], i) => ({ id: `e${i}`, title: String(title), category: String(category), amount: Number(amount), date: offsetDays(Number(day)), note: "" }));
  return {
    farmName: "Fazenda Boa Vista", animals,
    health: [
      { id: "h1", animalId: "a3", title: "Claudicação", severity: "Média", date: offsetDays(-2), status: "Em acompanhamento", symptoms: "Dificuldade para apoiar uma das patas.", note: "Solicitada avaliação do veterinário. Reavaliar o animal." },
      { id: "h2", animalId: "a6", title: "Redução de apetite", severity: "Baixa", date: offsetDays(-1), status: "Aberta", symptoms: "Animal comendo menos que o habitual.", note: "Acompanhar consumo de água e alimentação." },
      { id: "h3", animalId: "a8", title: "Ferimento superficial", severity: "Baixa", date: offsetDays(-22), status: "Resolvida", symptoms: "Pequena lesão superficial.", note: "Registro de exemplo; resolução confirmada." },
    ],
    vaccines: [
      { id: "v1", animalId: "a1", name: "Clostridioses (exemplo)", scheduledAt: offsetDays(3), appliedAt: "", status: "Pendente", batch: "", note: "Calendário ilustrativo; confirmar com responsável técnico." },
      { id: "v2", animalId: "a4", name: "Raiva (exemplo)", scheduledAt: offsetDays(8), appliedAt: "", status: "Pendente", batch: "", note: "Agendamento ilustrativo, não é prescrição." },
      { id: "v3", animalId: "a10", name: "Clostridioses (exemplo)", scheduledAt: offsetDays(-1), appliedAt: "", status: "Pendente", batch: "", note: "Registro fictício para testar alerta de atraso." },
      { id: "v4", animalId: "a2", name: "Vacina registrada (exemplo)", scheduledAt: offsetDays(-12), appliedAt: offsetDays(-12), status: "Aplicada", batch: "DEMO-01", note: "Registro fictício." },
    ],
    expenses,
    fuel: [
      { id: "f1", vehicle: "Trator John Deere", liters: 85, price: 6.19, date: offsetDays(-2), hourmeter: "1.860 h", note: "Abastecimento no início do expediente." },
      { id: "f2", vehicle: "Caminhonete", liters: 62, price: 6.09, date: offsetDays(-5), hourmeter: "", note: "" },
      { id: "f3", vehicle: "Trator Massey", liters: 120, price: 6.25, date: offsetDays(-12), hourmeter: "3.420 h", note: "" },
      { id: "f4", vehicle: "Gerador", liters: 35, price: 6.12, date: offsetDays(-30), hourmeter: "", note: "" },
    ],
    notes: [
      { id: "n1", title: "Revisão das cercas", category: "Manutenção", body: "Conferir os mourões próximos ao pasto norte e providenciar os materiais para o reparo.", date: offsetDays(-1) },
      { id: "n2", title: "Observação do lote A", category: "Manejo", body: "Acompanhar peso e condição corporal dos animais no próximo manejo do curral.", date: offsetDays(-3) },
      { id: "n3", title: "Planejamento de compras", category: "Compras", body: "Levantar estoque de sal mineral e avaliar a próxima compra de insumos.", date: offsetDays(-5) },
    ],
  };
}

function Pill({ children, tone = "neutral", dot = false }: { children: ReactNode; tone?: "green" | "yellow" | "red" | "blue" | "purple" | "neutral"; dot?: boolean }) {
  return <span className={`pill pill-${tone}`}>{dot && <span className="pill-dot" />}{children}</span>;
}
function SmallIcon({ icon: Icon, className = "", size = 18 }: { icon: LucideIcon; className?: string; size?: number }) {
  return <span className={`small-icon ${className}`}><Icon size={size} strokeWidth={1.9} /></span>;
}
function Empty({ title, description, onAction, action }: { title: string; description: string; onAction?: () => void; action?: string }) {
  return <div className="empty-state"><div className="empty-illustration"><Leaf size={28}/></div><h3>{title}</h3><p>{description}</p>{onAction && <button className="btn btn-primary" onClick={onAction}><Plus size={17}/>{action || "Adicionar"}</button>}</div>;
}
function SectionHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="section-heading"><div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h2>{title}</h2>{description && <p>{description}</p>}</div>{action && <div className="heading-action">{action}</div>}</div>;
}
function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return <label className="field"><span className="field-label">{label}</span>{children}{hint && <small className="field-hint">{hint}</small>}</label>;
}
function NavButton({ item, selected, onClick }: { item: MenuItem; selected: boolean; onClick: () => void }) {
  const Icon = item.icon;
  return <button className={`nav-item ${selected ? "nav-active" : ""}`} onClick={onClick}><Icon size={19} strokeWidth={selected ? 2.3 : 1.85}/><span>{item.title}</span>{selected && <span className="nav-indicator"/>}</button>;
}

export default function Home() {
  const [data, setData] = useState<FarmData | null>(null);
  const [page, setPage] = useState<Page>("dashboard");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [modal, setModal] = useState<Kind | null>(null);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Todos");
  const [toast, setToast] = useState("");
  const [fuelLiters, setFuelLiters] = useState(0);
  const [fuelPrice, setFuelPrice] = useState(0);
  const [farmInput, setFarmInput] = useState("");
  const importRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("campovivo:data:v1");
      if (raw) {
        const parsed = JSON.parse(raw) as FarmData;
        if (isFarmData(parsed)) { setData(parsed); setFarmInput(parsed.farmName); return; }
      }
    } catch { /* Dados corrompidos são substituídos pelos registros de exemplo. */ }
    const seed = seedData(); setData(seed); setFarmInput(seed.farmName);
  }, []);
  useEffect(() => { if (data) localStorage.setItem("campovivo:data:v1", JSON.stringify(data)); }, [data]);
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(""), 3800); return () => window.clearTimeout(timer); }, [toast]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") { setModal(null); setMobileMenu(false); } };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  }, []);

  function notify(message: string) { setToast(message); }
  function navigate(to: Page) { setPage(to); setSearch(""); setFilter("Todos"); setMobileMenu(false); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function openForm(kind: Kind, record?: object) {
    setEditing(record ? { ...record } : null);
    setFuelLiters(kind === "fuel" && record ? Number((record as FuelLog).liters) : 0);
    setFuelPrice(kind === "fuel" && record ? Number((record as FuelLog).price) : 0);
    setModal(kind); setMobileMenu(false);
  }
  function closeForm() { setModal(null); setEditing(null); }
  function removeItem(kind: Kind, id: string) {
    if (!data || !window.confirm("Deseja excluir este registro? Esta ação não pode ser desfeita.")) return;
    setData(previous => {
      if (!previous) return previous;
      if (kind === "animal") return { ...previous, animals: previous.animals.filter(x => x.id !== id), health: previous.health.filter(x => x.animalId !== id), vaccines: previous.vaccines.filter(x => x.animalId !== id) };
      const key: "health" | "fuel" | "vaccines" | "expenses" | "notes" = kind === "expense" ? "expenses" : kind === "vaccine" ? "vaccines" : kind === "note" ? "notes" : kind;
      return { ...previous, [key]: (previous[key] as Array<{ id: string }>).filter(x => x.id !== id) };
    });
    notify("Registro excluído.");
  }
  function saveForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!modal || !data) return;
    const fd = new FormData(event.currentTarget);
    const val = (key: string) => String(fd.get(key) ?? "").trim();
    const id = String(editing?.id ?? makeId());
    let key: keyof FarmData; let record: Animal | Expense | FuelLog | HealthCase | Vaccine | FarmNote;
    if (modal === "animal") {
      key = "animals";
      record = { id, tag: val("tag"), name: val("name"), breed: val("breed"), sex: val("sex") as Animal["sex"], weight: Number(val("weight")), birthDate: val("birthDate"), status: val("status") as AnimalStatus, note: val("note") };
    } else if (modal === "health") {
      key = "health";
      record = { id, animalId: val("animalId"), title: val("title"), severity: val("severity") as HealthCase["severity"], date: val("date"), status: val("status") as HealthCase["status"], symptoms: val("symptoms"), note: val("note") };
    } else if (modal === "vaccine") {
      key = "vaccines";
      const status = val("status") as Vaccine["status"];
      record = { id, animalId: val("animalId"), name: val("name"), scheduledAt: val("scheduledAt"), appliedAt: status === "Aplicada" ? (val("appliedAt") || dateISO()) : "", status, batch: val("batch"), note: val("note") };
    } else if (modal === "expense") {
      key = "expenses";
      record = { id, title: val("title"), category: val("category"), amount: Number(val("amount")), date: val("date"), note: val("note") };
    } else if (modal === "fuel") {
      key = "fuel";
      record = { id, vehicle: val("vehicle"), liters: Number(val("liters")), price: Number(val("price")), date: val("date"), hourmeter: val("hourmeter"), note: val("note") };
    } else {
      key = "notes";
      record = { id, title: val("title"), category: val("category"), body: val("body"), date: val("date") };
    }
    if (modal === "animal" && data.animals.some(a => a.tag.toLowerCase() === (record as Animal).tag.toLowerCase() && a.id !== id)) { notify("Essa identificação já está cadastrada."); return; }
    if (modal === "fuel" && ((record as FuelLog).liters <= 0 || (record as FuelLog).price < 0)) { notify("Informe volume positivo e preço válido."); return; }
    if (modal === "expense" && (record as Expense).amount <= 0) { notify("Informe um valor de despesa maior que zero."); return; }
    setData(prev => {
      if (!prev) return prev;
      const existing = prev[key] as Array<{ id: string }>;
      const next = existing.some(item => item.id === id) ? existing.map(item => item.id === id ? record : item) : [record, ...existing];
      return { ...prev, [key]: next };
    });
    notify(editing ? "Registro atualizado com sucesso!" : "Registro cadastrado com sucesso!");
    closeForm();
  }
  function toggleVaccine(vaccine: Vaccine) {
    setData(previous => previous ? ({ ...previous, vaccines: previous.vaccines.map(v => v.id === vaccine.id ? { ...v, status: v.status === "Pendente" ? "Aplicada" : "Pendente", appliedAt: v.status === "Pendente" ? dateISO() : "" } : v) }) : previous);
    notify(vaccine.status === "Pendente" ? "Vacina marcada como aplicada." : "Vacina retornou para pendente.");
  }
  function resolveHealth(health: HealthCase) {
    setData(previous => previous ? ({ ...previous, health: previous.health.map(h => h.id === health.id ? { ...h, status: h.status === "Resolvida" ? "Aberta" : "Resolvida" } : h) }) : previous);
    notify(health.status === "Resolvida" ? "Ocorrência reaberta." : "Ocorrência marcada como resolvida.");
  }
  function exportData() {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = `campovivo-backup-${dateISO()}.json`; a.click(); URL.revokeObjectURL(url);
    notify("Backup exportado para seu computador.");
  }
  async function importData(file?: File) {
    if (!file) return;
    try {
      const raw = await file.text();
      const parsed: unknown = JSON.parse(raw);
      if (!isFarmData(parsed)) throw new Error("invalid");
      if (!window.confirm("Importar este backup substituirá os dados atuais. Continuar?")) return;
      setData(parsed); setFarmInput(parsed.farmName); notify("Backup importado com sucesso.");
    } catch { notify("Não foi possível importar: arquivo JSON inválido."); }
    if (importRef.current) importRef.current.value = "";
  }
  function clearData() {
    if (!window.confirm("Começar com cadastros vazios? Isso excluirá TODOS os registros atuais. Exporte um backup antes de continuar.")) return;
    const next = blankData(data?.farmName || "Minha Fazenda"); setData(next); setFarmInput(next.farmName); notify("Cadastros esvaziados. Sua fazenda está pronta para começar."); navigate("dashboard");
  }
  function resetData() {
    if (!window.confirm("Restaurar os registros de demonstração? Seus dados atuais serão substituídos.")) return;
    const next = seedData(); setData(next); setFarmInput(next.farmName); notify("Dados de demonstração restaurados."); navigate("dashboard");
  }

  const stats = useMemo(() => {
    if (!data) return null;
    const month = monthKey(dateISO());
    const currExpenses = data.expenses.filter(e => monthKey(e.date) === month);
    const currFuel = data.fuel.filter(f => monthKey(f.date) === month);
    const monthlyCosts = currExpenses.reduce((sum, x) => sum + x.amount, 0) + currFuel.reduce((sum, f) => sum + f.liters * f.price, 0);
    const fuelLiters = currFuel.reduce((sum, f) => sum + f.liters, 0);
    const openCases = data.health.filter(x => x.status !== "Resolvida");
    const nextVaccines = data.vaccines.filter(x => x.status === "Pendente").sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 5 + i);
      const key = dateISO(d).slice(0, 7);
      return { key, label: d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""), amount: data.expenses.filter(e => monthKey(e.date) === key).reduce((a, b) => a + b.amount, 0) + data.fuel.filter(f => monthKey(f.date) === key).reduce((a, b) => a + b.liters * b.price, 0) };
    });
    const categories = [...expenseCategories.map(category => ({ category, value: currExpenses.filter(e => e.category === category).reduce((a, b) => a + b.amount, 0) })), { category: "Combustível", value: currFuel.reduce((a, b) => a + b.liters * b.price, 0) }].filter(x => x.value > 0).sort((a, b) => b.value - a.value);
    return { monthlyCosts, fuelLiters, openCases, nextVaccines, months, categories, affected: data.animals.filter(a => a.status !== "Saudável").length };
  }, [data]);

  if (!data || !stats) return <div className="load-screen"><div className="brand-symbol"><Leaf size={28}/></div><h2>CampoVivo</h2><p>Preparando sua fazenda...</p></div>;

  const matches = (value: string) => value.toLocaleLowerCase("pt-BR").includes(search.toLocaleLowerCase("pt-BR"));
  const animals = data.animals.filter(x => (matches(`${x.name} ${x.tag} ${x.breed} ${x.note}`)) && (filter === "Todos" || x.status === filter));
  const health = data.health.filter(x => matches(`${x.title} ${x.symptoms} ${x.note} ${animalName(data, x.animalId)}`) && (filter === "Todos" || x.status === filter)).sort((a, b) => b.date.localeCompare(a.date));
  const vaccines = data.vaccines.filter(x => matches(`${x.name} ${x.note} ${animalName(data, x.animalId)}`) && (filter === "Todos" || x.status === filter)).sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
  const expenses = data.expenses.filter(x => matches(`${x.title} ${x.category} ${x.note}`) && (filter === "Todos" || x.category === filter)).sort((a, b) => b.date.localeCompare(a.date));
  const fuel = data.fuel.filter(x => matches(`${x.vehicle} ${x.note}`)).sort((a, b) => b.date.localeCompare(a.date));
  const notes = data.notes.filter(x => matches(`${x.title} ${x.body} ${x.category}`) && (filter === "Todos" || x.category === filter)).sort((a, b) => b.date.localeCompare(a.date));
  const dueVaccines = stats.nextVaccines.filter(x => x.scheduledAt < dateISO()).length;
  const topbarDate = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  const currentHour = new Date().getHours();
  const greeting = currentHour >= 18 ? "Boa noite" : currentHour >= 12 ? "Boa tarde" : "Bom dia";
  const editingItem = editing as any;

  return <div className="shell">
    {mobileMenu && <button className="mobile-shade" aria-label="Fechar menu" onClick={() => setMobileMenu(false)}/>}
    <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
      <button className="brand" onClick={() => navigate("dashboard")} aria-label="CampoVivo início">
        <span className="brand-symbol"><Leaf size={25} strokeWidth={2.25}/></span>
        <span className="brand-copy"><strong>campovivo<span>.</span></strong><small>gestão rural inteligente</small></span>
      </button>
      <div className="sidebar-group-label">MENU PRINCIPAL</div>
      <nav className="sidebar-nav">{navItems.map(item => <NavButton key={item.id} item={item} selected={page === item.id} onClick={() => navigate(item.id)} />)}</nav>
      <div className="sidebar-bottom">
        <div className="sidebar-banner"><span className="mini-sun">✦</span><h3>Uma fazenda<br/>mais conectada.</h3><p>O controle do seu campo começa aqui.</p><span className="sidebar-banner-sheen"/></div>
        <button className={`nav-item ${page === "settings" ? "nav-active" : ""}`} onClick={() => navigate("settings")}><Settings2 size={19}/><span>Configurações</span></button>
        <div className="sidebar-profile"><span className="profile-avatar">KV</span><span><strong>Administrador</strong><small>Minha fazenda</small></span><MoreHorizontal size={18}/></div>
      </div>
    </aside>
    <div className="workspace">
      <header className="topbar">
        <div className="topbar-left"><button className="mobile-menu icon-button" aria-label="Abrir menu" onClick={() => setMobileMenu(true)}><Menu size={22}/></button><span className="topbar-breadcrumb">Painel</span><ChevronRight size={15} className="subtle"/><span className="topbar-current">{pageNames[page]}</span></div>
        <div className="topbar-actions"><span className="topbar-date"><CalendarDays size={16}/>{topbarDate}</span><span className="vertical-rule"/><button className="topbar-farm" title="Nome da fazenda" onClick={() => navigate("settings")}><span className="topbar-farm-icon"><Tractor size={18}/></span><span>{data.farmName}</span><ChevronDown size={15}/></button><button className="topbar-avatar" onClick={() => navigate("settings")} title="Configurações">KV</button></div>
      </header>
      <main className="main-content" key={page}>
        {page === "dashboard" && <>
          <div className="welcome-header"><div><div className="eyebrow welcome-eyebrow"><span className="online-dot"/> SEU CAMPO EM DIA</div><h1>{greeting}, <span>produtor! <span className="wave">✳</span></span></h1><p>Veja o que está acontecendo na sua fazenda hoje.</p></div><button className="btn btn-outline desktop-btn" onClick={() => navigate("notes")}><NotebookPen size={17}/>Ver anotações <ArrowUpRight size={17}/></button></div>
          <section className="hero-banner"><div className="hero-copy"><div className="hero-chip"><Sparkles size={14}/>CONTROLE INTELIGENTE DA FAZENDA</div><h2>O futuro da sua fazenda<br/>cresce com você.</h2><p>Seu rebanho, suas despesas e seus cuidados organizados em um só lugar.</p><button className="hero-cta" onClick={() => openForm("animal")}>Cadastrar novo animal <ArrowUpRight size={17}/></button></div><FarmIllustration /></section>
          <section className="metrics-grid">
            <Metric icon={Beef} label="Total do rebanho" value={number(data.animals.length)} tag="Animais cadastrados" tone="green" action={() => navigate("animals")} />
            <Metric icon={Wallet} label="Gastos neste mês" value={money(stats.monthlyCosts)} tag="Despesas + combustível" tone="purple" action={() => navigate("expenses")} />
            <Metric icon={Fuel} label="Combustível no mês" value={`${number(stats.fuelLiters, 1)} L`} tag="Volume abastecido" tone="orange" action={() => navigate("fuel")} />
            <Metric icon={HeartPulse} label="Ocorrências abertas" value={number(stats.openCases.length)} tag={stats.openCases.length ? "Precisam de atenção" : "Tudo em dia"} tone="pink" action={() => navigate("health")} />
          </section>
          <div className="dashboard-main-grid">
            <section className="panel chart-panel"><div className="panel-heading"><div><div className="eyebrow">CONTROLE FINANCEIRO</div><h3>Visão de despesas</h3><p>Gastos registrados nos últimos 6 meses</p></div><span className="soft-activity"><TrendingUp size={16}/> Mensal</span></div><ExpenseChart months={stats.months}/></section>
            <section className="panel breakdown-panel"><div className="panel-heading"><div><div className="eyebrow">PARA ONDE VAI?</div><h3>Gastos por categoria</h3><p>Distribuição no mês atual</p></div><SmallIcon icon={BarChart3} className="mint-icon"/></div><CategoryBreakdown categories={stats.categories}/></section>
          </div>
          <div className="dashboard-bottom-grid">
            <section className="panel schedule-panel"><div className="panel-heading"><div><div className="eyebrow">AGENDA SANITÁRIA</div><h3>Próximas vacinas</h3><p>{dueVaccines ? `${dueVaccines} registro(s) em atraso` : "Acompanhe o calendário do rebanho"}</p></div><button className="text-link" onClick={() => navigate("vaccines")}>Ver todas <ArrowRight size={16}/></button></div>
              {stats.nextVaccines.length ? <div className="schedule-list">{stats.nextVaccines.slice(0, 3).map(v => <div key={v.id} className="schedule-row"><div className={`calendar-tile ${v.scheduledAt < dateISO() ? "calendar-overdue" : ""}`}><strong>{v.scheduledAt.slice(8, 10)}</strong><span>{new Date(`${v.scheduledAt}T12:00:00`).toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}</span></div><div className="schedule-text"><strong>{v.name}</strong><small>{animalName(data, v.animalId)} · {animalTag(data, v.animalId)}</small></div><Pill tone={v.scheduledAt < dateISO() ? "red" : "yellow"}>{v.scheduledAt < dateISO() ? "Atrasada" : "Pendente"}</Pill></div>)}</div> : <Empty title="Nenhuma vacina pendente" description="Você pode cadastrar uma nova aplicação no calendário."/>}
            </section>
            <section className="panel activity-panel"><div className="panel-heading"><div><div className="eyebrow">ACOMPANHAMENTO</div><h3>Saúde do rebanho</h3><p>Ocorrências que merecem atenção</p></div><button className="text-link" onClick={() => navigate("health")}>Ver todas <ArrowRight size={16}/></button></div>
              {stats.openCases.length ? <div className="health-overview">{stats.openCases.slice(0, 3).map(c => <button key={c.id} className="health-overview-row" onClick={() => { navigate("health"); openForm("health", c); }}><span className="animal-mini-avatar">{animalName(data, c.animalId).charAt(0)}</span><span className="health-overview-text"><strong>{animalName(data, c.animalId)}</strong><small>{c.title} · {animalTag(data, c.animalId)}</small></span><Pill tone={c.severity === "Alta" ? "red" : c.severity === "Média" ? "yellow" : "blue"}>{c.severity}</Pill></button>)}</div> : <Empty title="Nenhuma ocorrência aberta" description="Seu acompanhamento de saúde está em dia."/>}
              <button className="add-outline" onClick={() => openForm("health")}><Plus size={16}/> Nova ocorrência</button>
            </section>
          </div>
          <div className="quick-actions"><div><h3>Acesso rápido</h3><p>Registre o dia a dia sem perder tempo.</p></div><div className="quick-buttons"><button onClick={() => openForm("expense")}><span className="quick-icon quick-lilac"><CircleDollarSign size={19}/></span>Nova despesa <Plus size={15}/></button><button onClick={() => openForm("fuel")}><span className="quick-icon quick-peach"><Fuel size={19}/></span>Abastecimento <Plus size={15}/></button><button onClick={() => openForm("note")}><span className="quick-icon quick-mint"><NotebookPen size={19}/></span>Anotação <Plus size={15}/></button></div></div>
        </>}

        {page === "animals" && <>
          <SectionHeading eyebrow="GESTÃO DO REBANHO" title="Meu rebanho" description="Acompanhe os animais, suas identificações e informações de manejo." action={<button className="btn btn-primary" onClick={() => openForm("animal")}><Plus size={18}/> Cadastrar animal</button>}/>
          <div className="mini-stats-grid"><SummaryPill icon={Beef} label="Animais cadastrados" value={number(data.animals.length)} tone="green"/><SummaryPill icon={ShieldCheck} label="Saudáveis" value={number(data.animals.filter(a => a.status === "Saudável").length)} tone="blue"/><SummaryPill icon={Activity} label="Em observação/tratamento" value={number(data.animals.filter(a => a.status !== "Saudável").length)} tone="yellow"/></div>
          <div className="panel table-panel"><TableTools search={search} setSearch={setSearch} filter={filter} setFilter={setFilter} options={["Todos", "Saudável", "Em observação", "Em tratamento"]} placeholder="Buscar nome, brinco ou raça..." count={animals.length}/>
            {animals.length ? <div className="table-scroll"><table className="data-table"><thead><tr><th>ANIMAL</th><th>IDENTIFICAÇÃO</th><th>RAÇA</th><th>SEXO</th><th>PESO</th><th>STATUS</th><th className="right">AÇÕES</th></tr></thead><tbody>{animals.map((a, i) => <tr key={a.id}><td><div className="table-person"><span className="animal-avatar" style={{ background: ["#e3f4e9", "#f9efdf", "#e6edf9", "#f5e7e7"][i%4] }}>{a.name.charAt(0)}</span><span><strong>{a.name}</strong><small>{a.note ? a.note.slice(0, 38) + (a.note.length > 38 ? "…" : "") : "Sem observações"}</small></span></div></td><td><span className="tag-code">{a.tag}</span></td><td>{a.breed}</td><td>{a.sex}</td><td>{number(a.weight)} kg</td><td><Pill dot tone={animalTone(a.status)}>{a.status}</Pill></td><td><RowActions edit={() => openForm("animal", a)} remove={() => removeItem("animal", a.id)}/></td></tr>)}</tbody></table></div> : <Empty title="Nenhum animal encontrado" description="Ajuste a busca ou cadastre um novo animal." onAction={() => openForm("animal")} action="Cadastrar animal"/>}
          </div>
        </>}

        {page === "health" && <>
          <SectionHeading eyebrow="CONTROLE SANITÁRIO" title="Saúde animal" description="Registre sintomas, doenças, atendimentos e acompanhe cada ocorrência." action={<button className="btn btn-primary" onClick={() => openForm("health")}><Plus size={18}/> Nova ocorrência</button>}/>
          <div className="mini-stats-grid"><SummaryPill icon={AlertCircle} label="Ocorrências abertas" value={number(data.health.filter(h => h.status === "Aberta").length)} tone="pink"/><SummaryPill icon={Activity} label="Em acompanhamento" value={number(data.health.filter(h => h.status === "Em acompanhamento").length)} tone="yellow"/><SummaryPill icon={CheckCircle2} label="Resolvidas" value={number(data.health.filter(h => h.status === "Resolvida").length)} tone="green"/></div>
          <div className="panel table-panel"><TableTools search={search} setSearch={setSearch} filter={filter} setFilter={setFilter} options={["Todos", "Aberta", "Em acompanhamento", "Resolvida"]} placeholder="Buscar ocorrência, sintoma ou animal..." count={health.length}/>
            {health.length ? <div className="health-card-list">{health.map(c => <article className="case-card" key={c.id}><div className="case-icon"><HeartPulse size={23}/></div><div className="case-body"><div className="case-title-row"><h3>{c.title}</h3><Pill tone={c.severity === "Alta" ? "red" : c.severity === "Média" ? "yellow" : "blue"}>Gravidade {c.severity.toLowerCase()}</Pill><Pill tone={c.status === "Resolvida" ? "green" : c.status === "Aberta" ? "red" : "yellow"} dot>{c.status}</Pill></div><p>{c.symptoms || "Sem sintomas registrados."}</p><div className="case-meta"><span><Beef size={14}/>{animalName(data, c.animalId)} ({animalTag(data, c.animalId)})</span><span><CalendarDays size={14}/>{dateLabel(c.date)}</span>{c.note && <span className="case-note-preview"><NotebookPen size={14}/>{c.note}</span>}</div></div><div className="case-actions"><button className="icon-button" title="Editar" onClick={() => openForm("health", c)}><Pencil size={17}/></button><button className="icon-button danger-hover" title="Excluir" onClick={() => removeItem("health", c.id)}><Trash2 size={17}/></button><button className="btn btn-small btn-outline" onClick={() => resolveHealth(c)}>{c.status === "Resolvida" ? "Reabrir" : "Resolver"}</button></div></article>)}</div> : <Empty title="Nenhuma ocorrência encontrada" description="Faça um registro para acompanhar a saúde de um animal." onAction={() => openForm("health")}/>}
          </div>
          <div className="inline-advice"><ShieldCheck size={19}/><p><strong>Importante:</strong> use este espaço para registrar observações e o acompanhamento profissional. Diagnóstico e tratamento devem ser orientados por médico-veterinário.</p></div>
        </>}

        {page === "vaccines" && <>
          <SectionHeading eyebrow="CALENDÁRIO SANITÁRIO" title="Vacinação" description="Organize o cronograma e registre as aplicações do rebanho." action={<button className="btn btn-primary" onClick={() => openForm("vaccine")}><Plus size={18}/> Agendar vacina</button>}/>
          <div className="mini-stats-grid"><SummaryPill icon={Clock3} label="Aplicações pendentes" value={number(data.vaccines.filter(v => v.status === "Pendente").length)} tone="yellow"/><SummaryPill icon={AlertCircle} label="Em atraso" value={number(dueVaccines)} tone="pink"/><SummaryPill icon={CheckCircle2} label="Aplicadas" value={number(data.vaccines.filter(v => v.status === "Aplicada").length)} tone="green"/></div>
          <div className="panel table-panel"><TableTools search={search} setSearch={setSearch} filter={filter} setFilter={setFilter} options={["Todos", "Pendente", "Aplicada"]} placeholder="Buscar vacina ou animal..." count={vaccines.length}/>
            {vaccines.length ? <div className="table-scroll"><table className="data-table"><thead><tr><th>VACINA</th><th>ANIMAL</th><th>DATA PREVISTA</th><th>DATA APLICADA</th><th>STATUS</th><th className="right">AÇÕES</th></tr></thead><tbody>{vaccines.map(v => <tr key={v.id}><td><div className="table-primary"><strong>{v.name}</strong><small>{v.batch ? `Lote ${v.batch}` : v.note ? v.note.slice(0, 42) : "Lote não informado"}</small></div></td><td><div className="table-primary"><strong>{animalName(data, v.animalId)}</strong><small>{animalTag(data, v.animalId)}</small></div></td><td>{dateLabel(v.scheduledAt)}</td><td>{dateLabel(v.appliedAt)}</td><td><Pill dot tone={v.status === "Aplicada" ? "green" : v.scheduledAt < dateISO() ? "red" : "yellow"}>{v.status === "Aplicada" ? "Aplicada" : v.scheduledAt < dateISO() ? "Atrasada" : "Pendente"}</Pill></td><td><div className="row-actions"><button className={`btn btn-tiny ${v.status === "Aplicada" ? "btn-muted" : "btn-soft"}`} onClick={() => toggleVaccine(v)}>{v.status === "Aplicada" ? "Desfazer" : <><Check size={13}/> Aplicada</>}</button><RowActions edit={() => openForm("vaccine", v)} remove={() => removeItem("vaccine", v.id)}/></div></td></tr>)}</tbody></table></div> : <Empty title="Nenhuma vacina encontrada" description="Cadastre os eventos do seu calendário sanitário." onAction={() => openForm("vaccine")}/>}
          </div>
          <div className="inline-advice"><ShieldCheck size={19}/><p><strong>Calendário sob orientação técnica:</strong> os nomes e datas exibidos inicialmente são exemplos fictícios. Defina aplicações e obrigações sanitárias com o veterinário responsável e os órgãos oficiais da sua região.</p></div>
        </>}

        {page === "expenses" && <>
          <SectionHeading eyebrow="GESTÃO FINANCEIRA" title="Controle de despesas" description="Organize cada custo da fazenda e saiba para onde vai seu dinheiro." action={<button className="btn btn-primary" onClick={() => openForm("expense")}><Plus size={18}/> Nova despesa</button>}/>
          <div className="mini-stats-grid"><SummaryPill icon={Wallet} label="Total de despesas" value={money(data.expenses.reduce((sum, e) => sum + e.amount, 0))} tone="purple"/><SummaryPill icon={CalendarDays} label="Despesas neste mês" value={money(data.expenses.filter(e => monthKey(e.date) === monthKey(dateISO())).reduce((sum, e) => sum + e.amount, 0))} tone="green"/><SummaryPill icon={ClipboardList} label="Lançamentos" value={number(data.expenses.length)} tone="blue"/></div>
          <div className="panel table-panel"><TableTools search={search} setSearch={setSearch} filter={filter} setFilter={setFilter} options={["Todos", ...expenseCategories]} placeholder="Buscar descrição, categoria ou nota..." count={expenses.length}/>
            {expenses.length ? <div className="table-scroll"><table className="data-table"><thead><tr><th>DESCRIÇÃO</th><th>CATEGORIA</th><th>DATA</th><th>VALOR</th><th>OBSERVAÇÃO</th><th className="right">AÇÕES</th></tr></thead><tbody>{expenses.map(e => <tr key={e.id}><td><div className="table-person"><span className="expense-icon"><Wallet size={18}/></span><strong>{e.title}</strong></div></td><td><span className="category-pill"><span style={{ background: categoryColors[e.category] || "#a0aaac" }}/>{e.category}</span></td><td>{dateLabel(e.date)}</td><td className="money-cell">{money(e.amount)}</td><td className="muted-cell">{e.note || "—"}</td><td><RowActions edit={() => openForm("expense", e)} remove={() => removeItem("expense", e.id)}/></td></tr>)}</tbody></table></div> : <Empty title="Nenhuma despesa encontrada" description="Lance os custos para acompanhar os gastos da fazenda." onAction={() => openForm("expense")}/>}
          </div>
        </>}

        {page === "fuel" && <>
          <SectionHeading eyebrow="CONTROLE OPERACIONAL" title="Combustível" description="Gerencie abastecimentos de tratores, veículos e máquinas." action={<button className="btn btn-primary" onClick={() => openForm("fuel")}><Plus size={18}/> Novo abastecimento</button>}/>
          <div className="mini-stats-grid"><SummaryPill icon={Droplets} label="Litros registrados" value={`${number(data.fuel.reduce((sum, f) => sum + f.liters, 0), 1)} L`} tone="blue"/><SummaryPill icon={Wallet} label="Custo total" value={money(data.fuel.reduce((sum, f) => sum + f.liters * f.price, 0))} tone="purple"/><SummaryPill icon={Tractor} label="Máquinas/veículos" value={number(new Set(data.fuel.map(f => f.vehicle.toLowerCase())).size)} tone="green"/></div>
          <div className="panel table-panel"><TableTools search={search} setSearch={setSearch} placeholder="Buscar máquina ou veículo..." count={fuel.length}/>
            {fuel.length ? <div className="table-scroll"><table className="data-table"><thead><tr><th>MÁQUINA / VEÍCULO</th><th>DATA</th><th>QUANTIDADE</th><th>PREÇO/LITRO</th><th>VALOR TOTAL</th><th>HORÍMETRO/NOTA</th><th className="right">AÇÕES</th></tr></thead><tbody>{fuel.map(f => <tr key={f.id}><td><div className="table-person"><span className="fuel-icon"><Tractor size={19}/></span><strong>{f.vehicle}</strong></div></td><td>{dateLabel(f.date)}</td><td><strong>{number(f.liters, 1)} L</strong></td><td>{money(f.price)}</td><td className="money-cell">{money(f.liters*f.price)}</td><td className="muted-cell">{f.hourmeter || f.note || "—"}</td><td><RowActions edit={() => openForm("fuel", f)} remove={() => removeItem("fuel", f.id)}/></td></tr>)}</tbody></table></div> : <Empty title="Nenhum abastecimento encontrado" description="Registre o consumo de diesel, gasolina e outros combustíveis." onAction={() => openForm("fuel")}/>}
          </div>
        </>}

        {page === "notes" && <>
          <SectionHeading eyebrow="DIÁRIO DA FAZENDA" title="Minhas anotações" description="Guarde informações importantes sobre manejo, compras e tarefas." action={<button className="btn btn-primary" onClick={() => openForm("note")}><Plus size={18}/> Nova anotação</button>}/>
          <div className="notes-tools"><div className="search-control"><Search size={17}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar anotações..."/></div><select value={filter} onChange={e => setFilter(e.target.value)} className="filter-select"><option>Todos</option>{["Manejo", "Manutenção", "Compras", "Saúde", "Outros"].map(c => <option key={c}>{c}</option>)}</select></div>
          {notes.length ? <div className="notes-grid">{notes.map((n, i) => <article className="note-card" key={n.id}><div className="note-top"><span className={`note-icon note-tone-${i % 4}`}><NotebookPen size={20}/></span><Pill tone={n.category === "Saúde" ? "red" : n.category === "Manejo" ? "green" : "blue"}>{n.category}</Pill></div><h3>{n.title}</h3><p>{n.body}</p><div className="note-bottom"><span><CalendarDays size={15}/>{dateLabel(n.date)}</span><div className="row-actions"><button className="icon-button" onClick={() => openForm("note", n)} title="Editar"><Pencil size={16}/></button><button className="icon-button danger-hover" onClick={() => removeItem("note", n.id)} title="Excluir"><Trash2 size={16}/></button></div></div></article>)}</div> : <Empty title="Nenhuma anotação encontrada" description="Crie uma anotação para não esquecer tarefas e acontecimentos." onAction={() => openForm("note")}/>}
        </>}

        {page === "settings" && <>
          <SectionHeading eyebrow="PREFERÊNCIAS" title="Configurações" description="Personalize a fazenda e gerencie seus registros locais."/>
          <div className="settings-layout"><section className="panel settings-panel"><div className="settings-icon"><Tractor size={22}/></div><h3>Dados da fazenda</h3><p>Como sua propriedade aparece no painel.</p><form onSubmit={e => { e.preventDefault(); if (!farmInput.trim()) return; setData(prev => prev ? { ...prev, farmName: farmInput.trim() } : prev); notify("Nome da fazenda atualizado."); }}><Field label="Nome da propriedade"><input required value={farmInput} onChange={e => setFarmInput(e.target.value)} maxLength={65}/></Field><button className="btn btn-primary" type="submit"><Check size={17}/> Salvar alterações</button></form></section>
          <section className="panel settings-panel"><div className="settings-icon purple-icon"><Download size={22}/></div><h3>Backup dos dados</h3><p>Exporte ou importe todas as informações do seu navegador.</p><div className="settings-buttons"><button className="btn btn-primary" onClick={exportData}><Download size={17}/> Exportar backup JSON</button><input ref={importRef} hidden type="file" accept="application/json,.json" onChange={e => importData(e.target.files?.[0])}/><button className="btn btn-outline" onClick={() => importRef.current?.click()}><Upload size={17}/> Importar backup</button></div><div className="info-note"><AlertCircle size={17}/> Seus dados são armazenados apenas neste navegador. Faça backups regularmente.</div></section>
          <section className="panel settings-panel settings-danger"><div className="settings-icon yellow-icon"><RotateCcw size={22}/></div><h3>Dados de demonstração</h3><p>Restaure os exemplos fictícios para explorar todas as funcionalidades.</p><div className="settings-buttons"><button className="btn btn-outline" onClick={resetData}><RotateCcw size={17}/> Restaurar exemplos</button><button className="btn btn-danger-outline" onClick={clearData}><Trash2 size={17}/> Começar do zero</button></div></section>
          <section className="panel settings-panel"><div className="settings-icon"><ShieldCheck size={22}/></div><h3>Sobre esta versão</h3><p>CampoVivo MVP 1.0 — Next.js e React, com registros editáveis e persistência local.</p><div className="version-pill"><span className="online-dot"/> Versão demonstrativa funcional</div></section></div>
        </>}
      </main>
      <footer className="footer"><span>© {new Date().getFullYear()} CampoVivo. Feito para quem vive do campo. <span className="footer-leaf">✳</span></span><span>Dados salvos neste navegador · <button onClick={() => navigate("settings")}>Gerenciar backups</button></span></footer>
    </div>

    {toast && <div className="toast" role="status"><span><Check size={17}/></span>{toast}<button aria-label="Dispensar" onClick={() => setToast("")}><X size={15}/></button></div>}

    {modal && <div className="modal-backdrop" onClick={closeForm}><div className="modal-card" role="dialog" aria-modal="true" aria-label={`${editing ? "Editar" : "Cadastrar"} ${kindTitles[modal]}`} onClick={e => e.stopPropagation()} key={`${modal}-${editing?.id ?? "new"}`}><div className="modal-header"><div className="modal-mark"><Leaf size={19}/></div><div><span className="eyebrow">CAMPOVIVO · CADASTRO</span><h2>{editing ? "Editar" : "Novo registro de"} {kindTitles[modal]}</h2></div><button className="modal-close" onClick={closeForm} aria-label="Fechar"><X size={20}/></button></div>
        <form onSubmit={saveForm} className="modal-form">
          {modal === "animal" && <>
            <div className="form-grid"><Field label="Nome / apelido *"><input name="name" required placeholder="Ex.: Estrela" defaultValue={editingItem?.name || ""}/></Field><Field label="Número do brinco / ID *"><input name="tag" required placeholder="Ex.: BR-1025" defaultValue={editingItem?.tag || ""}/></Field></div>
            <div className="form-grid"><Field label="Raça *"><input name="breed" required placeholder="Ex.: Nelore" defaultValue={editingItem?.breed || ""}/></Field><Field label="Sexo"><select name="sex" defaultValue={editingItem?.sex || "Fêmea"}><option>Fêmea</option><option>Macho</option></select></Field></div>
            <div className="form-grid"><Field label="Peso estimado (kg)"><input name="weight" type="number" min="0" step="0.1" defaultValue={editingItem?.weight ?? 0}/></Field><Field label="Data de nascimento"><input name="birthDate" type="date" defaultValue={editingItem?.birthDate || dateISO()}/></Field></div>
            <Field label="Situação atual"><select name="status" defaultValue={editingItem?.status || "Saudável"}><option>Saudável</option><option>Em observação</option><option>Em tratamento</option></select></Field>
            <Field label="Observações do animal"><textarea name="note" rows={3} placeholder="Lote, alimentação, comportamento, histórico..." defaultValue={editingItem?.note || ""}/></Field>
          </>}
          {modal === "health" && <>
            <Field label="Animal *"><select name="animalId" required defaultValue={editingItem?.animalId || ""}><option value="" disabled>Selecione um animal</option>{data.animals.map(a => <option value={a.id} key={a.id}>{a.name} — {a.tag}</option>)}</select></Field>
            <Field label="Problema / ocorrência *"><input name="title" required placeholder="Ex.: Dificuldade de locomoção" defaultValue={editingItem?.title || ""}/></Field>
            <div className="form-grid"><Field label="Gravidade"><select name="severity" defaultValue={editingItem?.severity || "Baixa"}><option>Baixa</option><option>Média</option><option>Alta</option></select></Field><Field label="Data da ocorrência"><input name="date" type="date" required defaultValue={editingItem?.date || dateISO()}/></Field></div>
            <Field label="Andamento"><select name="status" defaultValue={editingItem?.status || "Aberta"}><option>Aberta</option><option>Em acompanhamento</option><option>Resolvida</option></select></Field>
            <Field label="Sintomas observados"><textarea name="symptoms" rows={3} placeholder="O que você percebeu no animal?" defaultValue={editingItem?.symptoms || ""}/></Field>
            <Field label="Notas / orientação do veterinário"><textarea name="note" rows={3} placeholder="Exames, recomendações, evolução..." defaultValue={editingItem?.note || ""}/></Field>
          </>}
          {modal === "vaccine" && <>
            <Field label="Animal *"><select name="animalId" required defaultValue={editingItem?.animalId || ""}><option value="" disabled>Selecione um animal</option>{data.animals.map(a => <option value={a.id} key={a.id}>{a.name} — {a.tag}</option>)}</select></Field>
            <Field label="Nome da vacina *"><input name="name" required placeholder="Conforme calendário do médico-veterinário" defaultValue={editingItem?.name || ""}/></Field>
            <div className="form-grid"><Field label="Data prevista *"><input name="scheduledAt" required type="date" defaultValue={editingItem?.scheduledAt || dateISO()}/></Field><Field label="Situação"><select name="status" defaultValue={editingItem?.status || "Pendente"}><option>Pendente</option><option>Aplicada</option></select></Field></div>
            <div className="form-grid"><Field label="Data de aplicação"><input name="appliedAt" type="date" defaultValue={editingItem?.appliedAt || ""}/></Field><Field label="Lote da vacina"><input name="batch" placeholder="Ex.: L-2503" defaultValue={editingItem?.batch || ""}/></Field></div>
            <Field label="Observações"><textarea name="note" rows={3} placeholder="Dose, protocolo, profissional responsável..." defaultValue={editingItem?.note || ""}/></Field>
            <div className="form-advice"><ShieldCheck size={17}/> Cadastre somente vacinas e datas definidas com orientação veterinária.</div>
          </>}
          {modal === "expense" && <>
            <Field label="Descrição da despesa *"><input name="title" required placeholder="Ex.: Compra de sal mineral" defaultValue={editingItem?.title || ""}/></Field>
            <div className="form-grid"><Field label="Categoria"><select name="category" defaultValue={editingItem?.category || "Alimentação"}>{expenseCategories.map(c => <option key={c}>{c}</option>)}</select></Field><Field label="Valor (R$) *"><input name="amount" required min="0.01" step="0.01" type="number" placeholder="0,00" defaultValue={editingItem?.amount ?? ""}/></Field></div>
            <Field label="Data da despesa"><input name="date" required type="date" defaultValue={editingItem?.date || dateISO()}/></Field>
            <Field label="Observações"><textarea name="note" rows={3} placeholder="Fornecedor, nota fiscal, informações adicionais..." defaultValue={editingItem?.note || ""}/></Field>
          </>}
          {modal === "fuel" && <>
            <Field label="Máquina ou veículo *"><input name="vehicle" required placeholder="Ex.: Trator John Deere" defaultValue={editingItem?.vehicle || ""}/></Field>
            <div className="form-grid"><Field label="Quantidade (litros) *"><input name="liters" required min="0.01" step="0.01" type="number" defaultValue={editingItem?.liters ?? ""} onChange={e => setFuelLiters(Number(e.target.value))}/></Field><Field label="Preço por litro (R$) *"><input name="price" required min="0" step="0.001" type="number" defaultValue={editingItem?.price ?? ""} onChange={e => setFuelPrice(Number(e.target.value))}/></Field></div>
            <div className="form-total"><span>Valor total calculado</span><strong>{money(fuelLiters * fuelPrice)}</strong></div>
            <div className="form-grid"><Field label="Data do abastecimento"><input name="date" required type="date" defaultValue={editingItem?.date || dateISO()}/></Field><Field label="Horímetro / quilometragem"><input name="hourmeter" placeholder="Ex.: 1.860 h" defaultValue={editingItem?.hourmeter || ""}/></Field></div>
            <Field label="Observações"><textarea name="note" rows={3} placeholder="Posto, motorista, número de nota fiscal..." defaultValue={editingItem?.note || ""}/></Field>
          </>}
          {modal === "note" && <>
            <Field label="Título *"><input name="title" required placeholder="Ex.: Verificar bebedouros" defaultValue={editingItem?.title || ""}/></Field>
            <div className="form-grid"><Field label="Categoria"><select name="category" defaultValue={editingItem?.category || "Manejo"}>{["Manejo", "Manutenção", "Compras", "Saúde", "Outros"].map(c => <option key={c}>{c}</option>)}</select></Field><Field label="Data"><input name="date" required type="date" defaultValue={editingItem?.date || dateISO()}/></Field></div>
            <Field label="Anotação *"><textarea name="body" required rows={6} placeholder="Escreva os detalhes desta anotação..." defaultValue={editingItem?.body || ""}/></Field>
          </>}
          <div className="modal-footer"><button className="btn btn-outline" type="button" onClick={closeForm}>Cancelar</button><button className="btn btn-primary" type="submit"><Check size={17}/>{editing ? "Salvar alterações" : "Salvar cadastro"}</button></div>
        </form>
      </div></div>}
  </div>;
}

function isFarmData(x: unknown): x is FarmData {
  if (!x || typeof x !== "object") return false;
  const y = x as Record<string, unknown>;
  return typeof y.farmName === "string" && ["animals", "health", "vaccines", "expenses", "fuel", "notes"].every(key => Array.isArray(y[key]));
}
function animalName(data: FarmData, id: string) { return data.animals.find(a => a.id === id)?.name || "Animal removido"; }
function animalTag(data: FarmData, id: string) { return data.animals.find(a => a.id === id)?.tag || "—"; }
function animalTone(status: AnimalStatus): "green" | "yellow" | "red" { return status === "Saudável" ? "green" : status === "Em observação" ? "yellow" : "red"; }
function RowActions({ edit, remove }: { edit: () => void; remove: () => void }) { return <div className="row-actions"><button className="icon-button" title="Editar registro" aria-label="Editar registro" onClick={edit}><Pencil size={17}/></button><button className="icon-button danger-hover" title="Excluir registro" aria-label="Excluir registro" onClick={remove}><Trash2 size={17}/></button></div>; }
function TableTools({ search, setSearch, filter, setFilter, options, placeholder, count }: { search: string; setSearch: (s: string) => void; filter?: string; setFilter?: (s: string) => void; options?: string[]; placeholder: string; count: number }) { return <div className="table-tools"><div className="search-control"><Search size={18}/><input placeholder={placeholder} value={search} onChange={e => setSearch(e.target.value)}/></div><div className="table-tools-right">{options && filter !== undefined && setFilter && <select className="filter-select" value={filter} onChange={e => setFilter(e.target.value)}>{options.map(o => <option key={o}>{o}</option>)}</select>}<span className="records-count">{count} registro{count === 1 ? "" : "s"}</span></div></div>; }
function SummaryPill({ icon: Icon, label, value, tone }: { icon: LucideIcon; label: string; value: string; tone: string }) { return <div className="summary-pill"><div className={`summary-icon tone-${tone}`}><Icon size={21}/></div><div><span>{label}</span><strong>{value}</strong></div></div>; }
function Metric({ icon: Icon, label, value, tag, tone, action }: { icon: LucideIcon; label: string; value: string; tag: string; tone: string; action: () => void }) { return <button className="metric-card" onClick={action}><div className="metric-head"><span className={`metric-icon tone-${tone}`}><Icon size={22} strokeWidth={2}/></span><span className="metric-arrow"><ArrowUpRight size={18}/></span></div><span className="metric-label">{label}</span><strong className="metric-value">{value}</strong><span className="metric-note"><span className={`metric-tick tick-${tone}`}><Check size={11}/></span>{tag}</span></button>; }
function ExpenseChart({ months }: { months: { key: string; label: string; amount: number }[] }) {
  const max = Math.max(1, ...months.map(m => m.amount));
  const ticks = [1, .75, .5, .25, 0].map(f => Math.round(max * f));
  return <div className="expense-chart"><div className="chart-yaxis">{ticks.map((t, i) => <span key={i}>{t >= 1000 ? `${number(t / 1000, 1)}k` : number(t)}</span>)}</div><div className="chart-main"><div className="chart-gridlines">{ticks.map((_, i) => <span key={i}/>)}</div><div className="chart-bars">{months.map((m, i) => <div className="bar-slot" key={m.key}><div className={`bar ${i === months.length-1 ? "bar-current" : ""}`} title={`${m.label}: ${money(m.amount)}`} style={{ height: `${Math.max(2, (m.amount / max) * 100)}%` }}/></div>)}</div><div className="chart-months">{months.map(m => <span key={m.key}>{m.label}</span>)}</div></div></div>;
}
function CategoryBreakdown({ categories }: { categories: { category: string; value: number }[] }) {
  const total = categories.reduce((a, b) => a+b.value, 0);
  if (!total) return <div className="breakdown-empty">Sem gastos registrados neste mês.</div>;
  const cols: Record<string, string> = { ...categoryColors, "Combustível": "#efc275" };
  return <div className="breakdown-content"><div className="breakdown-total"><span>Total no mês</span><strong>{money(total)}</strong></div><div className="stacked-bar">{categories.map(c => <div key={c.category} title={`${c.category}: ${money(c.value)}`} style={{ width: `${c.value/total*100}%`, background: cols[c.category] || "#a6afac" }}/>)}</div><div className="breakdown-list">{categories.slice(0, 5).map(c => <div key={c.category}><span><i style={{ background: cols[c.category] || "#a6afac" }}/>{c.category}</span><strong>{number(c.value / total * 100, 0)}%</strong></div>)}</div></div>;
}
function FarmIllustration() { return <svg className="hero-art" viewBox="0 0 490 290" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="317" cy="89" r="64" fill="#D7F8B4" opacity=".45"/><circle cx="317" cy="89" r="43" fill="#F3FFC5" opacity=".5"/><path d="M0 226C79 176 150 190 239 219C306 242 395 179 490 188V290H0V226Z" fill="#65B984" opacity=".38"/><path d="M0 263C122 209 208 255 297 238C375 221 426 224 490 214V290H0V263Z" fill="#4BA472" opacity=".56"/><path d="M0 283C95 254 165 260 261 269C343 278 411 239 490 255V290H0V283Z" fill="#237951" opacity=".6"/><path d="M223 208V159H360V208" stroke="#E4FBD9" strokeWidth="5" strokeLinecap="round"/><path d="M207 161L290 101L375 161H207Z" fill="#D7F0DD"/><path d="M213 159L289 105L369 159" stroke="#FFFFFF" strokeWidth="7" strokeLinejoin="round" strokeLinecap="round"/><rect x="238" y="161" width="108" height="65" rx="3" fill="#F6FFF5" opacity=".95"/><rect x="276" y="181" width="33" height="45" rx="3" fill="#76B28B"/><rect x="248" y="171" width="18" height="21" rx="3" fill="#95D2A1"/><rect x="318" y="171" width="18" height="21" rx="3" fill="#95D2A1"/><path d="M184 223V175M168 225V191M200 225V194" stroke="#E8F7E6" strokeWidth="5" strokeLinecap="round"/><path d="M152 214L184 157L215 214H152Z" fill="#1E805C"/><path d="M161 194L184 146L206 194H161Z" fill="#51AF79"/><path d="M377 226V164" stroke="#E6F9E6" strokeWidth="5" strokeLinecap="round"/><path d="M340 197L376 123L412 197H340Z" fill="#3D9C6C"/><path d="M351 173L376 105L401 173H351Z" fill="#74C48C"/><g fill="#E8F7E2"><path d="M97 240c-11-17-4-25 22-24h23c15 0 24 9 21 24l-8 13h-13l-5-15-14 2-4 14h-13l-3-14-15-3-7-11 10-4z"/><path d="M99 220l-13-10-7 3 9 15 13-2zM139 221l15-13 7 6-8 17z"/><circle cx="143" cy="226" r="2.5" fill="#256849"/><path d="M118 250v18m29-18v17" stroke="#E8F7E2" strokeWidth="7" strokeLinecap="round"/></g><g stroke="#DAF2CE" strokeWidth="3" strokeLinecap="round" opacity=".78"><path d="M54 273v-14m-7 4 7 5 8-10M424 276v-18m-8 8 8 5 8-12M447 265v-12m-7 3 7 4 7-8"/></g><path d="M232 59l5-8m-2 12 9-3M430 92l4-7m-4 11 9-1" stroke="#E6FCD7" strokeWidth="3" strokeLinecap="round"/></svg>; }
