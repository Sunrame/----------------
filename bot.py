import asyncio
import datetime
from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import Command

# Твой токен
API_TOKEN = '8471734836:AAH0wbdpfIaxnoZchWlh3pSO_gBa0ehFd2A'

bot = Bot(token=API_TOKEN)
dp = Dispatcher()

def get_countdown():
    now = datetime.datetime.now()
    summer_start = datetime.datetime(now.year + (1 if now.month > 8 else 0), 6, 1)
    
    if 6 <= now.month <= 8:
        return "Лето уже здесь! Время развивать бизнес! 🚀"
    
    delta = summer_start - now
    return f"⏳ До начала летнего сезона осталось: {delta.days} дней и {delta.seconds // 3600} часов."

# Хендлер для БИЗНЕС-сообщений (когда пишут тебе в личку, а бот отвечает)
@dp.business_message(Command("лето"))
async def business_summer_handler(message: types.Message):
    # business_connection_id обязателен для ответа от имени бизнес-аккаунта
    await message.answer(
        get_countdown(),
        business_connection_id=message.business_connection_id
    )

# Обычный хендлер (если пишут самому боту)
@dp.message(Command("лето"))
async def private_summer_handler(message: types.Message):
    await message.answer(get_countdown())

async def main():
    print("Бизнес-бот запущен...")
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
