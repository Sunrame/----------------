"""Публичный API: каталог, голоса, отзывы, заявки."""
from typing import Literal, Optional

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field

from .db import pool
from .security import ip_hash

router = APIRouter(prefix="/api")

OPERATORS = {"МТС", "МегаФон", "Билайн", "Tele2", "Ростелеком", "Другой"}

# Агрегаты по сервису: голоса + рейтинг + число одобренных отзывов
AGG_SQL = """
SELECT s.id, s.name, s.price, s.traffic, s.devices, s.protocols,
       s.whitelist, s.trial, s.visible,
       COUNT(v.id) FILTER (WHERE v.status='ok')  AS w,
       COUNT(v.id) FILTER (WHERE v.status='mid') AS p,
       COUNT(v.id) FILTER (WHERE v.status='no')  AS x,
       (SELECT ROUND(AVG(r.stars)::numeric, 1) FROM reviews r
         WHERE r.service_id = s.id AND r.status='approved' AND r.stars IS NOT NULL) AS rating,
       (SELECT COUNT(*) FROM reviews r
         WHERE r.service_id = s.id AND r.status='approved') AS rv
FROM services s
LEFT JOIN votes v ON v.service_id = s.id
{where}
GROUP BY s.id
ORDER BY w DESC, s.id
"""


def to_service(row) -> dict:
    """Строка БД -> формат, который ждёт фронтенд."""
    return {
        "id": row["id"],
        "n": row["name"],
        "w": row["w"], "p": row["p"], "x": row["x"],
        "r": float(row["rating"]) if row["rating"] is not None else None,
        "rv": row["rv"],
        "wl": row["whitelist"],
        "pr": row["price"],
        "tr": row["traffic"],
        "dv": row["devices"],
        "pt": list(row["protocols"]),
        "trl": row["trial"],
    }


@router.get("/services")
async def list_services():
    rows = await pool().fetch(AGG_SQL.format(where="WHERE s.visible"))
    return [to_service(r) for r in rows]


@router.get("/services/{sid}")
async def service_detail(sid: int):
    row = await pool().fetchrow(
        AGG_SQL.format(where="WHERE s.visible AND s.id = $1"), sid
    )
    if not row:
        raise HTTPException(404, "Сервис не найден")
    reviews = await pool().fetch(
        """SELECT author, operator, stars, text, created_at
           FROM reviews
           WHERE service_id=$1 AND status='approved' AND text <> ''
           ORDER BY created_at DESC LIMIT 50""",
        sid,
    )
    data = to_service(row)
    data["reviews"] = [
        {
            "a": r["author"], "o": r["operator"], "s": r["stars"],
            "t": r["text"], "d": r["created_at"].isoformat(),
        }
        for r in reviews
    ]
    return data


class VoteIn(BaseModel):
    status: Literal["ok", "mid", "no"]
    operator: str = "Другой"
    stars: Optional[int] = Field(None, ge=1, le=5)
    text: str = ""
    author: str = ""


@router.post("/services/{sid}/vote")
async def vote(sid: int, body: VoteIn, request: Request):
    exists = await pool().fetchval(
        "SELECT 1 FROM services WHERE id=$1 AND visible", sid
    )
    if not exists:
        raise HTTPException(404, "Сервис не найден")

    ih = ip_hash(request)
    operator = body.operator if body.operator in OPERATORS else "Другой"
    text = body.text.strip()[:1000]
    author = (body.author.strip()[:40]) or "Аноним"

    # Голос: один на сервис с одного IP, повторный — заменяет прежний
    await pool().execute(
        """INSERT INTO votes(service_id, status, operator, ip_hash)
           VALUES($1, $2, $3, $4)
           ON CONFLICT (service_id, ip_hash)
           DO UPDATE SET status=EXCLUDED.status, operator=EXCLUDED.operator,
                         created_at=now()""",
        sid, body.status, operator, ih,
    )

    moderated = False
    if text or body.stars:
        recent = await pool().fetchval(
            """SELECT COUNT(*) FROM reviews
               WHERE ip_hash=$1 AND created_at > now() - interval '1 day'""",
            ih,
        )
        if recent >= 5:
            raise HTTPException(429, "Слишком много отзывов за сутки — попробуйте завтра")
        # Голая оценка без текста публикуется сразу; текст — через модерацию
        status = "pending" if text else "approved"
        moderated = bool(text)
        await pool().execute(
            """INSERT INTO reviews(service_id, author, operator, stars, text, status, ip_hash)
               VALUES($1, $2, $3, $4, $5, $6, $7)""",
            sid, author, operator, body.stars, text, status, ih,
        )

    return {"ok": True, "moderated": moderated}


class SubmissionIn(BaseModel):
    name: str = Field(..., min_length=1, max_length=80)
    link: str = Field(..., min_length=3, max_length=200)
    price: str = Field("", max_length=40)
    protocols: str = Field("", max_length=120)
    comment: str = Field("", max_length=1000)


@router.post("/submissions")
async def create_submission(body: SubmissionIn, request: Request):
    ih = ip_hash(request)
    recent = await pool().fetchval(
        """SELECT COUNT(*) FROM submissions
           WHERE ip_hash=$1 AND created_at > now() - interval '1 day'""",
        ih,
    )
    if recent >= 5:
        raise HTTPException(429, "Слишком много заявок за сутки — попробуйте завтра")
    await pool().execute(
        """INSERT INTO submissions(name, link, price, protocols, comment, ip_hash)
           VALUES($1, $2, $3, $4, $5, $6)""",
        body.name.strip(), body.link.strip(), body.price.strip(),
        body.protocols.strip(), body.comment.strip(), ih,
    )
    return {"ok": True}
