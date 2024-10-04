# Building Scraper
FROM node:18-bullseye

WORKDIR /usr/app

# Copy package.json and package-lock.json
COPY package*.json ./

ENV CANVAS_PREBUILT=1
RUN npm install

# Copy tsconfig.json
COPY tsconfig.json ./

# Copy the rest of the application code
COPY . .

# Build the TypeScript code
RUN npm run build

# Start the application
CMD ["npm", "start"]