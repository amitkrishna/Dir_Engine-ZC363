import java.util.Scanner;
import java.util.regex.Pattern;

class File {
    String name;
    String data;
    Directory parent;
    File next;
    File prev;

    File(Directory parent, String name, String data) {
        this.parent = parent;
        this.name = name;
        this.data = data;
        this.next = null;
        this.prev = null;
    }

    static void deleteFile(File file) {
        file.parent = null;
        file.prev = null;
        file.next = null;
    }

    static File createFile(Directory parent, String name, String data) {
        return new File(parent, name, data);
    }
}

class Directory {
    String name;
    Directory parent;
    Directory childDir;
    Directory nextDir;
    Directory prevDir;
    File childFile;

    Directory(Directory parent, String name) {
        this.parent = parent;
        this.name = name;
        this.childDir = null;
        this.childFile = null;
        this.nextDir = null;
        this.prevDir = null;
    }

    String getPath() {
        if (parent == null) return name;
        else {
            return parent.getPath() + name + "/";
        }
    }

    static void list(Directory dir) {
        if (dir.childDir != null) {
            Directory dirHead = dir.childDir;
            System.out.println("Sub-directories:");
            while (dirHead != null) {
                System.out.println("\t" + dirHead.name);
                dirHead = dirHead.nextDir;
            }
        }
        if (dir.childFile != null) {
            System.out.println("Files:");
            File file = dir.childFile;
            while (file != null) {
                System.out.println("\t" + file.name);
                file = file.next;
            }
        }
    }

    static void createDirectory(Directory parent, String directoryName) {
        Directory head = parent.childDir;
        if (head == null) {
            parent.childDir = new Directory(parent, directoryName);
            return;
        }
        Directory previous = head;
        head = head.nextDir;
        while (head != null) {
            if (head.name.equals(directoryName)) {
                System.out.println("The directory " + directoryName + " already exists!");
                return;
            }
            previous = head;
            head = head.nextDir;
        }
        head = new Directory(parent, directoryName);
        previous.nextDir = head;
        head.prevDir = previous;
    }

    static void deleteDirectory(Directory dir) {
        if (dir.childDir != null) {
            Directory dirHead = dir.childDir, tempDir;
            while (dirHead != null) {
                tempDir = dirHead.nextDir;
                deleteDirectory(dirHead);
                dirHead = tempDir;
            }
        }

        if (dir.childFile != null) {
            File file = dir.childFile, tempFile;
            while (file != null) {
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

public class FileSystem {
    static Directory root = new Directory(null, "/");
    static Directory currentDir = root;

    public static void changeDirectory(String target) {
        if (target.equals("..")) {
            if (!currentDir.name.equals("/")) {
                currentDir = currentDir.parent;
            }
        } else {
            Directory head = currentDir.childDir;
            while (head != null) {
                if (head.name.equals(target)) {
                    currentDir = head;
                    return;
                }
                head = head.nextDir;
            }
            System.out.println("Could not find the directory with name " + target);
        }
    }

    public static void removeFile(String fileName) {
        File head = currentDir.childFile;
        if (head != null && head.name.equals(fileName)) {
            currentDir.childFile = head.next;
            File.deleteFile(head);
            return;
        }
        while (head != null) {
            if (head.name.equals(fileName)) {
                if (head.next != null) {
                    head.next.prev = head.prev;
                }
                if (head.prev != null) {
                    head.prev.next = head.next;
                }
                File.deleteFile(head);
                return;
            }
            head = head.next;
        }
        System.out.println("File with name " + fileName + " not found!");
    }

    public static void removeDirectory(String directoryName) {
        Directory head = currentDir.childDir;
        if (head != null && head.name.equals(directoryName)) {
            currentDir.childDir = head.nextDir;
            Directory.deleteDirectory(head);
            return;
        }
        while (head != null) {
            if (head.name.equals(directoryName)) {
                if (head.nextDir != null) {
                    head.nextDir.prevDir = head.prevDir;
                }
                if (head.prevDir != null) {
                    head.prevDir.nextDir = head.nextDir;
                }
                Directory.deleteDirectory(head);
                return;
            }
            head = head.nextDir;
        }
        System.out.println("Directory with name " + directoryName + " not found!");
    }

    public static void createFile(String fileName, String data) {
        File head = currentDir.childFile;
        if (head == null) {
            currentDir.childFile = File.createFile(currentDir, fileName, data);
            return;
        }
        File previous = head;
        head = head.next;
        while (head != null) {
            if (head.name.equals(fileName)) {
                System.out.println("The file " + fileName + " already exists!");
                return;
            }
            previous = head;
            head = head.next;
        }
        head = File.createFile(currentDir, fileName, data);
        previous.next = head;
        head.prev = previous;
    }

    public static void catCommand(String fileName) {
        File head = currentDir.childFile;
        while (head != null) {
            if (head.name.equals(fileName)) {
                System.out.println(head.data);
                return;
            }
            head = head.next;
        }
        System.out.println("File with name " + fileName + " does not exist!");
    }

    public static void identifyCommand(String ch) {
        Scanner scanner = new Scanner(System.in);
        String argument;
        Pattern splchar = Pattern.compile("[a-zA-Z0-9][a-zA-Z0-9.]*");
        switch (ch) {
            case "mkdir":
                System.out.print("Enter directory name: ");
                argument = scanner.next();
                if (!splchar.matcher(argument).matches()) {
                    System.out.println("Invalid Folder Name");
                    return;
                }
                Directory.createDirectory(currentDir, argument);
                break;
            case "rmdir":
                System.out.print("Enter directory name: ");
                argument = scanner.next();
                removeDirectory(argument);
                break;
            case "ls":
                Directory.list(currentDir);
                break;
            case "cd":
                System.out.print("Enter directory name: ");
                argument = scanner.next();
                changeDirectory(argument);
                break;
            case "touch":
                System.out.print("Enter file name: ");
                argument = scanner.next();
                if (!splchar.matcher(argument).matches()) {
                    System.out.println("Invalid File Name: " + argument);
                    return;
                }
                scanner.nextLine(); // clear the buffer
                System.out.print("Enter data for the file: ");
                String data = scanner.nextLine();
                createFile(argument, data);
                break;
            case "rm":
                System.out.print("Enter file name: ");
                argument = scanner.next();
                removeFile(argument);
                break;
            case "exit":
                System.exit(0);
                break;
            case "cat":
                System.out.print("Enter file name: ");
                argument = scanner.next();
                catCommand(argument);
                break;
            case "help":
                System.out.println("Available commands: mkdir, rmdir, ls, cd, touch, rm, exit, cat, help");
                break;
            default:
                System.out.println("Invalid command " + ch + "!");
                break;
        }
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        while (true) {
            System.out.print(currentDir.getPath() + " > ");
            String command = scanner.next();
            identifyCommand(command);
        }
    }
}