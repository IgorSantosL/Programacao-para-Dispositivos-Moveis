# App Scholar

Projeto completo de gerenciamento acadêmico para faculdade, composto por:

- **Frontend mobile** em **React Native + Expo + TypeScript**
- **Backend** em **Node.js + Express**
- **Banco de dados** em **PostgreSQL**
- Integrações externas com **ViaCEP** e **IBGE Localidades**

O sistema cobre os requisitos da Parte 1 e da Parte 2 do enunciado, incluindo interface mobile, autenticação, cadastros acadêmicos, boletim, integração com banco relacional e consumo de APIs externas.

---

## Funcionalidades implementadas

### Perfis e permissões
- **Administrador**
  - cadastrar alunos
  - cadastrar professores
  - cadastrar disciplinas
  - lançar e editar notas
  - lançar e editar faltas
  - consultar boletins
  - visualizar indicadores do dashboard

- **Professor**
  - lançar e editar notas
  - lançar e editar faltas
  - consultar boletins
  - visualizar dashboard acadêmico

### Módulos principais
- Login com autenticação via **JWT**
- Dashboard com indicadores salvos no banco
- Cadastro de alunos com:
  - validação de formulário
  - preenchimento automático de endereço via **ViaCEP**
  - estados e cidades via **IBGE**
- Cadastro de professores
- Cadastro de disciplinas
- Lançamento de **notas e faltas**
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

- **Node.js LTS**
- **PostgreSQL**
- **VS Code**
- **Expo Go** no celular, se quiser testar em aparelho físico

Confirme no terminal:

```bash
node -v
npm -v
psql --version
```

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

### Opção A — pelo terminal com psql

```bash
psql -U postgres -h localhost -c "CREATE DATABASE app_scholar;"
```

Senha:
```text
123
```

Se o banco já existir, ignore o erro.

### Opção B — pelo pgAdmin
Crie um banco chamado:

```text
app_scholar
```

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

Copie o arquivo de exemplo de ambiente para `.env`.

### No PowerShell:
```powershell
Copy-Item .env.example .env
```

### No CMD:
```cmd
copy .env.example .env
```

### No Git Bash:
```bash
cp .env.example .env
```

O `.env` deve ficar assim:

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

Copie o `.env.example` da raiz para `.env`.

### No PowerShell:
```powershell
Copy-Item .env.example .env
```

### No CMD:
```cmd
copy .env.example .env
```

### No Git Bash:
```bash
cp .env.example .env
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
- IPv4 Address
- Endereço IPv4

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
```text
Login: admin@appscholar.com
Senha: 123456
```

### Professor
```text
Login: prof.mobile@appscholar.com
Senha: 123456
```

---

## 8. Fluxo recomendado de teste

### Como admin
1. entrar com `admin@appscholar.com`
2. cadastrar aluno
3. cadastrar professor
4. cadastrar disciplina
5. lançar notas e faltas
6. consultar boletim pela matrícula

### Como professor
1. entrar com `prof.mobile@appscholar.com`
2. acessar notas e faltas
3. lançar/editar registros
4. consultar boletim

---

## 9. Endpoints principais do backend

### Autenticação
```http
POST /api/login
```

### Cadastros
```http
GET  /api/alunos
POST /api/alunos

GET  /api/professores
POST /api/professores

GET  /api/disciplinas
POST /api/disciplinas
```

### Notas e faltas
```http
POST /api/notas
POST /api/frequencias
GET  /api/academic-records
```

### Boletim
```http
GET /api/boletim/:matricula
```

### Dashboard
```http
GET /api/dashboard/summary
```

### APIs externas
```http
GET /api/external/cep/:cep
GET /api/external/estados
GET /api/external/cidades/:uf
```

---

## 10. Testes rápidos da API

Com o backend rodando, teste no navegador ou no Postman:

### Health check
```text
http://localhost:3001/api/health
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
- controle de perfis (admin e professor)
- dashboard com indicadores
- menu lateral expandível
- lançamento de faltas
- seed inicial automática
- proxy backend para APIs externas
- visual mobile mais robusto

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
