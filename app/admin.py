"""Админ-API: вход по логину-паролю, заявки, модерация отзывов, CRUD сервисов."""
from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel, Field

from .api import AGG_SQL, to_service
from .db import pool
from .security import COOKIE, MAX_AGE, creds_ok, make_token, require_admin

router = APIRouter(prefix="/api/admin")
guard = Depends(require_admin)


# ---------- вход / выход ----------

class LoginIn(BaseModel):
    user: str
    password: str


@router.post("/login")
async def login(body: LoginIn, response: Response):
    if not creds_ok(body.user, body.password):
        raise HTTPException(401, "Неверный логин или пароль")
    response.set_cookie(
        COOKIE, make_token(),
        max_age=MAX_AGE, httponly=True, samesite="lax", path="/",
    )
    return {"ok": True}


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(COOKIE, path="/")
    return {"ok": True}


@router.get("/me", dependencies=[guard])
async def me():
    pend_sub = await pool().fetchval("SELECT COUNT(*) FROM submissions WHERE status='pending'")
    pend_rev = await pool().fetchval("SELECT COUNT(*) FROM reviews WHERE status='pending'")
    return {"ok": True, "pending_submissions": pend_sub, "pending_reviews": pend_rev}


# ---------- заявки ----------

@router.get("/submissions", dependencies=[guard])
async def submissions(status: str = "pending"):
    rows = await pool().fetch(
        """SELECT id, name, link, price, protocols, comment, status, created_at
           FROM submissions WHERE status=$1 ORDER BY created_at DESC LIMIT 200""",
        status,
    )
    return [dict(r) | {"created_at": r["created_at"].isoformat()} for r in rows]


@router.post("/submissions/{sub_id}/reject", dependencies=[guard])
async def reject_submission(sub_id: int):
    res = await pool().execute(
        "UPDATE submissions SET status='rejected' WHERE id=$1 AND status='pending'", sub_id
    )
    if res.endswith("0"):
        raise HTTPException(404, "Заявка не найдена")
    return {"ok": True}


# ---------- модерация отзывов ----------

@router.get("/reviews", dependencies=[guard])
async def reviews(status: str = "pending"):
    rows = await pool().fetch(
        """SELECT r.id, r.service_id, s.name AS service, r.author, r.operator,
                  r.stars, r.text, r.created_at
           FROM reviews r JOIN services s ON s.id = r.service_id
           WHERE r.status=$1 AND r.text <> ''
           ORDER BY r.created_at DESC LIMIT 200""",
        status,
    )
    return [dict(r) | {"created_at": r["created_at"].isoformat()} for r in rows]


@router.post("/reviews/{rid}/approve", dependencies=[guard])
async def approve_review(rid: int):
    await pool().execute("UPDATE reviews SET status='approved' WHERE id=$1", rid)
    return {"ok": True}


@router.post("/reviews/{rid}/reject", dependencies=[guard])
async def reject_review(rid: int):
    await pool().execute("UPDATE reviews SET status='rejected' WHERE id=$1", rid)
    return {"ok": True}


# ---------- сервисы ----------

class ServiceIn(BaseModel):
    name: str = Field(..., min_length=1, max_length=80)
    price: int = Field(0, ge=0, le=100000)
    traffic: str = Field("Безлимит", max_length=40)
    devices: str = Field("—", max_length=40)
    protocols: list[str] = []
    whitelist: Literal["ok", "mid", "no"] = "mid"
    trial: bool = False
    visible: bool = True
    submission_id: Optional[int] = None  # если сервис создаётся из заявки


@router.get("/services", dependencies=[guard])
async def all_services():
    rows = await pool().fetch(AGG_SQL.format(where=""))
    out = []
    for r in rows:
        s = to_service(r)
        s["visible"] = r["visible"]
        out.append(s)
    return out


@router.post("/services", dependencies=[guard])
async def create_service(body: ServiceIn):
    prot = [p.strip() for p in body.protocols if p.strip()][:10]
    sid = await pool().fetchval(
        """INSERT INTO services(name, price, traffic, devices, protocols,
                                whitelist, trial, visible)
           VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id""",
        body.name.strip(), body.price, body.traffic.strip() or "Безлимит",
        body.devices.strip() or "—", prot, body.whitelist, body.trial, body.visible,
    )
    if body.submission_id:
        await pool().execute(
            "UPDATE submissions SET status='approved' WHERE id=$1", body.submission_id
        )
    return {"ok": True, "id": sid}


@router.put("/services/{sid}", dependencies=[guard])
async def update_service(sid: int, body: ServiceIn):
    prot = [p.strip() for p in body.protocols if p.strip()][:10]
    res = await pool().execute(
        """UPDATE services SET name=$2, price=$3, traffic=$4, devices=$5,
                  protocols=$6, whitelist=$7, trial=$8, visible=$9, updated_at=now()
           WHERE id=$1""",
        sid, body.name.strip(), body.price, body.traffic.strip() or "Безлимит",
        body.devices.strip() or "—", prot, body.whitelist, body.trial, body.visible,
    )
    if res.endswith("0"):
        raise HTTPException(404, "Сервис не найден")
    return {"ok": True}


@router.post("/services/{sid}/toggle", dependencies=[guard])
async def toggle_service(sid: int):
    vis = await pool().fetchval(
        "UPDATE services SET visible = NOT visible, updated_at=now() WHERE id=$1 RETURNING visible",
        sid,
    )
    if vis is None:
        raise HTTPException(404, "Сервис не найден")
    return {"ok": True, "visible": vis}


@router.delete("/services/{sid}", dependencies=[guard])
async def delete_service(sid: int):
    res = await pool().execute("DELETE FROM services WHERE id=$1", sid)
    if res.endswith("0"):
        raise HTTPException(404, "Сервис не найден")
    return {"ok": True}
