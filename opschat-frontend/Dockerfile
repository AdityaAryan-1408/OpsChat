# Multistage Dockerfile for opschat-frontend

# Stage 1: Build the application

FROM node:20-alpine AS builder

WORKDIR /app

# Add args
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm ci

COPY . .

# Run the build
RUN npm run build


# Stage 2: Serve with Nginx

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf.d/default.conf

EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]