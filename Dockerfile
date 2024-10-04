# Stage 1: Build Stage
FROM node:18-alpine AS tiktok_scraper.build

WORKDIR /usr/app

# Install necessary Alpine packages along with additional dependencies for canvas
RUN apk update && apk add --no-cache \
    python3 \
    pkgconfig \
    pixman-dev \
    cairo-dev \
    pango-dev \
    make \
    g++ \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    libjpeg-turbo-dev \
    giflib-dev \
    libpng-dev

# Copy package.json and package-lock.json
COPY package*.json ./

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

RUN npm install

# Copy tsconfig.json
COPY tsconfig.json ./

# Copy the rest of the application code
COPY ./src ./src
COPY ./bin ./bin

# Build the project
RUN npm run build

# Stage 2: Use Stage
FROM node:18-alpine AS tiktok_scraper.use

WORKDIR /usr/app

# Install necessary Alpine packages
RUN apk update && apk add --no-cache \
    python3 \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    pixman \
    cairo \
    pango \
    libjpeg-turbo \
    giflib \
    libpng

# Copy necessary files from the build stage
COPY --from=tiktok_scraper.build /usr/app/package*.json ./
COPY --from=tiktok_scraper.build /usr/app/build ./build
COPY --from=tiktok_scraper.build /usr/app/bin ./bin
COPY --from=tiktok_scraper.build /usr/app/node_modules ./node_modules

ENV SCRAPING_FROM_DOCKER=1
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Create the files directory
RUN mkdir -p files

# Set correct permissions for cli.js
RUN chmod +x bin/cli.js

# Install PM2 globally
RUN npm install pm2 -g

# Expose the port (adjust if necessary)
EXPOSE 10000

# Start the application using PM2
CMD ["pm2-runtime", "bin/cli.js"]

# Alternatively, if you prefer using npm start, comment out the above CMD and uncomment below:
# CMD ["npm", "start"]