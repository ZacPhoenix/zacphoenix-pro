# Project AI Classroom

A pedagogical research project. The goal is to prototype an AI system that, from
routine classroom audio, can:

1. **Monitor long-term student engagement and progress** — track how individual
   students participate over time, across subjects, formats (lecture vs. group
   work), and times of day.
2. **Surface teacher coaching opportunities** — both *individualization*
   (how a teacher could better reach a specific student) and *general
   instructional* coaching (pacing, wait time, equity of voice, checks for
   understanding).

This folder holds the **synthetic seed data** used to prototype that idea before
any real classroom audio is collected.

## What's in here

```
ai-classroom/
├── README.md              ← you are here
├── personas.md            ← the cast + engagement profiles (the "answer key")
└── transcripts/           ← one markdown file per lesson
    ├── 01-homeroom-advisory.md
    ├── 02-math-fractions-on-a-number-line.md
    ├── 03-ela-close-reading-theme.md
    ├── 04-science-states-of-matter.md
    └── 05-social-studies-13-colonies.md
```

## The simulated setting

- **Grade:** 5th grade (students ~10–11 years old).
- **Class:** One cohort of **8 students**, labeled **Student A – Student H**.
- **Teachers:** A small departmentalized 5th-grade team, labeled **Teacher 1 – Teacher 4**
  (upper-elementary teams commonly split the core subjects this way).
  - Teacher 1 — Homeroom & Math
  - Teacher 2 — English Language Arts
  - Teacher 3 — Science
  - Teacher 4 — Social Studies
- **Simulated day:** Tuesday, April 14, 2026 (a spring school day).
- **Schedule:** Follows the provided period timing. This prototype covers the
  five **core academic blocks** of that day:

  | File | Block | Time | Teacher |
  |------|-------|------|---------|
  | 01 | Homeroom / Advisory | 8:00–8:15 AM | Teacher 1 |
  | 02 | Math | 8:19–9:04 AM | Teacher 1 |
  | 03 | English Language Arts | 9:08–9:53 AM | Teacher 2 |
  | 04 | Science | 10:46–11:31 AM | Teacher 3 |
  | 05 | Social Studies | 12:58–1:43 PM | Teacher 4 |

## How the "audio" is modeled

Each **student** has a microphone on their desk; each **teacher** wears a lapel
mic. The result is clean, fully diarized audio — every utterance is attributed
to a known speaker. The transcripts are therefore rendered as timestamped,
speaker-labeled dialogue:

```
[HH:MM:SS] Speaker: utterance   (*optional paralinguistic / non-verbal note*)
```

Paralinguistic notes in *(parentheses/italics)* — `(off-task side talk)`,
`(overlapping)`, `(long pause)`, `(quietly)` — stand in for the acoustic and
prosodic signals a real system would extract. They are deliberately included so
the downstream model has engagement cues beyond raw word counts.

## Reading the data

Every transcript file has two parts:

1. **A lesson header / introduction** — the content, agenda, lesson structure,
   and intended learning outcomes, plus a machine-readable metadata block.
2. **The diarized transcript** — the synthetic audio of the lesson.

The **engagement arcs are intentional and consistent**. See
[`personas.md`](personas.md) for each student's profile — it is effectively the
labeled "answer key" the prototype's outputs can be checked against.

## Important caveats

- This is **entirely synthetic** data. No real students, teachers, classrooms,
  or recordings are represented. Names are abstract labels by design.
- It is built to be *realistic and developmentally appropriate*, not to depict
  any real person. Any resemblance to a real individual is unintended.
- It is a **prototyping seed**, not a benchmark. It is small, hand-authored, and
  reflects the author's assumptions about engagement — validate conclusions
  against real, consented data before drawing pedagogical claims.
