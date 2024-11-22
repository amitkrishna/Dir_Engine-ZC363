#include <iostream> //for std input/output
#include <regex>
#include<string> // for string class

using namespace std;


//Declaring classes as these have inter-dependency
class File;

class Directory;

//Class for file
class File {
public:
    string name;
    string data;
    Directory *parent;
    File *next;
    File *prev;

    File(Directory *parent, string name, string data) {
        this->parent = parent;
        this->name = std::move(name);
        this->data = std::move(data);
        this->next = nullptr;
        this->prev = nullptr;
    }

    static void deleteFile(File *file) {
        file->parent = nullptr;
        file->prev = nullptr;
        file->next = nullptr;

        delete file;
    }

    static File *createFile(Directory *parent, string name, string data) {
        return new File(parent, std::move(name), std::move(data));
    }
};

// Structure of a Directory
class Directory {
public:
    string name;
    Directory *parent;

    //List of child directories and files
    Directory *child_dir;
    Directory *next_dir;
    Directory *pre_dir;

    File *child_file;

    Directory(Directory *parent, string name) {
        this->parent = parent;
        this->name = std::move(name);
        this->child_dir = nullptr;
        this->child_file = nullptr;
        this->next_dir = nullptr;
        this->pre_dir = nullptr;
    }

    string getPath() {
        if (parent == nullptr) return name;
        else {
            return parent->getPath() + name + "/";
        }
    }

    static void list(Directory *dir) {
        if (dir->child_dir) {
            Directory *dirHead = dir->child_dir;
            cout << "Sub-directories:" << endl;
            while (dirHead) {
                string dir_name = dirHead->name;
                cout << "\t" << dir_name << endl;
                dirHead = dirHead->next_dir;
            }
        }
        if (dir->child_file) {
            cout << "Files:" << endl;
            File *file = (dir->child_file);
            while (file) {
                string file_name = file->name;
                cout << "\t" << file_name << endl;
                file = file->next;
            }
        }
    }

    static void createDirectory(Directory *parent, string directoryName) {
        Directory *head = parent->child_dir;
        if (head == nullptr) {
            parent->child_dir = new Directory(parent, std::move(directoryName));
            return;
        }
        Directory *previous = head;
        head = head->next_dir;
        while (head != nullptr) {
            if (head->name == directoryName) {
                cout << "The directory " << directoryName << " already exists!" << endl;
                return;
            }
            previous = head;
            head = head->next_dir;
        }
        head = new Directory(parent, directoryName);
        previous->next_dir = head;
        head->pre_dir = previous;
    }

    static void deleteDirectory(Directory *dir)//function to delete Directory
    {
        if (dir->child_dir) {
            Directory *dirHead = (dir->child_dir), *temp_dir;
            while (dirHead) {
                temp_dir = dirHead->next_dir;
                deleteDirectory(dirHead);
                dirHead = temp_dir;
            }
        }

        if (dir->child_file) {
            File *file = (dir->child_file), *temp_file;
            while (file) {
                temp_file = file->next;
                File::deleteFile(file);
                file = temp_file;
            }
        }
        dir->parent = nullptr;
        dir->next_dir = nullptr;
        dir->pre_dir = nullptr;
        delete dir;
    }
};

Directory *root = new Directory(nullptr, "/");
Directory *current_dir = root;

void changeDirectory(string target) {
    if (target == "..") {
        if (current_dir->name != "/") {
            current_dir = current_dir->parent;
        }
    } else {
        Directory *head = current_dir->child_dir;
        while (head != nullptr) {
            if (head->name == target) {
                current_dir = head;
                return;
            }
            head = head->next_dir;
        }
        cout << "Could not find the directory with name " << target << endl;
    }
}

void removeFile(string fileName) {
    File *head = current_dir->child_file;
    if (head != nullptr && head->name == fileName) {
        current_dir->child_file = head->next;
        File::deleteFile(head);
        return;
    }
    while (head != nullptr) {
        if (head->name == fileName) {
            if (head->next != nullptr) {
                head->next->prev = head->prev;
            }
            if (head->prev != nullptr) {
                head->prev->next = head->next;
            }
            File::deleteFile(head);
            return;
        }
        head = head->next;
    }
    cout << "File with name " << fileName << " not found!" << endl;
}

void removeDirectory(string directoryName) {
    Directory *head = current_dir->child_dir;
    if (head != nullptr && head->name == directoryName) {
        current_dir->child_dir = head->next_dir;
        Directory::deleteDirectory(head);
        return;
    }
    while (head != nullptr) {
        if (head->name == directoryName) {
            if (head->next_dir != nullptr) {
                head->next_dir->pre_dir = head->pre_dir;
            }
            if (head->pre_dir != nullptr) {
                head->pre_dir->next_dir = head->next_dir;
            }
            Directory::deleteDirectory(head);
            return;
        }
        head = head->next_dir;
    }
    cout << "Directory with name " << directoryName << " not found!" << endl;
}

void createFile(string fileName, string data) {
    File *head = current_dir->child_file;
    if (head == nullptr) {
        current_dir->child_file = File::createFile(current_dir, fileName, data);
        return;
    }
    File *previous = head;
    head = head->next;
    while (head != nullptr) {
        if (head->name == fileName) {
            cout << "The file " << fileName << " already exists!" << endl;
            return;
        }
        previous = head;
        head = head->next;
    }
    head = File::createFile(current_dir, fileName, data);
    previous->next = head;
    head->prev = previous;

}

void catCommand(string fileName) {
    File *head = current_dir->child_file;
    while (head != nullptr) {
        if (head->name == fileName) {
            cout << head->data << endl;
            return;
        }
        head = head->next;
    }
    cout << "File with name " << fileName << " does not exist!" << endl;
}

int identifyCommand(string ch) {
    string argument;
    regex splchar("[a-zA-Z0-9][a-zA-Z0-9.]*");
    if (ch == "mkdir") {
        cin >> argument;
        if (!regex_match(argument, splchar)) {
            cout << "Invalid Folder Name" << endl;
            return 1;
        }

        Directory::createDirectory(current_dir, argument);
        return 1;

    } else if (ch == "rmdir") {

        cin >> argument;

        removeDirectory(argument);
        return 1;
    } else if (ch == "ls") {
        Directory::list(current_dir);
        return 1;
    } else if (ch == "cd") {
        cin >> argument;
        changeDirectory(argument);
        return 1;
    } else if (ch == "touch") {
        cin >> argument;
        if (!regex_match(argument, splchar)) {
            cout << "Invalid File Name:" << argument << endl;
            return 1;
        }
        //Clear input buffer
        cin.sync();
        cin.clear();
        //--------------------
        cout << "Enter data for the file:" << endl;
        string data;
        //getchar();
        getline(cin, data);
        createFile(argument, data);
        return 1;
    } else if (ch == "rm") {
        cin >> argument;
        removeFile(argument);
        return 1;
    } else if (ch == "exit") {
        return 0;
    } else if (ch == "cat") {
        cin >> argument;
        catCommand(argument);//function to get contents of a file
        return 1;
    } else if (ch == "help") {
        cout << "---------------------- All supported commands -----------------------------\n\n"
                "ls                \tLists directories and files under current directory\n"
                "cd <path />       \tChange directory to child directory\n"
                "cd ..             \tChange directory to its parent\n"
                "mkdir <dir-name>  \tCreate directory under current directory with name specified\n"
                "rmdir <dir-name>  \tRemove the directory under current directory with the name specified\n"
                "rm <file>         \tRemove a file in current directory\n"
                "touch <file-name> \tCreate a file with name specified under current directory\n"
                "cat <file-name>   \tDisplay content of the file specified\n"
                "---------------------------------------------------------------------------\n\n"
             << endl;
        return 1;
    } else {
        cout << "Invalid command " << ch << "!" << endl;
        return 1;
    }
}


#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wmissing-noreturn"


int main() {
    string command;

    while (true) {
        //clear the buffer
        cin.sync();
        cin.clear();
        //----------------

        cout << current_dir->getPath() << " >";
        cin >> command;
        int signal = identifyCommand(command);
        if (signal == 0)//checks if the command is valid or not
        {
            break;
        }
    }
    return 0;
}

#pragma clang diagnostic pop

/** ls ------ Lists directories and files under current directory
 * cd <path />  ------ Change directory to child directory
 *  cd ..       ------ Change directory to its parent
 *  mkdir <dir-name>  ------- Create directory under current directory with name specified
 *  rmdir <dir-name>  ------- Remove the directory under current directory with the name specified
 *  rm <file> ------- Remove a file in current directory
 *  touch <file-name> ------- Create a file with name specified under current directory */