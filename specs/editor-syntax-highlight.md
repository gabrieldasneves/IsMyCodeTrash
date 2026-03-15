# Spec: Editor com Syntax Highlight

## Contexto

O editor da homepage precisa aceitar código colado pelo usuário, aplicar syntax highlighting em tempo real conforme a linguagem detectada automaticamente, e permitir que o usuário sobrescreva a linguagem manualmente via seletor.

---

## Pesquisa de opções

### Opção 1 — Textarea + Shiki (abordagem ray.so)

O ray.so usa exatamente essa técnica: um `<textarea>` invisível sobreposto a uma `<div>` com o HTML gerado pelo Shiki. A técnica é conhecida como *"fake editor"*:

- O `<textarea>` captura input e fica absolutamente posicionado sobre o bloco de código
- O Shiki roda no cliente via `createHighlighter()` (inicialização única)
- A cada `onChange` do textarea, gera novo HTML via `highlighter.codeToHtml()`
- A div com `dangerouslySetInnerHTML` renderiza o HTML colorido por baixo
- Fontes, tamanho e line-height são sincronizados entre textarea e div para que o cursor fique alinhado com o texto visível

**Prós:**
- Já temos Shiki instalado (`shiki@4`)
- Zero dependências extras
- Tema `vesper` já configurado no projeto, coerência visual
- Shiki suporta +180 linguagens via lazy-loading por módulo (`shiki/langs/typescript.mjs`)
- Controle total sobre estilização — 100% Tailwind
- Funciona perfeitamente com Next.js (Shiki roda no servidor e no cliente)

**Contras:**
- Requer sincronização manual de fonte, line-height, padding entre textarea e div overlay
- Auto-detecção de linguagem não é nativa no Shiki — precisa de lib separada

---

### Opção 2 — CodeMirror 6

Editor completo com parser próprio, highlight nativo e extensões.

**Prós:**
- Editor real: cursor, seleção, undo/redo, indent automático
- Highlight integrado (não depende de Shiki)
- Extensões para linguagens carregadas sob demanda
- Bem suportado, usado em CodeSandbox, Replit, etc.

**Contras:**
- Bundle pesado (+150kb minificado para um conjunto razoável de linguagens)
- Difícil de estilizar via Tailwind — usa classes CSS próprias
- Overhead desnecessário para um "paste & roast": o usuário só cola, não edita muito
- Não integra com o Shiki que já temos

---

### Opção 3 — Monaco Editor

Editor do VS Code portado para o browser.

**Prós:**
- Experiência de editor completa (IntelliSense, hover, etc.)
- Auto-detecção embutida

**Contras:**
- Bundle enorme (~2MB+)
- Requer web workers e configuração de webpack/turbopack extra
- Não funciona em mobile
- Muito pesado para o caso de uso: o usuário só vai colar código, não editar arquivos
- Styling via CSS modules, incompatível com Tailwind de forma natural

---

### Opção 4 — Highlight.js com `highlightAuto()`

Biblioteca com auto-detecção nativa.

**Prós:**
- `hljs.highlightAuto(code)` detecta a linguagem automaticamente com score de confiança
- Leve se importado com subset (`highlight.js/lib/common`)
- Auto-detecção é a funcionalidade mais madura do mercado para esse caso

**Contras:**
- Não integra com Shiki — duplicaria a lógica de highlight
- Themes separados dos nossos tokens de design
- Seria necessário usar hljs para detectar e Shiki para renderizar (dois sistemas)

---

## Decisão recomendada

**Textarea + Shiki no cliente + highlight.js apenas para auto-detecção**

A estratégia híbrida é a mais coerente com o stack atual:

1. **Shiki** faz o rendering do highlight (já instalado, tema `vesper`, coerência visual)
2. **highlight.js** (`hljs.highlightAuto`) faz apenas a detecção da linguagem — sem renderizar nada, só retorna `{ language, relevance }`. Pode ser importado com o subset `common` (~45kb gzip)
3. O editor é um `<textarea>` + `<div>` overlay, mesma técnica do ray.so

Essa combinação é exatamente o que faz mais sentido: o Shiki é superior ao hljs em qualidade de highlight (usa TextMate grammars, o mesmo do VS Code), mas o hljs tem a melhor auto-detecção do mercado.

---

## Especificação de implementação

### Decisões baseadas no escopo ("paste & roast")

O editor é simples: o usuário **cola** o código — não digita linha a linha. Isso simplifica bastante:

- **Sem debounce**: o highlight roda imediatamente no `onChange` (paste dispara um único evento)
- **Sem undo/redo, indent, autocomplete**: não é um editor de texto, é uma área de entrada
- **LanguageSelector simples**: lista estática com scroll, sem busca inline
- **Badge "auto"**: não necessário — mostrar só o nome da linguagem detectada é suficiente
- **Ao limpar**: volta para `plaintext` (campo vazio = sem linguagem)

### Arquitetura do componente

```
CodeEditor (Client Component)
├── estado: code (string)
├── estado: detectedLang (string | null)  ← detectado automaticamente
├── estado: selectedLang (string | null)  ← override manual do usuário
├── estado: highlightedHtml (string)      ← output do Shiki
│
├── <div> wrapper (posição relativa)
│   ├── <textarea> (absoluto, transparente, z-index alto)
│   └── <div> (dangerouslySetInnerHTML com HTML do Shiki)
│
└── <LanguageSelector> (dropdown, lista estática ~28 linguagens)
    └── mostra: selectedLang ?? detectedLang ?? "Auto"
```

### Fluxo de dados

```
usuário cola código (paste → onChange)
      ↓
setCode(value)
      ↓
hljs.highlightAuto(code) → { language, relevance }
se relevance >= 5 e code tem >= 3 linhas:
    setDetectedLang(language)
caso contrário:
    setDetectedLang(null)
      ↓
effectiveLang = selectedLang ?? detectedLang ?? "plaintext"
      ↓
highlighter.codeToHtml(code, { lang: effectiveLang, theme: "vesper" })
      ↓
setHighlightedHtml(html)
```

### Inicialização do Shiki (client-side)

```typescript
// Inicializado uma vez com createHighlighter, lazy por linguagem
const highlighter = await createHighlighter({
  themes: ["vesper"],
  langs: [], // começa vazio, carrega sob demanda
})
```

A linguagem é carregada dinamicamente quando necessária:
```typescript
if (!highlighter.getLoadedLanguages().includes(lang)) {
  await highlighter.loadLanguage(lang)
}
```

### Auto-detecção com highlight.js

```typescript
import hljs from "highlight.js/lib/common" // ~45kb gzip, cobre ~40 linguagens populares

const result = hljs.highlightAuto(code)
// result.language → "typescript" | "python" | null
// result.relevance → número (confiança, 0–100+)
```

Threshold: só aplicar a detecção se `relevance >= 5` e o código tiver pelo menos 3 linhas. Abaixo disso, manter `plaintext`.

### Mapeamento hljs → Shiki

As linguagens têm nomes diferentes entre os dois sistemas. Necessário um mapa:

```typescript
const HLJS_TO_SHIKI: Record<string, string> = {
  "javascript": "javascript",
  "typescript": "typescript",
  "python": "python",
  "ruby": "ruby",
  "go": "go",
  "rust": "rust",
  "java": "java",
  "kotlin": "kotlin",
  "swift": "swift",
  "cpp": "cpp",
  "csharp": "csharp",
  "css": "css",
  "html": "html",
  "xml": "xml",
  "json": "json",
  "yaml": "yaml",
  "bash": "bash",
  "shell": "bash",
  "sql": "sql",
  "php": "php",
  "scala": "scala",
  "r": "r",
}
```

### LanguageSelector

Dropdown usando `@base-ui/react` `Select`. Exibe:
- O nome da linguagem ativa (`selectedLang ?? detectedLang ?? "Auto"`)
- Lista estática com scroll das ~28 linguagens suportadas
- Opção "Auto" no topo para limpar o override manual (volta à detecção automática)

### Sincronização visual textarea ↔ overlay

Para que o cursor do textarea fique alinhado com o texto renderizado, os dois elementos precisam ter exatamente os mesmos valores de:
- `font-family` → `font-mono` (JetBrains Mono)
- `font-size` → `13px`
- `line-height` → `1.6` (ou valor definido pelo Shiki/tema)
- `padding` → mesmo valor nos dois
- `white-space: pre-wrap`
- `word-break: break-all` ou `overflow-wrap: break-word`

O textarea fica `color: transparent` e `caret-color: var(--color-accent-green)` para que o cursor seja visível mas o texto não.

### Arquivos a criar

```
src/
  components/
    ui/
      language-selector.tsx    ← dropdown de seleção de linguagem
  hooks/
    use-highlighter.ts         ← inicialização e cache do Shiki highlighter
    use-language-detection.ts  ← debounce + hljs.highlightAuto
  lib/
    languages.ts               ← lista curada de linguagens + mapa hljs→shiki
```

O componente `CodeEditor` existente em `src/components/ui/code-editor.tsx` será refatorado para incorporar tudo isso.

---

## Linguagens suportadas (curadas)

Subset inicial baseado no ray.so, priorizando as mais comuns para um "code roaster":

TypeScript, JavaScript, TSX, JSX, Python, Go, Rust, Java, Kotlin, Swift, C++, C#, PHP, Ruby, Scala, HTML, CSS, SCSS, JSON, YAML, SQL, Bash, Dockerfile, Markdown, GraphQL, Prisma, Vue, Svelte

Total: ~28 linguagens. Suficiente para cobrir 95%+ dos casos de uso.

---

## Status

Perguntas resolvidas — pronto para implementação.
