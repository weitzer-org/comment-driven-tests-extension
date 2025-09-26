# Revised Design v2: The "Comment-Driven" Test Agent
**(Integrated with the Diff-Based Code Review Extension)**

## 1. Overview & Vision

The vision remains to create an AI agent that accelerates development by turning code review feedback into tests. This design is now tailored to a more powerful, realistic developer workflow where reviews are conducted on a set of staged changes (`git diff`) rather than individual files. The test agent will act as a direct "responder" to the findings from the `/code-review` command.

## 2. The User Workflow

The workflow is now centered around the `git` staging area and a single, comprehensive review pass.

*   **Step 1: Stage Code Changes**
    The developer finishes a feature or a bug fix and stages their changes for commit using `git add`.

*   **Step 2: Analyze Staged Diff**
    The developer runs the single, file-agnostic command:
    ` /code-review`

    The agent internally runs `git diff --merge-base origin/HEAD`, analyzes all the changes, and returns a single, structured report. The findings in this report are uniquely identified by their **file path and line number**.

    *Example Output from `/code-review`:*
    ```
    # Change summary: Adds a new calculation utility.

    ## File: src/utils/calculator.js
    ### L15: [HIGH] Division by zero risk.
    The 'average' function does not handle cases where the input array is empty.

    ## File: src/config/settings.js
    ### L28: [MEDIUM] Hardcoded value.
    The 'timeout' setting is hardcoded. Consider moving this to a constant.
    ```

*   **Step 3: Generate a Specific Test**
    The developer decides to generate a test for the division-by-zero risk. They use the new `/generate-test` command, referencing the finding by its file and line number.
    ` /generate-test --file src/utils/calculator.js --line 15`

    The agent then generates the required test and patches the appropriate test file.

## 3. The User-Facing Command

The `/generate-test` command is now designed to precisely target a finding from the diff-based review.

**Usage:**
`/generate-test --file <path_to_file> --line <line_number>`

**Parameters:**

*   `--file` (required): The file path of the finding, exactly as it appears in the `/code-review` report.
*   `--line` (required): The line number of the finding from the report.
*   `--dry-run` (optional): Prints the generated test to the console instead of modifying the file.
*   `--type` (optional): `unit`, `e2e`, or `manual`. Defaults to `unit`.

This new structure is more robust and less ambiguous than referencing a finding by a simple index number.

## 4. Internal Architecture & State Management

The internal architecture remains the same, but the state management becomes more critical.

*   **Session State:** When `/code-review` is executed, the **entire structured markdown report** must be stored in the agent's session state.
*   **Finding Lookup:** When `/generate-test` is called, its primary job is to parse the stored markdown report, find the block corresponding to the given `--file` and `--line`, and extract the detailed description of the issue (e.g., "The 'average' function does not handle..."). This extracted text becomes the "comment" that fuels the test generation logic.
```