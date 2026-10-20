"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowRight, ArrowUpRight, Beef, Check, ChevronDown, Eye, EyeOff,
  Fuel, HeartPulse, Leaf, LockKeyhole, Menu, Moon, ShieldCheck, Sun,
  Syringe, Tractor, X,
} from "lucide-react";

type EntryProps = {
  onEnter: () => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
};

const DEMO_EMAIL = "demo@campovivo.com";
const DEMO_PASSWORD = "CampoVivo2026";

const features = [
  { number: "01", title: "Rebanho", description: "Identificação, histórico, situação de cada animal e anotações em um só cadastro.", icon: Beef },
  { number: "02", title: "Saúde e vacinas", description: "Ocorrências sanitárias, lembretes e aplicações organizadas por animal.", icon: HeartPulse },
  { number: "03", title: "Gastos da fazenda", description: "Despesas, abastecimentos, máquinas e preços registrados por operação.", icon: Fuel },
];

export default function Entrada({ onEnter, theme, onToggleTheme }: EntryProps) {
  const [showLogin, setShowLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    if (!showLogin) return;
    const handleEscape = (e: KeyboardEvent) => { if (e.key === "Escape") setShowLogin(false); };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [showLogin]);

  function openLogin() { setShowLogin(true); setMobileNav(false); setError(""); }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (email.trim().toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
      setError("Use as credenciais de demonstração indicadas abaixo do formulário.");
      return;
    }
    setShowLogin(false);
    onEnter();
  }
  function fillDemo() { setEmail(DEMO_EMAIL); setPassword(DEMO_PASSWORD); setError(""); }

  return (
    <div className="entry">
      <header className="entry-header">
        <div className="entry-wrap entry-header-inner">
          <a className="entry-brand" href="#inicio" aria-label="CampoVivo — início">
            <span className="entry-symbol" aria-hidden="true"><Leaf size={22} strokeWidth={2.2}/></span>
            <span className="entry-wordmark">campo<span>vivo</span><i>.</i></span>
          </a>
          <nav className={`entry-nav ${mobileNav ? "entry-nav-open" : ""}`} aria-label="Navegação principal">
            <a href="#recursos" onClick={() => setMobileNav(false)}>Recursos</a>
            <a href="#como-funciona" onClick={() => setMobileNav(false)}>Como funciona</a>
            <button type="button" className="entry-nav-login" onClick={openLogin}>Entrar no sistema</button>
          </nav>
          <div className="entry-header-actions">
            <button type="button" className="entry-theme" title={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"} aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"} onClick={onToggleTheme}>{theme === "dark" ? <Sun size={19}/> : <Moon size={19}/>}</button>
            <button type="button" className="entry-header-cta" onClick={openLogin}>Acessar painel <ArrowUpRight size={16}/></button>
            <button type="button" className="entry-menu" onClick={() => setMobileNav(v => !v)} aria-expanded={mobileNav} aria-label="Abrir menu">{mobileNav ? <X size={23}/> : <Menu size={23}/>}</button>
          </div>
        </div>
      </header>

      <main>
        <section id="inicio" className="entry-hero entry-wrap">
          <div className="entry-hero-copy">
            <div className="entry-kicker"><span className="entry-kicker-line"/> GESTÃO RURAL, DO SEU JEITO</div>
            <h1>Menos papel.<br/>Mais <em>controle</em><br/>da fazenda.</h1>
            <p>Rebanho, saúde animal, despesas e combustível. Tudo organizado, sem perder tempo procurando informação.</p>
            <div className="entry-hero-actions">
              <button type="button" className="entry-primary" onClick={openLogin}>Conhecer o painel <ArrowUpRight size={19}/></button>
              <a className="entry-text-link" href="#recursos">Ver o que você controla <ArrowRight size={17}/></a>
            </div>
            <div className="entry-hero-foot"><span className="entry-hero-foot-rule"/><span>Feito para a rotina de quem cuida do campo.</span></div>
          </div>

          <div className="entry-hero-visual" aria-label="Representação dos registros da plataforma">
            <div className="entry-visual-top"><span>VISÃO DE CAMPO</span><span>01 / 03</span></div>
            <div className="entry-landscape" aria-hidden="true">
              <div className="entry-sun-disc"/>
              <div className="entry-hill entry-hill-back"/>
              <div className="entry-hill entry-hill-front"/>
              <div className="entry-field-line entry-field-a"/>
              <div className="entry-field-line entry-field-b"/>
              <div className="entry-field-line entry-field-c"/>
            </div>
            <div className="entry-visual-bottom">
              <div><span>DO MANEJO À GESTÃO</span><h2>O dia a dia<br/>sob controle.</h2></div>
              <div className="entry-visual-numbers"><span>REBANHO</span><strong>Cadastro</strong><span>FINANÇAS</span><strong>Despesas</strong></div>
            </div>
            <div className="entry-visual-bottomline"><span>ORGANIZAÇÃO EM CADA ETAPA</span><span>↗</span></div>
          </div>
        </section>

        <div className="entry-ticker">
          <div className="entry-wrap"><span><Check size={15}/> Rebanho</span><span><Check size={15}/> Sanidade</span><span><Check size={15}/> Vacinação</span><span><Check size={15}/> Combustível</span><span><Check size={15}/> Financeiro</span></div>
        </div>

        <section id="recursos" className="entry-features entry-wrap">
          <div className="entry-section-title">
            <div><span className="entry-eyebrow">01 / O QUE VOCÊ CONTROLA</span><h2>Informação certa.<br/>Na hora certa.</h2></div>
            <p>Uma forma prática de acompanhar o que acontece na propriedade, do cuidado com os animais aos gastos da operação.</p>
          </div>
          <div className="entry-feature-list">
            {features.map(item => <div className="entry-feature" key={item.number}>
              <div className="entry-feature-index">{item.number}</div>
              <div className="entry-feature-icon"><item.icon size={26} strokeWidth={1.5}/></div>
              <div className="entry-feature-copy"><h3>{item.title}</h3><p>{item.description}</p></div>
              <ArrowUpRight className="entry-feature-arrow" size={20}/>
            </div>)}
          </div>
        </section>

        <section id="como-funciona" className="entry-process">
          <div className="entry-wrap entry-process-grid">
            <div>
              <span className="entry-eyebrow entry-eyebrow-light">02 / SIMPLES DE USAR</span>
              <h2>Mais tempo<br/>para o que<br/><em>importa.</em></h2>
            </div>
            <div className="entry-process-right">
              <p>Comece pelos cadastros essenciais e acompanhe a operação sem depender de anotações espalhadas.</p>
              <div className="entry-process-steps">
                <div><span>01</span><strong>Cadastre o rebanho</strong><small>Identifique animais e registre observações.</small></div>
                <div><span>02</span><strong>Registre o que aconteceu</strong><small>Vacinas, problemas, combustível e despesas.</small></div>
                <div><span>03</span><strong>Acompanhe o histórico</strong><small>Consulte os registros e faça backup em JSON.</small></div>
              </div>
              <button type="button" className="entry-light-cta" onClick={openLogin}>Acessar demonstração <ArrowUpRight size={18}/></button>
            </div>
          </div>
        </section>

        <section className="entry-cta-section entry-wrap">
          <span className="entry-eyebrow">SEU CONTROLE COMEÇA AQUI</span>
          <h2>O campo não para.<br/>Sua gestão acompanha.</h2>
          <button type="button" className="entry-primary" onClick={openLogin}>Entrar no painel <ArrowUpRight size={19}/></button>
        </section>
      </main>

      <footer className="entry-footer"><div className="entry-wrap entry-footer-inner"><span>campovivo. <small>Gestão rural</small></span><p>Protótipo funcional · Os dados da demonstração ficam neste navegador.</p><a href="#inicio">Voltar ao início ↑</a></div></footer>

      {showLogin && <div className="entry-modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setShowLogin(false); }}>
        <section className="entry-login" role="dialog" aria-modal="true" aria-labelledby="entry-login-title">
          <button type="button" className="entry-login-close" aria-label="Fechar" onClick={() => setShowLogin(false)}><X size={21}/></button>
          <span className="entry-login-mark"><Leaf size={25}/></span>
          <p className="entry-eyebrow">ACESSO AO PAINEL</p>
          <h2 id="entry-login-title">Bom ter você por aqui.</h2>
          <p className="entry-login-desc">Entre na versão demonstrativa para explorar as funcionalidades do sistema.</p>
          <form onSubmit={submit}>
            <label htmlFor="entry-email">E-mail de demonstração</label>
            <input id="entry-email" type="email" autoComplete="username" value={email} onChange={e => {setEmail(e.target.value);setError("");}} placeholder="seu@email.com" required autoFocus/>
            <label htmlFor="entry-password">Senha de demonstração</label>
            <div className="entry-password-field">
              <input id="entry-password" type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={e => {setPassword(e.target.value);setError("");}} placeholder="Digite sua senha" required/>
              <button type="button" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
            </div>
            {error && <p className="entry-login-error" role="alert">{error}</p>}
            <button type="submit" className="entry-login-submit">Entrar no painel <ArrowRight size={18}/></button>
          </form>
          <div className="entry-demo-details">
            <div><LockKeyhole size={17}/><strong>Versão de demonstração</strong></div>
            <p>O acesso abaixo é público e não protege os cadastros. Não registre dados reais ou sensíveis nesta versão.</p>
            <span>Login: <code>{DEMO_EMAIL}</code></span>
            <span>Senha: <code>{DEMO_PASSWORD}</code></span>
            <button type="button" onClick={fillDemo}>Preencher dados de demonstração <ArrowUpRight size={15}/></button>
          </div>
        </section>
      </div>}
    </div>
  );
}
