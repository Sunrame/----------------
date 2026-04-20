import asyncio
import datetime
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command

# Вставь сюда свой токен
API_TOKEN = '8471734836:AAH0wbdpfIaxnoZchWlh3pSO_gBa0ehFd2A'

bot = Bot(token=API_TOKEN)
dp = Dispatcher()

def get_countdown_to_summer():
    now = datetime.datetime.now()
    year = now.year
    
    # Если уже лето, но еще не закончилось (июнь, июль, август)
    if 6 <= now.month <= 8:
        return "Ура! Лето уже в самом разгаре! Наслаждайся теплом! ☀️"
    
    # Определяем дату начала ближайшего лета
    # Если сейчас сентябрь-декабрь, ждем лето следующего года
    if now.month > 8:
        summer_start = datetime.datetime(year + 1, 6, 1)
    else:
        summer_start = datetime.datetime(year, 6, 1)
        
    delta = summer_start - now
    
    days = delta.days
    hours, remainder = divmod(delta.seconds, 3600)
    minutes, seconds = divmod(remainder, 60)
    
    return (
        f"⏳ **Отсчёт до лета:**\n\n"
        f"• Дней: **{days}**\n"
        f"• Часов: **{hours}**\n"
        f"• Минут: **{minutes}**\n"
        f"• Секунд: **{seconds}**\n\n"
        f"Готовь шорты и солнцезащитный крем! 🍦"
    )

@dp.message(Command("start"))
async def cmd_start(message: types.Message):
    await message.answer("Привет! Я твой бизнес-помощник. Чтобы узнать, сколько осталось до отпуска, введи команду /лето")

@dp.message(Command("лето"))
async def cmd_summer(message: types.Message):
    report = get_countdown_to_summer()
    await message.answer(report, parse_mode="Markdown")

async def main():
    print("Бот запущен...")
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())