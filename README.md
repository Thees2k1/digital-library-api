# digital-library-api

# development

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
