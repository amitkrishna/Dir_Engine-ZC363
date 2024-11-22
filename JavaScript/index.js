const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

class File {
    constructor(parent, name, data) {
        this.parent = parent;
        this.name = name;
        this.data = data;
        this.next = null;
        this.prev = null;
    }

    static deleteFile(file) {
        file.parent = null;
        file.prev = null;
        file.next = null;
    }

    static createFile(parent, name, data) {
        return new File(parent, name, data);
    }
}

class Directory {
    constructor(parent, name) {
        this.parent = parent;
        this.name = name;
        this.child_dir = null;
        this.child_file = null;
        this.next_dir = null;
        this.pre_dir = null;
    }

    getPath() {
        if (this.parent === null) return this.name;
        else {
            return this.parent.getPath() + this.name + "/";
        }
    }

    static list(dir) {
        if (dir.child_dir) {
            let dirHead = dir.child_dir;
            console.log("Sub-directories:");
            while (dirHead) {
                console.log("\t" + dirHead.name);
                dirHead = dirHead.next_dir;
            }
        }
        if (dir.child_file) {
            console.log("Files:");
            let file = dir.child_file;
            while (file) {
                console.log("\t" + file.name);
                file = file.next;
            }
        }
    }

    static createDirectory(parent, directoryName) {
        let head = parent.child_dir;
        if (head === null) {
            parent.child_dir = new Directory(parent, directoryName);
            return;
        }
        let previous = head;
        head = head.next_dir;
        while (head !== null) {
            if (head.name === directoryName) {
                console.log("The directory " + directoryName + " already exists!");
                return;
            }
            previous = head;
            head = head.next_dir;
        }
        head = new Directory(parent, directoryName);
        previous.next_dir = head;
        head.pre_dir = previous;
    }

    static deleteDirectory(dir) {
        if (dir.child_dir) {
            let dirHead = dir.child_dir, temp_dir;
            while (dirHead) {
                temp_dir = dirHead.next_dir;
                Directory.deleteDirectory(dirHead);
                dirHead = temp_dir;
            }
        }

        if (dir.child_file) {
            let file = dir.child_file, temp_file;
            while (file) {
                temp_file = file.next;
                File.deleteFile(file);
                file = temp_file;
            }
        }
        dir.parent = null;
        dir.next_dir = null;
        dir.pre_dir = null;
    }
}

let root = new Directory(null, "/");
let current_dir = root;

function changeDirectory(target) {
    if (target === "..") {
        if (current_dir.name !== "/") {
            current_dir = current_dir.parent;
        }
    } else {
        let head = current_dir.child_dir;
        while (head !== null) {
            if (head.name === target) {
                current_dir = head;
                return;
            }
            head = head.next_dir;
        }
        console.log("Could not find the directory with name " + target);
    }
}

function removeFile(fileName) {
    let head = current_dir.child_file;
    if (head !== null && head.name === fileName) {
        current_dir.child_file = head.next;
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

function removeDirectory(directoryName) {
    let head = current_dir.child_dir;
    if (head !== null && head.name === directoryName) {
        current_dir.child_dir = head.next_dir;
        Directory.deleteDirectory(head);
        return;
    }
    while (head !== null) {
        if (head.name === directoryName) {
            if (head.next_dir !== null) {
                head.next_dir.pre_dir = head.pre_dir;
            }
            if (head.pre_dir !== null) {
                head.pre_dir.next_dir = head.next_dir;
            }
            Directory.deleteDirectory(head);
            return;
        }
        head = head.next_dir;
    }
    console.log("Directory with name " + directoryName + " not found!");
}

function createFile(fileName, data) {
    let head = current_dir.child_file;
    if (head === null) {
        current_dir.child_file = File.createFile(current_dir, fileName, data);
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
    head = File.createFile(current_dir, fileName, data);
    previous.next = head;
    head.prev = previous;
}

function catCommand(fileName) {
    let head = current_dir.child_file;
    while (head !== null) {
        if (head.name === fileName) {
            console.log(head.data);
            return;
        }
        head = head.next;
    }
    console.log("File with name " + fileName + " does not exist!");
}

function identifyCommand(ch) {
    let argument;
    const splchar = /^[a-zA-Z0-9][a-zA-Z0-9.]*$/;
    if (ch === "mkdir") {
        rl.question('Enter directory name: ', (argument) => {
            if (!splchar.test(argument)) {
                console.log("Invalid Folder Name");
                return;
            }
            Directory.createDirectory(current_dir, argument);
        });
    } else if (ch === "rmdir") {
        rl.question('Enter directory name: ', (argument) => {
            removeDirectory(argument);
        });
    } else if (ch === "ls") {
        Directory.list(current_dir);
    } else if (ch === "cd") {
        rl.question('Enter directory name: ', (argument) => {
            changeDirectory(argument);
        });
    } else if (ch === "touch") {
        rl.question('Enter file name: ', (argument) => {
            if (!splchar.test(argument)) {
                console.log("Invalid File Name: " + argument);
                return;
            }
            rl.question('Enter data for the file: ', (data) => {
                createFile(argument, data);
            });
        });
    } else if (ch === "rm") {
        rl.question('Enter file name: ', (argument) => {
            removeFile(argument);
        });
    } else if (ch === "exit") {
        rl.close();
        process.exit(0);
    } else if (ch === "cat") {
        rl.question('Enter file name: ', (argument) => {
            catCommand(argument);
        });
    } else if (ch === "help") {
        console.log("Available commands: mkdir, rmdir, ls, cd, touch, rm, exit, cat, help");
    } else {
        console.log("Invalid command " + ch + "!");
    }
}

function main() {
    rl.setPrompt(current_dir.getPath() + " > ");
    rl.prompt();
    rl.on('line', (command) => {
        identifyCommand(command.trim());
        rl.setPrompt(current_dir.getPath() + " > ");
        rl.prompt();
    });
}

main();