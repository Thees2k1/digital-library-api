# digital-library-api

# development

## 1. setup:

- install pnpm for package management (recommended)

- set your DATABASE_URL variable in .env for connecting your postgresql database (container/local)

- run pnpm install

- run pnpm dlx prisma migrate deploy
- run pnpm dlix prisma generate

* create nodemon.json at root dir and copy the following code:

```
{
    "new": true,
    "watch": ["src"],
    "ext": "ts",
    "ignore": ["dist"],
    "exec":"ts-node -r tsconfig-paths/register -r dotenv/config src/app.ts"
}

```

## 2. run

- run command: pnpm dev
