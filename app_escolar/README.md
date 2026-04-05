# App Scholar

Aplicativo mobile multiplataforma desenvolvido em **React Native com Expo** para gerenciamento acadêmico, com foco na **Parte 1** da atividade: interface, navegação, formulários e dados simulados.

## Objetivo do projeto

O app foi criado para demonstrar:

- autenticação simulada
- navegação entre telas
- cadastro de alunos
- cadastro de professores
- cadastro de disciplinas
- consulta de boletim
- validação de formulários
- uso de componentes reutilizáveis
- organização em pastas conforme a estrutura pedida no enunciado

Nesta versão, os dados são **mockados/simulados**, sem banco de dados.

---

## Tecnologias utilizadas

- React Native
- Expo
- TypeScript
- React Navigation
- Hooks do React (`useState`, `useEffect`, `useContext`)

---

## Estrutura do projeto

```text
app_escolar/
├── assets/
├── src/
│   ├── components/
│   ├── hooks/
│   ├── navigation/
│   ├── screens/
│   ├── services/
│   ├── styles/
│   └── types/
├── .gitignore
├── App.tsx
├── app.json
├── babel.config.js
├── index.ts
├── package.json
├── package-lock.json
└── tsconfig.json
```

### Pastas principais

- `components`: componentes reutilizáveis como botão, input e cards
- `hooks`: autenticação simulada com contexto
- `navigation`: pilha de navegação do app
- `screens`: telas principais do sistema
- `services`: dados simulados e serviços fake
- `styles`: paleta de cores e estilos globais
- `types`: interfaces TypeScript

---

## Funcionalidades atuais

### 1. Login
- login simulado
- validação de campos obrigatórios
- redirecionamento para o dashboard após autenticação

### 2. Dashboard
- acesso rápido às funcionalidades principais
- interface visual com cards clicáveis
- botão de saída

### 3. Cadastro de alunos
Validações implementadas:
- nome válido
- matrícula numérica inteira
- curso válido
- email válido
- telefone com 10 ou 11 dígitos
- CEP com 8 dígitos
- endereço, cidade e estado válidos

### 4. Cadastro de professores
Validações implementadas:
- nome válido
- titulação válida
- área de atuação válida
- tempo de docência em número inteiro
- email válido

### 5. Cadastro de disciplinas
Validações implementadas:
- nome da disciplina válido
- carga horária em número inteiro positivo
- professor responsável válido
- curso válido
- semestre válido

### 6. Consulta de boletim
- exibição de disciplinas
- nota 1
- nota 2
- média
- situação
- resumo com média geral e status

---

## Requisitos para executar

Antes de rodar o projeto, você precisa ter instalado:

- **Node.js** (recomendado: versão LTS)
- **npm**
- **Expo Go** no celular, ou emulador Android/iOS
- **VS Code** ou outro editor

Para conferir se Node e npm estão instalados:

```bash
node -v
npm -v
```

---

## Como executar o projeto

### 1. Entrar na pasta do projeto

```bash
cd app_escolar
```

### 2. Instalar as dependências

Se o projeto acabou de ser clonado ou baixado, rode:

```bash
npm install
```

### 3. Caso necessário, instalar o preset do Babel

Se aparecer erro relacionado a `babel-preset-expo`, rode:

```bash
npm install --save-dev babel-preset-expo
```

### 4. Iniciar o projeto

```bash
npx expo start
```

### 5. Se quiser limpar o cache do Expo

Use este comando quando o app parecer estar com cache antigo ou comportamento estranho:

```bash
npx expo start -c
```

---

## Como abrir no celular

Depois de rodar `npx expo start`:

- abra o aplicativo **Expo Go** no celular
- escaneie o QR Code exibido no terminal/navegador

---

## Credenciais de teste

Use as credenciais simuladas abaixo para login:

```text
Email: admin@appscholar.com
Senha: 123456
```

---

## Dados simulados para teste

### CEPs mockados
Você pode testar estes CEPs no cadastro de alunos:

```text
12246000
12300000
01001000
```

Eles preenchem endereço simulado automaticamente.

---

## Comportamento dos dados nesta etapa

Nesta etapa do projeto:

- os cadastros são simulados
- os dados são exibidos no console
- não há banco de dados real
- não há API REST real ainda

Ou seja: o foco está em **interface, navegação, validação e experiência do usuário**.

---

## Comandos úteis

### Instalar dependências

```bash
npm install
```

### Rodar o projeto

```bash
npx expo start
```

### Rodar limpando cache

```bash
npx expo start -c
```

### Instalar navegação, caso precise novamente

```bash
npx expo install @react-navigation/native @react-navigation/native-stack react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-reanimated
```

### Instalar preset do Babel, caso falte

```bash
npm install --save-dev babel-preset-expo
```

---

## Observações importantes

- `node_modules` não sobe para o GitHub porque está no `.gitignore`
- a pasta `.expo` também não deve ser versionada
- se o projeto der erro após trocar dependências, tente:

```bash
npm install
npx expo start -c
```

---

## Próximas melhorias possíveis

- persistência local ou banco de dados
- integração com API REST
- listagem dos cadastros realizados
- edição e exclusão de registros
- máscaras de telefone e CEP
- selects para curso, semestre e professor
- prevenção de duplicidade de matrícula e email

---

## Autor

Projeto desenvolvido para a disciplina de **Programação para Dispositivos Móveis I**, seguindo a proposta do **App Scholar**.
