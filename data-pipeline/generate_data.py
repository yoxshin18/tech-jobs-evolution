#!/usr/bin/env python3
"""
Tech jobs evolution — data pipeline
===================================

Legge i dataset curati in ``raw/`` (valori estratti manualmente dai report
citati, ognuno con il proprio ``source_id``), calcola indicatori derivati e
proiezioni, e scrive ``web-paper/src/data/market_data.json``.

Principio guida: separare in modo esplicito
  * i valori **riportati** dalle fonti (campo ``reported``), da
  * i valori **derivati/stimati** da questo script (campo ``derived``),
così che il frontend possa etichettarli in modo diverso.

Uso:
    python data-pipeline/generate_data.py            # scrive il JSON
    python data-pipeline/generate_data.py --check    # valida senza scrivere
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parent
RAW = ROOT / "raw"
OUT = ROOT.parent / "web-paper" / "src" / "data" / "market_data.json"

# Data di riferimento dei dati (fissa): è quella mostrata nel paper. generated_at
# resta come informazione tecnica sulla build e cambia a ogni esecuzione.
DATA_CUTOFF = "2026-10-26"

PROJECTION_END = 2030
EMPLOYMENT_HORIZON = 2035
# Scenari per la capacità di saturazione (K) della curva logistica di adozione.
LOGISTIC_K = {"low": 0.87, "central": 0.92, "high": 0.97}

ROLE_LABELS = {
    "swe": "Software Engineer / Full-stack",
    "frontend": "Frontend Developer",
    "backend": "Backend Developer",
    "ai_ml": "AI / ML Engineer",
    "data_scientist": "Data Scientist",
    "data_engineer": "Data Engineer",
    "mlops_cloud": "MLOps / Cloud Architect",
}

# Mappatura ruolo -> (occupazione BLS, tipo sviluppatore SO 2025, categoria WEF).
# Dove il BLS non ha una categoria dedicata si usa un proxy dichiarato.
ROLE_MAP = {
    "swe": ("software_developers", "fullstack", "Software and Applications Developers", "core"),
    "frontend": ("web_developers", "frontend", "Software and Applications Developers", "core"),
    "backend": ("software_developers", "backend", "Software and Applications Developers", "core"),
    "ai_ml": ("research_scientists", "ai_ml", "AI and Machine Learning Specialists", "ai"),
    "data_scientist": ("data_scientists", "data_scientist", "Data Analysts and Scientists", "data"),
    "data_engineer": ("database_architects", "data_engineer", "Data Warehousing Specialists", "data"),
    "mlops_cloud": ("network_architects", "cloud", "DevOps Engineers", "data"),
}

RADAR_ROLES = ["swe", "ai_ml", "data_scientist", "data_engineer", "mlops_cloud"]


def read(name: str) -> pd.DataFrame:
    return pd.read_csv(RAW / f"{name}.csv")


def clean(value):
    """Converte tipi numpy/NaN in tipi JSON-friendly."""
    if isinstance(value, (np.floating, float)):
        if np.isnan(value):
            return None
        return round(float(value), 4)
    if isinstance(value, (np.integer,)):
        return int(value)
    return value


def records(df: pd.DataFrame) -> list[dict]:
    return [{k: clean(v) for k, v in row.items()} for row in df.to_dict(orient="records")]


# ---------------------------------------------------------------------------
# 1. Adozione AI tra gli sviluppatori: curva logistica a K fissato
# ---------------------------------------------------------------------------
def fit_logistic(years: np.ndarray, share: np.ndarray, k: float) -> tuple[float, float]:
    """Stima r e t0 di p(t) = K / (1 + exp(-r (t - t0))) via linearizzazione logit."""
    if np.any(share >= k):
        raise ValueError(f"K={k} deve superare la quota massima osservata {share.max():.3f}")
    logit = np.log(share / (k - share))
    slope, intercept = np.polyfit(years, logit, 1)
    return float(slope), float(-intercept / slope)


def logistic(t: np.ndarray, k: float, r: float, t0: float) -> np.ndarray:
    return k / (1.0 + np.exp(-r * (t - t0)))


def build_adoption(so: pd.DataFrame, gartner: pd.DataFrame, org: pd.DataFrame) -> dict:
    years = so["year"].to_numpy(dtype=float)
    share = so["using"].to_numpy(dtype=float) / 100.0

    params = {}
    for name, k in LOGISTIC_K.items():
        r, t0 = fit_logistic(years, share, k)
        fitted = logistic(years, k, r, t0)
        rmse = float(np.sqrt(np.mean((fitted - share) ** 2)))
        params[name] = {"K": k, "r": round(r, 4), "t0": round(t0, 3), "rmse_pp": round(rmse * 100, 2)}

    horizon = np.arange(int(years.min()), PROJECTION_END + 1)
    series = []
    gart = gartner.set_index("id").loc["code_assistants"]
    org_idx = org.set_index("year")
    for y in horizon:
        row = {"year": int(y)}
        observed = so.loc[so["year"] == y]
        if not observed.empty:
            obs = observed.iloc[0]
            row.update(
                using=clean(obs["using"]),
                planning=clean(obs["planning"]),
                not_using=clean(obs["not_using"]),
                observed=True,
            )
        else:
            row["observed"] = False
        for name, p in params.items():
            row[f"proj_{name}"] = round(float(logistic(np.array([y]), p["K"], p["r"], p["t0"])[0]) * 100, 1)
        # Banda di incertezza per Recharts (area "range"): inviluppo dei tre scenari,
        # perché le curve a K diverso si incrociano nel periodo osservato.
        scen = [row["proj_low"], row["proj_central"], row["proj_high"]]
        row["proj_band"] = [min(scen), max(scen)]
        # Riferimenti esterni (non fanno parte del fit).
        if y == int(gart["baseline_year"]):
            row["gartner_enterprise"] = clean(gart["baseline_pct"])
        if y == int(gart["target_year"]):
            row["gartner_enterprise"] = clean(gart["value_pct"])
        if y in org_idx.index:
            row["org_any_ai"] = clean(org_idx.loc[y, "any_ai_pct"])
            row["org_genai"] = clean(org_idx.loc[y, "genai_pct"])
        series.append(row)

    return {
        "reported": records(so),
        "organizations": records(org),
        "series": series,
        "derived": {
            "method": "Logistica a capacità K fissata; r e t0 stimati con OLS sul logit di 4 osservazioni (2023–2026).",
            "params": params,
            "caveat": "Il 2026 usa una domanda diversa (quota che non usa strumenti AI). Proiezione illustrativa, non previsione puntuale.",
        },
    }


# ---------------------------------------------------------------------------
# 2. Occupazione USA: traiettorie BLS 2025 -> 2035 (indice e valori assoluti)
# ---------------------------------------------------------------------------
def build_employment(bls: pd.DataFrame, revisions: pd.DataFrame, oews: pd.DataFrame) -> dict:
    years = np.arange(2025, EMPLOYMENT_HORIZON + 1)
    focus = [
        "data_scientists",
        "research_scientists",
        "infosec_analysts",
        "software_developers",
        "database_architects",
        "network_architects",
        "web_developers",
        "computer_programmers",
    ]
    b = bls.set_index("key")
    trajectories = []
    for y in years:
        row = {"year": int(y)}
        for key in focus:
            g = b.loc[key, "growth_2025_35"] / 100.0
            cagr = (1 + g) ** (1 / 10) - 1
            row[key] = round(100 * (1 + cagr) ** (y - 2025), 2)
        trajectories.append(row)

    cagr_table = []
    for key in focus:
        g = b.loc[key, "growth_2025_35"] / 100.0
        cagr_table.append(
            {
                "key": key,
                "occupation": b.loc[key, "occupation"],
                "growth_2025_35": clean(b.loc[key, "growth_2025_35"]),
                "cagr_pct": round(((1 + g) ** (1 / 10) - 1) * 100, 2),
                "jobs_2025": clean(b.loc[key, "jobs_2025"]),
                "jobs_2035": int(round(b.loc[key, "jobs_2025"] + b.loc[key, "change_2025_35"])),
            }
        )

    # Salari mediani SWE (OEWS): trend lineare + proiezione nominale
    w = oews.dropna(subset=["median_wage"])
    slope, intercept = np.polyfit(w["year"], w["median_wage"], 1)
    first, last = w.iloc[0], w.iloc[-1]
    span = last["year"] - first["year"]
    cagr_wage = (last["median_wage"] / first["median_wage"]) ** (1 / span) - 1
    recent = w[w["year"] >= 2023]
    cagr_recent = (recent.iloc[-1]["median_wage"] / recent.iloc[0]["median_wage"]) ** (
        1 / (recent.iloc[-1]["year"] - recent.iloc[0]["year"])
    ) - 1
    wage_series = []
    for y in range(int(first["year"]), PROJECTION_END + 1):
        obs = w.loc[w["year"] == y]
        wage_series.append(
            {
                "year": y,
                "median_wage": clean(obs.iloc[0]["median_wage"]) if not obs.empty else None,
                "trend_linear": round(slope * y + intercept),
                "trend_recent_cagr": round(last["median_wage"] * (1 + cagr_recent) ** (y - last["year"]))
                if y >= last["year"]
                else None,
            }
        )

    revs = records(revisions)
    drop = revisions["growth_pct"].iloc[0] - revisions["growth_pct"].iloc[-1]

    return {
        "trajectories": trajectories,
        "cagr": cagr_table,
        "swe_revisions": revs,
        "swe_wages": {
            "reported": records(oews),
            "series": wage_series,
            "derived": {
                "linear_slope_usd_per_year": round(float(slope)),
                "cagr_2021_2025_pct": round(cagr_wage * 100, 2),
                "cagr_2023_2025_pct": round(cagr_recent * 100, 2),
                "revision_drop_pp": int(drop),
            },
        },
    }


# ---------------------------------------------------------------------------
# 3. Indice di penetrazione AI nei task (stima dell'autore)
# ---------------------------------------------------------------------------
def build_exposure(tasks: pd.DataFrame, weights: pd.DataFrame) -> dict:
    t = tasks.set_index("task")["share"]
    w = weights.set_index("role")
    missing = set(w.columns) - set(t.index)
    if missing:
        raise ValueError(f"Task senza misura di penetrazione: {missing}")
    sums = w.sum(axis=1)
    if not np.allclose(sums, 1.0):
        raise ValueError(f"I pesi per ruolo devono sommare a 1: {sums.to_dict()}")
    index = (w[t.index] * t).sum(axis=1)
    out = []
    for role, value in index.items():
        contrib = (w.loc[role, t.index] * t).sort_values(ascending=False)
        out.append(
            {
                "role": role,
                "label": ROLE_LABELS[role],
                "index": round(float(value) * 100, 1),
                "top_tasks": [k for k in contrib.index[:3]],
                "ops_weight": clean(w.loc[role, "ops_production"]),
            }
        )
    return {
        "method": (
            "Indice = Σ_task peso(ruolo, task) × quota di sviluppatori che usa (o trova utile) l'AI "
            "per quel task (SO 2026). I pesi del mix di attività sono ipotesi dell'autore."
        ),
        "tasks": records(tasks),
        "weights": records(weights.rename(columns={"role": "role"})),
        "roles": sorted(out, key=lambda r: -r["index"]),
    }


# ---------------------------------------------------------------------------
# 4. Confronto ruoli: tabella completa + radar normalizzato
# ---------------------------------------------------------------------------
def build_roles(bls: pd.DataFrame, so_sal: pd.DataFrame, wef: pd.DataFrame, exposure: dict) -> dict:
    b = bls.set_index("key")
    s = so_sal.set_index("key")
    wf = wef.set_index("job")
    ex = {r["role"]: r["index"] for r in exposure["roles"]}

    table = []
    for role, (bls_key, so_key, wef_job, family) in ROLE_MAP.items():
        table.append(
            {
                "role": role,
                "label": ROLE_LABELS[role],
                "family": family,
                "bls_occupation": b.loc[bls_key, "occupation"],
                "bls_is_proxy": "proxy" in str(b.loc[bls_key, "proxy_for"]).lower(),
                "bls_median_pay": clean(b.loc[bls_key, "median_pay_2025"]),
                "bls_jobs_2025": clean(b.loc[bls_key, "jobs_2025"]),
                "bls_growth_2025_35": clean(b.loc[bls_key, "growth_2025_35"]),
                "so_dev_type": s.loc[so_key, "dev_type"],
                "so_median_usd": clean(s.loc[so_key, "median_usd"]),
                "so_change_vs_2024": clean(s.loc[so_key, "change_vs_2024_pct"]),
                "wef_category": wef_job,
                "wef_growth_2025_30": clean(wf.loc[wef_job, "growth_pct"]),
                "ai_task_index": ex[role],
            }
        )
    df = pd.DataFrame(table).set_index("role")

    def norm_max(col: str) -> pd.Series:
        return (df[col] / df.loc[RADAR_ROLES, col].max() * 100).round(1)

    axes = {
        "bls_growth": norm_max("bls_growth_2025_35"),
        "wef_growth": norm_max("wef_growth_2025_30"),
        "us_pay": norm_max("bls_median_pay"),
        "global_pay": norm_max("so_median_usd"),
        "ai_exposure": df["ai_task_index"].round(1),
    }
    radar = []
    for axis, values in axes.items():
        row = {"axis": axis}
        for role in RADAR_ROLES:
            row[role] = clean(values.loc[role])
        radar.append(row)

    salaries = []
    for role in ROLE_MAP:
        salaries.append(
            {
                "role": role,
                "label": ROLE_LABELS[role],
                "us_bls": clean(df.loc[role, "bls_median_pay"]),
                "global_so": clean(df.loc[role, "so_median_usd"]),
                "ratio": round(df.loc[role, "bls_median_pay"] / df.loc[role, "so_median_usd"], 2),
            }
        )

    return {
        "table": table,
        "radar": radar,
        "radar_roles": RADAR_ROLES,
        "radar_method": "Assi normalizzati sul massimo tra i 5 ruoli (=100); esposizione AI espressa direttamente in 0–100.",
        "salaries": salaries,
        "reference": records(bls[bls["proxy_for"] == "Riferimento"]),
    }


def build_kpis(metrics: pd.DataFrame) -> dict:
    return {row["key"]: {k: clean(v) for k, v in row.items() if k != "key"} for row in metrics.to_dict("records")}


def validate(data: dict) -> None:
    so = data["adoption"]["reported"]
    for row in so:
        parts = [row["using"], row["planning"] or 0, row["not_using"]]
        if abs(sum(parts) - 100) > 0.6:
            raise ValueError(f"Le quote SO {row['year']} non sommano a 100: {parts}")
    for row in data["adoption"]["series"]:
        lo, hi = row["proj_band"]
        if not lo <= row["proj_central"] <= hi:
            raise ValueError(f"Banda incoerente nel {row['year']}")
    src_ids = {s["id"] for s in data["sources"]}
    for kpi in data["kpis"].values():
        if kpi["source_id"] not in src_ids:
            raise ValueError(f"source_id sconosciuto: {kpi}")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--check", action="store_true", help="valida i dati senza scrivere il JSON")
    parser.add_argument("--out", type=Path, default=OUT)
    args = parser.parse_args()

    sources = read("sources")
    so = read("so_ai_adoption")
    gartner = read("gartner_predictions")
    org = read("org_ai_adoption")
    bls = read("bls_roles")
    revisions = read("bls_swe_revisions")
    oews = read("oews_swe")
    so_sal = read("so_salaries_2025")
    wef = read("wef_fastest_growing")
    tasks = read("task_penetration")
    weights = read("role_task_weights")
    metrics = read("headline_metrics")

    exposure = build_exposure(tasks, weights)
    data = {
        "meta": {
            "title": "Tech jobs evolution — market data",
            "version": "1.0.0",
            "data_cutoff": DATA_CUTOFF,
            "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "generator": "data-pipeline/generate_data.py",
            "notes": "Valori 'reported' = dalle fonti; valori 'derived' = calcolati da questo script.",
        },
        "sources": records(sources),
        "kpis": build_kpis(metrics),
        "adoption": build_adoption(so, gartner, org),
        "employment": build_employment(bls, revisions, oews),
        "exposure": exposure,
        "roles": build_roles(bls, so_sal, wef, exposure),
        "wef": {
            "fastest_growing": records(wef),
            "tech_share_top15": int(wef["tech"].sum()),
        },
        "gartner": records(gartner.sort_values(["target_year", "value_pct"])),
    }
    validate(data)

    if args.check:
        print("OK — dati validi, nessun file scritto.")
        return 0

    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    p = data["adoption"]["derived"]["params"]["central"]
    print(f"Scritto {args.out.relative_to(ROOT.parent)}")
    print(f"  logistica centrale: K={p['K']} r={p['r']} t0={p['t0']} RMSE={p['rmse_pp']}pp")
    print("  indice penetrazione AI:", ", ".join(f"{r['role']}={r['index']}" for r in exposure["roles"]))
    return 0


if __name__ == "__main__":
    sys.exit(main())
