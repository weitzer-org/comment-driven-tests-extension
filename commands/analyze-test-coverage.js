const { spawn } = require('child_process');
const fs = require('fs/promises');
const path = require('path');

async function analyzeTestCoverage() {
    try {
        const testOutput = await new Promise((resolve, reject) => {
            const c8 = spawn('npx', ['c8', '--reporter=json-summary', '--reporter=text', 'npm', 'test']);
            let output = '';

            c8.stdout.on('data', (data) => {
                output += data.toString();
            });

            c8.stderr.on('data', (data) => {
                output += data.toString();
            });

            c8.on('close', (code) => {
                if (code !== 0 && !output.includes('FAIL')) {
                    reject(new Error(`c8 process exited with code ${code}:
${output}`));
                } else {
                    resolve(output);
                }
            });
        });

        console.log(testOutput);

        if (testOutput.includes('FAIL')) {
            console.log('\nWarning: Tests are failing. The code coverage report may be inaccurate.\n');
        }

        const summaryPath = path.join(process.cwd(), 'coverage', 'coverage-summary.json');
        const summary = JSON.parse(await fs.readFile(summaryPath, 'utf-8'));
        const overallCoverage = summary.total.lines.pct;

        console.log(`\nOverall test coverage: ${overallCoverage}%\n`);

        if (overallCoverage < 80) {
            console.log('\nRecommendations:\n');
            console.log(`- Overall test coverage is ${overallCoverage}%, which is below the recommended 80%. Consider adding more tests to improve coverage.`);
        }
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

analyzeTestCoverage();
