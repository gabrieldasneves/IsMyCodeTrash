# Specs — Formato e Convenções

Cada spec vive em `specs/<feature-name>.md` e deve ser criada **antes** de implementar a feature.

## Estrutura obrigatória

```
# Spec: <Nome da Feature>

## Contexto
Por que esta feature existe e o que ela resolve.

## Decisão
O que foi escolhido e por quê (pesquisa de alternativas se relevante).

## Especificação
Detalhes técnicos: schema, contratos de API, arquitetura de componentes,
fluxo de dados, arquivos a criar/modificar.

## To-dos de Implementação
- [ ] Tarefa 1
- [ ] Tarefa 2

## Status
`Em pesquisa` | `Pronto para implementação` | `Implementado`
```

## Regras

- **Escreva a spec antes de qualquer código** — a spec é o contrato, não a documentação posterior.
- **Seja específico**: inclua nomes de arquivos, tipos TypeScript, nomes de funções e exemplos de código reais.
- **Registre decisões com justificativa** — "por que X e não Y" evita reabrir discussões.
- **Mantenha o Status atualizado** conforme a implementação avança.
- **Nome do arquivo**: kebab-case, descritivo (`drizzle-postgres.md`, não `db.md`).
