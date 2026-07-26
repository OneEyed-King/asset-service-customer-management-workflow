# ---- Build stage ----
FROM node:22-alpine AS build
WORKDIR /app

# Copy only package manifests first so `npm ci` is cached as its own layer
# and only re-runs when dependencies actually change.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite bakes VITE_* variables into the JS bundle at BUILD time, not at
# container start time - so this has to be a build ARG, not a runtime env
# var. Default points at the backend as reachable from the user's browser
# (localhost:8080), since the browser runs on the host, not inside the
# Docker network.
ARG VITE_API_BASE_URL=http://localhost:8080/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# ---- Runtime stage ----
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
