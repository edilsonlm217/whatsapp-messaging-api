# Etapa de build
FROM node:20.18.1-alpine as builder

WORKDIR /app

# Instalar o Yarn
RUN apk add --no-cache yarn

# Copiar os arquivos de dependências (package.json e yarn.lock)
COPY package.json yarn.lock ./

# Instalar as dependências usando Yarn
RUN yarn install --frozen-lockfile

# Copiar o restante do código
COPY . .

# Rodar o build da aplicação
RUN yarn build

# Etapa de produção
FROM node:20.18.1-alpine as production

WORKDIR /app

# Instalar o Yarn
RUN apk add --no-cache yarn

# Copiar os arquivos de dependências (package.json e yarn.lock) para o container
COPY package.json yarn.lock ./

# Instalar as dependências de produção usando Yarn
RUN yarn install --production --frozen-lockfile

# Copiar os arquivos de build da etapa anterior
COPY --from=builder /app/dist ./dist

# Definir o ambiente como produção
ENV NODE_ENV=production

# Comando para rodar a aplicação
CMD ["node", "dist/main"]
