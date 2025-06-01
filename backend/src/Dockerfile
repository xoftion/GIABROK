FROM node:23-alpine

RUN apk add --no-cache curl bash

RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:$PATH"

WORKDIR /app

RUN npx create-next-app@latest my-nextjs-app --yes

WORKDIR /app/my-nextjs-app

RUN bun install

EXPOSE 3001

CMD ["bun", "dev"]