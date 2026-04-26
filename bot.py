import os
import uuid
import requests
import logging
from aiogram import Bot, Dispatcher, types, Router
from aiogram.filters import Command
from aiogram.utils.markdown import hcode
import asyncio

# --- НАСТРОЙКИ ---
API_TOKEN = '8686511401:AAE_yiEoFOaAAfw9gii_2mkH4UfGiu5jmOY'
PANEL_URL = 'https://31.44.9.47:52790/KI30v9DBEumFxGGMNE' # URL твоей панели (с портом)
SUB_PORT = '2096'                    # Порт подписки из настроек
LOGIN = '54RBN6CGW3'                      # Логин от панели
PASSWORD = 'dsBc0092in'             # Пароль от панели
INBOUND_ID = 1                       # ID твоего входящего подключения (Германия)
ICON_URL = 'https://i.imgur.com/7WceXVn.jpeg' # Прямая ссылка на фото

logging.basicConfig(level=logging.INFO)
bot = Bot(token=API_TOKEN)
dp = Dispatcher()
router = Router()

def get_vpn_link(user_id):
    session = requests.Session()
    
    # 1. Авторизация
    login_url = f"{PANEL_URL}/login"
    session.post(login_url, data={'username': LOGIN, 'password': PASSWORD})
    
    # 2. Генерация уникального ID для нового юзера
    client_uuid = str(uuid.uuid4())
    client_email = f"tg_{user_id}"
    
    # 3. Добавление клиента через API
    add_url = f"{PANEL_URL}/panel/api/inbounds/addClient"
    payload = {
        "id": INBOUND_ID,
        "settings": "{\"clients\": [{\"id\": \"" + client_uuid + "\", \"alterId\": 0, \"email\": \"" + client_email + "\", \"limitIp\": 1, \"totalGB\": 0, \"expiryTime\": 0, \"enable\": true, \"tgId\": \"\", \"subId\": \"" + client_uuid + "\"}]}"
    }
    
    response = session.post(add_url, json=payload)
    
    if response.json().get('success'):
        # 4. Формируем ту самую ссылку с категорией и иконкой
        # В этой версии панели subId обычно совпадает с UUID
        final_link = f"http://31.44.9.47:{SUB_PORT}/sub/{client_uuid}?remark=TrubaVPN&icon={ICON_URL}"
        return final_link
    else:
        return None

@router.message(Command("start"))
async def start(message: types.Message):
    await message.answer("Привет! Нажми /new_vpn чтобы получить личную подписку с иконкой и категорией.")

@router.message(Command("new_vpn"))
async def create_key(message: types.Message):
    await message.answer("⏳ Создаю твой личный профиль...")
    
    loop = asyncio.get_event_loop()
    link = await loop.run_in_executor(None, get_vpn_link, message.from_user.id)
    
    if link:
        await message.answer(
            f"✅ Твой доступ готов!\n\n"
            f"Скопируй эту ссылку и добавь в Happ как **Subscription**:\n\n"
            f"{hcode(link)}", 
            parse_mode="HTML"
        )
    else:
        await message.answer("❌ Ошибка при создании ключа. Проверь настройки панели.")

async def main():
    dp.include_router(router)
    await dp.start_polling(bot)

if __name__ == '__main__':
    asyncio.run(main())
