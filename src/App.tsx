import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  Link,
  NavLink,
  Route,
  Routes,
  useParams,
  useLocation,
} from "react-router-dom";
import ReactMarkdown from "react-markdown";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Menu,
  MessageSquare,
  Search,
  Send,
  Share2,
  X,
} from "lucide-react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import { articles, formatDate, type Article } from "./content";

// --------------------------------------------------
// UTILITÁRIOS
// --------------------------------------------------

function cn(...values: Parameters<typeof clsx>) {
  return twMerge(clsx(...values));
}

function calculateReadingTime(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function getTagsList(tags: unknown): string[] {
  if (Array.isArray(tags)) {
    return tags.map(String).map((tag) => tag.trim()).filter(Boolean);
  }

  if (typeof tags === "string") {
    return tags.split(",").map((tag) => tag.trim()).filter(Boolean);
  }

  return [];
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}

// --------------------------------------------------
// MODAL DE ENVIO DE TEXTOS
// --------------------------------------------------

function ContactModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");

  const [message, setMessage] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    setStatus("idle");
    setErrorMessage("");

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    modalRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!message.trim() || status === "sending") return;

    setStatus("sending");
    setErrorMessage("");

    try {
      const formspreeEndpoint = "https://formspree.io/f/xkjjndzd";

      const payload: Record<string, string> = {
        autor: isAnonymous
          ? "Anónimo"
          : authorName.trim() || "Não informado",
        texto: message.trim(),
        dataEnvio: new Date().toLocaleString("pt-PT"),
      };

      if (!isAnonymous && authorEmail.trim()) {
        payload.email = authorEmail.trim();
      }

      const response = await fetch(formspreeEndpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Não foi possível enviar a mensagem.");
      }

      setStatus("success");
      setMessage("");
      setAuthorName("");
      setAuthorEmail("");
      setIsAnonymous(true);
    } catch {
      setStatus("error");
      setErrorMessage(
        "Não foi possível enviar o seu texto. Verifique a sua ligação e tente novamente."
      );
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-background/85 p-4 backdrop-blur-md animate-fadeIn"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-title"
        className="relative my-auto w-full max-w-lg space-y-6 rounded-2xl border border-line bg-surface p-6 shadow-2xl outline-none sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar janela"
          className="absolute right-4 top-4 rounded-full p-2 text-muted transition-colors hover:bg-line/30 hover:text-paper cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="space-y-3 pr-6">
          <span className="text-xs uppercase tracking-[0.2em] text-accent">
            espaço autoral
          </span>

          <h2
            id="contact-title"
            className="font-serif text-3xl text-paper"
          >
            Envie as suas palavras.
          </h2>

          <p className="text-sm leading-relaxed text-muted">
            Uma reflexão, um desabafo ou um texto autoral.
            Se preferir, pode enviar de forma anónima.
          </p>
        </div>

        {status === "success" ? (
          <div className="space-y-4 py-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-accent/30 bg-accent/10 text-accent">
              <Check size={26} />
            </div>

            <h3 className="font-serif text-2xl text-paper">
              Palavras recebidas.
            </h3>

            <p className="text-sm leading-relaxed text-muted">
              A mensagem foi entregue com sucesso.
              Obrigado por partilhar este espaço.
            </p>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-line px-6 py-2.5 text-sm text-paper transition-colors hover:border-accent cursor-pointer"
            >
              Fechar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="flex cursor-pointer items-center gap-3 border-b border-line pb-4 text-sm text-paper select-none">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(event) => setIsAnonymous(event.target.checked)}
                className="h-4 w-4 accent-accent"
              />
              Enviar anonimamente
            </label>

            {!isAnonymous && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  aria-label="O seu nome"
                  placeholder="O seu nome (opcional)"
                  value={authorName}
                  onChange={(event) => setAuthorName(event.target.value)}
                  className="min-w-0 rounded-lg border border-line bg-[#121316] px-3 py-3 text-sm text-white outline-none transition-colors placeholder:text-muted/60 focus:border-accent"
                />

                <input
                  type="email"
                  aria-label="O seu e-mail"
                  placeholder="O seu e-mail (opcional)"
                  value={authorEmail}
                  onChange={(event) => setAuthorEmail(event.target.value)}
                  className="min-w-0 rounded-lg border border-line bg-[#121316] px-3 py-3 text-sm text-white outline-none transition-colors placeholder:text-muted/60 focus:border-accent"
                />
              </div>
            )}

            <textarea
              rows={6}
              required
              minLength={2}
              maxLength={10000}
              aria-label="Texto da mensagem"
              placeholder="Escreva sem pressa..."
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="w-full resize-y rounded-xl border border-line bg-[#121316] p-4 text-sm leading-relaxed text-white outline-none transition-colors placeholder:text-muted/60 focus:border-accent"
            />

            <div className="flex justify-end text-xs text-muted">
              {message.length}/10000 caracteres
            </div>

            {status === "error" && (
              <p role="alert" className="text-sm text-red-400">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "sending" || !message.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-accent/50 bg-accent/10 px-5 py-3 text-sm font-medium text-accent transition-colors hover:bg-accent/20 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              {status === "sending" ? (
                "A enviar..."
              ) : (
                <>
                  <Send size={16} />
                  Enviar texto
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// --------------------------------------------------
// CABEÇALHO
// --------------------------------------------------

function Header({ onOpenContact }: { onOpenContact: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [menuOpen]);

  const links = [
    { to: "/", label: "Início" },
    { to: "/escritos", label: "Escritos" },
    { to: "/sobre", label: "Sobre" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-line/50 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6 lg:px-12">
        <Link
          to="/"
          className="font-serif text-2xl tracking-tight text-paper transition-opacity hover:opacity-75"
        >
          entrelinhas<span className="text-accent">.</span>
        </Link>

        <button
          type="button"
          className="rounded-full p-2 text-paper transition-colors hover:bg-surface md:hidden cursor-pointer"
          aria-label={menuOpen ? "Fechar navegação" : "Abrir navegação"}
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <nav
          id="main-navigation"
          className={cn(
            "absolute left-0 right-0 top-full border-b border-line bg-background/95 p-6 shadow-xl transition-all duration-200 md:static md:flex md:items-center md:gap-8 md:border-0 md:bg-transparent md:p-0 md:shadow-none",
            menuOpen
              ? "visible translate-y-0 opacity-100"
              : "invisible -translate-y-2 opacity-0 md:visible md:translate-y-0 md:opacity-100"
          )}
        >
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                cn(
                  "block py-3 text-sm transition-colors md:py-2",
                  isActive
                    ? "text-paper font-medium"
                    : "text-muted hover:text-paper"
                )
              }
            >
              {link.label}
            </NavLink>
          ))}

          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              onOpenContact();
            }}
            className="mt-3 flex items-center gap-2 border-t border-line pt-5 text-left text-xs uppercase tracking-widest text-accent transition-colors hover:text-paper md:mt-0 md:border-0 md:pt-0 cursor-pointer"
          >
            <MessageSquare size={14} />
            Enviar texto
            <ArrowRight size={13} />
          </button>
        </nav>
      </div>
    </header>
  );
}

// --------------------------------------------------
// RODAPÉ
// --------------------------------------------------

function Footer() {
  return (
    <footer className="mx-auto mt-16 flex w-full max-w-7xl flex-col items-center justify-between gap-4 border-t border-line/60 px-6 py-10 text-center sm:flex-row sm:text-left lg:px-12">
      <span className="text-xs tracking-wide text-muted">
        © {new Date().getFullYear()} entrelinhas · por Luana Souza
      </span>

      <span className="font-serif text-sm italic text-paper/70">
        feito de palavras, tempo e silêncio.
      </span>
    </footer>
  );
}

// --------------------------------------------------
// CARD DE ARTIGO
// --------------------------------------------------

function ArticleCard({ article }: { article: Article }) {
  const readingTime = useMemo(
    () => calculateReadingTime(article.content),
    [article.content]
  );

  const tags = useMemo(
    () => getTagsList(article.tags),
    [article.tags]
  );

  return (
    <article className="group flex h-full flex-col rounded-xl border border-line/60 bg-surface/20 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/60 hover:bg-surface/50 hover:shadow-[0_0_30px_rgba(147,51,234,0.1)] md:p-7">
      <div className="mb-5 flex flex-wrap items-center gap-x-2 gap-y-2 text-[11px] uppercase tracking-wider text-muted">
        <span className="text-accent">{article.category}</span>
        <span aria-hidden="true">·</span>
        <time dateTime={article.date}>{formatDate(article.date)}</time>
        <span aria-hidden="true">·</span>
        <span className="flex items-center gap-1">
          <Clock size={12} />
          {readingTime} min
        </span>
      </div>

      <Link
        to={`/escritos/${article.slug}`}
        className="flex flex-1 flex-col"
      >
        <h3 className="font-serif text-2xl leading-snug text-paper transition-colors group-hover:text-accent md:text-[1.7rem]">
          {article.title}
        </h3>

        <p className="mt-3 line-clamp-3 text-sm leading-7 text-muted md:text-base">
          {article.excerpt}
        </p>

        <span className="mt-6 inline-flex items-center gap-2 text-sm text-paper/80 transition-colors group-hover:text-accent">
          Continuar lendo
          <ArrowRight
            size={15}
            className="transition-transform group-hover:translate-x-1"
          />
        </span>
      </Link>

      {tags.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2 border-t border-line/40 pt-4">
          {tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-line/20 px-2.5 py-1 text-xs text-muted"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}

// --------------------------------------------------
// ARTIGO EM DESTAQUE
// --------------------------------------------------

function FeaturedArticle({ article }: { article: Article }) {
  const readingTime = useMemo(
    () => calculateReadingTime(article.content),
    [article.content]
  );

  return (
    <section className="group relative overflow-hidden rounded-2xl border border-line/80 bg-gradient-to-br from-surface/80 to-background p-7 transition-all hover:border-accent/60 hover:shadow-[0_0_40px_rgba(147,51,234,0.12)] sm:p-10 md:p-14">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-5 -top-12 select-none font-serif text-[180px] leading-none text-accent/[0.06] sm:text-[240px]"
      >
        e.
      </div>

      <div className="relative z-10 max-w-3xl space-y-6">
        <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.16em] text-accent">
          <span>em destaque</span>
          <span aria-hidden="true">·</span>
          <span>{readingTime} min de leitura</span>
        </div>

        <Link to={`/escritos/${article.slug}`} className="block">
          <h2 className="max-w-3xl font-serif text-4xl leading-[1.1] text-paper transition-colors group-hover:text-accent sm:text-5xl md:text-6xl">
            {article.title}
          </h2>
        </Link>

        <p className="max-w-2xl text-base leading-8 text-muted md:text-lg">
          {article.excerpt}
        </p>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <Link
            to={`/escritos/${article.slug}`}
            className="inline-flex items-center gap-2 rounded-full border border-accent/50 px-5 py-3 text-sm text-paper transition-colors hover:bg-accent/10"
          >
            Ler o escrito
            <ArrowRight size={16} className="text-accent" />
          </Link>

          <span className="text-xs tracking-wide text-muted">
            {article.category} · {formatDate(article.date)}
          </span>
        </div>
      </div>
    </section>
  );
}

// --------------------------------------------------
// PÁGINA INICIAL
// --------------------------------------------------

function HomePage() {
  const latest = articles[0];

  return (
    <main className="mx-auto w-full max-w-7xl space-y-20 px-6 py-14 md:space-y-28 md:py-20 lg:px-12">
      <section className="max-w-5xl space-y-7">
        <span className="block text-xs uppercase tracking-[0.2em] text-accent">
          um espaço entre o sentir e o dizer
        </span>

        <h1 className="font-serif text-5xl leading-[1.08] tracking-tight text-paper sm:text-6xl md:text-7xl lg:text-8xl">
          Nem tudo precisa ter um lugar.
          <br />
          Mas pode ter{" "}
          <em className="text-accent">palavras.</em>
        </h1>

        <p className="max-w-2xl text-base leading-8 text-muted md:text-xl">
          Um caderno aberto sobre o que nos atravessa — e sobre tudo aquilo
          que só cabe nas entrelinhas.
        </p>

        <a
          href="#escritos-recentes"
          className="inline-flex items-center gap-2 pt-2 text-sm text-paper/80 transition-colors hover:text-accent"
        >
          Explorar escritos
          <ArrowDown size={16} className="text-accent" />
        </a>
      </section>

      {latest && (
        <section className="space-y-7" aria-labelledby="featured-heading">
          <div className="flex items-center gap-4">
            <h2
              id="featured-heading"
              className="text-xs uppercase tracking-[0.2em] text-muted"
            >
              uma leitura para começar
            </h2>
            <div className="h-px flex-1 bg-line/60" />
          </div>

          <FeaturedArticle article={latest} />
        </section>
      )}

      <section id="escritos-recentes" className="space-y-8">
        <div className="flex items-end justify-between gap-4 border-b border-line pb-5">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-accent">
              do caderno
            </span>
            <h2 className="mt-2 font-serif text-3xl text-paper md:text-4xl">
              Últimos escritos
            </h2>
          </div>

          <Link
            to="/escritos"
            className="inline-flex shrink-0 items-center gap-2 text-sm text-muted transition-colors hover:text-accent"
          >
            Ver todos
            <ArrowRight size={15} />
          </Link>
        </div>

        {articles.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {articles.slice(0, 3).map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        ) : (
          <p className="py-12 text-sm text-muted">
            Ainda não há escritos publicados. Em breve, novas palavras por aqui.
          </p>
        )}
      </section>

      <section className="rounded-2xl border-y border-line/60 bg-surface/20 px-6 py-16 text-center md:py-24">
        <span className="text-xs uppercase tracking-[0.2em] text-accent">
          uma pequena lembrança
        </span>

        <p className="mx-auto mt-6 max-w-3xl font-serif text-2xl leading-relaxed text-paper sm:text-3xl md:text-5xl">
          Nem tudo precisa ser resolvido.
          <br />
          <em className="text-accent">
            Algumas coisas só precisam ser compreendidas.
          </em>
        </p>
      </section>
    </main>
  );
}

// --------------------------------------------------
// LISTAGEM E FILTROS
// --------------------------------------------------

function WritingsPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todas");
  const [tag, setTag] = useState("Todas");

  const categories = useMemo(
    () => ["Todas", ...new Set(articles.map((article) => article.category))],
    []
  );

  const tags = useMemo(
    () => [
      "Todas",
      ...new Set(articles.flatMap((article) => getTagsList(article.tags))),
    ],
    []
  );

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("pt-PT");

    return articles.filter((article) => {
      const articleTags = getTagsList(article.tags);

      const searchable = [
        article.title,
        article.excerpt,
        article.content,
        article.category,
        ...articleTags,
      ]
        .join(" ")
        .toLocaleLowerCase("pt-PT");

      return (
        searchable.includes(normalizedQuery) &&
        (category === "Todas" || article.category === category) &&
        (tag === "Todas" || articleTags.includes(tag))
      );
    });
  }, [query, category, tag]);

  function clearFilters() {
    setQuery("");
    setCategory("Todas");
    setTag("Todas");
  }

  return (
    <main className="mx-auto min-h-[70vh] w-full max-w-7xl space-y-10 px-6 py-14 lg:px-12">
      <section className="max-w-3xl space-y-4">
        <span className="text-xs uppercase tracking-[0.2em] text-accent">
          o caderno inteiro
        </span>

        <h1 className="font-serif text-5xl text-paper md:text-6xl">
          Escritos<span className="text-accent">.</span>
        </h1>

        <p className="max-w-2xl text-base leading-8 text-muted">
          Textos para ler sem pressa. Procure um assunto, encontre uma
          palavra ou deixe o acaso escolher.
        </p>
      </section>

      <section
        className="space-y-6 border-y border-line py-7"
        aria-label="Pesquisar e filtrar escritos"
      >
        <div className="relative max-w-xl">
          <Search
            size={18}
            aria-hidden="true"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
          />

          <input
            type="search"
            aria-label="Pesquisar escritos"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Pesquisar por título ou palavra..."
            className="w-full rounded-full border border-line bg-[#121316] py-3.5 pl-11 pr-11 text-sm text-white outline-none transition-colors placeholder:text-muted/60 focus:border-accent"
          />

          {query && (
            <button
              type="button"
              aria-label="Limpar pesquisa"
              onClick={() => setQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-paper cursor-pointer"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="space-y-3">
          <span className="block text-xs uppercase tracking-widest text-muted">
            Categorias
          </span>

          <div className="flex flex-wrap gap-2">
            {categories.map((item) => (
              <button
                type="button"
                key={item}
                aria-pressed={category === item}
                onClick={() => setCategory(item)}
                className={cn(
                  "rounded-full border px-4 py-2 text-xs transition-colors cursor-pointer",
                  category === item
                    ? "border-accent/70 bg-accent/10 text-accent"
                    : "border-line/60 text-muted hover:border-accent/40 hover:text-paper"
                )}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {tags.length > 1 && (
          <div className="space-y-3">
            <span className="block text-xs uppercase tracking-widest text-muted">
              Tags
            </span>

            <div className="flex flex-wrap gap-2">
              {tags.map((item) => (
                <button
                  type="button"
                  key={item}
                  aria-pressed={tag === item}
                  onClick={() => setTag(item)}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-xs transition-colors cursor-pointer",
                    tag === item
                      ? "border-paper/50 bg-paper/10 text-paper"
                      : "border-line/40 text-muted hover:border-line hover:text-paper"
                  )}
                >
                  {item === "Todas" ? "Todas as tags" : `#${item}`}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      <div className="flex items-center justify-between gap-4 text-xs text-muted">
        <span aria-live="polite">
          {filtered.length}{" "}
          {filtered.length === 1
            ? "escrito encontrado"
            : "escritos encontrados"}
        </span>

        {(query || category !== "Todas" || tag !== "Todas") && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1 text-accent hover:underline cursor-pointer"
          >
            <X size={13} />
            Limpar filtros
          </button>
        )}
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      ) : (
        <div className="space-y-3 rounded-xl border border-dashed border-line p-12 text-center">
          <p className="font-serif text-2xl text-paper">
            Nenhum escrito encontrado.
          </p>

          <p className="text-sm text-muted">
            Tente outras palavras ou remova os filtros.
          </p>

          <button
            type="button"
            onClick={clearFilters}
            className="text-sm text-accent hover:underline cursor-pointer"
          >
            Ver todos os escritos
          </button>
        </div>
      )}
    </main>
  );
}

// --------------------------------------------------
// PÁGINA INDIVIDUAL DO ARTIGO (DESIGN LITERÁRIO & IMERSIVO)
// --------------------------------------------------

function ArticlePage() {
  const { slug } = useParams();

  const articleIndex = articles.findIndex((item) => item.slug === slug);
  const article = articles[articleIndex];

  const bodyRef = useRef<HTMLElement>(null);

  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const [shareMessage, setShareMessage] = useState("");

  const readingTime = useMemo(
    () => (article ? calculateReadingTime(article.content) : 0),
    [article]
  );

  const tags = useMemo(
    () => (article ? getTagsList(article.tags) : []),
    [article]
  );

  const prevArticle = articles[articleIndex + 1];
  const nextArticle = articleIndex > 0 ? articles[articleIndex - 1] : undefined;

  const relatedArticles = useMemo(() => {
    if (!article) return [];

    return articles
      .filter(
        (item) =>
          item.slug !== article.slug &&
          item.category === article.category
      )
      .slice(0, 2);
  }, [article]);

  useEffect(() => {
    const element = bodyRef.current;

    if (!element) return;

    let animationFrame = 0;

    function updateProgress() {
      const currentElement = bodyRef.current;
      if (!currentElement) return;

      cancelAnimationFrame(animationFrame);

      animationFrame = requestAnimationFrame(() => {
        const rect = currentElement.getBoundingClientRect();
        const documentTop = rect.top + window.scrollY;
        const articleHeight = currentElement.offsetHeight;
        const start = documentTop;
        const end = documentTop + articleHeight - window.innerHeight;

        if (articleHeight <= window.innerHeight || end <= start) {
          setProgress(window.scrollY >= start ? 100 : 0);
          return;
        }

        const value =
          ((window.scrollY - start) / (end - start)) * 100;

        setProgress(Math.min(100, Math.max(0, value)));
      });
    }

    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);

    updateProgress();

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, [slug]);

  useEffect(() => {
    setCopied(false);
    setShareMessage("");
  }, [slug]);

  useEffect(() => {
    if (!shareMessage) return;

    const timeout = window.setTimeout(() => {
      setShareMessage("");
    }, 3500);

    return () => window.clearTimeout(timeout);
  }, [shareMessage]);

  if (!article) {
    return (
      <main className="mx-auto w-full max-w-4xl space-y-5 px-6 py-24 text-center">
        <h1 className="font-serif text-4xl text-paper">
          Escrito não encontrado.
        </h1>

        <p className="text-muted">
          Talvez este texto tenha mudado de lugar.
        </p>

        <Link
          to="/escritos"
          className="inline-flex items-center gap-2 text-accent hover:underline"
        >
          <ArrowLeft size={16} />
          Voltar aos escritos
        </Link>
      </main>
    );
  }

  async function shareArticle() {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: article.title,
          url,
        });

        return;
      }

      if (!navigator.clipboard?.writeText) {
        setShareMessage("O seu browser não permite copiar o link automaticamente.");
        return;
      }

      await navigator.clipboard.writeText(url);
      setCopied(true);
      setShareMessage("Link copiado para a área de transferência.");
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }

      setShareMessage("Não foi possível partilhar. Tente novamente.");
    }
  }

  return (
    <>
      <div
        className="fixed left-0 top-0 z-[60] h-1.5 bg-accent transition-[width] duration-100 shadow-[0_0_12px_var(--color-accent)]"
        style={{ width: `${progress}%` }}
        role="progressbar"
        aria-label="Progresso da leitura"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
      />

      <main className="mx-auto w-full max-w-3xl px-6 py-16 md:py-24 lg:px-4">
        <article className="space-y-12">
          <Link
            to="/escritos"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted transition-colors hover:text-accent"
          >
            <ArrowLeft size={16} />
            Todos os escritos
          </Link>

          <header className="space-y-8 border-b border-line pb-12">
            <div className="flex flex-wrap items-center gap-3 text-sm uppercase tracking-[0.18em] text-accent font-medium">
              <span>{article.category}</span>
              <span aria-hidden="true">·</span>
              <time dateTime={article.date}>{formatDate(article.date)}</time>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} />
                {readingTime} min de leitura
              </span>
            </div>

            <h1 className="font-serif text-4xl leading-[1.12] text-white sm:text-5xl md:text-6xl tracking-tight">
              {article.title}
            </h1>

            <p className="font-serif text-xl italic leading-relaxed text-white/90 md:text-2xl font-light">
              {article.excerpt}
            </p>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2.5 pt-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-line bg-surface/60 px-3.5 py-1.5 text-xs text-white/80 tracking-wide"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          <section
            ref={bodyRef}
            className="markdown-body max-w-none text-xl md:text-[1.35rem] leading-[2.1] text-white/95 space-y-10 [&>p:first-of-type]:first-letter:text-7xl [&>p:first-of-type]:first-letter:font-serif [&>p:first-of-type]:first-letter:float-left [&>p:first-of-type]:first-letter:mr-4 [&>p:first-of-type]:first-letter:leading-none [&>p:first-of-type]:first-letter:text-accent font-normal"
          >
            <ReactMarkdown
              components={{
                h2: ({ ...props }) => (
                  <h2
                    className="font-serif text-3xl md:text-4xl font-normal text-white mt-16 mb-6 tracking-tight"
                    {...props}
                  />
                ),
                h3: ({ ...props }) => (
                  <h3
                    className="font-serif text-2xl md:text-3xl font-normal text-white mt-12 mb-5"
                    {...props}
                  />
                ),
                p: ({ ...props }) => (
                  <p className="my-8 text-white/95" {...props} />
                ),
                blockquote: ({ ...props }) => (
                  <blockquote
                    className="my-12 border-l-2 border-accent py-3 pl-8 font-serif text-2xl md:text-3xl italic text-white leading-relaxed bg-surface/30 rounded-r-xl"
                    {...props}
                  />
                ),
                a: ({ ...props }) => (
                  <a
                    className="text-accent underline underline-offset-4 hover:opacity-80 transition-opacity"
                    target="_blank"
                    rel="noopener noreferrer"
                    {...props}
                  />
                ),
                ul: ({ ...props }) => (
                  <ul className="my-8 list-disc pl-8 space-y-4 text-white/95" {...props} />
                ),
                ol: ({ ...props }) => (
                  <ol className="my-8 list-decimal pl-8 space-y-4 text-white/95" {...props} />
                ),
              }}
            >
              {article.content}
            </ReactMarkdown>
          </section>

          <footer className="space-y-10 border-t border-line pt-12">
            <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
              <span className="font-serif text-2xl italic text-accent font-light">
                fim, por enquanto.
              </span>

              <button
                type="button"
                onClick={shareArticle}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/50 px-6 py-3 text-sm text-paper transition-all hover:border-accent hover:bg-surface cursor-pointer shadow-sm"
              >
                {copied ? <Check size={16} className="text-accent" /> : <Share2 size={16} />}
                {copied ? "Copiado!" : "Partilhar"}
              </button>
            </div>

            {shareMessage && (
              <p role="status" className="text-center text-xs tracking-wide text-accent">
                {shareMessage}
              </p>
            )}

            <nav
              className="grid grid-cols-1 gap-6 pt-4 sm:grid-cols-2"
              aria-label="Navegação entre artigos"
            >
              {prevArticle ? (
                <Link
                  to={`/escritos/${prevArticle.slug}`}
                  className="group rounded-2xl border border-line/60 bg-surface/20 p-6 transition-all hover:border-accent/50 hover:bg-surface/40"
                >
                  <span className="mb-2 block text-xs uppercase tracking-widest text-muted">
                    ← Anterior
                  </span>
                  <span className="font-serif text-xl text-white group-hover:text-accent line-clamp-1 transition-colors">
                    {prevArticle.title}
                  </span>
                </Link>
              ) : (
                <div />
              )}

              {nextArticle ? (
                <Link
                  to={`/escritos/${nextArticle.slug}`}
                  className="group rounded-2xl border border-line/60 bg-surface/20 p-6 text-right transition-all hover:border-accent/50 hover:bg-surface/40 sm:col-start-2"
                >
                  <span className="mb-2 block text-xs uppercase tracking-widest text-muted">
                    Próximo →
                  </span>
                  <span className="font-serif text-xl text-white group-hover:text-accent line-clamp-1 transition-colors">
                    {nextArticle.title}
                  </span>
                </Link>
              ) : (
                <div />
              )}
            </nav>

            {relatedArticles.length > 0 && (
              <section className="space-y-6 pt-8">
                <h3 className="font-serif text-2xl text-white">
                  Outras leituras em {article.category}
                </h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {relatedArticles.map((item) => (
                    <ArticleCard key={item.slug} article={item} />
                  ))}
                </div>
              </section>
            )}
          </footer>
        </article>
      </main>
    </>
  );
}

// --------------------------------------------------
// PÁGINA SOBRE
// --------------------------------------------------

function AboutPage({ onOpenContact }: { onOpenContact: () => void }) {
  return (
    <main className="mx-auto min-h-[70vh] w-full max-w-3xl space-y-8 px-6 py-16">
      <section className="space-y-4">
        <span className="text-xs uppercase tracking-[0.2em] text-accent">
          um pouco sobre este lugar
        </span>

        <h1 className="font-serif text-5xl text-paper md:text-6xl">
          Sobre<span className="text-accent">.</span>
        </h1>
      </section>

      <div className="space-y-6 border-l border-line pl-6 font-light leading-relaxed text-muted md:text-lg">
        <p>
          O <strong className="font-normal text-paper">entrelinhas.</strong> é
          um espaço autoral para escrever sobre aquilo que nem sempre encontra
          nome: sentimentos, mudanças, memórias e pequenos começos.
        </p>

        <p>
          Um caderno aberto, sem urgência. Feito para quem acredita que
          algumas palavras chegam melhor quando se lê devagar.
        </p>

        <p>
          Aqui não há métricas de engajamento nem algoritmos para agradar.
          Apenas pensamentos organizados em frases.
        </p>

        <div className="pt-4">
          <button
            type="button"
            onClick={onOpenContact}
            className="inline-flex items-center gap-2 text-sm text-paper transition-colors hover:text-accent cursor-pointer"
          >
            Escreva para mim
            <ArrowRight size={15} className="text-accent" />
          </button>
        </div>
      </div>
    </main>
  );
}

// --------------------------------------------------
// PÁGINA 404
// --------------------------------------------------

function NotFoundPage() {
  return (
    <main className="mx-auto w-full max-w-md px-6 py-32 text-center space-y-6">
      <span className="text-xs uppercase tracking-[0.2em] text-accent">404</span>

      <h1 className="font-serif text-4xl text-paper">
        Caminho não encontrado.
      </h1>

      <p className="text-muted">
        Talvez esta página tenha mudado de lugar ou o endereço não exista.
      </p>

      <Link
        to="/"
        className="inline-flex items-center gap-2 text-accent hover:underline pt-2"
      >
        <ArrowLeft size={16} />
        Voltar ao início
      </Link>
    </main>
  );
}

// --------------------------------------------------
// COMPONENTE RAIZ (APP)
// --------------------------------------------------

export default function App() {
  const [isContactOpen, setIsContactOpen] = useState(false);

  return (
    <div className="app-shell flex min-h-screen flex-col justify-between overflow-x-hidden bg-background text-paper selection:bg-accent/30">
      <ScrollToTop />

      <Header onOpenContact={() => setIsContactOpen(true)} />

      <div className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/escritos" element={<WritingsPage />} />
          <Route path="/escritos/:slug" element={<ArticlePage />} />
          <Route
            path="/sobre"
            element={<AboutPage onOpenContact={() => setIsContactOpen(true)} />}
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>

      <Footer />

      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />
    </div>
  );
}