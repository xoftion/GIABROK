FROM oven/bun:latest

WORKDIR /app

COPY . .

RUN chmod +x ./start.sh

RUN cd backend && bun install && cd ../frontend && bun install

EXPOSE 3000 8000

CMD ["./start.sh"]
