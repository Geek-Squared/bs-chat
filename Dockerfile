# Use the official NestJS Node image
FROM node:16

# Create and set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app
COPY . .

# Expose the app port
EXPOSE 3000

# Default command to start the app
CMD ["npm", "run", "start:dev"]
