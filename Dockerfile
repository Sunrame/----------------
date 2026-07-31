FROM nginx:alpine

# Шаблон конфига: nginx сам подставит $PORT при старте (нужно для Railway)
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Статика сайта
COPY . /usr/share/nginx/html

# Служебные файлы не должны раздаваться наружу
RUN rm -f /usr/share/nginx/html/Dockerfile \
          /usr/share/nginx/html/nginx.conf \
          /usr/share/nginx/html/README.md

ENV PORT=80
EXPOSE 80
