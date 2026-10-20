# CampoVivo 🌱

Painel moderno de **gestão de fazendas** desenvolvido com **Next.js 15, React 19, TypeScript e CSS**.

## Funcionalidades

- **Painel geral:** indicadores dinâmicos, despesas mensais, distribuição de gastos e alertas.
- **Rebanho:** cadastro, consulta, edição, exclusão, filtros e observações por animal.
- **Sanidade:** registro de doenças/sintomas, gravidade, andamento e encerramento de ocorrências.
- **Vacinação:** calendário de vacinas definido pelo responsável técnico, registros pendentes/aplicados, lote e notas.
- **Financeiro:** despesas por categoria, valor, data e observações.
- **Combustível:** lançamentos por máquina/veículo, litros, preço unitário e total automático.
- **Anotações:** registros livres para manejo, manutenção e tarefas.
- **Configurações:** nome da fazenda, exportação de backup em JSON, importação de backup e restauração dos exemplos ou início com registros vazios.
- Design responsivo com gradientes, transições e layout para desktop e mobile.

## Como rodar

Requisitos: **Node.js 20.9+** e npm.

```bash
npm install
npm run dev
```

Abra **http://localhost:3000**. No Windows, você também pode abrir `iniciar-windows.bat` (requer Node.js e acesso à internet para instalar dependências na primeira execução).

Para gerar versão de produção:

```bash
npm run build
npm run start
```

## Persistência e limites

Este é um **MVP funcional no navegador**. Os dados ficam no `localStorage` do dispositivo e navegador usados. Não há autenticação, banco de dados, sincronização entre máquinas nem cópia na nuvem. Use **Configurações → Exportar backup** para guardar os registros. Ao limpar os dados do navegador, eles podem ser perdidos.

Os cadastros iniciais são **exemplos fictícios** para explorar a interface. Use **Configurações → Começar do zero** para removê-los de uma vez, ou restaure a demonstração quando quiser. Para usar a aplicação em fazendas reais, recomenda-se criar API/backend, PostgreSQL, autenticação, permissões e backups automáticos.

**Atenção sanitária:** o módulo de vacinação é um calendário de registro, não um prescritor. Vacinas, esquemas e exigências oficiais variam conforme espécie, região e situação epidemiológica; defina-os com médico-veterinário e órgãos oficiais competentes.

## Estrutura

- `app/page.tsx`: componentes, interface, tipos, formulários e operações CRUD.
- `app/globals.css`: design system, layout e responsividade.
- `app/layout.tsx`: estrutura e metadados.
- `public/favicon.svg`: marca.

## Próximos passos técnicos

Separar componentes e contexto em módulos, validar formulários com Zod, criar rotas de API no Next.js, persistir em PostgreSQL via Prisma e implementar login multiusuário, níveis de acesso e trilha de auditoria.

## Página de entrada e acesso demonstrativo

A página pública de entrada apresenta o sistema e permite abrir um modal com credenciais de **demonstração**:

- E-mail: `demo@campovivo.com`
- Senha: `CampoVivo2026`

Use o botão **Preencher dados de demonstração** para entrar mais rápido. A sessão dura enquanto a aba do navegador permanece aberta e pode ser encerrada pelo menu lateral. O visual da entrada oferece alternância entre temas claro e escuro e favicon próprio com sol sobre pastagem (`app/icon.svg`).

**Segurança:** este acesso é apenas uma experiência de demonstração feita no navegador. Ele **não autentica usuários no servidor**, não protege os dados da aplicação e **não deve ser usado para dados reais ou sensíveis**. Para colocar em produção, implemente autenticação real, regras de acesso e banco de dados persistente no servidor.

