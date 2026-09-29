# docs/specs/inbox-v1.feature
# Acceptance criteria for Forge Inbox v1. Tags are stable ids: never renumber, only add.
# Day 14 maps every scenario to at least one test titled "AC-n: ..." and checks coverage.

Feature: Review Triage proposals in the Forge Inbox
  As the maintainer reviewing Triage output
  I want to approve, edit, or reject each proposal in one place
  So that I decide every proposal without opening raw files

  Background:
    Given the Inbox reads proposals from "data/triage/results.jsonl"
    And it reads feedback items from "data/inbox/*.jsonl"

  @AC-1
  Scenario: Pending proposals are listed with their feedback
    Given 3 proposals have no decision
    When the reviewer opens the Inbox
    Then 3 proposals are listed with status "pending"
    And each shows its suggested title, category, severity, and confidence
    And opening one shows the original feedback text beside the proposal

  @AC-2
  Scenario: Approve a pending proposal
    Given proposal "fb_101" is pending
    When the reviewer approves it
    Then its status shows "approved"
    And "data/decisions.jsonl" gains exactly one decision with action "approve" for "fb_101"

  @AC-3 @negative
  Scenario: A proposal is decided at most once
    Given proposal "fb_102" is approved
    When another approve, edit, or reject arrives for "fb_102"
    Then the API responds with status 409
    And "data/decisions.jsonl" still holds exactly one decision for "fb_102"

  @AC-4
  Scenario: An edit records which fields changed
    Given proposal "fb_103" is pending with severity "high"
    When the reviewer changes severity to "medium" and saves the edit
    Then the decision has action "edit" with a change from "high" to "medium" on "severity"
    And "data/triage/results.jsonl" is byte-for-byte unchanged

  @AC-5
  Scenario: Reject requires a reason
    Given proposal "fb_104" is pending
    When the reviewer rejects it without a reason
    Then the reject is refused with a message asking for a reason
    And no decision is recorded for "fb_104"

  @AC-6
  Scenario: Proposals that need a human stand out
    Given proposal "fb_105" has confidence "low" and needsHuman true
    When the reviewer opens the Inbox
    Then "fb_105" is marked as needing attention
    And pending proposals that need attention are listed first

  @AC-7
  Scenario: Every decision works from the keyboard
    Given proposal "fb_106" is selected
    When the reviewer presses "a"
    Then "fb_106" is approved without any mouse input

  @AC-8 @negative
  Scenario: The Inbox never writes to GitHub
    Given the Inbox is running
    When the reviewer approves any proposal
    Then no request goes to "api.github.com" from the browser or the server
    And the create_issue tool is never called

  @AC-9 @negative
  Scenario: Malformed data does not break the queue
    Given "data/triage/results.jsonl" contains one malformed line
    When the reviewer opens the Inbox
    Then every valid proposal is listed
    And the header reports 1 skipped line
