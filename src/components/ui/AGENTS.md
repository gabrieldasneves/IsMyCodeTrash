# UI Components — Padrões de Criação

Este documento define os padrões obrigatórios para criação de componentes em `src/components/ui`.
Todo componente novo deve seguir estes padrões sem exceção.

---

## Stack de estilização

- **Tailwind CSS** — classes utilitárias
- **tailwind-variants (`tv`)** — variantes e merge de classes
- **Sem `tailwind-merge` diretamente** — o `tv` já faz o merge internamente; passe `className` como argumento da função `tv`, não via `twMerge(tv(...), className)`
- **`@base-ui/react`** — primitivos headless para componentes com comportamento (estado, acessibilidade, teclado, ARIA)
- **`shiki`** — syntax highlighting server-side para blocos de código

---

## Quando usar Base UI

Use os primitivos do `@base-ui/react` sempre que o componente tiver **comportamento interativo**:

| Comportamento | Primitivo Base UI |
|---|---|
| Toggle on/off | `Switch.Root` + `Switch.Thumb` |
| Menu dropdown | `Menu.Root`, `Menu.Trigger`, `Menu.Positioner`, `Menu.Popup`, `Menu.Item` |
| Dialog / Modal | `Dialog.Root`, `Dialog.Trigger`, `Dialog.Backdrop`, `Dialog.Popup` |
| Tooltip | `Tooltip.Root`, `Tooltip.Trigger`, `Tooltip.Positioner`, `Tooltip.Popup` |
| Select | `Select.Root`, `Select.Trigger`, `Select.Positioner`, `Select.Popup`, `Select.Item` |
| Accordion | `Accordion.Root`, `Accordion.Item`, `Accordion.Header`, `Accordion.Panel` |
| Tabs | `Tabs.Root`, `Tabs.List`, `Tabs.Tab`, `Tabs.Panel` |

**Regras ao usar Base UI:**
- A estilização continua sendo 100% Tailwind — o Base UI é sem estilo (headless)
- Use os **data attributes** expostos pelo Base UI para estilização de estados:
  ```tsx
  // Switch: data-[checked], data-[unchecked], data-[disabled]
  className="bg-zinc-700 data-[checked]:bg-emerald-500 data-[disabled]:opacity-50"
  ```
- Estenda a interface `Props` do primitivo Base UI em vez de `HTMLAttributes`:
  ```tsx
  // correto
  export interface ToggleProps extends Switch.Root.Props { label?: string }

  // errado
  export interface ToggleProps extends InputHTMLAttributes<HTMLInputElement> { ... }
  ```
- Adicione `"use client"` no topo — primitivos Base UI usam hooks React

---

## Server Components assíncronos

Use **async Server Components** para componentes que realizam I/O no servidor (fetch, leitura de arquivos, highlight de código, etc.):

```tsx
// ✅ Server Component assíncrono — sem "use client"
export async function CodeBlock({ code, lang }: CodeBlockProps) {
  const html = await codeToHtml(code, { lang, theme: "vesper" });
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
```

**Regras:**
- **Sem `"use client"`** — Server Components rodam exclusivamente no servidor
- A função deve ser `async` quando usar `await`
- Qualquer página que renderize um Server Component assíncrono também deve ser `async`
- Não use `useState`, `useEffect` ou outros hooks React — eles não existem no servidor

## Tipografia

- **`font-mono`** → JetBrains Mono (carregada via `next/font/google`, injetada como `--font-mono`)
  - Use para todo texto de interface, labels, botões, badges, código
- **`font-sans`** → fonte padrão do sistema (`ui-sans-serif, system-ui, sans-serif, ...`)
  - Use para texto descritivo/editorial de leitura longa (ex: descrições em cards)
- **Nunca use `font-primary`, `font-secondary` ou classes customizadas de fonte**
- As variáveis `--font-mono` e `--font-sans` são definidas no `@theme` do `globals.css` e sobrescrevem os defaults do Tailwind — `font-mono` e `font-sans` funcionam como classes normais do Tailwind

---

## Estrutura obrigatória de um componente

```tsx
import type { <Element>HTMLAttributes } from "react";
import { tv, type VariantProps } from "tailwind-variants";

// 1. Definição das variantes com tv()
const component = tv({
  base: [...],       // classes base sempre aplicadas
  variants: {
    variant: { ... },
    size: { ... },
    // outras dimensões de variação
  },
  defaultVariants: {
    variant: "...",
    size: "...",
  },
});

// 2. Tipo das variantes extraído do tv()
type ComponentVariants = VariantProps<typeof component>;

// 3. Interface pública: estende as props nativas do elemento HTML + variantes
export interface ComponentProps
  extends <Element>HTMLAttributes<HTML<Element>Element>,
    ComponentVariants {}

// 4. Named export — nunca default export
export function Component({ variant, size, className, ...props }: ComponentProps) {
  return (
    <element
      className={component({ variant, size, className })}
      {...props}
    />
  );
}
```

---

## Regras

### Exports
- **Sempre named export** — `export function`, `export interface`, `export type`
- **Nunca `export default`**

### Props
- Sempre estender as props nativas do elemento HTML subjacente
  - `button` → `ButtonHTMLAttributes<HTMLButtonElement>`
  - `input` → `InputHTMLAttributes<HTMLInputElement>`
  - `a` → `AnchorHTMLAttributes<HTMLAnchorElement>`
  - `div` → `HTMLAttributes<HTMLDivElement>`
  - etc.
- Sempre usar `...props` para repassar todos os atributos nativos ao elemento

### Variantes com `tailwind-variants`
- Definir o objeto `tv()` fora do componente (escopo de módulo)
- O nome da variável segue o nome do componente em **camelCase** (`button`, `input`, `badge`)
- `base` aceita array de strings para organizar classes por categoria
- Extrair o tipo com `type XxxVariants = VariantProps<typeof xxx>`
- Passar `className` diretamente para a função `tv` — **não usar `twMerge` manualmente**:
  ```tsx
  // correto
  className={button({ variant, size, className })}

  // errado
  className={twMerge(button({ variant, size }), className)}
  ```

### Merge de classes
- O `tailwind-variants` resolve conflitos de classes automaticamente
- Não instalar nem importar `tailwind-merge` diretamente nos componentes

### Arquivo
- Um componente por arquivo
- Nome do arquivo em **kebab-case**: `button.tsx`, `icon-button.tsx`, `text-input.tsx`
- O nome da função exportada em **PascalCase**: `Button`, `IconButton`, `TextInput`

---

## Exemplo de referência — Button

```tsx
import type { ButtonHTMLAttributes } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const button = tv({
  base: [
    "inline-flex items-center justify-center gap-2",
    "font-mono font-medium text-[13px]",
    "transition-colors duration-150",
    "cursor-pointer disabled:pointer-events-none disabled:opacity-50",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
  ],
  variants: {
    variant: {
      primary:   "bg-emerald-500 text-zinc-950 not-disabled:hover:bg-emerald-400 focus-visible:ring-emerald-500",
      secondary: "bg-zinc-800 text-zinc-100 not-disabled:hover:bg-zinc-700 focus-visible:ring-zinc-500",
      outline:   "border border-emerald-500 text-emerald-500 bg-transparent not-disabled:hover:bg-emerald-500 not-disabled:hover:text-zinc-950 focus-visible:ring-emerald-500",
      ghost:     "bg-transparent text-zinc-400 not-disabled:hover:bg-zinc-800 not-disabled:hover:text-zinc-100 focus-visible:ring-zinc-500",
      destructive: "bg-red-600 text-zinc-50 not-disabled:hover:bg-red-500 focus-visible:ring-red-500",
    },
    size: {
      sm: "px-3 py-1.5 text-xs",
      md: "px-6 py-2.5",
      lg: "px-8 py-3 text-sm",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});

type ButtonVariants = VariantProps<typeof button>;

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariants {}

export function Button({ variant, size, className, ...props }: ButtonProps) {
  return <button className={button({ variant, size, className })} {...props} />;
}
```
