# -*- coding: utf-8 -*-
"""
build-html.py — Собирает презентационный whitepaper.html из базы знаний.

Читает arkheosium-kb.json (сгенерирован build-kb.py) и рендерит единый
самодостаточный HTML-документ: обложка, канонические факты, интерактивный
граф связей, все 5 документов с оглавлением. Без внешних зависимостей/CDN.

Запуск:  python build-html.py   (после python build-kb.py)
"""

import json
import os
import re
import math

HERE = os.path.dirname(os.path.abspath(__file__))
FILE_TO_ID = {
    "01-arkheosium-ecosystem.md": "arkheosium-ecosystem",
    "02-foxampyforge-lab.md": "foxampyforge-lab",
    "03-lab-unicap-dao-partnership.md": "lab-unicap-dao-partnership",
    "04-roadmap-unicap-lab-karakalpak.md": "roadmap-unicap-lab-karakalpak",
    "05-aral-sea-program.md": "aral-sea-program",
}

# ── Лёгкий markdown → HTML ────────────────────────────────────────────────────
def fix_href(u):
    m = re.match(r"\./(\d{2}-[a-z0-9-]+\.md)", u)
    if m and m.group(1) in FILE_TO_ID:
        return "#doc-" + FILE_TO_ID[m.group(1)]
    return u


def inline(s):
    s = s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    s = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", s)
    s = re.sub(r"`([^`]+)`", r"<code>\1</code>", s)
    s = re.sub(r"\[([^\]]+)\]\(([^)]+)\)",
               lambda m: '<a href="%s">%s</a>' % (fix_href(m.group(2)), m.group(1)), s)
    s = re.sub(r"(?<![\w*])_([^_]+)_(?![\w*])", r"<em>\1</em>", s)
    return s


def md_to_html(text):
    lines = text.split("\n")
    out, i, n = [], 0, len(text.split("\n"))
    while i < n:
        line = lines[i]
        stripped = line.strip()
        if not stripped:
            i += 1
            continue
        # hr
        if re.match(r"^-{3,}$", stripped):
            out.append("<hr>")
            i += 1
            continue
        # heading ###
        mh = re.match(r"^(#{3,6})\s+(.*)$", stripped)
        if mh:
            lvl = len(mh.group(1))
            out.append("<h%d>%s</h%d>" % (lvl, inline(mh.group(2)), lvl))
            i += 1
            continue
        # blockquote
        if stripped.startswith(">"):
            buf = []
            while i < n and lines[i].strip().startswith(">"):
                buf.append(lines[i].strip()[1:].strip())
                i += 1
            out.append("<blockquote>%s</blockquote>" % inline(" ".join(buf)))
            continue
        # table
        if stripped.startswith("|"):
            tbl = []
            while i < n and lines[i].strip().startswith("|"):
                tbl.append(lines[i].strip())
                i += 1
            out.append(render_table(tbl))
            continue
        # list
        if re.match(r"^[-*]\s+", stripped):
            items = []
            while i < n and re.match(r"^[-*]\s+", lines[i].strip()):
                items.append(inline(re.sub(r"^[-*]\s+", "", lines[i].strip())))
                i += 1
            out.append("<ul>%s</ul>" % "".join("<li>%s</li>" % it for it in items))
            continue
        # paragraph (accumulate until blank / special)
        buf = []
        while i < n and lines[i].strip() and not re.match(r"^([-*]\s+|\||>|#{3,}|-{3,}$)", lines[i].strip()):
            buf.append(lines[i].strip())
            i += 1
        out.append("<p>%s</p>" % inline(" ".join(buf)))
    return "\n".join(out)


def render_table(rows):
    def cells(r):
        parts = [c.strip() for c in r.strip().strip("|").split("|")]
        return parts
    if len(rows) < 2:
        return ""
    header = cells(rows[0])
    body = rows[2:]  # rows[1] is separator
    thead = "<tr>%s</tr>" % "".join("<th>%s</th>" % inline(c) for c in header)
    trs = []
    for r in body:
        cs = cells(r)
        trs.append("<tr>%s</tr>" % "".join("<td>%s</td>" % inline(c) for c in cs))
    return "<div class='tw'><table><thead>%s</thead><tbody>%s</tbody></table></div>" % (thead, "".join(trs))


# ── Раскладка графа (кластеры по группам) ────────────────────────────────────
CLUSTERS = {
    "entity":       (560, 100, 95),
    "economics":    (560, 305, 78),
    "concept":      (850, 250, 82),
    "document":     (165, 215, 120),
    "vector":       (935, 515, 98),
    "module":       (615, 600, 122),
    "library":      (235, 585, 118),
    "data-product": (430, 760, 122),
    "dao":          (800, 730, 88),
}
R_BY_TYPE = {"entity": 20, "economics": 18, "concept": 15, "document": 14,
             "vector": 11, "module": 10, "library": 10, "data-product": 9, "dao": 11}
BIG_LABEL = {"entity", "economics", "concept", "document"}
LEGEND = [
    ("Сущности", "#00e6c8"), ("Документы", "#8aa0b8"), ("Экономика", "#00d4ff"),
    ("Концепты", "#f59e0b"), ("Векторы", "#34d399"), ("Модули", "#00e6c8"),
    ("Библиотеки", "#c084fc"), ("Продукты данных · MRV", "#f59e0b"), ("DAO", "#7dd3fc"),
]


def layout(nodes):
    by_group = {}
    for nd in nodes:
        by_group.setdefault(nd["group"], []).append(nd)
    pos = {}
    for grp, items in by_group.items():
        cx, cy, rad = CLUSTERS.get(grp, (560, 430, 100))
        k = len(items)
        for j, nd in enumerate(items):
            if k == 1:
                x, y = cx, cy
            else:
                ang = -math.pi / 2 + 2 * math.pi * j / k
                x = cx + rad * math.cos(ang)
                y = cy + rad * math.sin(ang)
            pos[nd["id"]] = (x, y, cx, cy)
    return pos


def build_graph_svg(graph):
    nodes = graph["nodes"]
    edges = graph["edges"]
    pos = layout(nodes)
    W, H = 1120, 880
    parts = ['<svg id="graph" viewBox="0 0 %d %d" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Граф связей документов и сущностей ArkheOSium">' % (W, H)]
    # edges
    parts.append('<g class="edges">')
    for e in edges:
        if e["source"] not in pos or e["target"] not in pos:
            continue
        x1, y1, _, _ = pos[e["source"]]
        x2, y2, _, _ = pos[e["target"]]
        parts.append('<line class="edge" data-s="%s" data-t="%s" x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f"><title>%s</title></line>'
                     % (e["source"], e["target"], x1, y1, x2, y2, e.get("label", "")))
    parts.append('</g>')
    # nodes
    parts.append('<g class="nodes">')
    for nd in nodes:
        x, y, cx, cy = pos[nd["id"]]
        r = R_BY_TYPE.get(nd["type"], 9)
        color = nd["color"]
        parts.append('<g class="node" data-id="%s">' % nd["id"])
        parts.append('<circle cx="%.1f" cy="%.1f" r="%d" fill="%s" fill-opacity="0.85" stroke="%s" stroke-width="1.5"><title>%s</title></circle>'
                     % (x, y, r, color, color, nd["label"]))
        big = nd["group"] in BIG_LABEL
        # label side by horizontal offset from cluster center
        if abs(x - cx) < 6:
            anchor, dx, dy = "middle", 0, r + (14 if big else 11)
        elif x >= cx:
            anchor, dx, dy = "start", r + 4, 4
        else:
            anchor, dx, dy = "end", -(r + 4), 4
        cls = "lbl big" if big else "lbl"
        parts.append('<text class="%s" x="%.1f" y="%.1f" text-anchor="%s">%s</text>'
                     % (cls, x + dx, y + dy, anchor, esc(nd["label"])))
        parts.append('</g>')
    parts.append('</g>')
    parts.append('</svg>')
    return "\n".join(parts)


def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


CSS = """
:root{--bg:#040a14;--bg2:#060f1c;--card:rgba(6,15,28,0.6);--bd:rgba(255,255,255,0.08);
--tx:#e6eef7;--mut:#94a7bd;--accent:#00e6c8;--accent2:#00d4ff;--gold:#f59e0b;}
*{box-sizing:border-box;}
html{scroll-behavior:smooth;}
body{margin:0;background:radial-gradient(1200px 700px at 70% -10%,rgba(0,212,255,0.10),transparent 60%),
radial-gradient(1000px 600px at 10% 20%,rgba(0,230,200,0.07),transparent 55%),var(--bg);
color:var(--tx);font-family:'Segoe UI',system-ui,-apple-system,Roboto,Arial,sans-serif;
line-height:1.7;font-size:16px;-webkit-font-smoothing:antialiased;}
.wrap{display:grid;grid-template-columns:290px 1fr;gap:0;max-width:1500px;margin:0 auto;}
aside{position:sticky;top:0;align-self:start;height:100vh;overflow-y:auto;padding:26px 20px;
border-right:1px solid var(--bd);background:rgba(4,10,20,0.65);backdrop-filter:blur(10px);}
aside .brand{font-weight:800;font-size:18px;letter-spacing:.3px;
background:linear-gradient(90deg,var(--accent),var(--accent2));-webkit-background-clip:text;
background-clip:text;color:transparent;margin-bottom:2px;}
aside .sub{color:var(--mut);font-size:12px;margin-bottom:20px;}
aside nav a{display:block;color:var(--mut);text-decoration:none;font-size:13px;padding:4px 0;
border-left:2px solid transparent;padding-left:10px;transition:color .15s,border-color .15s;}
aside nav a:hover{color:var(--tx);border-color:var(--accent);}
aside nav a.doc{color:var(--tx);font-weight:700;margin-top:16px;font-size:13.5px;}
aside nav a.sec{font-size:12px;opacity:.85;}
main{padding:0 clamp(20px,4vw,64px) 90px;min-width:0;}
.cover{padding:90px 0 40px;border-bottom:1px solid var(--bd);}
.cover .kick{display:inline-block;font-size:12px;text-transform:uppercase;letter-spacing:2px;
color:var(--accent);border:1px solid var(--bd);border-radius:999px;padding:6px 14px;margin-bottom:22px;}
.cover h1{font-size:clamp(30px,5vw,52px);line-height:1.1;margin:0 0 18px;font-weight:800;}
.cover h1 span{background:linear-gradient(90deg,var(--accent),var(--accent2));-webkit-background-clip:text;
background-clip:text;color:transparent;}
.cover p{color:var(--mut);font-size:18px;max-width:760px;}
.meta{display:flex;flex-wrap:wrap;gap:10px;margin-top:26px;}
.meta span{font-size:12.5px;color:var(--mut);border:1px solid var(--bd);border-radius:999px;padding:5px 12px;}
section.doc{padding:56px 0;border-bottom:1px solid var(--bd);}
.doc-eyebrow{font-size:12px;text-transform:uppercase;letter-spacing:1.5px;color:var(--accent2);margin-bottom:8px;}
h2.doc-title{font-size:clamp(24px,3.4vw,36px);margin:0 0 10px;font-weight:800;line-height:1.15;}
.doc-topic{color:var(--mut);margin-bottom:8px;}
main h3{font-size:20px;margin:34px 0 10px;font-weight:700;color:#fff;}
main h4{font-size:16px;margin:22px 0 8px;font-weight:700;color:var(--accent);}
main p{color:#d4dfeb;}
main a{color:var(--accent2);text-decoration:none;border-bottom:1px solid rgba(0,212,255,.3);}
main a:hover{border-color:var(--accent2);}
main ul{padding-left:22px;color:#d4dfeb;}
main li{margin:5px 0;}
blockquote{margin:16px 0;padding:14px 18px;border-left:3px solid var(--accent);
background:rgba(0,230,200,0.06);border-radius:0 12px 12px 0;color:#cfe0ee;font-style:italic;}
code{background:rgba(255,255,255,.07);padding:2px 6px;border-radius:6px;font-size:13.5px;
font-family:'Cascadia Code',Consolas,monospace;color:#9fe;}
hr{border:none;border-top:1px solid var(--bd);margin:26px 0;}
.tw{overflow-x:auto;margin:18px 0;border:1px solid var(--bd);border-radius:14px;}
table{border-collapse:collapse;width:100%;font-size:14px;}
th,td{text-align:left;padding:11px 14px;border-bottom:1px solid var(--bd);vertical-align:top;}
th{background:rgba(255,255,255,.04);color:#fff;font-weight:700;font-size:12.5px;
text-transform:uppercase;letter-spacing:.4px;}
tbody tr:hover{background:rgba(0,212,255,.04);}
td strong{color:#fff;}
.facts{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px;margin:26px 0;}
.fact{background:var(--card);border:1px solid var(--bd);border-radius:18px;padding:18px 18px;
backdrop-filter:blur(14px);}
.fact .l{font-size:12px;text-transform:uppercase;letter-spacing:1px;color:var(--mut);margin-bottom:6px;}
.fact .v{font-size:15px;color:#fff;}
.fact .v b{color:var(--accent);}
.graph-card{background:var(--card);border:1px solid var(--bd);border-radius:22px;padding:20px;
margin:26px 0;backdrop-filter:blur(14px);}
.graph-card h3{margin-top:0;}
#graph{width:100%;height:auto;display:block;}
.edge{stroke:rgba(255,255,255,0.11);stroke-width:1;transition:opacity .15s,stroke-width .15s,stroke .15s;}
.lbl{fill:#c3d2e2;font-size:9px;pointer-events:none;paint-order:stroke;
stroke:rgba(4,10,20,0.85);stroke-width:2.4px;font-family:'Segoe UI',sans-serif;}
.lbl.big{fill:#fff;font-size:11.5px;font-weight:700;}
.node circle{cursor:pointer;transition:opacity .15s,r .15s;}
#graph.dim .edge{opacity:.05;}
#graph.dim .node{opacity:.22;}
#graph.dim .node.hl{opacity:1;}
#graph.dim .edge.hl{opacity:.95;stroke:var(--accent);stroke-width:2;}
.legend{display:flex;flex-wrap:wrap;gap:12px;margin-top:16px;}
.legend span{display:inline-flex;align-items:center;gap:7px;font-size:12.5px;color:var(--mut);}
.legend i{width:11px;height:11px;border-radius:50%;display:inline-block;}
.ghint{color:var(--mut);font-size:13px;margin-top:6px;}
footer{color:var(--mut);font-size:13px;padding:40px 0 0;}
@media(max-width:900px){.wrap{grid-template-columns:1fr;}aside{position:static;height:auto;
border-right:none;border-bottom:1px solid var(--bd);}aside nav{columns:2;}}
"""

JS = """
(function(){
  var g=document.getElementById('graph'); if(!g) return;
  var nodes=[].slice.call(g.querySelectorAll('.node'));
  var edges=[].slice.call(g.querySelectorAll('.edge'));
  function clear(){g.classList.remove('dim');edges.forEach(function(e){e.classList.remove('hl');});
    nodes.forEach(function(n){n.classList.remove('hl');});}
  nodes.forEach(function(node){
    var id=node.getAttribute('data-id');
    node.addEventListener('mouseenter',function(){
      g.classList.add('dim');node.classList.add('hl');
      var nb={};nb[id]=1;
      edges.forEach(function(e){
        if(e.getAttribute('data-s')===id||e.getAttribute('data-t')===id){
          e.classList.add('hl');nb[e.getAttribute('data-s')]=1;nb[e.getAttribute('data-t')]=1;}
      });
      nodes.forEach(function(nn){if(nb[nn.getAttribute('data-id')])nn.classList.add('hl');});
    });
    node.addEventListener('mouseleave',clear);
    node.addEventListener('click',function(){
      if(id.indexOf('doc:')===0){var t=document.getElementById('doc-'+id.slice(4));if(t)t.scrollIntoView();}
    });
  });
})();
"""


def facts_html(cf):
    e = cf["entities"]
    ec = cf["economics"]
    items = [
        ("ArkheOSium", e["ArkheOSium"]),
        ("FoxampyForge", e["FoxampyForge"]),
        ("UnicapInvest", e["UnicapInvest"]),
        ("Кампания «Каракалпакия»", ec["campaign_label"]),
        ("Полная программа", ec["program_label"]),
        ("Принцип эффекта", ec["multiplier_principle"]),
        ("Токен Лаборатории", cf["internal_token"]["name"] + " " + cf["internal_token"]["symbol"] + " — " + cf["internal_token"]["context"]),
        ("Верификация", cf["verification"]["framework"] + " " + cf["verification"]["sealing"]),
        ("Слой знаний", cf["knowledge"]["term"] + " — " + cf["knowledge"]["definition"]),
    ]
    cards = "".join('<div class="fact"><div class="l">%s</div><div class="v">%s</div></div>'
                    % (esc(k), inline(v)) for k, v in items)
    return '<div class="facts">%s</div>' % cards


def main():
    with open(os.path.join(HERE, "arkheosium-kb.json"), encoding="utf-8") as f:
        kb = json.load(f)

    # sidebar nav
    nav = []
    for d in kb["documents"]:
        nav.append('<a class="doc" href="#doc-%s">%02d · %s</a>' % (d["id"], d["order"], esc(short_title(d["title"]))))
        for j, s in enumerate(d["sections"]):
            nav.append('<a class="sec" href="#%s-s%d">%s</a>' % (d["id"], j, esc(s["heading"])))
    nav_html = "\n".join(nav)

    # documents
    docs_html = []
    for d in kb["documents"]:
        body = []
        if d["intro"]:
            body.append(md_to_html(d["intro"]))
        for j, s in enumerate(d["sections"]):
            body.append('<h3 id="%s-s%d">%s</h3>' % (d["id"], j, esc(s["heading"])))
            body.append(md_to_html(s["content"]))
        docs_html.append(
            '<section class="doc" id="doc-%s">'
            '<div class="doc-eyebrow">Документ %02d · %s</div>'
            '<h2 class="doc-title">%s</h2>'
            '<div class="doc-topic">%s</div>%s</section>'
            % (d["id"], d["order"], esc(d["kind"]), esc(d["title"]), esc(d["topic"]), "\n".join(body))
        )

    graph_svg = build_graph_svg(kb["graph"])
    legend = "".join('<span><i style="background:%s"></i>%s</span>' % (c, esc(l)) for l, c in LEGEND)
    st = kb["graph"]["stats"]

    html = TEMPLATE
    html = html.replace("__CSS__", CSS)
    html = html.replace("__JS__", JS)
    html = html.replace("__NAV__", nav_html)
    html = html.replace("__FACTS__", facts_html(kb["canonical_facts"]))
    html = html.replace("__GRAPH__", graph_svg)
    html = html.replace("__LEGEND__", legend)
    html = html.replace("__GSTATS__", "%d узлов · %d связей" % (st["node_count"], st["edge_count"]))
    html = html.replace("__DOCS__", "\n".join(docs_html))
    total_words = sum(d["word_count"] for d in kb["documents"])
    total_sections = sum(d["section_count"] for d in kb["documents"])
    html = html.replace("__COUNTS__", "%d документов · %d секций · ~%s слов" %
                        (len(kb["documents"]), total_sections, f"{total_words:,}".replace(",", " ")))

    out = os.path.join(HERE, "whitepaper.html")
    with open(out, "w", encoding="utf-8") as f:
        f.write(html)
    print("HTML built OK ->", out)
    print("  size:", os.path.getsize(out), "bytes")


def short_title(t):
    t = re.split(r"[—:]", t)[0].strip()
    return t[:38]


TEMPLATE = """<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>ArkheOSium — Whitepaper</title>
<style>__CSS__</style>
</head>
<body>
<div class="wrap">
<aside>
  <div class="brand">ArkheOSium</div>
  <div class="sub">Whitepaper · единый документ</div>
  <nav>
    <a class="doc" href="#top">Обзор и факты</a>
    <a class="sec" href="#graph-sec">Граф связей</a>
__NAV__
  </nav>
</aside>
<main>
  <div class="cover" id="top">
    <span class="kick">Операционная система экосистемы</span>
    <h1>Экосистема <span>ArkheOSium</span>, Лаборатория FoxampyForge и Программа «Аральское море»</h1>
    <p>Комплект документов уровня whitepaper: операционная система ресурсов и жизни планеты, R&amp;D-лаборатория, DAO-партнёрство с группой UnicapInvest и флагманская Программа восстановления Приаралья — в едином связанном виде.</p>
    <div class="meta"><span>__COUNTS__</span><span>Граф: __GSTATS__</span><span>Версия 1.1</span></div>
  </div>

  <section class="doc">
    <div class="doc-eyebrow">Единый источник истины</div>
    <h2 class="doc-title">Канонические факты</h2>
    <div class="doc-topic">Одинаковы во всех документах и в машиночитаемой базе знаний.</div>
    __FACTS__
  </section>

  <section class="doc" id="graph-sec">
    <div class="doc-eyebrow">Связность</div>
    <h2 class="doc-title">Граф связей</h2>
    <div class="doc-topic">Документы, сущности, экономика, векторы, модули, библиотеки (онтология), продукты данных MRV и DAO — со всеми связями. Наведите на узел, чтобы подсветить его связи; клик по документу — переход к нему.</div>
    <div class="graph-card">
      <h3>Карта экосистемы</h3>
      __GRAPH__
      <div class="legend">__LEGEND__</div>
      <div class="ghint">__GSTATS__ · наведение выделяет соседей, клик по узлу-документу прокручивает к разделу.</div>
    </div>
  </section>

  __DOCS__

  <footer>
    <hr>
    Сгенерировано из markdown-источников · машиночитаемые версии: arkheosium-kb.json · arkheosium-kb.jsonl · arkheosium-graph.json · пересборка: <code>python build-kb.py &amp;&amp; python build-html.py</code>
  </footer>
</main>
</div>
<script>__JS__</script>
</body>
</html>"""


if __name__ == "__main__":
    main()
