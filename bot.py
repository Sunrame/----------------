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
    # Целевая дата: 1 июня текущего или следующего года
    target_year = now.year
    if now.month >= 6: # Если июнь или позже, считаем до следующего года
        target_year += 1
    
    summer_start = datetime.datetime(target_year, 6, 1)
    
    # Если сейчас лето (июнь, июль, август)
    if 6 <= now.month <= 8:
        return "Ура! Лето в самом разгаре! Самое время для роста бизнеса! 🚀"
    
    delta = summer_start - now
    
    days = delta.days
    hours, remainder = divmod(delta.seconds, 3600)
    minutes, seconds = divmod(remainder, 60)
    
    return (
        f"⏳ **До лета осталось:**\n\n"
        f"• Дней: **{days}**\n"
        f"• Часов: **{hours}**\n"
        f"• Минут: **{minutes}**\n\n"
        f"Готовимся к сезону! 🍦"
    )

# Хендлер для БИЗНЕС-сообщений
@dp.business_message(Command("лето"))
async def business_summer_handler(message: types.Message):
    # В aiogram 3.x метод answer сам подхватит business_connection_id
    await message.answer(get_countdown(), parse_mode="Markdown")

# Обычный хендлер (для ЛС с ботом)
@dp.message(Command("лето"))
async def private_summer_handler(message: types.Message):
    await message.answer(get_countdown(), parse_mode="Markdown")

async def main():
    # Удаляем вебхуки перед запуском, чтобы избежать конфликтов
    await bot.delete_webhook(drop_pending_updates=True)
    print("Бот запущен...")
    await dp.start_polling(bot)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Бот остановлен")
