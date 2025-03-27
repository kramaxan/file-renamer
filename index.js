import inquirer from 'inquirer';
import { isNotJunk } from 'junk';
import { sep as separator } from 'path';
import { existsSync, readdirSync, statSync, renameSync } from 'fs';

if (!['darwin', 'linux', 'win32'].includes(process.platform)) {
    console.warn('Your OS is currently not supported.');
    process.exit(1);
}

console.log('Welcome to File Renamer!\nPlease:');

const questions = [
    {
        type: 'input',
        name: 'path',
        message: 'Provide path to files:',
        validate: (input) => {
            if (!input.trim()) {
                return 'Path cannot be empty.';
            }
            if (!existsSync(input)) {
                return 'The provided path does not exist.';
            }
            return true;
        },
    },
];

inquirer
    .prompt(questions)
    .then((answers) => {
        console.log('Preparing...');

        const { path } = answers;

        const sortedFiles = getSortedFiles(path);

        console.log(`Found ${sortedFiles.length} files in the directory.`);
        console.log('Start renaming...');

        firstRename(sortedFiles, path);

        console.log('Finishing...');

        const renamedFiles = getSortedFiles(path);

        secondRename(renamedFiles, path);

        console.log('Renaming completed successfully!');
    })
    .catch((error) => {
        if (error instanceof Error && error.name === 'ExitPromptError') {
            console.log('See you next time!');
        } else {
            throw error;
        }
    });

function getSortedFiles(path) {
    const files = readdirSync(path).filter(isNotJunk);

    if (files.length === 0) {
        console.warn('No valid files found in the directory.');
        process.exit(1);
    }

    const sortedFiles = files.sort((a, b) => {
        let c = statSync(`${path}${separator}${a}`).mtime.getTime();
        let d = statSync(`${path}${separator}${b}`).mtime.getTime();
        return c - d;
    });

    return sortedFiles;
}

function firstRename(files, path) {
    const folderName = path.slice(path.lastIndexOf(separator) + 1);

    files.forEach((fileName, index) => {
        const filePath = `${path}${separator}${fileName}`;
        const fileExtension = fileName.slice(fileName.lastIndexOf('.'));
        const newFileName = `_TEMP_${folderName} (${++index})${fileExtension}`;
        const newFilePath = `${path}${separator}${newFileName}`;

        renameSync(filePath, newFilePath);

        console.log(`${fileName}  ->  ${newFileName.slice(6)}`);
    });
}

function secondRename(files, path) {
    files.forEach((fileName) => {
        if (fileName.startsWith('_TEMP_')) {
            const newFileName = fileName.slice(6);
            const filePath = `${path}${separator}${fileName}`;
            const newFilePath = `${path}${separator}${newFileName}`;

            renameSync(filePath, newFilePath);
        }
    });
}
