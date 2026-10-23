export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  tags: string[];
  content: string;
};

const files = import.meta.glob("./content/escritos/*.md", {
  eager: true,
  query: "?raw",
  import: "default"
}) as Record<string, string>;

function parseArticle(path: string, raw: string): Article {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) throw new Error(`Frontmatter ausente ou inválido em ${path}`);

  const metadata: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const separator = line.indexOf(":");
    if (separator !== -1) metadata[line.slice(0, separator).trim()] = line.slice(separator + 1).trim();
  }
  const unquote = (value: string) => value.replace(/^["']|["']$/g, "");
  let tags: string[];
  try {
    tags = JSON.parse(metadata.tags ?? "[]");
  } catch {
    throw new Error(`Lista de tags inválida em ${path}`);
  }

  for (const key of ["title", "excerpt", "date", "category"]) {
    if (!metadata[key]) throw new Error(`Campo "${key}" ausente em ${path}`);
  }

  return {
    slug: path.split("/").pop()!.replace(/\.md$/, ""),
    title: unquote(metadata.title),
    excerpt: unquote(metadata.excerpt),
    date: unquote(metadata.date),
    category: unquote(metadata.category),
    tags,
    content: match[2].trim()
  };
}

export const articles = Object.entries(files)
  .map(([path, raw]) => parseArticle(path, raw))
  .sort((a, b) => b.date.localeCompare(a.date));

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(`${date}T12:00:00Z`));
}

// --------------------------------------------------
// LISTA DE FRASES PARA A PÁGINA INICIAL
// --------------------------------------------------

export type Quote = {
  text: string;
  highlight?: string;
  author?: string;
};

export const randomQuotes: Quote[] = [
  {
    text: "Nem tudo precisa ser resolvido.",
    highlight: "Algumas coisas só precisam ser compreendidas.",
  },
  {
    text: "How rare and beautiful it is",
    highlight: "to even exist.",
    author: "Saturn — Sleeping At Last",
  },
  {
    text: "Algumas histórias não precisam de um fim,",
    highlight: "apenas de um espaço nas entrelinhas.",
    author: "Luana Souza",
  },
];