"""
Blacklist Bot — личный бот-заметочник для чёрного списка людей.

Команды:
    /start, /help          — подсказка
    /blacklist ID/@username причина  — добавить запись
    /listblack             — показать весь список
    /unblacklist @username — удалить все записи по юзернейму
    /cancel                — отменить текущее действие (например, при пересылке)

Плюс: если переслать боту сообщение от человека, бот предложит
добавить его в список и сам подставит точный numeric ID — это надёжнее
юзернейма, который человек может в любой момент сменить.
"""

import asyncio
import logging
import os
from datetime import datetime
from html import escape as h
from typing import Optional

import aiosqlite
from aiogram import Bot, Dispatcher, F, Router
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from aiogram.exceptions import TelegramBadRequest
from aiogram.filters import Command, CommandObject
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.fsm.storage.memory import MemoryStorage
from aiogram.types import (
    CallbackQuery,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    Message,
    MessageOriginHiddenUser,
    MessageOriginUser,
)
from dotenv import load_dotenv

load_dotenv()

BOT_TOKEN = os.getenv("BOT_TOKEN", "")
ADMIN_IDS = {int(x) for x in os.getenv("ADMIN_IDS", "").split(",") if x.strip().isdigit()}
DB_PATH = os.getenv("DB_PATH", "blacklist.db")

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("blacklist_bot")

router = Router()
# Бот отвечает только тебе (или тем, чей ID указан в ADMIN_IDS) — всем
# остальным он просто "не существует".
router.message.filter(F.from_user.id.in_(ADMIN_IDS))
router.callback_query.filter(F.from_user.id.in_(ADMIN_IDS))


class AddReason(StatesGroup):
    waiting_for_reason = State()


# ---------------------------------------------------------------- database --

async def init_db() -> None:
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            """
            CREATE TABLE IF NOT EXISTS blacklist (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                username TEXT,
                full_name TEXT,
                reason TEXT NOT NULL,
                added_at TEXT NOT NULL
            )
            """
        )
        await db.commit()


async def add_entry(
    user_id: Optional[int],
    username: Optional[str],
    full_name: Optional[str],
    reason: str,
) -> None:
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "INSERT INTO blacklist (user_id, username, full_name, reason, added_at) "
            "VALUES (?, ?, ?, ?, ?)",
            (user_id, username, full_name, reason, datetime.now().isoformat(timespec="seconds")),
        )
        await db.commit()


# ---------------------------------------------------------------- commands --

HELP_TEXT = (
    "Привет! Это твой личный чёрный список.\n\n"
    "<b>Команды:</b>\n"
    "/blacklist ID или @username причина — добавить запись\n"
    "/listblack — показать весь список\n"
    "/unblacklist @username — удалить все записи по юзернейму\n"
    "/cancel — отменить текущее действие\n\n"
    "Ещё можешь просто <b>переслать</b> мне сообщение от человека — "
    "предложу занести его в список и сам подставлю точный ID "
    "(понадёжнее юзернейма, он может смениться)."
)


@router.message(Command("start", "help"))
async def cmd_start(message: Message, state: FSMContext) -> None:
    await state.clear()
    await message.answer(HELP_TEXT)


@router.message(Command("cancel"))
async def cmd_cancel(message: Message, state: FSMContext) -> None:
    if await state.get_state() is None:
        await message.answer("Нечего отменять.")
        return
    await state.clear()
    await message.answer("Отменил.")


@router.message(Command("blacklist"))
async def cmd_blacklist(message: Message, command: CommandObject, state: FSMContext, bot: Bot) -> None:
    await state.clear()

    if not command.args:
        await message.answer(
            "Использование:\n<code>/blacklist @username причина</code>\n"
            "или <code>/blacklist 123456789 причина</code>, если уже знаешь ID."
        )
        return

    parts = command.args.split(maxsplit=1)
    if len(parts) < 2:
        await message.answer("Нужно указать и кого, и причину, например:\n<code>/blacklist @username причина</code>")
        return

    raw_target, reason = parts
    raw_target = raw_target.lstrip("@")

    user_id: Optional[int] = None
    username: Optional[str] = None
    full_name: Optional[str] = None

    try:
        if raw_target.isdigit():
            user_id = int(raw_target)
            chat = await bot.get_chat(user_id)
            username = chat.username
            full_name = chat.full_name
        else:
            username = raw_target
            chat = await bot.get_chat(f"@{username}")
            user_id = chat.id
            full_name = chat.full_name
    except TelegramBadRequest:
        # Бот ещё не "встречал" этого человека — Telegram не даёт ботам
        # искать произвольных пользователей по юзернейму/ID напрямую.
        # Это нормально, запись всё равно сохранится.
        if not raw_target.isdigit():
            username = raw_target

    await add_entry(user_id, username, full_name, reason)

    label = f"@{h(username)}" if username else f"ID <code>{user_id}</code>"
    note = ""
    if user_id is None:
        note = (
            "\n\n⚠️ ID определить не удалось — бот раньше не пересекался с этим "
            "человеком. Запись сохранена по юзернейму. Если позже перешлёшь мне "
            "любое его сообщение, я предложу привязать точный ID."
        )
    await message.answer(f"Добавил в чёрный список: {label}\nПричина: {h(reason)}{note}")


@router.message(Command("listblack"))
async def cmd_listblack(message: Message, state: FSMContext) -> None:
    await state.clear()

    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT user_id, username, full_name, reason, added_at FROM blacklist "
            "ORDER BY username COLLATE NOCASE, added_at"
        )
        rows = await cursor.fetchall()

    if not rows:
        await message.answer("Чёрный список пуст 🙂")
        return

    # группируем по человеку — у одного могло накопиться несколько причин
    grouped: dict[str, dict] = {}
    for row in rows:
        key = (row["username"] or "").lower() or f"id:{row['user_id']}"
        entry = grouped.setdefault(
            key, {"username": row["username"], "user_id": row["user_id"], "full_name": row["full_name"], "reasons": []}
        )
        if row["user_id"] and not entry["user_id"]:
            entry["user_id"] = row["user_id"]
        date = row["added_at"].split("T")[0]
        entry["reasons"].append(f"{date} — {h(row['reason'])}")

    lines = ["<b>Чёрный список:</b>", ""]
    for i, entry in enumerate(grouped.values(), start=1):
        if entry["username"]:
            title = f"@{h(entry['username'])}"
        elif entry["full_name"]:
            title = h(entry["full_name"])
        else:
            title = "без имени"
        uid = entry["user_id"] if entry["user_id"] else "неизвестен"
        lines.append(f"{i}. {title} (ID: <code>{uid}</code>)")
        lines.extend(f"    • {r}" for r in entry["reasons"])
        lines.append("")

    text = "\n".join(lines).strip()
    # на всякий случай режем на части — Telegram ограничивает сообщение 4096 символами
    for start in range(0, len(text), 3500):
        await message.answer(text[start : start + 3500])


@router.message(Command("unblacklist"))
async def cmd_unblacklist(message: Message, command: CommandObject, state: FSMContext) -> None:
    await state.clear()

    if not command.args:
        await message.answer("Использование: <code>/unblacklist @username</code>")
        return

    username = command.args.strip().lstrip("@")
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute("DELETE FROM blacklist WHERE lower(username) = lower(?)", (username,))
        await db.commit()
        deleted = cursor.rowcount

    if deleted:
        await message.answer(f"Убрал @{h(username)} из чёрного списка. Удалено записей: {deleted}")
    else:
        await message.answer(f"@{h(username)} не найден в чёрном списке.")


# --------------------------------------------------- пересланные сообщения --

@router.message(F.forward_origin)
async def handle_forwarded(message: Message, state: FSMContext) -> None:
    origin = message.forward_origin

    user_id: Optional[int] = None
    username: Optional[str] = None
    full_name: Optional[str] = None

    if isinstance(origin, MessageOriginUser):
        user_id = origin.sender_user.id
        username = origin.sender_user.username
        full_name = origin.sender_user.full_name
    elif isinstance(origin, MessageOriginHiddenUser):
        full_name = origin.sender_user_name
    else:
        await message.answer("Это переслано не от пользователя (канал/группа) — не могу такое добавить.")
        return

    await state.update_data(pending_user_id=user_id, pending_username=username, pending_full_name=full_name)

    label = f"@{h(username)}" if username else h(full_name or "этого человека")
    kb = InlineKeyboardMarkup(
        inline_keyboard=[[InlineKeyboardButton(text="➕ Добавить в чёрный список", callback_data="add_forwarded")]]
    )
    await message.answer(f"Добавить {label} в чёрный список?", reply_markup=kb)


@router.callback_query(F.data == "add_forwarded")
async def cb_add_forwarded(callback: CallbackQuery, state: FSMContext) -> None:
    await state.set_state(AddReason.waiting_for_reason)
    if callback.message:
        await callback.message.edit_reply_markup(reply_markup=None)
    await callback.answer()
    await callback.message.answer("Напиши причину одним сообщением (или /cancel, чтобы отменить):")


@router.message(AddReason.waiting_for_reason)
async def process_reason(message: Message, state: FSMContext) -> None:
    reason = (message.text or "").strip()
    if not reason:
        await message.answer("Пришли причину текстом, пожалуйста.")
        return

    data = await state.get_data()
    user_id = data.get("pending_user_id")
    username = data.get("pending_username")
    full_name = data.get("pending_full_name")

    await add_entry(user_id, username, full_name, reason)
    await state.clear()

    label = f"@{h(username)}" if username else h(full_name or f"ID {user_id}")
    await message.answer(f"Добавил {label} в чёрный список.\nПричина: {h(reason)}")


# ---------------------------------------------------------------------- run --

async def main() -> None:
    if not BOT_TOKEN:
        raise RuntimeError("Не задан BOT_TOKEN (переменная окружения).")
    if not ADMIN_IDS:
        logger.warning("ADMIN_IDS не задан — бот не будет отвечать НИКОМУ, включая тебя.")

    await init_db()

    bot = Bot(token=BOT_TOKEN, default=DefaultBotProperties(parse_mode=ParseMode.HTML))
    dp = Dispatcher(storage=MemoryStorage())
    dp.include_router(router)

    await bot.delete_webhook(drop_pending_updates=True)
    logger.info("Бот запущен, жду сообщений...")
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
