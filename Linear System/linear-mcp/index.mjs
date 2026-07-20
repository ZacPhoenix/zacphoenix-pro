#!/usr/bin/env node
// Minimal self-hosted Linear MCP server — acts AS YOUR OAUTH APP.
//
// Why this exists: the hosted/stock Linear MCP uses your personal login, so
// agents act as you. This server authenticates with an app token (actor=app),
// giving agents their own identity + proper notifications, and it bakes in the
// three fixes from "Linear System/08-linear-mcp-setup.md":
//   fix 1 — description edits are DIFF-ONLY and protect the Verifications block
//   fix 2 — app identity (via the Bearer app token you pass in)
//   fix 3 — get_issue returns full context (comments + sub-issues) in one call
//
// Transport: MCP over stdio (newline-delimited JSON-RPC 2.0). Zero npm deps —
// requires Node 18+ (built-in fetch). Logs go to stderr; stdout is protocol-only.
//
// Config: set LINEAR_APP_TOKEN in the environment (the lin_oauth_... token from
// scripts/linear-app-token.mjs). See linear-mcp/README.md for harness wiring.

const TOKEN = process.env.LINEAR_APP_TOKEN || "";
const API = "https://api.linear.app/graphql";
const PROTOCOL_FALLBACK = "2024-11-05";

// ---------------------------------------------------------------- GraphQL ----

async function gql(query, variables = {}) {
  if (!TOKEN) {
    throw new Error(
      "LINEAR_APP_TOKEN is not set. Point this MCP at your app token.",
    );
  }
  const res = await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // OAuth app tokens use the Bearer prefix (personal API keys do not).
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.errors) {
    throw new Error(
      `Linear API error (${res.status}): ${JSON.stringify(json.errors || json)}`,
    );
  }
  return json.data;
}

// ------------------------------------------------------------- resolvers ----

const isUuid = (s) => /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(s);
const isIdentifier = (s) => /^[A-Za-z0-9]+-\d+$/.test(s);

async function resolveTeamId(keyOrId) {
  if (!keyOrId) throw new Error("team is required (key like 'ZAC' or a UUID).");
  if (isUuid(keyOrId)) return keyOrId;
  const data = await gql(`{ teams { nodes { id key name } } }`);
  const t = data.teams.nodes.find(
    (n) =>
      n.key.toLowerCase() === keyOrId.toLowerCase() ||
      n.name.toLowerCase() === keyOrId.toLowerCase(),
  );
  if (!t) throw new Error(`No team matching '${keyOrId}'.`);
  return t.id;
}

async function resolveIssueId(idOrIdentifier) {
  if (!idOrIdentifier) throw new Error("issue id/identifier is required.");
  if (isUuid(idOrIdentifier)) return idOrIdentifier;
  if (isIdentifier(idOrIdentifier)) {
    const [key, num] = idOrIdentifier.split("-");
    const data = await gql(
      `query($key:String!,$num:Float!){ issues(filter:{ team:{ key:{ eq:$key } }, number:{ eq:$num } }){ nodes { id } } }`,
      { key: key.toUpperCase(), num: Number(num) },
    );
    const n = data.issues.nodes[0];
    if (!n) throw new Error(`No issue matching '${idOrIdentifier}'.`);
    return n.id;
  }
  return idOrIdentifier; // assume it's already an id
}

async function resolveStateId(teamId, stateNameOrId) {
  if (isUuid(stateNameOrId)) return stateNameOrId;
  const data = await gql(
    `query($id:String!){ team(id:$id){ states { nodes { id name } } } }`,
    { id: teamId },
  );
  const s = data.team.states.nodes.find(
    (n) => n.name.toLowerCase() === String(stateNameOrId).toLowerCase(),
  );
  if (!s)
    throw new Error(
      `No workflow state '${stateNameOrId}' on this team. Available: ${data.team.states.nodes
        .map((n) => n.name)
        .join(", ")}`,
    );
  return s.id;
}

const countCheckboxes = (text) => (text.match(/- \[[ xX]\]/g) || []).length;
const hasVerifications = (text) => /(^|\n)#{1,6}\s*Verifications/i.test(text);

// ---------------------------------------------------------------- tools ------

const TOOLS = [
  {
    name: "whoami",
    description:
      "Confirm the identity this MCP acts as (should be your OAuth app, not you) and the organization.",
    inputSchema: { type: "object", properties: {} },
    handler: async () => {
      const data = await gql(
        `{ viewer { id name email } organization { name urlKey } }`,
      );
      return data;
    },
  },
  {
    name: "list_teams",
    description: "List teams (id, key, name).",
    inputSchema: { type: "object", properties: {} },
    handler: async () => (await gql(`{ teams { nodes { id key name } } }`)).teams
      .nodes,
  },
  {
    name: "list_workflow_states",
    description: "List a team's workflow statuses (Triage, In Progress, Blocked, …).",
    inputSchema: {
      type: "object",
      properties: { team: { type: "string", description: "Team key (e.g. ZAC) or UUID." } },
      required: ["team"],
    },
    handler: async ({ team }) => {
      const teamId = await resolveTeamId(team);
      const data = await gql(
        `query($id:String!){ team(id:$id){ states { nodes { id name type position } } } }`,
        { id: teamId },
      );
      return data.team.states.nodes.sort((a, b) => a.position - b.position);
    },
  },
  {
    name: "list_projects",
    description: "List projects (id, name).",
    inputSchema: { type: "object", properties: {} },
    handler: async () =>
      (await gql(`{ projects { nodes { id name } } }`)).projects.nodes,
  },
  {
    name: "list_labels",
    description: "List issue labels (id, name).",
    inputSchema: { type: "object", properties: {} },
    handler: async () =>
      (await gql(`{ issueLabels { nodes { id name } } }`)).issueLabels.nodes,
  },
  {
    name: "list_issues",
    description:
      "List issues with optional filters. Returns identifier, title, state, assignee.",
    inputSchema: {
      type: "object",
      properties: {
        team: { type: "string", description: "Team key or UUID (optional)." },
        state: { type: "string", description: "Workflow state name, e.g. 'Triage' (optional)." },
        first: { type: "number", description: "Max results (default 25)." },
      },
    },
    handler: async ({ team, state, first }) => {
      const filter = {};
      if (team) filter.team = { key: { eq: (await teamKey(team)) } };
      if (state) filter.state = { name: { eq: state } };
      const data = await gql(
        `query($filter:IssueFilter,$first:Int){ issues(filter:$filter, first:$first, orderBy:updatedAt){ nodes { id identifier title priority state { name } assignee { name } parent { identifier } } } }`,
        { filter, first: first || 25 },
      );
      return data.issues.nodes;
    },
  },
  {
    name: "get_issue",
    description:
      "Get an issue with FULL context in one call: description, comments, sub-issues, parent, labels, project, attachments, and a verification-checkbox summary. Accepts an identifier (ZAC-123) or UUID.",
    inputSchema: {
      type: "object",
      properties: { issue: { type: "string", description: "Identifier (ZAC-123) or UUID." } },
      required: ["issue"],
    },
    handler: async ({ issue }) => {
      const id = await resolveIssueId(issue);
      const data = await gql(
        `query($id:String!){ issue(id:$id){
           id identifier title description url priority
           state { id name type }
           assignee { id name }
           parent { id identifier title }
           children { nodes { id identifier title state { name } } }
           labels { nodes { id name } }
           project { id name }
           comments { nodes { id body createdAt user { name } } }
           attachments { nodes { id title url } }
         } }`,
        { id },
      );
      const issueData = data.issue;
      const desc = issueData.description || "";
      issueData.verifications = {
        hasSection: hasVerifications(desc),
        totalBoxes: countCheckboxes(desc),
        uncheckedBoxes: (desc.match(/- \[ \]/g) || []).length,
      };
      return issueData;
    },
  },
  {
    name: "create_issue",
    description: "Create an issue. Name it after the OUTCOME. Give it a parent when possible.",
    inputSchema: {
      type: "object",
      properties: {
        team: { type: "string", description: "Team key (e.g. ZAC) or UUID." },
        title: { type: "string" },
        description: { type: "string" },
        parent: { type: "string", description: "Parent issue identifier/UUID (optional)." },
        projectId: { type: "string", description: "Project UUID (optional)." },
        state: { type: "string", description: "Workflow state name (optional)." },
        priority: { type: "number", description: "0-4 (optional)." },
        labelIds: { type: "array", items: { type: "string" }, description: "Label UUIDs (optional)." },
      },
      required: ["team", "title"],
    },
    handler: async (a) => {
      const teamId = await resolveTeamId(a.team);
      const input = { teamId, title: a.title };
      if (a.description) input.description = a.description;
      if (a.parent) input.parentId = await resolveIssueId(a.parent);
      if (a.projectId) input.projectId = a.projectId;
      if (a.state) input.stateId = await resolveStateId(teamId, a.state);
      if (typeof a.priority === "number") input.priority = a.priority;
      if (a.labelIds) input.labelIds = a.labelIds;
      const data = await gql(
        `mutation($input:IssueCreateInput!){ issueCreate(input:$input){ success issue { id identifier url } } }`,
        { input },
      );
      return data.issueCreate;
    },
  },
  {
    name: "update_issue_state",
    description: "Move an issue to a different workflow status (e.g. 'In Progress', 'Blocked', 'Done').",
    inputSchema: {
      type: "object",
      properties: {
        issue: { type: "string", description: "Identifier or UUID." },
        state: { type: "string", description: "Target state name or UUID." },
      },
      required: ["issue", "state"],
    },
    handler: async ({ issue, state }) => {
      const id = await resolveIssueId(issue);
      const teamData = await gql(
        `query($id:String!){ issue(id:$id){ team { id } } }`,
        { id },
      );
      const stateId = await resolveStateId(teamData.issue.team.id, state);
      const data = await gql(
        `mutation($id:String!,$input:IssueUpdateInput!){ issueUpdate(id:$id, input:$input){ success issue { identifier state { name } } } }`,
        { id, input: { stateId } },
      );
      return data.issueUpdate;
    },
  },
  {
    name: "assign_issue",
    description: "Assign an issue to a user (by user UUID). Use list_users-style lookups as needed.",
    inputSchema: {
      type: "object",
      properties: {
        issue: { type: "string" },
        assigneeId: { type: "string", description: "User UUID." },
      },
      required: ["issue", "assigneeId"],
    },
    handler: async ({ issue, assigneeId }) => {
      const id = await resolveIssueId(issue);
      const data = await gql(
        `mutation($id:String!,$input:IssueUpdateInput!){ issueUpdate(id:$id, input:$input){ success issue { identifier assignee { name } } } }`,
        { id, input: { assigneeId } },
      );
      return data.issueUpdate;
    },
  },
  {
    name: "add_comment",
    description: "Add a comment to an issue.",
    inputSchema: {
      type: "object",
      properties: {
        issue: { type: "string" },
        body: { type: "string" },
      },
      required: ["issue", "body"],
    },
    handler: async ({ issue, body }) => {
      const id = await resolveIssueId(issue);
      const data = await gql(
        `mutation($input:CommentCreateInput!){ commentCreate(input:$input){ success comment { id url } } }`,
        { input: { issueId: id, body } },
      );
      return data.commentCreate;
    },
  },
  {
    name: "patch_issue_description",
    description:
      "FIX 1 — the ONLY way to edit a description. Replaces exactly one occurrence of oldText with newText (a targeted diff), never a wholesale overwrite. Refuses changes that delete the Verifications section or reduce the checkbox count unless allowScopeChange=true.",
    inputSchema: {
      type: "object",
      properties: {
        issue: { type: "string", description: "Identifier or UUID." },
        oldText: { type: "string", description: "Exact text to replace (must occur exactly once)." },
        newText: { type: "string", description: "Replacement text." },
        allowScopeChange: {
          type: "boolean",
          description: "Set true to intentionally change the Verifications scope (rare).",
        },
      },
      required: ["issue", "oldText", "newText"],
    },
    handler: async ({ issue, oldText, newText, allowScopeChange }) => {
      const id = await resolveIssueId(issue);
      const cur = await gql(
        `query($id:String!){ issue(id:$id){ description } }`,
        { id },
      );
      const desc = cur.issue.description || "";
      const occurrences = desc.split(oldText).length - 1;
      if (occurrences === 0)
        throw new Error("oldText not found in the description. Fetch it with get_issue and copy the exact text.");
      if (occurrences > 1)
        throw new Error(`oldText occurs ${occurrences} times — make it unique so the patch is unambiguous.`);
      const next = desc.replace(oldText, newText);

      if (!allowScopeChange) {
        if (hasVerifications(desc) && !hasVerifications(next))
          throw new Error("Refused: this patch would remove the Verifications section. Set allowScopeChange=true only for an intentional scope change.");
        if (countCheckboxes(next) < countCheckboxes(desc))
          throw new Error("Refused: this patch would delete verification checkboxes. Set allowScopeChange=true only for an intentional scope change.");
      }

      const data = await gql(
        `mutation($id:String!,$input:IssueUpdateInput!){ issueUpdate(id:$id, input:$input){ success issue { identifier } } }`,
        { id, input: { description: next } },
      );
      return { ...data.issueUpdate, checkboxes: countCheckboxes(next) };
    },
  },
];

// small helper used by list_issues
async function teamKey(keyOrId) {
  if (!isUuid(keyOrId)) return keyOrId.toUpperCase();
  const data = await gql(`{ teams { nodes { id key } } }`);
  const t = data.teams.nodes.find((n) => n.id === keyOrId);
  return t ? t.key : keyOrId;
}

const TOOL_MAP = Object.fromEntries(TOOLS.map((t) => [t.name, t]));

// ------------------------------------------------------- JSON-RPC / stdio ----

function send(msg) {
  process.stdout.write(JSON.stringify(msg) + "\n");
}

function result(id, res) {
  send({ jsonrpc: "2.0", id, result: res });
}

function error(id, code, message) {
  send({ jsonrpc: "2.0", id, error: { code, message } });
}

async function handle(msg) {
  const { id, method, params } = msg;

  if (method === "initialize") {
    result(id, {
      protocolVersion: params?.protocolVersion || PROTOCOL_FALLBACK,
      capabilities: { tools: {} },
      serverInfo: { name: "linear-app-mcp", version: "0.1.0" },
    });
    return;
  }
  if (method === "notifications/initialized" || method === "notifications/cancelled") {
    return; // notifications: no response
  }
  if (method === "ping") {
    result(id, {});
    return;
  }
  if (method === "tools/list") {
    result(id, {
      tools: TOOLS.map(({ name, description, inputSchema }) => ({
        name,
        description,
        inputSchema,
      })),
    });
    return;
  }
  if (method === "tools/call") {
    const tool = TOOL_MAP[params?.name];
    if (!tool) {
      error(id, -32602, `Unknown tool: ${params?.name}`);
      return;
    }
    try {
      const out = await tool.handler(params.arguments || {});
      result(id, {
        content: [{ type: "text", text: JSON.stringify(out, null, 2) }],
      });
    } catch (e) {
      // Report tool failures as tool errors, not protocol errors.
      result(id, {
        content: [{ type: "text", text: `Error: ${e.message}` }],
        isError: true,
      });
    }
    return;
  }

  if (id !== undefined) error(id, -32601, `Method not found: ${method}`);
}

let buffer = "";
process.stdin.on("data", (chunk) => {
  buffer += chunk.toString("utf8");
  let nl;
  while ((nl = buffer.indexOf("\n")) >= 0) {
    const line = buffer.slice(0, nl).trim();
    buffer = buffer.slice(nl + 1);
    if (!line) continue;
    let msg;
    try {
      msg = JSON.parse(line);
    } catch {
      continue; // ignore non-JSON lines
    }
    handle(msg).catch((e) => console.error("handler error:", e));
  }
});

process.stdin.on("end", () => process.exit(0));
console.error("linear-app-mcp ready on stdio" + (TOKEN ? "" : " (WARNING: LINEAR_APP_TOKEN not set)"));
