# AI-Powered Test Agent (Proof of Concept)

This repository contains the proof-of-concept for an AI agent and Gemini CLI extension that automatically generates test cases based on code review feedback.

It includes:
1.  A sample Node.js application (`/src`).
2.  A Gemini CLI extension (`/test-agent`) with custom commands.
3.  A pre-staged test scenario (`/review-scenario`) to demonstrate the workflow.
4.  The PRD and Design documents for the project.

## Installation and Setup

To get started, you will need `node`, `npm`, and the `gemini` CLI installed.

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd test-agent
    ```

2.  **Install project dependencies:**
    This installs `jest` for the sample application.
    ```bash
    npm install
    ```

3.  **Link the Gemini CLI extension:**
    This command makes the `/generate-test-from-finding` and `/commit-test` commands available to the Gemini CLI. **It must be run from the project root directory (`test-agent/`).**
    ```bash
    gemini extensions link test-agent
    ```

## How to Test the Workflow

After completing the installation steps above, you can test the full workflow in the pre-staged scenario.

1.  **Navigate into the scenario directory:**
    ```bash
    cd review-scenario
    ```

2.  **Run Code Review:**
    Ask the agent to review the staged changes. 
    ```bash
    gemini /code-review
    ```
    *You should see a report identifying a division-by-zero risk in `src/calculator.js`.*

3.  **Generate a Test for the Finding:**
    Use our custom command to generate a test for the finding from the report.
    ```bash
    gemini /generate-test-from-finding src/calculator.js 2
    ```
    *The agent will suggest a new test case and instruct you to run `/commit-test`.*

4.  **Commit the New Test:**
    Run the commit command to apply the suggested test to your local file.
    ```bash
    gemini /commit-test
    ```
    *(Note: In this MVP, this step will fail due to CLI sandboxing, but it demonstrates the intended workflow.)*

5.  **Verify the Test Fails:**
    Manually apply the suggested test to `src/calculator.test.js` and run the test suite. The new test should fail, proving it caught the bug.
    ```bash
    npm test
    ```