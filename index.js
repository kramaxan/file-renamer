import inquirer from 'inquirer';
import { renameSync, readdirSync, statSync } from 'fs';

console.log('Welcome to File Renamer!\nPlease:');

const questions = [
    {
        type: 'input',
        name: 'path',
        message: 'Provide path to files folder:',
    },
    {
        type: 'input',
        name: 'name',
        message: 'Specify the name of folder:',
    },
    {
        type: 'list',
        name: 'extension',
        message: 'Select the appropriate file extension:',
        choices: ['.jpg', '.mp4'],
    },
];

inquirer
    .prompt(questions)
    .then((answers) => {
        let pathToFiles = `${answers.path}\\${answers.name}`;
        let files = readdirSync(pathToFiles);
        let sortedFiles = files.sort((a, b) => {
            let c = statSync(`${pathToFiles}\\${a}`).mtime;
            let d = statSync(`${pathToFiles}\\${b}`).mtime;
            return c - d;
        });

        console.log('Start renaming...');

        sortedFiles.forEach((file, index) => {
            let oldFilePath = `${pathToFiles}\\${file}`;
            let newFile = `${answers.name} (${++index})${answers.extension}`;
            let newFilePath = `${pathToFiles}\\${newFile}`;

            renameSync(oldFilePath, newFilePath, (err) => console.log(err));

            console.log(`${file}  ->  ${newFile}`);
        });
    })
    .then(
        () => console.log('Renaming completed successfully!'),
        (err) => console.log(err)
    );
