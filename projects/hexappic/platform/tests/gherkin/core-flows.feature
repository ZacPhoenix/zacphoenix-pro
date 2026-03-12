Feature: Hexappic local-first workflow

  Scenario: Read the current board
    Given the Hexappic platform exists locally
    When the operator runs "python3 projects/hexappic/platform/scripts/hexappic.py board"
    Then the output includes "Hexappic Kanban"
    And the output includes "HX-001"

  Scenario: Generate a platform readout
    Given the Hexappic platform exists locally
    When the operator runs "python3 projects/hexappic/platform/scripts/hexappic.py readout"
    Then a readout file is generated in "projects/hexappic/platform/reports"
    And the readout includes ticket counts by status

  Scenario: Validate ticket hygiene
    Given the Hexappic platform exists locally
    When the operator runs "python3 projects/hexappic/platform/scripts/hexappic.py validate"
    Then the validation exits successfully
    And each ticket includes required fields and valid source links
