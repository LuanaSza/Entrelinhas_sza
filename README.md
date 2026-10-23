# entrelinhas.

Blog pessoal autoral com React, TypeScript, Vite, Tailwind CSS e artigos em Markdown.

## Requisitos

- Node.js 20.19+ ou 22.12+
- npm

## Rodar localmente

No terminal, na pasta do projeto, execute:

```powershell
npm install
npm run dev
```

Abra no navegador o endereço exibido pelo Vite, normalmente `http://localhost:5173`.

Para gerar e testar a versão de produção:

```powershell
npm run build
npm run preview
```

## Criar um artigo

Adicione um arquivo `.md` em `src/content/escritos/`. Use frontmatter YAML no começo do arquivo e informe `tags` como um array JSON:

```md
---
title: "Título do artigo"
excerpt: "Uma breve apresentação."
date: "2026-10-23"
category: "Reflexões"
tags: ["vida", "pausa"]
---

O texto do artigo em Markdown.
```

O nome do arquivo vira o slug: `meu-texto.md` fica disponível em `/escritos/meu-texto`.

## Publicar na Vercel

1. Envie o projeto para um repositório GitHub.
2. Acesse [vercel.com](https://vercel.com/) e importe o repositório em **Add New → Project**.
3. Use o comando de build `npm run build` e o diretório de saída `dist`.
4. Clique em **Deploy**. O `vercel.json` mantém as rotas do React Router funcionando em acessos diretos e atualizações.

Nos próximos deploys, envie as alterações para o branch conectado à Vercel.
