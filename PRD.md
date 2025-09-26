# Product Requirements Document: The "Comment-Driven" Automated Test Agent

## 1. Overview & Vision

Today we offer a Code Review Agent integrated into GitHub via a standalone app as well as a code review extension.  Within code reviews, often, the same types of comments reappear in pull requests, whether from human reviewers (e.g., "Did you test the null case?") or from automated code analysis bots (e.g., "Potential unhandled exception."). This agent will identify these recurring comment patterns from both human and AI sources, treat them as implicit testing requirements, and automatically generate the corresponding test cases for manual execution, unit tests for automated execution and end-to-end-tests for automated test cases.  

The vision is to create a system that learns from a team's review habits and automated quality checks to proactively write the tests that would have otherwise been manually requested or written. It will function seamlessly within the GitHub UI and directly within a developer's local workflow via tools like the Gemini CLI.

## 2. Core Features

*   **Integration & Triggers:**
    *   **GitHub Trigger:** The agent will monitor new pull requests and subsequent code pushes within specified repositories via GitHub APIs (webhook events) or GitHub’s MCP servers
    *   **Gemini CLI Trigger:** The agent can be invoked directly from the command line. This allows a developer to run a code review on their local changes, and if the review generates a relevant comment, this test agent can be triggered immediately. 
    *   **Input Agnostic:** The agent must be configured to process comments from human users, other automated systems (e.g., GitHub Actions bots), and AI-generated reviews within the Gemini CLI.

*   **Comment Pattern Recognition:**
    *   The agent will analyze all relevant comments made on code.
    *   It will use an LLM to understand the intent behind the comments and identify patterns related to missing tests or edge cases.
    *   **Initial MVP:** The agent will only act on a pre-defined, strict, and curated list of high-confidence patterns (e.g., "handle null input", "test for an empty array", "throw an error if negative") to minimize ambiguity and ensure high-quality output.
    *   **Advanced:** Allow teams to provide their own custom comment patterns to look for.

*   **Context-Aware Code Analysis:**
    *   When a relevant comment pattern is detected, the agent analyzes the specific block of code the comment refers to.
    *   To ensure accuracy, it must be provided with rich context, including:
        *   The function's signature and surrounding logic.
        *   The entire content of the existing test file to learn the project's testing style, assertion library, and mocking conventions.
        *   The function signatures of any dependencies the code relies on.

*   **Comprehensive Test Generation:**
    *   **Unit Test Generation:** The agent will generate a complete, syntactically correct unit test case based on the comment and rich context, using frameworks like Jest, PyTest, etc.
    *   **End-to-End (E2E) Test Generation:** When comments imply a user workflow (e.g., "Does this form submission work?"), the agent will generate E2E test scripts for frameworks like Cypress or Playwright.
    *   **Manual Test Case Generation:** For UI/UX or complex logic comments, the agent can generate a markdown checklist of manual verification steps for the developer or a QA tester to execute.

*   **Flexible Output Workflow (Human-in-the-Loop):**
    *   **For GitHub:** To mitigate risk, the agent will post the generated output in a reply to the original comment. This could be a code suggestion for unit/E2E tests or a markdown checklist for manual tests. The developer must approve it.
    *   **For Gemini CLI:** The agent will output the generated test code as a patch or print the manual test plan to the console, allowing the developer to instantly review and use the output.

## 3. User Flows

*   **User Flow 1: Human-to-AI Interaction (GitHub - Unit Test)**
    1.  A developer opens a pull request.
    2.  A team member comments: "Good start, but you're not handling the case where the user object is null."
    3.  The AI Agent detects the "null case" pattern and generates a corresponding unit test.
    4.  The agent posts the test as a formal "suggestion."
    5.  The developer reviews, clicks "Commit suggestion," and the test is added.

*   **User Flow 2: AI-to-AI Interaction (GitHub - E2E Test)**
    1.  A developer opens a pull request.
    2.  An AI agent comments: "Bad Practice Detected: The function calculateDiscount does not handle negative input values."
    3.  Our Test Agent detects this comment, generates a test, and posts it as a suggestion.
    4.  The developer accepts the suggestion and fixes the code.

*   **User Flow 3: Developer-to-AI Interaction (Gemini CLI)**
    1.  A developer runs `gemini code review` on local changes.
    2.  The review includes a comment: "The parseData function doesn't account for an empty string input."
    3.  The developer runs `gemini generate-test --from-comment="..."`.
    4.  The agent generates the test and patches the local test file.
    5.  The developer sees the change in their IDE and confirms it's correct.

*   **User Flow 4: Manual Test Case Generation (GitHub)**
    1.  A developer opens a PR with a new UI component.
    2.  A reviewer comments: "Please verify this form's error states for all fields."
    3.  The AI Agent detects the "verify form" intent.
    4.  The agent posts a comment with a markdown checklist:
        ```markdown
        **Manual Test Plan:**
        - [ ] 1. Navigate to the new form page.
        - [ ] 2. Submit the form with the 'Name' field empty. Verify the error message appears.
        - [ ] 3. Submit with an invalid email. Verify the error message appears.
        - [ ] 4. Fill all fields correctly and submit. Verify success.
        ```
    5.  The developer follows the steps to confirm the behavior.

## 4. Technical Considerations

*   **Invocation Mechanism:** The agent must be architected to handle different triggers: listening for GitHub webhooks and responding to direct API calls from the Gemini CLI.
*   **Environment Access & Permissions:**
    *   **GitHub:** Needs API permissions to read repository code/comments and post new comments with suggestions.
    *   **CLI:** Needs read/write access to the local file system to analyze code and apply generated test patches.
*   **Prompt Engineering:** The core prompt must be robust enough to work with context from both a live PR and a local diff. This complexity increases significantly for E2E tests, which require the agent to infer a full user workflow from a localized code comment.
*   **Framework Detection:** A reliable mechanism is needed to determine the project's testing frameworks, including both unit test runners (Jest, PyTest) and E2E frameworks (Cypress, Playwright).
*   **Quality & Verification:** 
    *   **Human-in-the-Loop:** The suggestion/local patch workflow is the primary quality gate, ensuring a human always has the final say.
    *   **Self-Correction (Advanced):** A future enhancement could involve a multi-step AI chain where the agent first generates a test, then receives a second prompt asking it to "act as a senior engineer and critique this test."
