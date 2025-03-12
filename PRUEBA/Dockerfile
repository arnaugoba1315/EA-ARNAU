# Use official Node.js image as base
FROM node:21

# Set working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to work directory
COPY package*.json ./

# Install dependencies
RUN npm install 

# Copy the rest of the application code
COPY . .

# Build TypeScript files
RUN npm run build

# Expose the port that the application listens on
EXPOSE 3000

# Run the application in production mode
CMD ["npm", "run", "prod"]
