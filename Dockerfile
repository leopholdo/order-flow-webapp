# Step 1: Build the app
FROM node:18 as build-stage

WORKDIR /app

# Copy only package.json and lock file first
COPY package*.json ./

# Clean install inside the container
RUN npm install

# Copy the rest of the source files
COPY . .

# Run the build
RUN npm run build

# Step 2: Serve with Nginx
FROM nginx:stable-alpine as production-stage

COPY --from=build-stage /app/dist /usr/share/nginx/html

# Custom Nginx config (see below)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]