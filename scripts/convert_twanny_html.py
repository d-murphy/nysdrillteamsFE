from pathlib import Path
import html
import re

src = Path("/tmp/twanny-stats")
out_dir = Path("/Users/dmurphy/Projects/nysdrillteamsFE/twanny-html")
out_dir.mkdir(parents=True, exist_ok=True)

ORDER = [
    ("19s in Buckets.txt", "19s in Buckets"),
    ("8s in C-Ladder.txt", "8s in C-Ladder"),
    ("5s in Motor Pump.txt", "5s in Motor Pump"),
    ("Best Times Per Event To Not Score Points.txt", "Best Times Per Event To Not Score Points"),
    ("State Drill Three-Peats.txt", "State Drill Three-Peats"),
    ("Attempts at Ladder Sweeps at the State Drill.txt", "Attempts at Ladder Sweeps at the State Drill"),
    ("The 4 list.txt", "The Four Club"),
    ("Sevens by Hydrantmen in Racing History.txt", "Sevens by Hydrantmen in Racing History"),
    ("Sevens by Nozzlemen in Racing History.txt", "Sevens by Nozzlemen in Racing History"),
    ("Three Man Ladder Six-Fives or Faster.txt", "Sub 6.50s in Three Man Ladder by Thirdmen"),
    ("North Lindy State Drill Scoring Streak Chart.txt", "North Lindy State Drill Scoring Streak Chart"),
    ("State Drill Stats General Information.txt", "State Drill Stats — General Information"),
    ("State Drill Stats for All 8 Contests.txt", "State Drill Stats for All 8 Contests"),
    ("State Drill Stats Top 5 Per Contest for Every Year.txt", "State Drill Stats — Top 5 Per Contest for Every Year"),
]


def esc(s: str) -> str:
    return html.escape(s, quote=False)


def normalize(text: str) -> str:
    text = text.replace("\u2028", "\n").replace("\u2029", "\n")
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"\n\s*-A Twanny Stat File\s*$", "", text, flags=re.I)
    text = re.sub(r"\n\s*[•\-]\s*A Twanny Stat File\s*$", "", text, flags=re.I)
    return text.strip()


def is_headingish(line: str) -> bool:
    s = line.strip()
    if not s or len(s) > 140:
        return False
    letters = [c for c in s if c.isalpha()]
    if len(letters) >= 8 and sum(1 for c in letters if c.isupper()) / len(letters) > 0.85:
        return True
    return False


def looks_like_list_item(line: str) -> bool:
    return bool(re.match(r"^(\d+[\).\-:]|[-–—•*]|\d+-tie\)|[Tt]-?\d+\))\s+", line.strip()))


LIST_PREFIX = re.compile(r"^(\d+[\).\-:]|[-–—•*]|\d+-tie\)|[Tt]-?\d+\))\s+")
RANK_PREFIX = re.compile(r"^(\d+-tie\)|\d+\)|4-tie\))\s*")
DASH_PREFIX = re.compile(r"^--\s*")


def convert_generic(text: str) -> str:
    text = normalize(text)
    blocks = re.split(r"\n\s*\n+", text)
    parts = []
    for block in blocks:
        lines = [ln.strip() for ln in block.split("\n") if ln.strip()]
        if not lines:
            continue
        cleaned = []
        for ln in lines:
            ln = re.sub(r'HYPERLINK\s+"[^"]+"\s*', "", ln)
            ln = re.sub(r'\\o\s+"[^"]+"\s*', "", ln)
            ln = re.sub(r"\s+", " ", ln).strip()
            if ln:
                cleaned.append(ln)
        lines = cleaned
        if not lines:
            continue

        if len(lines) == 1 and is_headingish(lines[0]):
            title = lines[0].title() if lines[0].isupper() else lines[0]
            parts.append(f"<h2>{esc(title)}</h2>")
            continue

        if all(looks_like_list_item(ln) for ln in lines):
            tag = "ol" if re.match(r"^\d", lines[0]) else "ul"
            parts.append(f"<{tag}>")
            for ln in lines:
                item = LIST_PREFIX.sub("", ln)
                parts.append(f"<li>{esc(item)}</li>")
            parts.append(f"</{tag}>")
            continue

        if any(looks_like_list_item(ln) for ln in lines):
            buf = []
            list_buf = []
            list_tag = None

            def flush_list():
                nonlocal list_buf, list_tag
                if list_buf:
                    parts.append(f"<{list_tag}>")
                    parts.extend(list_buf)
                    parts.append(f"</{list_tag}>")
                    list_buf, list_tag = [], None

            def flush_p():
                nonlocal buf
                if buf:
                    parts.append(f"<p>{esc(' '.join(buf))}</p>")
                    buf = []

            for ln in lines:
                if looks_like_list_item(ln):
                    flush_p()
                    if list_tag is None:
                        list_tag = "ol" if re.match(r"^\d", ln) else "ul"
                    item = LIST_PREFIX.sub("", ln)
                    list_buf.append(f"<li>{esc(item)}</li>")
                else:
                    flush_list()
                    if is_headingish(ln):
                        flush_p()
                        title = ln.title() if ln.isupper() else ln
                        parts.append(f"<h2>{esc(title)}</h2>")
                    elif ln.startswith("--"):
                        flush_p()
                        parts.append(f"<p>{esc(DASH_PREFIX.sub('', ln))}</p>")
                    else:
                        buf.append(ln)
            flush_p()
            flush_list()
        else:
            for ln in lines:
                if is_headingish(ln):
                    title = ln.title() if ln.isupper() else ln
                    parts.append(f"<h2>{esc(title)}</h2>")
                else:
                    parts.append(f"<p>{esc(ln)}</p>")
    return "\n".join(parts)


def convert_19s(text: str) -> str:
    text = normalize(text)
    lines = [ln.strip() for ln in text.split("\n") if ln.strip()]
    if len(lines) == 1:
        chunks = re.split(r"(?=\d+-tie\)|\d+\))", lines[0])
        lines = [c.strip() for c in chunks if c.strip()]
    parts = []
    ranked, rest_start = [], 0
    for i, ln in enumerate(lines):
        if re.match(r"^(\d+-tie\)|\d+\))", ln):
            ranked.append(ln)
            rest_start = i + 1
        elif ranked:
            break
        else:
            parts.append(f"<p>{esc(ln)}</p>")
            rest_start = i + 1
    if ranked:
        parts.append("<h2>All 19s</h2><ol>")
        for ln in ranked:
            item = RANK_PREFIX.sub("", ln)
            parts.append(f"<li>{esc(item)}</li>")
        parts.append("</ol>")
    remaining = lines[rest_start:]
    section = None
    buf = []

    def flush():
        nonlocal buf, section
        if not buf:
            return
        if section:
            parts.append(f"<h2>{esc(section)}</h2>")
        list_items = [
            x
            for x in buf
            if re.match(r"^(\d+-tie\)|\d+\)|4-tie\))", x) or x.startswith("--")
        ]
        prose = [x for x in buf if x not in list_items]
        for p in prose:
            parts.append(f"<p>{esc(p)}</p>")
        if list_items:
            if list_items[0].startswith("--"):
                parts.append("<ul>")
                for x in list_items:
                    parts.append(f"<li>{esc(DASH_PREFIX.sub('', x))}</li>")
                parts.append("</ul>")
            else:
                parts.append("<ol>")
                for x in list_items:
                    parts.append(f"<li>{esc(RANK_PREFIX.sub('', x))}</li>")
                parts.append("</ol>")
        buf = []

    for ln in remaining:
        if (
            ln.startswith("There are 5 teams")
            or ln.startswith("Here is the order")
            or ln.startswith("Some interesting")
        ):
            flush()
            if ln.startswith("There are 5"):
                parts.append(f"<p>{esc(ln)}</p>")
                section = "First 19 by Team"
            elif "most 19" in ln.lower():
                section = "Most 19's in Team History"
            elif "interesting" in ln.lower():
                section = "Interesting Facts"
            else:
                section = None
                parts.append(f"<p>{esc(ln)}</p>")
        else:
            buf.append(ln)
    flush()
    return "\n".join(parts)


def convert_best_times(text: str) -> str:
    text = normalize(text)
    lines = [ln.strip() for ln in text.split("\n") if ln.strip()]
    parts, items = [], []
    for ln in lines:
        if re.match(
            r"^(3 Man|B-Ladder|C-Ladder|C-Hose|B-Hose|Efficiency|Motor Pump|Buckets):", ln
        ):
            items.append(ln)
        else:
            parts.append(f"<p>{esc(ln)}</p>")
    if items:
        parts.append("<ul>")
        for ln in items:
            label, rest = ln.split(":", 1)
            parts.append(f"<li><strong>{esc(label)}:</strong> {esc(rest.strip())}</li>")
        parts.append("</ul>")
        return "\n".join(parts)
    return convert_generic(text)


def convert_three_peats(text: str) -> str:
    text = normalize(text)
    lines = [ln.strip() for ln in text.split("\n") if ln.strip()]
    try:
        idx = lines.index("Year")
        data = lines[idx + 4 :]
    except ValueError:
        return convert_generic(text)
    cut = None
    for i, ln in enumerate(data):
        if ln == "State Drill Three-Peats" or ln.startswith("2024 was the"):
            cut = i
            break
    if cut is not None:
        narrative, data = data[cut:], data[:cut]
    else:
        narrative = []
    rows, i = [], 0
    while i < len(data):
        if re.match(r"^\d{4}$", data[i]):
            year, team, winner = data[i], data[i + 1], data[i + 2]
            loc = ""
            if i + 3 < len(data) and not re.match(r"^\d{4}$", data[i + 3]):
                loc = data[i + 3]
                i += 4
            else:
                i += 3
            rows.append((year, team, winner, loc))
        else:
            i += 1
    parts = [
        "<table>",
        "<thead><tr><th>Year</th><th>Team Going for 3rd Straight</th><th>Winner</th><th>Location</th></tr></thead>",
        "<tbody>",
    ]
    for year, team, winner, loc in rows:
        parts.append(
            f"<tr><td>{esc(year)}</td><td>{esc(team)}</td><td>{esc(winner)}</td><td>{esc(loc)}</td></tr>"
        )
    parts.append("</tbody></table>")
    for ln in narrative:
        if ln != "State Drill Three-Peats":
            parts.append(f"<p>{esc(ln)}</p>")
    return "\n".join(parts)


def convert_ladder_sweeps(text: str) -> str:
    text = normalize(text)
    lines = [ln.strip() for ln in text.split("\n") if ln.strip()]
    parts = [f"<p>{esc(lines[0])}</p>"] if lines else []
    body = lines[1:]
    try:
        sum_idx = next(i for i, ln in enumerate(body) if ln.startswith("To Sum Up"))
        table_lines, summary = body[:sum_idx], body[sum_idx:]
    except StopIteration:
        table_lines, summary = body, []
    skip = {"Year", "Cimber", "Climber", "Team", "3-Man", "B-Ladder", "C-Ladder", "Notes"}
    attempts, cur = [], None
    for ln in table_lines:
        if ln in skip:
            continue
        if re.match(r"^\d{4}$", ln):
            if cur:
                attempts.append(cur)
            cur = {"year": ln, "lines": []}
        elif cur is not None:
            cur["lines"].append(ln)
    if cur:
        attempts.append(cur)
    for att in attempts:
        parts.append(f"<h2>{esc(att['year'])}</h2>")
        parts.append("<p>" + esc(" · ".join(att["lines"])) + "</p>")
    for ln in summary:
        if ln.startswith("To Sum Up"):
            parts.append("<h2>To Sum Up</h2>")
        else:
            parts.append(f"<p>{esc(ln)}</p>")
    return "\n".join(parts)


def convert_leaderboard_cells(text: str) -> str:
    text = normalize(text)
    lines = [ln.strip() for ln in text.split("\n") if ln.strip()]
    parts, i = [], 0
    while i < len(lines) and lines[i] != "Name":
        parts.append(f"<p>{esc(lines[i])}</p>")
        i += 1
    header_stop = {
        "Name",
        "Team",
        "Years Running Hydrant",
        "Years Running Nozzle",
        "Years Climbing",
        "Third Man",
        "Total Sevens",
        "Total Sub 6.50s",
        "790s",
        "780s",
        "770s",
        "760s",
        "750s and lower",
        "640s",
        "630s",
        "620s",
        "6.1s",
        "6.0s",
    }
    while i < len(lines) and (lines[i] in header_stop or lines[i].endswith("and lower")):
        i += 1

    def is_num(s):
        return bool(re.match(r"^\d+$", s))

    records, cur = [], []
    while i < len(lines):
        ln = lines[i]
        if (
            cur
            and not is_num(ln)
            and re.search(r"[A-Za-z]", ln)
            and not re.match(r"^\d{4}", ln)
            and len(cur) >= 6
        ):
            if is_num(cur[-1]) or (len(cur) > 1 and is_num(cur[-2])):
                records.append(cur)
                cur = [ln]
                i += 1
                continue
        cur.append(ln)
        i += 1
    if cur:
        records.append(cur)
    parts.append(
        "<table><thead><tr><th>Name</th><th>Team / Years</th><th>Total</th><th>Breakdown</th></tr></thead><tbody>"
    )
    for rec in records:
        total_idx = None
        for j, x in enumerate(rec):
            if is_num(x) and j >= 2 and j + 1 < len(rec) and is_num(rec[j + 1]):
                total_idx = j
                break
        if total_idx is None:
            joined = " | ".join(rec)
            parts.append(f"<tr><td colspan='4'>{esc(joined)}</td></tr>")
            continue
        name_team_years, nums = rec[:total_idx], rec[total_idx:]
        name_parts, rest_parts = [], []
        for x in name_team_years:
            if re.search(r"\d", x) or rest_parts:
                rest_parts.append(x)
            else:
                name_parts.append(x)
        name = " ".join(name_parts) if name_parts else name_team_years[0]
        meta = " ".join(rest_parts)
        total = nums[0] if nums else ""
        details = ", ".join(nums[1:]) if len(nums) > 1 else ""
        parts.append(
            f"<tr><td>{esc(name)}</td><td>{esc(meta)}</td><td>{esc(total)}</td><td>{esc(details)}</td></tr>"
        )
    parts.append("</tbody></table>")
    return "\n".join(parts)


def convert_lindy_streak(text: str) -> str:
    text = normalize(text)
    lines = [ln.strip() for ln in text.split("\n") if ln.strip()]
    parts, i = [], 0
    while i < len(lines) and not re.match(r"^\d{4}$", lines[i]) and lines[i] != "Year":
        parts.append(f"<p>{esc(lines[i])}</p>")
        i += 1
    skip = {
        "Year",
        "3Man",
        "3man",
        "B-Ladder",
        "C-Ladder",
        "C-Hose",
        "B-Hose",
        "Efficiency",
        "Pump",
        "Motor Pump",
        "Buckets",
        "Total Pts.",
        "Total Points",
    }
    year_blocks = []
    while i < len(lines):
        if lines[i].startswith("Total scoring") or lines[i].startswith("Placed in"):
            break
        if lines[i] in skip:
            i += 1
            continue
        if re.match(r"^\d{4}$", lines[i]):
            year = lines[i]
            i += 1
            cells = []
            while (
                i < len(lines)
                and not re.match(r"^\d{4}$", lines[i])
                and not lines[i].startswith("Total scoring")
                and lines[i] not in skip
            ):
                cells.append(lines[i])
                i += 1
            year_blocks.append((year, cells))
        else:
            i += 1
    parts.append("<table><thead><tr><th>Year</th><th>Results</th></tr></thead><tbody>")
    for year, cells in year_blocks:
        if cells:
            joined = " · ".join(cells)
            parts.append(f"<tr><td>{esc(year)}</td><td>{esc(joined)}</td></tr>")
    parts.append("</tbody></table>")
    while i < len(lines):
        parts.append(f"<p>{esc(lines[i])}</p>")
        i += 1
    return "\n".join(parts)


def convert_dense_stats(text: str) -> str:
    text = normalize(text)
    lines = text.split("\n")
    parts, buf = [], []

    def flush_buf():
        nonlocal buf
        if not buf:
            return
        sub = [ln.strip() for ln in "\n".join(buf).split("\n") if ln.strip()]
        buf = []
        if not sub:
            return
        listish = sum(1 for ln in sub if re.search(r"\d", ln) and len(ln) < 120)
        if listish >= 3:
            parts.append("<ul>")
            for ln in sub:
                parts.append(f"<li>{esc(ln)}</li>")
            parts.append("</ul>")
        else:
            for ln in sub:
                parts.append(f"<p>{esc(ln)}</p>")

    for ln in lines:
        raw = ln.strip()
        if not raw:
            buf.append("")
            continue
        if is_headingish(raw) and len(raw) >= 12:
            flush_buf()
            title = re.sub(r"\s+", " ", raw.title() if raw.isupper() else raw)
            parts.append(f"<h2>{esc(title)}</h2>")
        else:
            buf.append(raw)
    flush_buf()
    return "\n".join(parts)


def convert_top5(text: str) -> str:
    text = normalize(text)
    lines = [ln.strip() for ln in text.split("\n") if ln.strip()]
    parts, i = [], 0
    while i < len(lines):
        ln = lines[i]
        if ln.startswith("Top 5"):
            parts.append(f"<h2>{esc(ln)}</h2>")
            i += 1
            while i < len(lines) and lines[i] in ("Year", "1st", "2nd", "3rd", "4th", "5th"):
                i += 1
            parts.append(
                "<table><thead><tr><th>Year</th><th>1st</th><th>2nd</th><th>3rd</th><th>4th</th><th>5th</th></tr></thead><tbody>"
            )
            while i < len(lines) and not lines[i].startswith("Top 5"):
                if re.match(r"^\d{4}$", lines[i]):
                    year = lines[i]
                    i += 1
                    places = []
                    while (
                        i < len(lines)
                        and not re.match(r"^\d{4}$", lines[i])
                        and not lines[i].startswith("Top 5")
                        and lines[i] not in ("Year", "1st", "2nd", "3rd", "4th", "5th")
                    ):
                        places.append(lines[i])
                        i += 1
                    while len(places) < 5:
                        places.append("")
                    cells = "".join(f"<td>{esc(p)}</td>" for p in places[:5])
                    parts.append(f"<tr><td>{esc(year)}</td>{cells}</tr>")
                else:
                    i += 1
            parts.append("</tbody></table>")
        else:
            i += 1
    return "\n".join(parts)


converters = {
    "19s in Buckets.txt": convert_19s,
    "8s in C-Ladder.txt": convert_generic,
    "5s in Motor Pump.txt": convert_generic,
    "Best Times Per Event To Not Score Points.txt": convert_best_times,
    "State Drill Three-Peats.txt": convert_three_peats,
    "Attempts at Ladder Sweeps at the State Drill.txt": convert_ladder_sweeps,
    "The 4 list.txt": convert_generic,
    "Sevens by Hydrantmen in Racing History.txt": convert_leaderboard_cells,
    "Sevens by Nozzlemen in Racing History.txt": convert_leaderboard_cells,
    "Three Man Ladder Six-Fives or Faster.txt": convert_leaderboard_cells,
    "North Lindy State Drill Scoring Streak Chart.txt": convert_lindy_streak,
    "State Drill Stats General Information.txt": convert_dense_stats,
    "State Drill Stats for All 8 Contests.txt": convert_dense_stats,
    "State Drill Stats Top 5 Per Contest for Every Year.txt": convert_top5,
}

index = []
for n, (fname, title) in enumerate(ORDER, 1):
    raw = (src / fname).read_text(errors="replace")
    doc = converters.get(fname, convert_generic)(raw).strip() + "\n"
    safe = re.sub(r"[^\w\-]+", "-", title).strip("-").lower()
    out_path = out_dir / f"{n:02d}-{safe}.html"
    out_path.write_text(doc, encoding="utf-8")
    index.append((n, title, out_path.name, len(doc)))
    print(f"{n:02d}. {title} ({len(doc)} chars)")

(out_dir / "00-INDEX.txt").write_text(
    "Paste into Admin Articles HTML mode. Tag: twanny-stat-files. Author suggestion: Twanny.\n\n"
    + "\n".join(f"{n}. {title}\n   file: {name}" for n, title, name, _ in index),
    encoding="utf-8",
)
print("Wrote", len(index), "files to", out_dir)
