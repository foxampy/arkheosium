# -*- coding: utf-8 -*-
"""
build-kb.py — Собирает единую базу знаний + граф связей из whitepaper-документов.

Читает markdown-файлы в этой папке, разбивает каждый по заголовкам (#/##),
и генерирует:
  - arkheosium-kb.json      структурированная БЗ (документы -> секции) + canonical_facts + graph
  - arkheosium-kb.jsonl     по одной записи на секцию (чанки для RAG/эмбеддингов)
  - arkheosium-graph.json   отдельный граф связей (nodes + edges) для визуализации/анализа

Запуск:  python build-kb.py
"""

import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))

# ── Документы ────────────────────────────────────────────────────────────────
DOCS = [
    {"id": "arkheosium-ecosystem", "file": "01-arkheosium-ecosystem.md", "order": 1,
     "kind": "whitepaper", "topic": "Экосистема / ОС ArkheOSium"},
    {"id": "foxampyforge-lab", "file": "02-foxampyforge-lab.md", "order": 2,
     "kind": "whitepaper", "topic": "Лаборатория FoxampyForge (R&D)"},
    {"id": "lab-unicap-dao-partnership", "file": "03-lab-unicap-dao-partnership.md", "order": 3,
     "kind": "whitepaper", "topic": "Лаборатория × UnicapInvest — автономия и DAO-партнёрство"},
    {"id": "roadmap-unicap-lab-karakalpak", "file": "04-roadmap-unicap-lab-karakalpak.md", "order": 4,
     "kind": "roadmap", "topic": "Дорожная карта UnicapInvest × Лаборатория, фокус — Каракалпакия"},
    {"id": "aral-sea-program", "file": "05-aral-sea-program.md", "order": 5,
     "kind": "program", "topic": "Программа «Аральское море» — флагман (кампании, модули, интеграции)"},
]

# ── Палитра доменов (синхр. с приложением) ───────────────────────────────────
DOMAIN = {
    "water": "#00e6c8", "energy": "#f59e0b", "minerals": "#c084fc",
    "nature": "#34d399", "agriculture": "#a3e635", "climate": "#7dd3fc",
    "accent": "#00e6c8", "accent2": "#00d4ff", "gold": "#f59e0b",
}

# ── Канонические факты — единый источник истины ──────────────────────────────
CANONICAL_FACTS = {
    "entities": {
        "ArkheOSium": "Операционная система (ОС) экосистемы ресурсов и жизни планеты; мульти-доменная платформа: 2D-карта + 3D-глобус, граф знаний, MRV/DePIN-верификация.",
        "FoxampyForge": "Исследовательско-инновационная (R&D) лаборатория — подразделение группы UnicapInvest; разрабатывает и управляет ArkheOSium и проектами через DAO.",
        "UnicapInvest": "Материнская инвестиционная группа (UNICAP); Лаборатория входит в неё как автономный R&D-департамент.",
    },
    "economics": {
        "campaign_karakalpakia_usd": 250_000_000,
        "campaign_label": "$250 млн — стоимость кампании «Каракалпакия» (региональный эталон).",
        "program_total_usd": 500_000_000_000,
        "program_label": "$0,5 трлн — ПОЛНАЯ стоимость программы (глобальная интеграция).",
        "multiplier_principle": "Эффект МУЛЬТИПЛИКАТИВЕН, а не аддитивен: прибыльность многократно выше даже полной кампании Каракалпакии.",
    },
    "internal_token": {"name": "Искра", "symbol": "✦",
        "context": "Внутренний токен Лаборатории FoxampyForge (App Hub, маркетплейс услуг, стейкинг, фрактальная методология)."},
    "verification": {"framework": "MRV (Measurement / Reporting / Verification) + DePIN.",
        "sealing": "Каждый модуль контура автоматически собирает данные и запечатывает информацию ХЭШЕМ либо выпускает её как ЭМИССИОННЫЙ ТОКЕН, эмитируемый самим модулем."},
    "knowledge": {"term": "Онтологическая систематизация",
        "definition": "Граф знаний поверх таксономии и фасетной классификации; DAO обеспечивает связную системность знаний, продуктов и библиотек по доменам/векторам."},
    "domains": {k: DOMAIN[k] for k in ("water", "energy", "minerals", "nature", "agriculture", "climate")},
}

# ── Структурные данные Программы (синхр. с src/data/karakalpak-campaign.ts) ───
VECTORS = [
    ("research", "Научно-исследовательский", DOMAIN["climate"]),
    ("economic", "Экономический", DOMAIN["agriculture"]),
    ("engineering", "Инженерный", DOMAIN["accent2"]),
    ("ecological", "Экологический", DOMAIN["nature"]),
    ("social", "Социальный", DOMAIN["minerals"]),
]
MODULES = [
    ("desalination", "Вода и опреснение", "engineering", DOMAIN["water"], "480 000 м³/сут"),
    ("energy", "Солнце + ветер + накопители", "engineering", DOMAIN["energy"], "3,2 ГВт"),
    ("agro", "Агро-биокупола", "economic", DOMAIN["agriculture"], "120 га"),
    ("ecocity", "Эко-город", "social", DOMAIN["nature"], "45 000 жителей"),
    ("port", "Логистика и порт", "economic", DOMAIN["minerals"], "2,4 млн т/год"),
    ("rnd", "R&D-кампус", "research", DOMAIN["climate"], "1 200 исследователей"),
    ("monitoring", "Сеть мониторинга", "engineering", DOMAIN["accent2"], "52 000 датчиков"),
]
LIBRARIES = [
    ("lib-engineering", "Инженерная библиотека", DOMAIN["accent2"], "own"),
    ("lib-research", "Научно-исследовательская", DOMAIN["climate"], "own"),
    ("lib-water", "Библиотека воды", DOMAIN["water"], "own"),
    ("lib-energy", "Энергетическая", DOMAIN["energy"], "partner"),
    ("lib-agro", "Агро-биологическая", DOMAIN["agriculture"], "partner"),
    ("lib-eco", "Экологическая", DOMAIN["nature"], "own"),
    ("lib-social", "Социально-правовая", DOMAIN["minerals"], "partner"),
]
KNOWLEDGE_EDGES = [
    ("lib-engineering", "lib-research"), ("lib-engineering", "lib-water"),
    ("lib-engineering", "lib-energy"), ("lib-research", "lib-eco"),
    ("lib-water", "lib-agro"), ("lib-energy", "lib-agro"),
    ("lib-eco", "lib-social"), ("lib-research", "lib-water"),
]
DAO_FACTS = [
    ("governance", "Управление", DOMAIN["accent"]),
    ("consensus", "Консенсус", DOMAIN["accent2"]),
    ("funding", "Финансирование", DOMAIN["agriculture"]),
    ("distribution", "Распределение эффективности", DOMAIN["minerals"]),
]
DATA_PRODUCTS = [
    ("water-meter", "Счётчики воды", "desalination", DOMAIN["water"], "hash"),
    ("energy-oracle", "Энергетический оракул", "energy", DOMAIN["energy"], "token"),
    ("agro-sensors", "Агро-телеметрия", "agro", DOMAIN["agriculture"], "hash"),
    ("eco-mrv", "Экологический MRV", "monitoring", DOMAIN["nature"], "token"),
    ("port-ledger", "Логистический реестр", "port", DOMAIN["minerals"], "hash"),
    ("grid-controller", "Контроллер микрогрида", "monitoring", DOMAIN["accent2"], "token"),
]


def build_graph(doc_titles, cross_refs):
    """Строит граф со всеми связями: сущности, документы, экономика,
    векторы, модули, библиотеки (онтология), MRV-продукты, DAO."""
    nodes, edges = [], []
    seen = set()

    def node(nid, label, ntype, color, group, meta=None):
        if nid in seen:
            return
        seen.add(nid)
        nodes.append({"id": nid, "label": label, "type": ntype,
                      "group": group, "color": color, "meta": meta or {}})

    def edge(s, t, label, etype):
        edges.append({"source": s, "target": t, "label": label, "type": etype})

    # Сущности
    node("ent:arkheosium", "ArkheOSium", "entity", DOMAIN["accent"], "entity",
         {"role": "ОС экосистемы"})
    node("ent:foxampyforge", "FoxampyForge", "entity", DOMAIN["accent2"], "entity",
         {"role": "R&D-лаборатория"})
    node("ent:unicap", "UnicapInvest", "entity", DOMAIN["gold"], "entity",
         {"role": "Инвестиционная группа"})
    edge("ent:foxampyforge", "ent:arkheosium", "разрабатывает", "builds")
    edge("ent:foxampyforge", "ent:unicap", "R&D-департамент", "division_of")
    edge("ent:foxampyforge", "ent:unicap", "DAO-партнёрство", "dao_partner")

    # Документы
    for m in DOCS:
        node("doc:" + m["id"], doc_titles.get(m["id"], m["id"]), "document",
             "#8aa0b8", "document", {"file": m["file"], "order": m["order"], "kind": m["kind"]})
    # Документ → сущность/концепт (главная тема)
    edge("doc:arkheosium-ecosystem", "ent:arkheosium", "описывает", "describes")
    edge("doc:foxampyforge-lab", "ent:foxampyforge", "описывает", "describes")
    edge("doc:lab-unicap-dao-partnership", "ent:foxampyforge", "описывает", "describes")
    edge("doc:lab-unicap-dao-partnership", "ent:unicap", "описывает", "describes")
    edge("doc:roadmap-unicap-lab-karakalpak", "econ:campaign", "фокус", "focus")
    edge("doc:aral-sea-program", "econ:program", "описывает", "describes")
    edge("doc:aral-sea-program", "econ:campaign", "описывает", "describes")
    # Перекрёстные ссылки между документами (из markdown)
    for s, t in cross_refs:
        edge("doc:" + s, "doc:" + t, "ссылается", "cross-ref")

    # Экономика
    node("econ:campaign", "Кампания «Каракалпакия» · $250 млн", "economics",
         DOMAIN["agriculture"], "economics", {"usd": 250_000_000})
    node("econ:program", "Программа · $0,5 трлн", "economics",
         DOMAIN["accent2"], "economics", {"usd": 500_000_000_000})
    node("concept:multiplier", "Мультипликативный эффект", "concept",
         DOMAIN["gold"], "concept")
    edge("econ:campaign", "concept:multiplier", "×", "scales")
    edge("concept:multiplier", "econ:program", "→ программа", "scales")
    edge("ent:arkheosium", "econ:program", "флагман: Аральское море", "flagship")

    # Концепты
    node("concept:dao", "DAO", "concept", DOMAIN["accent"], "concept")
    node("concept:mrv", "MRV + DePIN", "concept", DOMAIN["accent2"], "concept")
    node("concept:ontology", "Онтологическая систематизация", "concept",
         DOMAIN["climate"], "concept")

    # Векторы
    for vid, vlabel, vcolor in VECTORS:
        node("vec:" + vid, vlabel, "vector", vcolor, "vector")

    # Модули: кампания содержит модуль; модуль служит вектору
    for mid, mlabel, vid, color, metric in MODULES:
        node("mod:" + mid, mlabel, "module", color, "module", {"metric": metric})
        edge("econ:campaign", "mod:" + mid, "содержит", "contains")
        edge("mod:" + mid, "vec:" + vid, "вектор", "serves")

    # Библиотеки: онтология (граф знаний) + принадлежность концепту
    for lid, llabel, color, kind in LIBRARIES:
        node(lid, llabel, "library", color, "library", {"kind": kind})
        edge(lid, "concept:ontology", "узел онтологии", "part_of")
    for a, b in KNOWLEDGE_EDGES:
        edge(a, b, "связь знаний", "ontology")

    # Продукты данных: модуль эмитирует продукт; продукт → MRV
    for pid, plabel, mid, color, seal in DATA_PRODUCTS:
        node("dp:" + pid, plabel, "data-product", color, "data-product", {"seal": seal})
        edge("mod:" + mid, "dp:" + pid, "эмитирует", "emits")
        edge("dp:" + pid, "concept:mrv", ("хеш" if seal == "hash" else "токен"), "verifies")

    # DAO: факты → концепт DAO; DAO связывает контуры
    for did, dlabel, color in DAO_FACTS:
        node("dao:" + did, dlabel, "dao", color, "dao")
        edge("dao:" + did, "concept:dao", "функция", "part_of")
    edge("concept:dao", "econ:campaign", "управляет", "governs")
    edge("concept:dao", "concept:mrv", "агрегирует", "aggregates")
    edge("concept:dao", "concept:ontology", "связная системность", "connects")
    edge("ent:foxampyforge", "concept:dao", "управляет через", "governs_via")

    return {"nodes": nodes, "edges": edges,
            "stats": {"node_count": len(nodes), "edge_count": len(edges)}}


def slugify(text):
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text, flags=re.UNICODE)
    text = re.sub(r"[\s_]+", "-", text)
    return text.strip("-")


def parse_markdown(text):
    lines = text.splitlines()
    doc_title, sections, current, intro_buf = None, [], None, []
    for line in lines:
        m1 = re.match(r"^#\s+(.*)$", line)
        m2 = re.match(r"^##\s+(.*)$", line)
        if m1 and not m2 and doc_title is None:
            doc_title = m1.group(1).strip()
            continue
        if m2:
            if current is not None:
                sections.append(current)
            current = {"heading": m2.group(1).strip(), "level": 2, "content": ""}
            continue
        if current is None:
            intro_buf.append(line)
        else:
            current["content"] += line + "\n"
    if current is not None:
        sections.append(current)
    for s in sections:
        s["content"] = s["content"].strip()
        s["word_count"] = len(re.findall(r"\S+", s["content"]))
    return doc_title, "\n".join(intro_buf).strip(), sections


FILE_TO_ID = {m["file"]: m["id"] for m in DOCS}


def write_full_md(kb):
    """Собирает ОДИН текстовый файл, объединяющий всё: факты, граф и все документы.
    Формат — простой markdown (читается и как обычный текст)."""
    cf = kb["canonical_facts"]
    L = []
    L.append("# ArkheOSium — ПОЛНЫЙ единый документ")
    L.append("")
    L.append("> Один файл, объединяющий всё: канонические факты, граф связей и полный текст "
             "всех документов (Экосистема, Лаборатория FoxampyForge, DAO-партнёрство с UnicapInvest, "
             "дорожная карта, Программа «Аральское море»). Предназначен для полного разбора и изучения.")
    L.append("")
    total_words = sum(d["word_count"] for d in kb["documents"])
    total_sections = sum(d["section_count"] for d in kb["documents"])
    L.append("_Состав: %d документов · %d секций · ~%d слов · граф %d узлов / %d связей._"
             % (len(kb["documents"]), total_sections, total_words,
                kb["graph"]["stats"]["node_count"], kb["graph"]["stats"]["edge_count"]))
    L.append("")
    L.append("---")
    L.append("")

    # ЧАСТЬ 0 — канонические факты
    L.append("## ЧАСТЬ 0. Канонические факты (единый источник истины)")
    L.append("")
    L.append("**Сущности**")
    for k, v in cf["entities"].items():
        L.append("- **%s** — %s" % (k, v))
    L.append("")
    L.append("**Экономика**")
    L.append("- %s" % cf["economics"]["campaign_label"])
    L.append("- %s" % cf["economics"]["program_label"])
    L.append("- %s" % cf["economics"]["multiplier_principle"])
    L.append("")
    L.append("**Внутренний токен** — %s %s: %s" %
             (cf["internal_token"]["name"], cf["internal_token"]["symbol"], cf["internal_token"]["context"]))
    L.append("")
    L.append("**Верификация** — %s %s" % (cf["verification"]["framework"], cf["verification"]["sealing"]))
    L.append("")
    L.append("**Слой знаний** — %s: %s" % (cf["knowledge"]["term"], cf["knowledge"]["definition"]))
    L.append("")
    L.append("---")
    L.append("")

    # ЧАСТЬ 1 — граф связей (текстом)
    id2label = {nd["id"]: nd["label"] for nd in kb["graph"]["nodes"]}
    L.append("## ЧАСТЬ 1. Граф связей (все связи текстом)")
    L.append("")
    L.append("Формат: `источник — [связь] → цель`.")
    L.append("")
    for e in kb["graph"]["edges"]:
        s = id2label.get(e["source"], e["source"])
        t = id2label.get(e["target"], e["target"])
        L.append("- %s — [%s] → %s" % (s, e.get("label", ""), t))
    L.append("")
    L.append("---")
    L.append("")

    # ЧАСТЬ 2 — оглавление
    L.append("## ЧАСТЬ 2. Документы")
    L.append("")
    for d in kb["documents"]:
        L.append("%d. **%s**" % (d["order"], d["title"]))
    L.append("")

    # полный текст каждого документа
    for d in kb["documents"]:
        L.append("---")
        L.append("")
        L.append("# Документ %02d. %s" % (d["order"], d["title"]))
        L.append("")
        if d["intro"]:
            L.append(d["intro"])
            L.append("")
        for s in d["sections"]:
            L.append("## %s" % s["heading"])
            L.append("")
            L.append(s["content"])
            L.append("")

    with open(os.path.join(HERE, "arkheosium-full.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(L).rstrip() + "\n")


def main():
    kb = {
        "name": "ArkheOSium Knowledge Base",
        "version": "1.1",
        "description": "Единая база знаний whitepaper-документов экосистемы ArkheOSium, Лаборатории FoxampyForge и Программы «Аральское море», с графом связей.",
        "canonical_facts": CANONICAL_FACTS,
        "documents": [],
    }
    jsonl_records = []
    doc_titles = {}
    cross_refs = []

    for meta in DOCS:
        with open(os.path.join(HERE, meta["file"]), encoding="utf-8") as f:
            raw = f.read()
        title, intro, sections = parse_markdown(raw)
        doc_titles[meta["id"]] = title
        total_words = sum(s["word_count"] for s in sections) + len(re.findall(r"\S+", intro))

        # перекрёстные ссылки на другие документы
        for link in re.findall(r"\]\(\./(\d{2}-[a-z0-9-]+\.md)\)", raw):
            tgt = FILE_TO_ID.get(link)
            if tgt and tgt != meta["id"] and (meta["id"], tgt) not in cross_refs:
                cross_refs.append((meta["id"], tgt))

        kb["documents"].append({
            "id": meta["id"], "order": meta["order"], "kind": meta["kind"],
            "topic": meta["topic"], "file": meta["file"], "title": title,
            "intro": intro, "word_count": total_words,
            "section_count": len(sections), "sections": sections,
        })

        if intro:
            jsonl_records.append({"id": f"{meta['id']}::intro", "doc_id": meta["id"],
                "doc_title": title, "heading": "Введение", "level": 1,
                "order": meta["order"], "text": intro,
                "word_count": len(re.findall(r"\S+", intro))})
        for idx, s in enumerate(sections):
            rid = f"{meta['id']}::{slugify(s['heading'])[:60] or ('sec-%d' % idx)}"
            jsonl_records.append({"id": rid, "doc_id": meta["id"], "doc_title": title,
                "heading": s["heading"], "level": s["level"], "order": meta["order"],
                "section_index": idx, "text": s["content"], "word_count": s["word_count"]})

    graph = build_graph(doc_titles, cross_refs)
    kb["graph"] = graph

    with open(os.path.join(HERE, "arkheosium-kb.json"), "w", encoding="utf-8") as f:
        json.dump(kb, f, ensure_ascii=False, indent=2)
    with open(os.path.join(HERE, "arkheosium-kb.jsonl"), "w", encoding="utf-8") as f:
        for rec in jsonl_records:
            f.write(json.dumps(rec, ensure_ascii=False) + "\n")
    with open(os.path.join(HERE, "arkheosium-graph.json"), "w", encoding="utf-8") as f:
        json.dump({"name": "ArkheOSium Graph", "version": kb["version"],
                   "nodes": graph["nodes"], "edges": graph["edges"],
                   "stats": graph["stats"]}, f, ensure_ascii=False, indent=2)

    # единый текстовый файл «всё в одном»
    write_full_md(kb)

    print("KB + graph built OK")
    print(f"  documents : {len(kb['documents'])}")
    print(f"  sections  : {sum(d['section_count'] for d in kb['documents'])}")
    print(f"  words     : {sum(d['word_count'] for d in kb['documents'])}")
    print(f"  jsonl recs: {len(jsonl_records)}")
    print(f"  graph     : {graph['stats']['node_count']} nodes / {graph['stats']['edge_count']} edges")
    print(f"  cross-refs: {len(cross_refs)}")


if __name__ == "__main__":
    main()
