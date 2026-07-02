"""Core sheets: Home, RUF 101 framework guide, Dashboard."""

from ruf_style import *


def build_home(wb):
    ws = wb.create_sheet("🏠 Home", 0)
    N = 6
    page_setup(ws, PRIMARY)
    set_col_widths(ws, [4, 34, 46, 34, 34, 10])
    r = banner(ws, 1, N, "Risk Up Front — Project Mega Workbook",
               "Four principles. Four documents. Two meetings. — A complete, living toolkit for running a project the RUF way, built for humans AND AI agents.",
               PRIMARY, "🚀")
    r += 0

    r = section(ws, r, N, "Welcome", PRIMARY, "👋")
    r = big_text_block(ws, r, N, [
        "This workbook is the single source of truth for a project run with the Risk Up Front (RUF) approach "
        "(Josephs & Rubenstein, 'Risk Up Front: Managing Projects in a Complex World', 2018).",
        "It does three jobs at once:",
        "   1️⃣  TEMPLATES — every RUF artifact, ready to fill in: Project Statement, Team List, Individual Accountabilities, "
        "Risk Action Plan, Weekly Schedule, WAM log, plus the supporting logs and the Cost of Being Late.",
        "   2️⃣  TEACHER — the 📖 RUF 101 sheet and per-sheet help boxes teach the framework as you use it. A new team member "
        "(or a brand-new AI agent) can become fluent in RUF from this file alone.",
        "   3️⃣  AI-NATIVE — the 🤖 sheets give any AI agent full framework context, this workbook's exact schema, and "
        "step-by-step prompt instructions for ingesting meeting transcripts and emails into the right sheets.",
    ], size=11, line_height=16)
    r += 1

    r = section(ws, r, N, "The RUF system at a glance", PRIMARY, "🧭")
    r = table_header(ws, r, ["", "4 PRINCIPLES (the culture)", "4 DOCUMENTS (the paper)", "2 MEETINGS (the rhythm)", "4 LEVERS (how culture changes)", ""], PRIMARY)
    rows = [
        ["", "Accountability — 'Singular ownership of a result'", "📜 Project Statement", "Definition Meeting (DKDK)", "Language", ""],
        ["", "Transparency — 'Team-wide clarity of what is so'", "👥 Team List + 🧭 Individual Accountabilities", "🤝 Weekly Accountability Meeting", "Structures", ""],
        ["", "Integrity — 'Do what you say'", "📅 Weekly Schedule", "", "Practices", ""],
        ["", "Commitment — 'It will be so, even in the face of circumstances'", "⚠️ Risk Action Plan (RAP)", "", "Metrics", ""],
    ]
    fills_by_row = [ACCOUNT, TRANSPAR, INTEGRITY, COMMIT]
    for i, row_vals in enumerate(rows):
        r = body_row(ws, r, row_vals, height=26, fills_map={1: None} if False else None)
        ws.cell(row=r - 1, column=2).font = Font(name=FONT, size=10, bold=True, color=fills_by_row[i])
    r += 1

    r = section(ws, r, N, "Map of this workbook", PRIMARY, "🗺")
    r = table_header(ws, r, ["", "Sheet", "What it is", "Who uses it", "When", ""], PRIMARY)
    toc = [
        ("📖 RUF 101", "The framework explained: principles, levers, CEI risk form, meetings, timeline, glossary", "Everyone — read first", "Once, then as reference"),
        ("📜 Project Statement", "The 1–3 page charter around the 5W tradeoff; the object of team commitment", "Project Leader + team", "Definition; reviewed weekly"),
        ("👥 Team List", "Names (never titles alone), accountabilities, allocation, explicit agreement", "Project Leader", "Definition; kept current"),
        ("🧭 Individual Accountab.", "One block per person: the results they singularly own", "Every team member", "Definition"),
        ("⚠️ Risk Action Plan", "Risks in Cause–Effect–Impact form, owners, mitigation actions", "Whole team", "Continuously; walked at every WAM"),
        ("✅ Actions", "Every owned, dated task (mitigations, cleanups, follow-ups)", "Owners", "Continuously"),
        ("📅 Weekly Schedule", "The project as weekly deliverables, one owner each, done/not-done", "Whole team", "Weekly"),
        ("🤝 WAM Agenda & Log", "Standing agenda + one log row per weekly meeting", "Project Leader (chair)", "Every week"),
        ("🚧 Issues Log", "Known present problems (risks that happened live here)", "Owners", "As they arise"),
        ("🧮 Decision Log", "Decisions written down = transparency", "Everyone", "As decided"),
        ("💸 Cost of Being Late", "Linear + nonlinear lateness costs and the agreed narrative", "Team + stakeholders", "Definition; on change"),
        ("🗂 Accountability Matrix", "Deliverables × owners: find gaps and collisions", "Project Leader", "Definition; on change"),
        ("💡 Opportunity Sheet", "Pre-project capture of opportunities", "Sponsors", "Before Definition"),
        ("📊 Dashboard", "Weekly completion rate, risk burn-down, integrity metrics", "Everyone", "Auto/weekly"),
        ("🤖 AI · Framework Context", "Dense RUF context so an AI agent becomes fluent in the method", "AI agents", "On first read"),
        ("🤖 AI · Workbook Schema", "Machine-readable map: every sheet, column, enum, ID scheme, update rules", "AI agents", "Before any write"),
        ("🤖 AI · Transcript Ingestion", "Prompt instructions: meeting transcript → RAP/Actions/WAM log/Decisions", "AI agents", "After each meeting"),
        ("🤖 AI · Email Ingestion", "Prompt instructions: email threads → commitments, risks, decisions, issues", "AI agents", "On email batches"),
    ]
    for name, what, who, when in toc:
        r = body_row(ws, r, ["", name, what, who, when, ""], bold_cols=(1,), height=26)
    r += 1

    r = section(ws, r, N, "Color legend", PRIMARY, "🎨")
    legend = [
        ("Emerald", ACCOUNT, "Accountability / Team sheets"),
        ("Azure", TRANSPAR, "Transparency / Schedule"),
        ("Bronze", INTEGRITY, "Integrity / Costs & logs"),
        ("Plum", COMMIT, "Commitment / WAM"),
        ("Crimson", C_RAP, "Risk Action Plan"),
        ("Violet", C_AI, "AI-agent sheets"),
    ]
    for name, color, meaning in legend:
        c = ws.cell(row=r, column=2, value="  " + name)
        c.fill = fill(color); c.font = Font(name=FONT, size=10, bold=True, color=PAPER)
        m = ws.cell(row=r, column=3, value=meaning)
        m.font = Font(name=FONT_BODY, size=10, color=INK)
        ws.row_dimensions[r].height = 18
        r += 1
    r += 1
    r = section(ws, r, N, "Quick start (a PM's first hour)", PRIMARY, "⚡")
    r = big_text_block(ws, r, N, [
        "1. Read 📖 RUF 101 (10 min).   2. Draft the 📜 Project Statement — especially WHY NOT.   3. Put names on 👥 Team List.",
        "4. Run a risk-surfacing session and load the ⚠️ RAP in CEI form.   5. Fill 💸 Cost of Being Late with the team.",
        "6. Hold the Definition Meeting (line-by-line read of the Statement).   7. Retire the biggest novel risks.",
        "8. Team Commitment decision point → dates flip from Target to Committed.   9. Run 🤝 WAMs weekly; score the 📅 Weekly Schedule; watch the 📊 Dashboard.",
    ], size=10, line_height=16)
    r = note(ws, r, N, "Fidelity note: canonical definitions quoted from the authors' published Chapter 1 and excerpts; rules of thumb (e.g., the ~25–30% risk-retirement bar) are practitioner-reported. See the companion document RISK-UP-FRONT-GUIDE.md for sources.")
    return ws


def build_ruf101(wb):
    ws = wb.create_sheet("📖 RUF 101")
    N = 6
    page_setup(ws, PRIMARY)
    set_col_widths(ws, [4, 30, 40, 40, 40, 10])
    r = banner(ws, 1, N, "RUF 101 — The Framework in One Sheet",
               "Everything a human needs to run this workbook the Risk Up Front way. (AI agents: your denser version is 🤖 AI · Framework Context.)",
               PRIMARY, "📖")

    r = section(ws, r, N, "The big idea", PRIMARY, "💡")
    r = big_text_block(ws, r, N, [
        "Projects live on a cost-of-change curve: changes are cheap early and brutally expensive late. 'It's like gravity: it's there whether you believe in it or not.'",
        "Left alone, teams do the opposite of what the curve demands — 'optimistic procrastination': assume all will go smoothly and defer risk work until later. Urgency then arrives exactly when changes cost the most (the death march).",
        "RUF's one move: SHIFT URGENCY TO THE FRONT. Force risks, disagreements and hidden assumptions into the open during Definition, when they are cheap to fix. The whole method — four principles, four documents, two meetings — is machinery for that one move.",
        "The most dangerous risks live in the team's BLIND SPOT (what it doesn't know it doesn't know). 'The fact that an individual knows something is different than a team knowing something.' RUF's documents and meetings exist to drain the blind spot systematically.",
    ], size=10, line_height=15)
    r += 1

    r = section(ws, r, N, "The four principles (canonical definitions)", PRIMARY, "🏛")
    r = table_header(ws, r, ["", "Principle", "Canonical definition", "What it looks like in practice", "Anti-pattern it kills", ""], PRIMARY)
    P = [
        ("Accountability", "'Singular ownership of a result.'",
         "Every deliverable, risk and action has exactly ONE name — a person, never a title or department. Owners AGREE to accountabilities (not assigned unilaterally) and are on the hook to CAUSE the result, finding resources if needed.",
         "Shared ownership; 'the team owns it'; project democracy (consensus inside an owner's area).", ACCOUNT),
        ("Transparency", "'Team-wide clarity of what is so.'",
         "Decisions written down in actively reviewed documents; line-by-line team review; measurable success criteria everyone confirms they truly agree on; over-communication as default.",
         "Private knowledge, hallway decisions, status theater.", TRANSPAR),
        ("Integrity", "'Do what you say.'",
         "Depersonalized: 'Was a commitment made, and was it kept?' When a commitment is at risk, the owner cleans it up EARLY — before the date. Publicly accounting for results improves results.",
         "Silent slips; discovering misses after the deadline.", INTEGRITY),
        ("Commitment", "'It will be so, even in the face of circumstances.'",
         "Language of commitment ('I will deliver X by Y') replaces language of hope ('I'll try'). Before accepting: Do we agree what done means? What might prevent it? The right to say no is what makes yes meaningful.",
         "Weasel words; imposed dates; 'yes' without room for 'no'.", COMMIT),
    ]
    for name, defn, practice, anti, color in P:
        r = body_row(ws, r, ["", name, defn + "  " + practice[:0], practice, anti, ""], height=64)
        ws.cell(row=r - 1, column=2).font = Font(name=FONT, size=11, bold=True, color=PAPER)
        ws.cell(row=r - 1, column=2).fill = fill(color)
        ws.cell(row=r - 1, column=3).font = Font(name=FONT_BODY, size=10, bold=True, color=color)
        ws.cell(row=r - 1, column=3).value = defn
    r += 1

    r = section(ws, r, N, "The four levers — how you actually change culture", PRIMARY, "🎚")
    r = big_text_block(ws, r, N, [
        "Principles are engineered into a team via four levers (distinct from the principles — a common confusion):",
        "  •  LANGUAGE — driving values through conversation (commitment language, CEI risk form, 'accountable owner').",
        "  •  STRUCTURES — how you spend money and deploy resources (cross-functional team from day one, singular ownership).",
        "  •  PRACTICES — reliably repeated or triggered activities (line-by-line review, Definition Meeting, WAM).",
        "  •  METRICS — the results you choose to measure ('the simple act of transparently accounting for results improves results'): weekly completion rate, risks retired, commitments kept.",
    ], size=10, line_height=15)
    r += 1

    r = section(ws, r, N, "The language of risk — CEI form", C_RAP, "⚠️")
    r = big_text_block(ws, r, N, [
        "Every risk is stated as: 'Because of [CAUSE — a fact, verifiably true today], [EFFECT — an uncertain future event] may occur, resulting in [IMPACT — consequence to the project].'",
        "CAUSE must be a present fact (kills vague anxiety, forces evidence). EFFECT is uncertain and future (if it already happened it's an ISSUE, not a risk). IMPACT ties it to schedule/cost/scope/quality — which is what justifies spending on mitigation.",
        "Prioritize by exposure AND by NOVELTY: a risk this team has retired ten times is routine regardless of impact; a risk nobody here has retired before deserves the scarce early urgency.",
        "The standing weekly question: 'What is the most likely reason this project will fail?' — the answer always goes on the RAP with an owner.",
    ], size=10, line_height=15)
    r += 1

    r = section(ws, r, N, "The two meetings — and the DKDK taxonomy", C_WAM, "🤝")
    r = big_text_block(ws, r, N, [
        "RUF sorts meetings into three types: ISSUE meetings (solve known problems, small group), DKDK meetings ('Don't Know you Don't Know' — reveal blind-spot issues, do NOT solve on the spot), and INFORMATIONAL meetings (update stakeholders).",
        "Both signature RUF meetings are DKDK meetings:",
        "  •  DEFINITION MEETING — early; full cross-functional team + stakeholders; the Project Statement is read line by line; risks are harvested; the 5W tradeoff converges. A fattened RAP is success, not failure.",
        "  •  WEEKLY ACCOUNTABILITY MEETING (WAM) — the heartbeat: start on time → score last week's commitments (done/not-done, compute completion rate) → clean up broken ones → walk the RAP → ask the standing failure question → commit next week → end on time.",
    ], size=10, line_height=15)
    r += 1

    r = section(ws, r, N, "The timeline — Definition → Commitment → Delivery", C_SCHED, "🛤")
    r = big_text_block(ws, r, N, [
        "DEFINITION (urgency deliberately high): draft the Project Statement around the 5Ws (Why, What, When, Who, WHY NOT); build the Team List; load the RAP; agree the Cost of Being Late; start retiring the biggest, most novel risks BEFORE committing.",
        "TEAM COMMITMENT (the pivotal decision point): only when the whole cross-functional team is confident — practitioners cite ~25–30% of early-identified risks retired — the team commits out loud to the Project Statement. Dates flip from Target to Committed.",
        "DELIVERY: the weekly engine — Weekly Schedule of owned deliverables, WAM every week, RAP continuously refreshed. Changes still happen, but they surface within a week and are handled consciously against the cost of being late.",
        "CLOSE: verify success criteria; audit the blind spot (what bit us that was never on the RAP?); feed lessons to the portfolio.",
    ], size=10, line_height=15)
    r += 1

    r = section(ws, r, N, "Mini-glossary", PRIMARY, "📚")
    gl = [
        ("Blind Spot", "What the team doesn't know it doesn't know — the source of the worst risks."),
        ("CEI", "Cause–Effect–Impact: the mandatory linguistic form of a risk."),
        ("Cleanup", "Proactively flagging + renegotiating an at-risk commitment BEFORE its date. Integrity in action."),
        ("Cost of Being Late", "Agreed narrative + numbers (linear per-week + nonlinear step costs) of lateness. Prices urgency."),
        ("Decision Point", "RUF's lightweight gate; Team Commitment is the pivotal one."),
        ("DKDK Meeting", "'Don't Know you Don't Know' — reveals blind-spot issues; never solves on the spot."),
        ("Language of hope", "'I'll try', 'should be fine', 'hopefully' — effort-talk that predicts nothing. Replace with commitment."),
        ("Optimistic procrastination", "The default tendency to assume smooth sailing and defer risk work to 'later'."),
        ("RAP", "Risk Action Plan — the CEI-form risk register with owners and dated mitigation actions."),
        ("Retire (a risk)", "Mitigate to closure. ~25–30% of early risks retired ≈ ready to commit (rule of thumb)."),
        ("WAM", "Weekly Accountability Meeting — the weekly DKDK heartbeat."),
        ("Weekly completion rate", "% of the week's committed deliverables done. RUF's signature health metric."),
        ("5W Tradeoff", "Why, What, When, Who, WHY NOT — the frame of the Project Statement."),
    ]
    r = table_header(ws, r, ["", "Term", "Meaning", "", "", ""], PRIMARY)
    for term, meaning in gl:
        ws.merge_cells(start_row=r, start_column=3, end_row=r, end_column=5)
        r = body_row(ws, r, ["", term, meaning, "", "", ""], bold_cols=(1,), height=22)
    return ws


def build_dashboard(wb):
    ws = wb.create_sheet("📊 Dashboard")
    N = 8
    page_setup(ws, GOOD)
    set_col_widths(ws, [16, 22, 18, 18, 18, 18, 18, 30])
    r = banner(ws, 1, N, "Project Health Dashboard",
               "Metrics are a lever: 'The simple act of transparently accounting for results improves results.' Review at every WAM.",
               GOOD, "📊")
    r = helpbox(ws, r, N,
        "HOW TO USE: The counters below compute automatically from the other sheets. The weekly table is filled at each WAM "
        "(or by an AI agent ingesting the meeting transcript). Trend matters more than any single number: a falling completion "
        "rate is the earliest warning the project has. Novel-P1 risks sitting Open for weeks = your real status, whatever the schedule says.", accent=GOOD)
    r += 1

    r = section(ws, r, N, "Live counters (auto-computed)", GOOD, "🔢")
    counters = [
        ("Risks — total on RAP", "=COUNTA('⚠️ Risk Action Plan'!A7:A37)", "Growing fast in Definition is GOOD (blind spot draining)"),
        ("Risks — Open", "=COUNTIF('⚠️ Risk Action Plan'!L7:L37,\"Open\")", "Un-owned or un-mitigated exposure"),
        ("Risks — Mitigating", "=COUNTIF('⚠️ Risk Action Plan'!L7:L37,\"Mitigating\")", "Work in flight"),
        ("Risks — Retired", "=COUNTIF('⚠️ Risk Action Plan'!L7:L37,\"Retired\")", "Progress! Gate: ~25–30% retired before commitment"),
        ("Risks — became issues", "=COUNTIF('⚠️ Risk Action Plan'!L7:L37,\"Became issue\")", "Risks that struck — check the Issues Log"),
        ("% early risks retired", "=IF(COUNTA('⚠️ Risk Action Plan'!A7:A37)=0,\"—\",ROUND(COUNTIF('⚠️ Risk Action Plan'!L7:L37,\"Retired\")/COUNTA('⚠️ Risk Action Plan'!A7:A37)*100,0))", "Commitment-gate rule of thumb: ~25–30%"),
        ("Actions — open", "=COUNTIF('✅ Actions'!F7:F40,\"Not started\")+COUNTIF('✅ Actions'!F7:F40,\"In progress\")", "Every one has ONE owner and a date"),
        ("Actions — missed (no cleanup)", "=COUNTIF('✅ Actions'!H7:H40,\"No — missed\")", "Integrity leak — discuss at WAM, without blame"),
        ("Issues — open", "=COUNTIF('🚧 Issues Log'!F7:F30,\"Open\")+COUNTIF('🚧 Issues Log'!F7:F30,\"In work\")", "Solve in issue meetings, not the WAM"),
        ("Team — pending agreement", "=COUNTIF('👥 Team List'!F7:F25,\"Pending\")+COUNTIF('👥 Team List'!F7:F25,\"Declined\")", "Accountability requires agreement"),
    ]
    r = table_header(ws, r, ["Metric", "Value", "Reading it", "", "", "", "", ""], GOOD)
    for label, formula, hint in counters:
        ws.merge_cells(start_row=r, start_column=3, end_row=r, end_column=N)
        vals = [label, formula, hint, "", "", "", "", ""]
        r = body_row(ws, r, vals, bold_cols=(0,), height=22)
        vc = ws.cell(row=r - 1, column=2)
        vc.font = Font(name=FONT, size=12, bold=True, color=PRIMARY)
        vc.alignment = Alignment(horizontal="center", vertical="center")
    r += 1

    r = section(ws, r, N, "Weekly completion rate — the signature metric", GOOD, "📈")
    r = helpbox(ws, r, N, "Each week: Committed = rows on 📅 Weekly Schedule scored at the WAM; Done = those scored 'Done'. "
                "Rate = Done ÷ Committed. Healthy teams run high-80s to 90s%. 100% every week can mean sandbagged commitments; "
                "a falling trend is the earliest warning you will get. Chart this!", accent=GOOD)
    hdr = r
    r = table_header(ws, r, ["Week #", "Week of (Mon)", "Committed", "Done", "Rate %", "New risks added", "Risks retired", "WAM notes"], GOOD)
    for i in range(24):
        row_vals = [i + 1, "", "", "", f"=IF(OR(C{r}=\"\",C{r}=0),\"\",ROUND(D{r}/C{r}*100,0))", "", "", ""]
        r = body_row(ws, r, row_vals, center_cols=(0, 2, 3, 4, 5, 6), height=20, zebra=(i % 2 == 1))
    last = r - 1
    formula_conditional(ws, f"E{hdr+1}:E{last}", f"AND(ISNUMBER(E{hdr+1}),E{hdr+1}<70)", PAPER, BAD)
    formula_conditional(ws, f"E{hdr+1}:E{last}", f"AND(ISNUMBER(E{hdr+1}),E{hdr+1}>=70,E{hdr+1}<85)", INK, WARN_BG)
    formula_conditional(ws, f"E{hdr+1}:E{last}", f"AND(ISNUMBER(E{hdr+1}),E{hdr+1}>=85)", GOOD, GOOD_BG)
    freeze(ws, f"A{hdr+1}")
    return ws
