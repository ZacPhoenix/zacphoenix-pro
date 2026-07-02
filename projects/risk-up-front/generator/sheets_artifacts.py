"""RUF artifact template sheets: Project Statement, Team List, Individual
Accountabilities, RAP, Weekly Schedule, WAM, Issues, Decisions, Cost of Being
Late, Accountability Matrix, Opportunity Sheet."""

from ruf_style import *


def build_project_statement(wb):
    ws = wb.create_sheet("📜 Project Statement")
    N = 6
    page_setup(ws, C_STATEMENT)
    set_col_widths(ws, [22, 28, 28, 28, 28, 28])
    r = banner(ws, 1, N, "RUF Project Statement",
               "One to three pages. The object of team commitment. Read line-by-line at the Definition Meeting. Built on the 5W Tradeoff: Why · What · When · Who · Why Not.",
               C_STATEMENT, "📜")
    r = helpbox(ws, r, N,
        "HOW TO USE: Fill every field in plain language a new team member could understand. Keep it short enough to read aloud. "
        "Every date is a TARGET until the Team Commitment decision point — then it becomes a COMMITMENT. Review this document at every WAM; "
        "any edit after commitment is a conscious, visible change decision.", accent=C_STATEMENT)
    r += 1

    r = section(ws, r, N, "Identity", C_STATEMENT, "🪪")
    r = label_value(ws, r, "Project Name", "", N, C_STATEMENT, height=22)
    r = label_value(ws, r, "Project Leader", "", N, C_STATEMENT, height=22,)
    r = note(ws, r, N, "One name. The singular accountable owner of the project result — never a department or a pair.")
    r = label_value(ws, r, "Status", "Definition", N, C_STATEMENT, height=22)
    add_dv(ws, ["Definition", "Committed", "Delivery", "Released", "Closed", "On Hold", "Cancelled"],
           f"B{r-1}", "Project status")
    r = label_value(ws, r, "Version / Last updated", "v0.1 — ", N, C_STATEMENT, height=22)
    r += 1

    r = section(ws, r, N, "WHY — The Opportunity", C_STATEMENT, "❓")
    r = helpbox(ws, r, N, "Why this project, why now? What happens if we do nothing? This is the story that justifies the team's urgency.", accent=C_STATEMENT)
    r = label_value(ws, r, "Opportunity / Problem", "", N, C_STATEMENT, height=60)
    r = label_value(ws, r, "Strategic fit", "", N, C_STATEMENT, height=40)
    r += 1

    r = section(ws, r, N, "WHAT — Deliverables & Success Criteria", C_STATEMENT, "🎯")
    r = helpbox(ws, r, N, "Deliverables are nouns, verifiable as done/not-done. Success criteria must be MEASURABLE and 'necessary and sufficient' — "
                "every team member must confirm they really agree on what each item means.", accent=C_STATEMENT)
    r = table_header(ws, r, ["#", "Deliverable", "Description", "Measure of success (transparent, verifiable)", "Accountable Owner (one name)", "Target/Committed date"], C_STATEMENT)
    first = r
    for i in range(8):
        ws.cell(row=r, column=1, value=i + 1)
        r = blank_grid(ws, r, 1, N, height=24)
    r += 1

    r = section(ws, r, N, "Scope Boundaries — IS / IS NOT", C_STATEMENT, "🚧")
    r = helpbox(ws, r, N, "The IS NOT column prevents the most expensive class of late change: silent scope growth. Be explicit about near-misses people might assume are in scope.", accent=C_STATEMENT)
    r = table_header(ws, r, ["✅ This project IS…", "", "", "🚫 This project IS NOT…", "", ""], C_STATEMENT)
    ws.merge_cells(start_row=r-1, start_column=1, end_row=r-1, end_column=3)
    ws.merge_cells(start_row=r-1, start_column=4, end_row=r-1, end_column=6)
    for i in range(6):
        ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=3)
        ws.merge_cells(start_row=r, start_column=4, end_row=r, end_column=6)
        r = blank_grid(ws, r, 1, N, height=22)
    r += 1

    r = section(ws, r, N, "WHEN — Key Dates & Decision Points", C_STATEMENT, "🗓")
    r = table_header(ws, r, ["Milestone / Decision Point", "Type", "Date", "Target or Committed?", "Owner", "Notes"], C_STATEMENT)
    seeded = [
        ["Definition Meeting", "DKDK Meeting", "", "Target", "", ""],
        ["Team Commitment", "Decision Point", "", "Target", "", "Gate: ~25–30% of early-identified risks retired"],
        ["", "", "", "", "", ""],
        ["Release", "Decision Point", "", "Target", "", ""],
    ]
    dstart = r
    for row_vals in seeded:
        r = body_row(ws, r, row_vals, height=22)
    r = blank_grid(ws, r, 4, N, height=22)
    add_dv(ws, ["Target", "Committed"], f"D{dstart}:D{r-1}", "Date status",
           "Dates are Targets until the Team Commitment decision point.")
    status_conditional(ws, f"D{dstart}:D{r-1}", {"Committed": (PAPER, COMMIT), "Target": (INK, WARN_BG)})
    r += 1

    r = section(ws, r, N, "WHO — Team & Skills (summary; full roster on 👥 Team List)", C_STATEMENT, "👥")
    r = label_value(ws, r, "Functions required to ship", "", N, C_STATEMENT, height=40)
    r = note(ws, r, N, "Engineering, QA, support, sales, legal, ops, manufacturing, marketing… A function needed to ship with no name on the Team List is a structural risk — add it to the RAP.")
    r += 1

    r = section(ws, r, N, "WHY NOT — Risks, Costs & Tradeoffs (the honest case against)", C_STATEMENT, "⚖️")
    r = helpbox(ws, r, N, "The distinctive fifth W. Summarize the top risks and what this project displaces. If Why Not overwhelms Why, change the definition: "
                "'If your project has too many risks, it's time to evaluate your Project Definition.' Full risk detail lives on the ⚠️ RAP sheet.", accent=C_STATEMENT)
    r = label_value(ws, r, "Top risks (summary)", "", N, C_STATEMENT, height=60)
    r = label_value(ws, r, "Tradeoffs / displaced work", "", N, C_STATEMENT, height=40)
    r = label_value(ws, r, "Cost of being late (summary)", "", N, C_STATEMENT, height=40)
    r = note(ws, r, N, "Full narrative and numbers on the 💸 Cost of Being Late sheet.")
    r += 1

    r = section(ws, r, N, "TEAM COMMITMENT", COMMIT, "🤝")
    r = helpbox(ws, r, N, "At the Team Commitment decision point, each member commits out loud, in the language of commitment: "
                "'I commit to this project as defined in this statement. It will be so, even in the face of circumstances.' Record it here.", accent=COMMIT)
    r = table_header(ws, r, ["Name", "Role", "Commitment statement", "Date committed", "Signature/initials", "Notes"], COMMIT)
    r = blank_grid(ws, r, 10, N, height=20)
    freeze(ws, "A4")
    return ws


def build_team_list(wb):
    ws = wb.create_sheet("👥 Team List")
    N = 9
    page_setup(ws, C_TEAM)
    set_col_widths(ws, [18, 16, 16, 42, 10, 18, 14, 22, 26])
    r = banner(ws, 1, N, "RUF Team List",
               "Names, never job titles alone. Everyone who holds an accountability on this project — the full cross-functional team.",
               C_TEAM, "👥")
    r = helpbox(ws, r, N,
        "HOW TO USE: One row per person. 'Accountabilities' are RESULTS this person singularly owns (nouns, verifiable), not activities. "
        "A person is on this list only when they have AGREED to their accountabilities and allocation — accountability imposed without consent is not accountability. "
        "Each person also completes a one-pager on the 🧭 Individual Accountabilities sheet.", accent=C_TEAM)
    r += 1
    hdr = r
    r = table_header(ws, r, ["Name", "Role on project", "Function / Dept", "Accountabilities (results singularly owned)",
                             "% time", "Agreed & committed?", "Date agreed", "Contact", "Notes / coverage risks"], C_TEAM)
    seeded = [["", "Project Leader", "", "The project result: delivery of the Project Statement in full", "", "", "", "", ""]]
    for row_vals in seeded:
        r = body_row(ws, r, row_vals, height=24)
    first = r
    r = blank_grid(ws, r, 18, N, height=24)
    add_dv(ws, ["Yes — committed", "Pending", "Declined"], f"F{hdr+1}:F{r-1}", "Agreement status",
           "‘When there is no room for “no,” then “yes” is meaningless.’ Pending/Declined rows are open risks.")
    status_conditional(ws, f"F{hdr+1}:F{r-1}", {
        "Yes — committed": (GOOD, GOOD_BG), "Pending": (WARN, WARN_BG), "Declined": (BAD, BAD_BG)})
    r += 1
    r = section(ws, r, N, "Function coverage check", C_TEAM, "🧩")
    r = helpbox(ws, r, N, "List every function needed to SHIP (not just build). Any function without a name above is a structural risk — add it to the ⚠️ RAP in CEI form.", accent=C_TEAM)
    r = table_header(ws, r, ["Function needed to ship", "Covered by (name)", "Gap? (auto-flag empty)", "", "", "", "", "", ""], C_TEAM)
    for fn in ["Engineering / Build", "QA / Test", "Operations / Support", "Sales / Marketing", "Legal / Compliance", "Finance", "", ""]:
        r = body_row(ws, r, [fn, "", "", "", "", "", "", "", ""], height=20)
    freeze(ws, f"A{hdr+1}")
    return ws


def build_individual_accountabilities(wb):
    ws = wb.create_sheet("🧭 Individual Accountab.")
    N = 6
    page_setup(ws, C_TEAM)
    set_col_widths(ws, [20, 30, 30, 26, 16, 24])
    r = banner(ws, 1, N, "Individual Accountabilities Documents",
               "One block per team member: the results they singularly own on this project. The written form of 'singular ownership of a result.'",
               C_TEAM, "🧭")
    r = helpbox(ws, r, N,
        "HOW TO USE: Duplicate the block below for each team member (copy the whole block of rows). Write accountabilities as RESULTS "
        "('Signed-off test plan', 'Production deployment live'), never activities ('help with testing'). The owner drafts their own block, "
        "then the team reviews it line-by-line — gaps and overlaps between blocks are risks: send them to the RAP.", accent=C_TEAM)
    r += 1
    for i in range(4):
        r = section(ws, r, N, f"Team member {i+1}", C_TEAM, "🧑")
        r = label_value(ws, r, "Name", "", N, C_TEAM, height=20)
        r = label_value(ws, r, "Role on project", "", N, C_TEAM, height=20)
        r = table_header(ws, r, ["Accountability # ", "Result I singularly own (noun, verifiable)", "What 'done' means (agreed with team)",
                                 "Key dependencies / who I need", "Due (week of)", "Status / notes"], C_TEAM)
        for j in range(4):
            ws.cell(row=r, column=1, value=j + 1)
            r = blank_grid(ws, r, 1, N, height=22)
        r = label_value(ws, r, "I agree to own these results", "", N, COMMIT, height=20)
        r = note(ws, r, N, "Signature/initials + date. This is an agreement, not an assignment.")
        r += 1
    return ws


def build_rap(wb):
    ws = wb.create_sheet("⚠️ Risk Action Plan")
    N = 14
    page_setup(ws, C_RAP)
    set_col_widths(ws, [8, 34, 30, 32, 10, 10, 12, 12, 16, 40, 16, 12, 14, 30])
    r = banner(ws, 1, N, "Risk Action Plan (RAP)",
               "Every risk in Cause–Effect–Impact form, with one owner and dated mitigation actions. Reviewed at every WAM. A conversation tool, not a compliance archive.",
               C_RAP, "⚠️")
    r = helpbox(ws, r, N,
        "HOW TO WRITE A RISK (CEI form): 'Because of [CAUSE — a fact, verifiably true today], [EFFECT — an uncertain future event] may occur, "
        "resulting in [IMPACT — consequence to schedule/cost/scope/quality].' If the effect has ALREADY happened it is not a risk — move it to the 🚧 Issues Log. "
        "Prioritize by exposure AND by NOVELTY: risks the team has never retired before deserve the most early urgency. "
        "Success in Definition looks like this list growing fast — a fat RAP means the blind spot is draining. "
        "Gate rule of thumb: don't commit the schedule until ~25–30% of early-identified risks are Retired.", accent=C_RAP)
    r += 1
    hdr = r
    r = table_header(ws, r, ["Risk ID", "CAUSE — Because of… (a fact, true today)", "EFFECT — …may occur (uncertain future event)",
                             "IMPACT — …resulting in (consequence to the project)", "Prob.", "Impact", "Novelty to team", "Priority",
                             "Accountable Owner (one name)", "Mitigation actions (each becomes a row on ✅ Actions)",
                             "Next action due", "Status", "Date identified", "Notes / WAM discussion"], C_RAP)
    ex = ["R-001",
          "The vendor's API documentation is incomplete and their support SLA is 10 business days",
          "Integration defects may be discovered late in system test",
          "2–4 week slip to the committed release date and rework across two teams",
          "M", "H", "Novel", "P1", "",
          "1) Build API test harness by wk 3 (owner: ___)  2) Escalation contact secured at vendor (owner: ___)",
          "", "Open", "", "EXAMPLE ROW — replace with your own. Note the cause is a verifiable fact."]
    r = body_row(ws, r, ex, height=48)
    first = r
    r = blank_grid(ws, r, 30, N, height=30)
    last = r - 1
    add_dv(ws, ["L", "M", "H"], f"E{hdr+1}:F{last}", "L/M/H")
    add_dv(ws, ["Novel", "Familiar"], f"G{hdr+1}:G{last}", "Novelty",
           "Has this team retired a risk like this before? Novel risks get the team's scarce early urgency.")
    add_dv(ws, ["P1", "P2", "P3"], f"H{hdr+1}:H{last}", "Priority")
    add_dv(ws, ["Open", "Mitigating", "Retired", "Accepted", "Became issue"], f"L{hdr+1}:L{last}", "Risk status",
           "Retired = mitigated to closure. Accepted = consciously living with it. Became issue = it happened; move to Issues Log.")
    status_conditional(ws, f"L{hdr+1}:L{last}", {
        "Open": (BAD, BAD_BG), "Mitigating": (WARN, WARN_BG), "Retired": (GOOD, GOOD_BG),
        "Accepted": (NEUTRAL, NEUTRAL_BG), "Became issue": (PAPER, BAD)})
    status_conditional(ws, f"H{hdr+1}:H{last}", {
        "P1": (PAPER, BAD), "P2": (INK, WARN_BG), "P3": (INK, NEUTRAL_BG)})
    status_conditional(ws, f"G{hdr+1}:G{last}", {"Novel": (PAPER, C_RAP), "Familiar": (NEUTRAL, NEUTRAL_BG)})
    r += 1
    r = section(ws, r, N, "The standing question — ask it every week", C_RAP, "🎤")
    r = helpbox(ws, r, N, "“What is the most likely reason this project will fail?” Ask it at every WAM. Whatever the answer is, it belongs on this sheet in CEI form with an owner.", accent=C_RAP)
    freeze(ws, f"A{hdr+1}")
    return ws


def build_actions(wb):
    ws = wb.create_sheet("✅ Actions")
    N = 10
    page_setup(ws, C_LOG)
    set_col_widths(ws, [10, 44, 14, 18, 14, 14, 12, 14, 30, 14])
    r = banner(ws, 1, N, "Action Tracker",
               "Every owned, dated task — risk mitigations, WAM cleanups, decision follow-ups. One owner per action. Always.",
               C_LOG, "✅")
    r = helpbox(ws, r, N,
        "HOW TO USE: Actions are the unit of motion in RUF. Each mitigation listed on the ⚠️ RAP gets its own row here (Source = risk ID). "
        "An action has ONE owner (a name that agreed), a committed date, and a binary done/not-done outcome. "
        "If an action's date is at risk, the owner cleans it up BEFORE the date — that's integrity.", accent=C_LOG)
    r += 1
    hdr = r
    r = table_header(ws, r, ["Action ID", "Action (verb — concrete and verifiable)", "Source (Risk/Issue/Decision/WAM ID)",
                             "Accountable Owner", "Committed date", "Status", "Done date", "Kept commitment?", "Cleanup notes (if renegotiated)", "Week (for WAM)"], C_LOG)
    r = blank_grid(ws, r, 34, N, height=22)
    last = r - 1
    add_dv(ws, ["Not started", "In progress", "Done", "Renegotiated", "Dropped"], f"F{hdr+1}:F{last}", "Action status")
    add_dv(ws, ["Yes", "No — cleaned up early", "No — missed"], f"H{hdr+1}:H{last}", "Integrity",
           "'Cleaned up early' = owner flagged the slip BEFORE the date and renegotiated. That preserves integrity.")
    status_conditional(ws, f"F{hdr+1}:F{last}", {
        "Not started": (NEUTRAL, NEUTRAL_BG), "In progress": (WARN, WARN_BG), "Done": (GOOD, GOOD_BG),
        "Renegotiated": (INTEGRITY, WARN_BG), "Dropped": (NEUTRAL, MIST)})
    status_conditional(ws, f"H{hdr+1}:H{last}", {
        "Yes": (GOOD, GOOD_BG), "No — cleaned up early": (INTEGRITY, WARN_BG), "No — missed": (PAPER, BAD)})
    freeze(ws, f"A{hdr+1}")
    return ws


def build_weekly_schedule(wb):
    ws = wb.create_sheet("📅 Weekly Schedule")
    N = 10
    page_setup(ws, C_SCHED)
    set_col_widths(ws, [12, 12, 42, 18, 26, 14, 14, 16, 30, 12])
    r = banner(ws, 1, N, "RUF Weekly Schedule",
               "The whole project as weekly deliverables, each owned by one named person. Done or not done — no percentages.",
               C_SCHED, "📅")
    r = helpbox(ws, r, N,
        "HOW TO USE: Rows are DELIVERABLES (nouns, verifiable), not activities — 'Draft test plan reviewed by QA' not 'work on testing'. "
        "Each has ONE owner and a committed week. At the WAM each row for the closing week is scored Done / Not done — that feeds the Weekly "
        "Completion Rate on the 📊 Dashboard, RUF's signature health metric. Slips are renegotiated visibly (cleanup), never silently moved.", accent=C_SCHED)
    r += 1
    hdr = r
    r = table_header(ws, r, ["Week # ", "Week of (Mon)", "Deliverable (noun — verifiable done/not-done)", "Accountable Owner",
                             "What 'done' means", "Committed?", "Scored at WAM", "If not done: cleanup", "Notes", "Carry-over of"], C_SCHED)
    r = blank_grid(ws, r, 40, N, height=22)
    last = r - 1
    add_dv(ws, ["Target", "Committed"], f"F{hdr+1}:F{last}", "Commitment",
           "Targets become Commitments at the Team Commitment decision point (or when the owner commits at WAM).")
    add_dv(ws, ["Done", "Not done", "—"], f"G{hdr+1}:G{last}", "WAM score",
           "Binary. Scored publicly at the WAM for the week just ended.")
    status_conditional(ws, f"G{hdr+1}:G{last}", {
        "Done": (GOOD, GOOD_BG), "Not done": (PAPER, BAD)})
    status_conditional(ws, f"F{hdr+1}:F{last}", {"Committed": (PAPER, COMMIT), "Target": (INK, WARN_BG)})
    freeze(ws, f"A{hdr+1}")
    return ws


def build_wam(wb):
    ws = wb.create_sheet("🤝 WAM Agenda & Log")
    N = 8
    page_setup(ws, C_WAM)
    set_col_widths(ws, [14, 30, 30, 22, 14, 14, 30, 26])
    r = banner(ws, 1, N, "Weekly Accountability Meeting (WAM)",
               "The weekly heartbeat. A DKDK meeting: it exists to REVEAL, not to solve. Start on time. End on time.",
               C_WAM, "🤝")
    r = section(ws, r, N, "Standing agenda (timebox ~30–45 min)", C_WAM, "📋")
    agenda = [
        ("1. Start on time", "Integrity begins with the meeting itself. Note who is present."),
        ("2. Score last week's commitments", "Walk the 📅 Weekly Schedule rows for the closing week. Each is publicly Done / Not done. Compute the completion rate. No blame — transparent accounting of results improves results."),
        ("3. Clean up broken commitments", "For each Not-done: acknowledge, root-cause briefly, re-commit with a new date. Cleanups are logged on ✅ Actions."),
        ("4. Walk the Risk Action Plan", "Top risks first (P1s and Novel). Check mitigation actions. Add newly surfaced risks in CEI form. Retire mitigated ones."),
        ("5. Ask the standing question", "“What is the most likely reason this project will fail?” The answer goes on the RAP with an owner."),
        ("6. Make next week's commitments", "Each owner states, in the language of commitment: 'I will deliver X by Y.' Two checks: Do we agree what done means? What might prevent it?"),
        ("7. End on time", "Issues raised get owners and go to issue meetings. The WAM reveals; it does not solve."),
    ]
    r = table_header(ws, r, ["Step", "What happens", "", "", "", "", "", ""], C_WAM)
    for step, what in agenda:
        ws.merge_cells(start_row=r, start_column=2, end_row=r, end_column=N)
        r = body_row(ws, r, [step, what, "", "", "", "", "", ""], bold_cols=(0,), height=30)
    r += 1
    r = section(ws, r, N, "WAM Log — one row per meeting", C_WAM, "🗒")
    r = helpbox(ws, r, N, "Fill this every week. AI agents ingesting meeting transcripts append here (see 🤖 AI · Transcript Ingestion). "
                "Completion rate = Done ÷ (Done + Not done) from the 📅 Weekly Schedule for that week.", accent=C_WAM)
    hdr = r
    r = table_header(ws, r, ["Date", "Attendees (absent flagged)", "Answer to 'most likely reason to fail'", "New risks added (IDs)",
                             "Completion rate %", "Started on time?", "Cleanups made (action IDs)", "Notes / decisions referred out"], C_WAM)
    r = blank_grid(ws, r, 26, N, height=24)
    last = r - 1
    add_dv(ws, ["Yes", "No"], f"F{hdr+1}:F{last}", "On time")
    status_conditional(ws, f"F{hdr+1}:F{last}", {"Yes": (GOOD, GOOD_BG), "No": (BAD, BAD_BG)})
    formula_conditional(ws, f"E{hdr+1}:E{last}", f"AND(ISNUMBER(E{hdr+1}),E{hdr+1}<80)", BAD, BAD_BG)
    formula_conditional(ws, f"E{hdr+1}:E{last}", f"AND(ISNUMBER(E{hdr+1}),E{hdr+1}>=80)", GOOD, GOOD_BG)
    freeze(ws, f"A{hdr+1}")
    return ws


def build_issues(wb):
    ws = wb.create_sheet("🚧 Issues Log")
    N = 9
    page_setup(ws, C_LOG)
    set_col_widths(ws, [10, 46, 16, 18, 12, 14, 16, 30, 22])
    r = banner(ws, 1, N, "Issues Log",
               "Known, present problems — already true. (Uncertain future problems are RISKS: they belong on the ⚠️ RAP in CEI form.)",
               C_LOG, "🚧")
    r = helpbox(ws, r, N,
        "RISK vs ISSUE: A risk MAY happen (goes to RAP). An issue HAS happened / IS true now (goes here). When a risk materializes, "
        "set its RAP status to 'Became issue' and open a row here referencing it. Issues get solved in ISSUE MEETINGS with the right small "
        "group — not in the WAM (the WAM only reveals and assigns).", accent=C_LOG)
    r += 1
    hdr = r
    r = table_header(ws, r, ["Issue ID", "Issue (what is true now)", "From risk (RAP ID, if any)", "Accountable Owner",
                             "Severity", "Status", "Issue meeting date", "Resolution / decision", "Actions opened (IDs)"], C_LOG)
    r = blank_grid(ws, r, 24, N, height=24)
    last = r - 1
    add_dv(ws, ["S1 — project-threatening", "S2 — major", "S3 — minor"], f"E{hdr+1}:E{last}", "Severity")
    add_dv(ws, ["Open", "In work", "Resolved", "Absorbed"], f"F{hdr+1}:F{last}", "Status")
    status_conditional(ws, f"F{hdr+1}:F{last}", {
        "Open": (BAD, BAD_BG), "In work": (WARN, WARN_BG), "Resolved": (GOOD, GOOD_BG), "Absorbed": (NEUTRAL, NEUTRAL_BG)})
    status_conditional(ws, f"E{hdr+1}:E{last}", {
        "S1 — project-threatening": (PAPER, BAD), "S2 — major": (INK, WARN_BG), "S3 — minor": (INK, NEUTRAL_BG)})
    freeze(ws, f"A{hdr+1}")
    return ws


def build_decisions(wb):
    ws = wb.create_sheet("🧮 Decision Log")
    N = 8
    page_setup(ws, C_LOG)
    set_col_widths(ws, [10, 40, 22, 18, 14, 30, 22, 22])
    r = banner(ws, 1, N, "Decision Log",
               "Write decisions down — 'the most important improvement teams make.' Transparency is team-wide clarity of what is so.",
               C_LOG, "🧮")
    r = helpbox(ws, r, N,
        "HOW TO USE: Log every decision that shapes the project — scope calls, tradeoffs, decision-point outcomes. Decisions inside an owner's "
        "area of accountability are THEIRS to make (no 'project democracy'); the log makes the decision visible, not re-litigable. "
        "AI agents ingesting emails/transcripts append rows here (see the 🤖 AI sheets).", accent=C_LOG)
    r += 1
    hdr = r
    r = table_header(ws, r, ["Decision ID", "Decision (what was decided)", "Context / alternatives considered", "Decided by (accountable owner)",
                             "Date", "Consequences (scope/schedule/cost)", "Communicated to", "Source (meeting/email/WAM ref)"], C_LOG)
    r = blank_grid(ws, r, 24, N, height=24)
    freeze(ws, f"A{hdr+1}")
    return ws


def build_cost_of_late(wb):
    ws = wb.create_sheet("💸 Cost of Being Late")
    N = 7
    page_setup(ws, INTEGRITY)
    set_col_widths(ws, [34, 20, 16, 16, 16, 16, 40])
    r = banner(ws, 1, N, "Cost of Being Late",
               "Not a single number — a narrative of factors and costs. The compelling story that gives the team the incentive to hit their dates.",
               INTEGRITY, "💸")
    r = helpbox(ws, r, N,
        "HOW TO USE: The whole cross-functional team must consider, articulate, discuss and AGREE on this. It prices the team's urgency and "
        "creates the context for mitigation spending ('the test machines cost less than one day of lateness'). Revisit whenever scope or market timing changes.", accent=INTEGRITY)
    r += 1
    r = section(ws, r, N, "Linear costs — accumulate per week late", INTEGRITY, "📈")
    hdr1 = r
    r = table_header(ws, r, ["Factor", "Basis / evidence", "Cost per week", "Currency", "Confidence", "Agreed by team?", "Narrative"], INTEGRITY)
    for f in ["Lost profit / revenue", "Delayed cost savings", "Additional project expense (team burn)", "", ""]:
        r = body_row(ws, r, [f, "", "", "", "", "", ""], height=24)
    total_row = r
    c = ws.cell(row=r, column=1, value="TOTAL LINEAR COST PER WEEK LATE")
    c.font = Font(name=FONT, size=11, bold=True, color=PAPER); c.fill = fill(INTEGRITY)
    tc = ws.cell(row=r, column=3, value=f"=SUM(C{hdr1+1}:C{r-1})")
    tc.font = Font(name=FONT, size=11, bold=True, color=INTEGRITY)
    for col in range(1, N + 1):
        ws.cell(row=r, column=col).border = BORDER_ALL
    r += 2
    r = section(ws, r, N, "Nonlinear costs — step-function consequences", INTEGRITY, "⛰")
    hdr2 = r
    r = table_header(ws, r, ["Factor", "Trigger (how late / what event)", "Estimated cost", "Currency", "Likelihood", "Agreed by team?", "Narrative"], INTEGRITY)
    for f in ["Breach of contract / penalties", "Lost market share / market window", "Failure of dependent business processes", "Damage to customer relationships", "Impact on valuation / funding", ""]:
        r = body_row(ws, r, [f, "", "", "", "", "", ""], height=24)
    last2 = r - 1
    add_dv(ws, ["High", "Medium", "Low"], f"E{hdr1+1}:E{total_row-1}", "Confidence")
    add_dv(ws, ["High", "Medium", "Low"], f"E{hdr2+1}:E{last2}", "Likelihood")
    add_dv(ws, ["Yes", "Not yet"], f"F{hdr1+1}:F{last2}", "Team agreement")
    status_conditional(ws, f"F{hdr1+1}:F{last2}", {"Yes": (GOOD, GOOD_BG), "Not yet": (WARN, WARN_BG)})
    r += 1
    r = section(ws, r, N, "The narrative — tell the story", INTEGRITY, "📖")
    r = helpbox(ws, r, N, "Write 3–6 sentences the whole team agrees on: what happens to customers, the market, and the company for each month of lateness. This is what a team member reads before deciding whether to ask for that extra test rig.", accent=INTEGRITY)
    r = blank_grid(ws, r, 5, N, zebra=False, height=26)
    for i in range(r - 5, r):
        ws.merge_cells(start_row=i, start_column=1, end_row=i, end_column=N)
    return ws


def build_accountability_matrix(wb):
    ws = wb.create_sheet("🗂 Accountability Matrix")
    N = 10
    page_setup(ws, ACCOUNT)
    set_col_widths(ws, [40] + [14] * 9)
    r = banner(ws, 1, N, "Accountability Matrix",
               "Deliverables & areas × named owners. Review to find GAPS (no owner) and COLLISIONS (two owners). Both are risks.",
               ACCOUNT, "🗂")
    r = helpbox(ws, r, N,
        "HOW TO USE: List deliverables/areas down the left; write team member NAMES across the top; put exactly one '●' per row under the "
        "single accountable owner (add '○' for contributors if useful — but only ● carries accountability). A row with zero ● is a gap; "
        "a row with two ● is a collision. Send both to the ⚠️ RAP.", accent=ACCOUNT)
    r += 1
    hdr = r
    r = table_header(ws, r, ["Deliverable / Area of accountability"] + [f"Name {i}" for i in range(1, 10)], ACCOUNT)
    r = blank_grid(ws, r, 22, N, height=22)
    last = r - 1
    add_dv(ws, ["●", "○"], f"B{hdr+1}:J{last}", "● owner / ○ contributor")
    status_conditional(ws, f"B{hdr+1}:J{last}", {"●": (PAPER, ACCOUNT), "○": (ACCOUNT, GOOD_BG)})
    freeze(ws, f"B{hdr+1}")
    return ws


def build_opportunity_sheet(wb):
    ws = wb.create_sheet("💡 Opportunity Sheet")
    N = 5
    page_setup(ws, WARN)
    set_col_widths(ws, [24, 34, 34, 34, 34])
    r = banner(ws, 1, N, "Opportunity Sheet",
               "The lightweight pre-project artifact: capture an opportunity BEFORE it becomes a defined project. Feeds the portfolio and, if sanctioned, the Definition phase.",
               WARN, "💡")
    r = helpbox(ws, r, N,
        "HOW TO USE: One block per opportunity. Keep it honest and short — this is the seed of the 5W tradeoff. If sanctioned, it graduates "
        "into a 📜 Project Statement and a Definition phase.", accent=WARN)
    r += 1
    for i in range(3):
        r = section(ws, r, N, f"Opportunity {i+1}", WARN, "✨")
        for lbl, h in [("Opportunity name", 20), ("The opportunity (why now?)", 44), ("What we'd build / deliver", 36),
                       ("Who would benefit (customer)", 24), ("Rough size of the prize", 24), ("Why not — obvious risks & costs", 36),
                       ("Sponsor (one name)", 20), ("Recommended next step", 24)]:
            r = label_value(ws, r, lbl, "", N, WARN, height=h)
        r += 1
    return ws
