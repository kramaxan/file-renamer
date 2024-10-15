import inquirer from 'inquirer';
import { isNotJunk } from 'junk';
import { readdirSync, statSync, renameSync } from 'fs';

const CURRENT_OS = process.platform;

if (!['darwin', 'linux', 'win32'].includes(CURRENT_OS)) {
    console.error('Your OS is currently not supported.');
    process.exit(1);
}

let systemSeparator;

switch (CURRENT_OS) {
    case 'win32':
        systemSeparator = '\\';
        break;
    case 'darwin':
    case 'linux':
        systemSeparator = '/';
        break;
    default:
        throw 'Your OS is currently not supported.';
}

console.log('Welcome to File Renamer!\nPlease:');

const questions = [
    {
        type: 'input',
        name: 'path',
        message: 'Provide path to folder with files:',
    },
    {
        type: 'input',
        name: 'name',
        message: 'Specify the folder name:',
    },
    {
        type: 'list',
        name: 'extension',
        message: 'Select the appropriate file extension:',
        choices: ['.jpg', '.png', '.mp4'],
    },
];

inquirer
    .prompt(questions)
    .then((answers) => {
        let pathToFiles = `${answers.path}${systemSeparator}${answers.name}`;
        let files = readdirSync(pathToFiles).filter(isNotJunk);
        let sortedFiles = files.sort((a, b) => {
            let c = statSync(`${pathToFiles}${systemSeparator}${a}`).mtime;
            let d = statSync(`${pathToFiles}${systemSeparator}${b}`).mtime;
            return c - d;
        });

        console.log('Start renaming...');

        sortedFiles.forEach((file, index) => {
            let oldFilePath = `${pathToFiles}${systemSeparator}${file}`;
            let newFile = `${answers.name} (${++index})${answers.extension}`;
            let newFilePath = `${pathToFiles}${systemSeparator}${newFile}`;

            renameSync(oldFilePath, newFilePath, (err) => console.log(err));

            console.log(`${file}  ->  ${newFile}`);
        });
    })
    .then(
        () => console.log('Renaming completed successfully!'),
        (err) => console.log(err)
    );
