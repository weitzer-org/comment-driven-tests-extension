const { commitTest } = require('./testAgentLogic.js');
const fs = require('fs/promises');

// Session state simulation
const SESSION_FILE = '.test-agent-session.json';

exports.command = '/commit-test';
exports.describe = 'Commits the last generated test to the corresponding test file.';

exports.handler = async (argv) => {
  try {
    const sessionData = await fs.readFile(SESSION_FILE, 'utf-8');
    const { newTestCase, testFilePath } = JSON.parse(sessionData);

    if (newTestCase && testFilePath) {
      await commitTest(newTestCase, testFilePath);
      // Clean up the session file after committing
      await fs.unlink(SESSION_FILE);
    } else {
      console.log('No test case to commit. Run /generate-test first.');
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('No test case to commit. Run /generate-test first.');
    } else {
      console.error('An error occurred:', error);
    }
  }
};
