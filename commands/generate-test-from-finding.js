const { generateTest } = require('./testAgentLogic.js');
const fs = require('fs/promises');

// Session state simulation
const SESSION_FILE = '.test-agent-session.json';

exports.command = '/generate-test-from-finding <file> <line>';
exports.describe = 'Generates a test case from a code review finding.';

exports.builder = yargs => {
  return yargs.positional('file', {
    describe: 'The file path of the finding from the code review report.',
    type: 'string'
  }).positional('line', {
    describe: 'The line number of the finding from the code review report.',
    type: 'number'
  });
};

exports.handler = async (argv) => {
  const { newTestCase, testFilePath } = await generateTest(argv);

  if (newTestCase && testFilePath) {
    console.log('--- SUGGESTED TEST CASE ---');
    console.log(newTestCase);

    // Simulate session state by writing to a temporary file
    const sessionData = { newTestCase, testFilePath };
    await fs.writeFile(SESSION_FILE, JSON.stringify(sessionData));

    console.log('\nTo accept this test, run: /commit-test');
  }
};