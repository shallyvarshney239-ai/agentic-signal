FROM oven/bun:latest AS base

RUN apt-get update && apt-get install -y \
    curl \
    unzip \
    libnss3 \
    libnspr4 \
    libdbus-1-3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
    libatspi2.0-0 \
    fonts-liberation \
    && apt-get clean

RUN curl -fsSL https://deno.land/install.sh | sh
ENV PATH="/root/.deno/bin:$PATH"

WORKDIR /app
ADD . ./agentic-signal
WORKDIR /app/agentic-signal

RUN bun install
RUN cd client && bun install

RUN npx playwright install --with-deps chromium 2>/dev/null || \
    npx playwright install chromium 2>/dev/null || \
    echo "Warning: Playwright Chromium install failed - browser features will be limited"

EXPOSE 8000 8080
CMD ["bun", "run", "dev"]