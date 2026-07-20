# Linear MCP Installation Status

## ✅ What's Ready

The **Linear System implementation guide** has been added to this branch. It covers everything you need to set up Linear as a central coordination hub for coding agents:

- **Linear System/** folder contains 9 chapters + templates + prompts
- Read order: Start with README.md → 01-09 chapters → setup-checklist.md
- Key resources:
  - `09-setup-checklist.md` — do-this-in-order implementation steps
  - `08-linear-mcp-setup.md` — MCP configuration & the three customizations
  - `templates/` — copy-paste ticket template, hooks, workstream docs
  - `prompts/` — ready-to-use prompts for agents

## ⏳ What's Next: Connect Linear MCP

To enable Linear MCP tools in this session:

1. **Go to claude.ai connector settings:**
   https://claude.ai/admin-settings/connectors

2. **Search for "Linear"** in the MCP connector registry

3. **Click "Connect"** and authenticate with your Linear workspace

4. **Once connected,** Linear tools will be available:
   - `list_issues`, `create_issue`, `get_issue`, `update_issue`
   - `list_cycles`, `create_comment`, `list_comments`
   - And 14+ more tools for full Linear integration

## 🚀 After Connection: Next Steps

Once Linear MCP is connected:

1. **Read the setup checklist** (`Linear System/09-setup-checklist.md`)
   - Configure Linear statuses, labels, triage
   - Set up ticket templates
   - Configure agent rules & hooks

2. **Customize the MCP** (`Linear System/08-linear-mcp-setup.md`)
   - Set up bot identity (app-based auth)
   - Create patch-based description updates tool
   - Enhance get_issue with full context

3. **Deploy agent harness** with:
   - Linear MCP pointing to your workspace
   - Hooks from `templates/hooks/`
   - Agent rules from `templates/agent-rules.md`

4. **Create your first workstream**
   - Use `prompts/ticket-intake.md` to triage work
   - Use `prompts/workstream-update.md` to batch 3-5 tasks
   - Deploy agents to run in parallel

## 📚 Key Concepts

| Concept | File | Purpose |
|---------|------|---------|
| Outcome hierarchy | 01 | Tickets named for results, not tasks |
| Triage inbox | 02 | Funnel for all incoming work |
| Ticket contract | 03 | Standardized Goal/Why/Outcomes/Impl/Verifs |
| Verification checklists | 04 | Mandatory completion criteria |
| Workstreams | 05 | Batch 3-5 parallel non-overlapping tasks |
| Agent lifecycle | 06 | Hooks force merge/verify/close |
| Human escalation | 07 | Formal way agents ask for help |
| MCP setup | 08 | Bot identity + description patches + full context |

## 💡 Architecture

```
Your Linear (personal)
        ↓ (same workspace)
Custom MCP Server (bot-authenticated)
  ├─ get_issue (full context in one call)
  ├─ update_description_patch (diffs only)
  ├─ create/update/move issues
  └─ acts as agent identity
        ↓
  Claude Code, Cursor, Codex, etc.
```

---

**Next action:** Connect Linear MCP at https://claude.ai/admin-settings/connectors
