# Base image
FROM node:21-alpine

# Set working directory
WORKDIR /api

# Copy everything from the current directory to the /api directory in the image
COPY . .

# Install all dependencies (including dev dependencies)
RUN yarn install --frozen-lockfile

# Generate Prisma client
RUN yarn run prisma generate

# Build the application (assumes build script is defined in package.json)
RUN yarn run build

# Set environment variables (adjust as necessary)
ENV PORT 8080

# Expose the port the app runs on
EXPOSE 8080

# Run the app
CMD yarn start:migrate:prod
