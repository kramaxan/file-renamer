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
        console.error('Your OS is currently not supported.');
        process.exit(1);
}

console.log('Welcome to File Renamer!\nPlease:');

const questions = [
    {
        type: 'input',
        name: 'path',
        message: 'Provide path to files:',
    },
];

inquirer
    .prompt(questions)
    .then((answers) => {
        console.log('Preparing...');

        const PATH_TO_FILES = answers.path;
        const FOLDER_NAME = PATH_TO_FILES.slice(PATH_TO_FILES.lastIndexOf(systemSeparator) + 1);

        let files = readdirSync(PATH_TO_FILES).filter(isNotJunk);
        let sortedFiles = files.sort((a, b) => {
            let c = statSync(`${PATH_TO_FILES}${systemSeparator}${a}`).mtime;
            let d = statSync(`${PATH_TO_FILES}${systemSeparator}${b}`).mtime;
            return c - d;
        });

        console.log('Start renaming...');

        sortedFiles.forEach((oldFileName, index) => {
            let oldFilePath = `${PATH_TO_FILES}${systemSeparator}${oldFileName}`;
            let fileExtension = oldFileName.slice(oldFileName.lastIndexOf('.'));
            let newFileName = `${FOLDER_NAME} (${++index})${fileExtension}`;
            let newFilePath = `${PATH_TO_FILES}${systemSeparator}${newFileName}`;

            renameSync(oldFilePath, newFilePath, (err) => console.log(err));

            console.log(`${oldFileName}  ->  ${newFileName}`);
        });
    })
    .then(
        () => console.log('Renaming completed successfully!'),
        (err) => console.log(err)
    );
