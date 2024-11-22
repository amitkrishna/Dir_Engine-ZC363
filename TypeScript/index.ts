class File {
    name: string;
    data: string;
    parent: Directory | null;
    next: File | null;
    prev: File | null;

    constructor(parent: Directory | null, name: string, data: string) {
        this.parent = parent;
        this.name = name;
        this.data = data;
        this.next = null;
        this.prev = null;
    }

    static deleteFile(file: File): void {
        file.parent = null;
        file.prev = null;
        file.next = null;
    }

    static createFile(parent: Directory, name: string, data: string): File {
        return new File(parent, name, data);
    }
}

class Directory {
    name: string;
    parent: Directory | null;
    childDir: Directory | null;
    nextDir: Directory | null;
    prevDir: Directory | null;
    childFile: File | null;

    constructor(parent: Directory | null, name: string) {
        this.parent = parent;
        this.name = name;
        this.childDir = null;
        this.childFile = null;
        this.nextDir = null;
        this.prevDir = null;
    }

    getPath(): string {
        if (this.parent === null) return this.name;
        else {
            return this.parent.getPath() + this.name + "/";
        }
    }

    static list(dir: Directory): void {
        if (dir.childDir) {
            let dirHead = dir.childDir;
            console.log("Sub-directories:");
            while (dirHead) {
                console.log("\t" + dirHead.name);
                dirHead = dirHead.nextDir;
            }
        }
        if (dir.childFile) {
            console.log("Files:");
            let file = dir.childFile;
            while (file) {
                console.log("\t" + file.name);
                file = file.next;
            }
        }
    }

    static createDirectory(parent: Directory, directoryName: string): void {
        let head = parent.childDir;
        if (head === null) {
            parent.childDir = new Directory(parent, directoryName);
            return;
        }
        let previous = head;
        head = head.nextDir;
        while (head !== null) {
            if (head.name === directoryName) {
                console.log("The directory " + directoryName + " already exists!");
                return;
            }
            previous = head;
            head = head.nextDir;
        }
        head = new Directory(parent, directoryName);
        previous.nextDir = head;
        head.prevDir = previous;
    }

    static deleteDirectory(dir: Directory): void {
        if (dir.childDir) {
            let dirHead = dir.childDir, tempDir: Directory | null;
            while (dirHead) {
                tempDir = dirHead.nextDir;
                Directory.deleteDirectory(dirHead);
                dirHead = tempDir;
            }
        }

        if (dir.childFile) {
            let file = dir.childFile, tempFile: File | null;
            while (file) {
                tempFile = file.next;
                File.deleteFile(file);
                file = tempFile;
            }
        }
        dir.parent = null;
        dir.nextDir = null;
        dir.prevDir = null;
    }
}

let root = new Directory(null, "/");
let currentDir = root;

function changeDirectory(target: string): void {
    if (target === "..") {
        if (currentDir.name !== "/") {
            currentDir = currentDir.parent!;
        }
    } else {
        let head = currentDir.childDir;
        while (head !== null) {
            if (head.name === target) {
                currentDir = head;
                return;
            }
            head = head.nextDir;
        }
        console.log("Could not find the directory with name " + target);
    }
}

function removeFile(fileName: string): void {
    let head = currentDir.childFile;
    if (head !== null && head.name === fileName) {
        currentDir.childFile = head.next;
        File.deleteFile(head);
        return;
    }
    while (head !== null) {
        if (head.name === fileName) {
            if (head.next !== null) {
                head.next.prev = head.prev;
            }
            if (head.prev !== null) {
                head.prev.next = head.next;
            }
            File.deleteFile(head);
            return;
        }
        head = head.next;
    }
    console.log("File with name " + fileName + " not found!");
}

function removeDirectory(directoryName: string): void {
    let head = currentDir.childDir;
    if (head !== null && head.name === directoryName) {
        currentDir.childDir = head.nextDir;
        Directory.deleteDirectory(head);
        return;
    }
    while (head !== null) {
        if (head.name === directoryName) {
            if (head.nextDir !== null) {
                head.nextDir.prevDir = head.prevDir;
            }
            if (head.prevDir !== null) {
                head.prevDir.nextDir = head.nextDir;
            }
            Directory.deleteDirectory(head);
            return;
        }
        head = head.nextDir;
    }
    console.log("Directory with name " + directoryName + " not found!");
}

function createFile(fileName: string, data: string): void {
    let head = currentDir.childFile;
    if (head === null) {
        currentDir.childFile = File.createFile(currentDir, fileName, data);
        return;
    }
    let previous = head;
    head = head.next;
    while (head !== null) {
        if (head.name === fileName) {
            console.log("The file " + fileName + " already exists!");
            return;
        }
        previous = head;
        head = head.next;
    }
    head = File.createFile(currentDir, fileName, data);
    previous.next = head;
    head.prev = previous;
}

function catCommand(fileName: string): void {
    let head = currentDir.childFile;
    while (head !== null) {
        if (head.name === fileName) {
            console.log(head.data);
            return;
        }
        head = head.next;
    }
    console.log("File with name " + fileName + " does not exist!");
}

function identifyCommand(ch: string): void {
    const splchar = /^[a-zA-Z0-9][a-zA-Z0-9.]*$/;
    const scanner = require('readline-sync');
    let argument: string;
    switch (ch) {
        case "mkdir":
            argument = scanner.question('Enter directory name: ');
            if (!splchar.test(argument)) {
                console.log("Invalid Folder Name");
                return;
            }
            Directory.createDirectory(currentDir, argument);
            break;
        case "rmdir":
            argument = scanner.question('Enter directory name: ');
            removeDirectory(argument);
            break;
        case "ls":
            Directory.list(currentDir);
            break;
        case "cd":
            argument = scanner.question('Enter directory name: ');
            changeDirectory(argument);
            break;
        case "touch":
            argument = scanner.question('Enter file name: ');
            if (!splchar.test(argument)) {
                console.log("Invalid File Name: " + argument);
                return;
            }
            const data = scanner.question('Enter data for the file: ');
            createFile(argument, data);
            break;
        case "rm":
            argument = scanner.question('Enter file name: ');
            removeFile(argument);
            break;
        case "exit":
            process.exit(0);
        case "cat":
            argument = scanner.question('Enter file name: ');
            catCommand(argument);
            break;
        case "help":
            console.log("Available commands: mkdir, rmdir, ls, cd, touch, rm, exit, cat, help");
            break;
        default:
            console.log("Invalid command " + ch + "!");
            break;
    }
}

function main(): void {
    const scanner = require('readline-sync');
    while (true) {
        const command = scanner.question(currentDir.getPath() + " > ");
        identifyCommand(command.trim());
    }
}

main();