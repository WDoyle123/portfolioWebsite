# Use the official Node.js 16 image as a base
FROM node:current-alpine3.19

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application's code
COPY . .

# Build your application
RUN npm run build

# Expose the port your app runs on
EXPOSE 3000

CMD ["npm", "run", "preview", "--", "--port", "3000"]
