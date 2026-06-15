# App Scholar — README

Projeto completo de gerenciamento acadêmico para faculdade, composto por:

- **Frontend mobile** em React Native + Expo + TypeScript
- **Backend** em Node.js + Express
- **Banco de dados** em PostgreSQL
- **Integrações externas** com ViaCEP e IBGE Localidades

O sistema cobre os requisitos da Parte 1 e da Parte 2 do enunciado, incluindo interface mobile, autenticação, cadastros acadêmicos, boletim, integração com banco relacional e consumo de APIs externas.

Para ver o vídeo de funcionamento do projeto, acesse:
**https://youtu.be/fmG8k4AQE1k**

---

## Funcionalidades implementadas

### Perfis e permissões

#### Administrador
- cadastrar alunos
- cadastrar professores
- cadastrar disciplinas
- editar as disciplinas de alunos já existentes
- lançar e editar notas
- lançar e editar faltas
- consultar boletins
- visualizar indicadores do dashboard

#### Professor
- acessar apenas suas disciplinas
- lançar e editar notas
- lançar e editar faltas
- consultar boletins dos alunos vinculados às suas disciplinas
- visualizar dashboard acadêmico

#### Aluno
- acessar o portal do aluno
- visualizar suas disciplinas
- visualizar suas notas
- visualizar suas faltas
- visualizar sua média e situação por disciplina

---

## Módulos principais

- Login com autenticação via JWT
- Dashboard com indicadores salvos no banco
- Cadastro de alunos com:
  - validação de formulário
  - preenchimento automático de endereço via ViaCEP
  - estados e cidades via IBGE
  - vínculo obrigatório com pelo menos uma disciplina do curso
- Cadastro de professores com:
  - vínculo com disciplina previamente existente e sem professor
  - criação de usuário de acesso com senha inicial
- Cadastro de disciplinas
- Edição das disciplinas do aluno já cadastrado
- Lançamento de notas e faltas
- Consulta de boletim por matrícula
- Menu lateral expandível na tela inicial
- Seed inicial com usuários e dados de exemplo

---

## Estrutura do projeto

```text
app_escolar/
├── assets/
├── backend/
│   ├── controllers/
│   ├── database/
│   ├── middleware/
│   ├── routes/
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── src/
│   ├── components/
│   ├── hooks/
│   ├── navigation/
│   ├── screens/
│   ├── services/
│   ├── styles/
│   └── types/
├── .env
├── .env.example
├── App.tsx
├── app.json
├── babel.config.js
├── index.ts
├── package.json
└── README.md
```

---

## Tecnologias

### Frontend
- React Native
- Expo
- TypeScript
- React Navigation
- Hooks (`useState`, `useEffect`, `useContext`)
- Fetch API

### Backend
- Node.js
- Express.js
- PostgreSQL
- JWT
- bcryptjs
- axios

### APIs externas
- ViaCEP
- IBGE Localidades

---

## Pré-requisitos

No Windows, instale:

- Node.js LTS
- PostgreSQL
- VS Code
- Expo Go no celular, se quiser testar em aparelho físico

Confirme no terminal:

```bash
node -v
npm -v
```

Se o `psql` não estiver no PATH, não tem problema. Você pode criar o banco pelo **pgAdmin**.

---

# PASSO A PASSO COMPLETO NO WINDOWS

## 1. Abrir a pasta no VS Code

Abra a pasta raiz `app_escolar` no VS Code.

Ela precisa conter:

- `package.json`
- `App.tsx`
- `backend/`
- `src/`

---

## 2. Criar o banco PostgreSQL

Como o sistema cria tabelas automaticamente, você só precisa criar o banco uma vez.

### Opção A — pelo pgAdmin
Crie um banco chamado:

```text
app_scholar
```

### Opção B — pelo terminal com psql
Se o `psql` estiver funcionando no seu Windows:

```bash
psql -U postgres -h localhost -c "CREATE DATABASE app_scholar;"
```

Senha:

```text
123
```

Se o banco já existir, ignore o erro.

---

## 3. Configurar o backend

Entre na pasta do backend:

```bash
cd backend
```

Instale as dependências:

```bash
npm install
```

Crie os arquivos `.env` e `.env.example` dentro da pasta `backend`.

### Conteúdo de `backend/.env`
```env
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=123
DB_NAME=app_scholar
JWT_SECRET=app_scholar_super_secret_key
```

### Conteúdo de `backend/.env.example`
```env
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=123
DB_NAME=app_scholar
JWT_SECRET=app_scholar_super_secret_key
```

Agora rode o backend:

```bash
npm start
```

Se estiver tudo certo, você verá algo como:

```text
Backend App Scholar rodando em http://localhost:3001
```

### O backend faz automaticamente ao iniciar
- cria tabelas
- cria usuário admin
- cria usuário professor
- cria usuário aluno
- cria aluno exemplo
- cria disciplina exemplo
- cria notas e faltas exemplo

---

## 4. Configurar o frontend mobile

Abra um novo terminal no VS Code e volte para a raiz do projeto:

```bash
cd ..
```

Instale as dependências do app:

```bash
npm install
```

Crie os arquivos `.env` e `.env.example` na raiz do projeto.

### Conteúdo de `/.env`
Se for rodar no **celular físico**, use o IP do seu computador na rede local:

```env
EXPO_PUBLIC_API_URL=http://SEU_IP_LOCAL:3001/api
```

### Conteúdo de `/.env.example`
```env
EXPO_PUBLIC_API_URL=http://192.168.0.15:3001/api
```

---

## 5. Definir a URL da API

### Se for rodar no navegador web
Use:

```env
EXPO_PUBLIC_API_URL=http://localhost:3001/api
```

### Se for rodar no celular físico
Você **não pode usar localhost**.

Use o IP do seu computador na rede local. Exemplo:

```env
EXPO_PUBLIC_API_URL=http://192.168.0.15:3001/api
```

Para descobrir o IP do seu computador no Windows:

```bash
ipconfig
```

Procure por algo como:

- `IPv4 Address`
- `Endereço IPv4`

Exemplo:

```text
192.168.0.15
```

---

## 6. Rodar o app Expo

Na raiz do projeto:

```bash
npx expo start -c
```

### Se estiver no celular e der problema de rede
Use:

```bash
npx expo start --tunnel -c
```

---

## 7. Usuários padrão do sistema

### Administrador
- Login: `admin@appscholar.com`
- Senha: `123456`

### Professor
- Login: `prof.mobile@appscholar.com`
- Senha: `123456`

### Aluno
- Login: `maria.souza@appscholar.com`
- Senha: `123456`

---

## 8. Fluxo recomendado de teste

### Como admin
- entrar com `admin@appscholar.com`
- cadastrar disciplina
- cadastrar professor vinculado a uma disciplina sem professor
- cadastrar aluno vinculando pelo menos uma disciplina do curso dele
- editar disciplinas de um aluno já existente
- lançar notas e faltas
- consultar boletim pela matrícula

### Como professor
- entrar com `prof.mobile@appscholar.com`
- acessar notas e faltas
- lançar/editar registros apenas nas disciplinas permitidas
- consultar boletim

### Como aluno
- entrar com `maria.souza@appscholar.com`
- acessar o portal do aluno
- visualizar disciplinas
- visualizar notas
- visualizar faltas
- visualizar média e situação

---

## 9. Endpoints principais do backend

### Autenticação
- `POST /api/login`

### Cadastros
- `GET /api/alunos`
- `POST /api/alunos`
- `PUT /api/alunos/:id/disciplinas`

- `GET /api/professores`
- `POST /api/professores`

- `GET /api/disciplinas`
- `POST /api/disciplinas`

### Notas e faltas
- `POST /api/notas`
- `POST /api/frequencias`
- `GET /api/academic-records`

### Boletim
- `GET /api/boletim/:matricula`
- `GET /api/student/me`

### Dashboard
- `GET /api/dashboard/summary`

### APIs externas
- `GET /api/external/cep/:cep`
- `GET /api/external/estados`
- `GET /api/external/cidades/:uf`

---

## 10. Testes rápidos da API

Com o backend rodando, teste no navegador ou no Postman:

### Health check
```text
http://localhost:3001/api/health
```

### Status da API
```text
http://localhost:3001
```

---

## 11. Problemas comuns

### Erro de conexão no celular
- confira se `EXPO_PUBLIC_API_URL` está com o IP do computador
- confira se celular e PC estão na mesma rede
- teste `--tunnel`
- verifique o firewall do Windows

### Erro no PostgreSQL
- confirme se o serviço do PostgreSQL está iniciado
- confirme usuário `postgres`
- confirme senha `123`
- confirme se o banco `app_scholar` existe

### Erro de cache no Expo
```bash
npx expo start -c
```

### Dependência faltando
```bash
npm install
```

---

## 12. Requisitos dos PDFs cobertos

### Parte 1
- telas mobile
- navegação
- componentes reutilizáveis
- hooks
- layout e validação
- dashboard
- formulários
- boletim

### Parte 2
- backend Node.js
- APIs REST
- integração com PostgreSQL
- autenticação
- cadastro de dados acadêmicos
- consulta de boletim
- integração com ViaCEP
- integração com IBGE

---

## 13. Melhorias além do enunciado

- controle de perfis (`admin`, `professor`, `aluno`)
- dashboard com indicadores
- menu lateral expandível
- lançamento de faltas
- seed inicial automática
- proxy backend para APIs externas
- visual mobile mais robusto
- portal do aluno
- vínculo entre professor, disciplina e alunos
- edição das disciplinas do aluno já cadastrado

---

## 14. Comandos principais resumidos

### Backend
```bash
cd backend
npm install
npm start
```

### Frontend
```bash
cd ..
npm install
npx expo start -c
```

### Frontend com túnel
```bash
npx expo start --tunnel -c
```

---

## 15. Observação final

O projeto foi estruturado para funcionar localmente com:

- PostgreSQL local
- backend local na porta `3001`
- app mobile consumindo a API local

Para aparelho físico, o ponto mais importante é configurar corretamente:

```env
EXPO_PUBLIC_API_URL=http://SEU_IP_LOCAL:3001/api
```

Se quiser apenas ver o funcionamento em vídeo, acesse:

**https://youtu.be/fmG8k4AQE1k**
