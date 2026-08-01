FROM python:3.12-slim

WORKDIR /srv
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PORT=8080
EXPOSE 8080
# host :: — Railway ходит в контейнеры по IPv6
CMD uvicorn app.main:app --host :: --port ${PORT}
