# Hexappic Workflow

## Flow
1. Research captures evidence in a brief or note.
2. PM creates tickets linked to that evidence.
3. Dev challenges scope and implementation details.
4. PM updates scope.
5. Work moves through the board.
6. Gherkin scenarios define acceptance.
7. Validation confirms tickets and links are intact.

## Artifact Rules
- Docs and tickets must cross-link by relative path.
- Every active ticket needs at least one source document.
- Every done ticket needs an evidence link.
- Board status must match the ticket status field.

## Anti-Patterns
- Fake multi-agent agreement loops
- Detached docs with no execution path
- Bloated state machines
- Closing tickets without proof
