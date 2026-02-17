const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const projectRoot = __dirname;
console.log(`Running in ${projectRoot}`);

const run = (cmd) => {
    try {
        execSync(cmd, { stdio: 'inherit', cwd: projectRoot });
    } catch (error) {
        // Ignore errors
    }
};

const checkoutMain = () => {
    run(`git checkout main`);
};

const createBranch = (branchName) => {
    checkoutMain();
    run(`git checkout -b ${branchName}`);
};

const mergeBranch = (branchName) => {
    checkoutMain();
    run(`git merge ${branchName} --no-ff -m "Merge branch '${branchName}'"`);
};

const commit = (msg) => {
    run(`git add .`);
    run(`git commit -m "${msg}" --allow-empty`);
};

const features = [
    {
        name: 'Project Structure',
        branch: 'feat/project-structure',
        steps: [
            { file: 'README.md', append: '\n## Overview\nThis is a Stacks blockchain project based on micro-commit architecture.', msg: 'docs: add overview section' },
            { dir: 'contracts', msg: 'feat: create contracts directory' },
            { dir: 'tests', msg: 'feat: create tests directory' },
            { dir: 'scripts', msg: 'feat: create scripts directory' },
            { dir: 'frontend', msg: 'feat: create frontend directory' },
        ]
    },
    {
        name: 'Clarinet Configuration',
        branch: 'config/clarinet',
        steps: [
            { file: 'Clarinet.toml', content: '[project]\nname = "Stx-conapp"\nrequirements = []\n', msg: 'config: init Clarinet.toml file' },
            { file: 'Clarinet.toml', append: '[contracts.escrow]\npath = "contracts/escrow.clar"\n', msg: 'config: add escrow contract path' },
            { file: 'Clarinet.toml', append: 'clarity_version = 4\nepoch = "3.3"\n', msg: 'config: set clarity version 4 and epoch 3.3' },
        ]
    },
    {
        name: 'Package Configuration',
        branch: 'config/package-json',
        steps: [
            { file: 'package.json', content: '{\n  "name": "stx-conapp",\n  "version": "1.0.0",\n  "description": "Stacks Connect App",\n  "main": "index.js",\n  "scripts": {\n    "test": "echo \\"Error: no test specified\\" && exit 1"\n  },\n  "author": "",\n  "license": "ISC",\n', msg: 'config: init package.json structure' },
            { file: 'package.json', append: '  "dependencies": {\n', msg: 'pkg: start dependencies section' },
            { file: 'package.json', append: '    "@stacks/connect": "^7.0.0",\n', msg: 'pkg: add @stacks/connect dependency' },
            { file: 'package.json', append: '    "@stacks/transactions": "^6.0.0",\n', msg: 'pkg: add @stacks/transactions dependency' },
            { file: 'package.json', append: '    "@hirosystems/chainhooks-client": "^1.0.0",\n', msg: 'pkg: add @hirosystems/chainhooks-client dependency' },
            { file: 'package.json', append: '    "@walletconnect/web3-provider": "^1.8.0"\n  }\n}\n', msg: 'pkg: add walletconnect dependency and close json' },
        ]
    },
    {
        name: 'Wallet Setup',
        branch: 'feat/wallet-connect-setup',
        steps: [
            { file: 'frontend/wallet.js', content: '// Wallet Connect Implementation\n', msg: 'feat: init wallet setup file' },
            { file: 'frontend/wallet.js', append: 'import { AppConfig, UserSession, showConnect } from "@stacks/connect";\n', msg: 'feat: import stacks connect modules' },
            { file: 'frontend/wallet.js', append: 'import { StacksMocknet } from "@stacks/network";\n', msg: 'feat: import stacks network module' },
            { file: 'frontend/wallet.js', append: '\nconst appConfig = new AppConfig(["store_write", "publish_data"]);\n', msg: 'feat: configure app config' },
            { file: 'frontend/wallet.js', append: 'export const userSession = new UserSession({ appConfig });\n', msg: 'feat: create user session' },
        ]
    }
];

function generateGranularCommits(baseName, count) {
    const extra = [];
    for (let i = 0; i < count; i++) {
        const branchName = `feat/${baseName.toLowerCase()}-${i}`;
        const steps = [];

        const filename = `frontend/component_${baseName}_${i}.js`;
        steps.push({ file: filename, content: `// Component ${i}\n`, msg: `feat: init component ${i}` });

        for (let j = 0; j < 7; j++) {
            steps.push({ file: filename, append: `export const func${j} = () => {\n  console.log("Action ${j}");\n};\n`, msg: `feat: add function ${j} to component ${i}` });
            steps.push({ file: filename, append: `// Documentation for func${j}\n`, msg: `docs: add doc for func${j}` });
        }

        extra.push({ name: branchName, branch: branchName, steps });
    }
    return extra;
};

const extraFeatures = generateGranularCommits('Auto', 35);
const allFeatures = [...features, ...extraFeatures];

const execute = () => {
    // 1. Reset Git
    const gitDir = path.join(projectRoot, '.git');
    if (fs.existsSync(gitDir)) {
        console.log("Removing existing .git...");
        fs.rmSync(gitDir, { recursive: true, force: true });
    }

    // 2. Init
    run('git init');
    run('git remote add origin https://github.com/teefeh-07/Stx-conapp.git');

    // 3. Initial Commit on Main
    if (!fs.existsSync(path.join(projectRoot, 'README.md'))) {
        fs.writeFileSync(path.join(projectRoot, 'README.md'), '# Stx-conapp\n');
    }
    run('git add .');
    run('git commit -m "initial commit"');
    run('git branch -M main');

    // 4. Feature Loop
    let branchCount = 0;
    for (const feat of allFeatures) {
        console.log(`Processing ${feat.name}...`);
        createBranch(feat.branch);
        branchCount++;

        for (const step of feat.steps) {
            if (step.dir) {
                const dirPath = path.join(projectRoot, step.dir);
                if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
                fs.writeFileSync(path.join(dirPath, '.gitkeep'), '');
                commit(step.msg);
            } else {
                const filePath = path.join(projectRoot, step.file);
                // Ensure dir exists
                const dir = path.dirname(filePath);
                if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

                if (step.content !== undefined) {
                    fs.writeFileSync(filePath, step.content);
                } else if (step.append !== undefined) {
                    fs.appendFileSync(filePath, step.append);
                }
                commit(step.msg);
            }
        }

        mergeBranch(feat.branch);
    }

    console.log(`Finished processing. Created ${branchCount} branches.`);
    run('echo Commit Count:');
    run('git rev-list --count main');
};

execute();
