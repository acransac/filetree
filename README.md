# Introduction
**filetree** maps _file entries_ in a typical filesystem tree with _handles_ which can be anything relevant to an application. The tree is navigated with a _selection_. Also, this library exposes some of its internal tooling to allow reimplementation of its logic.

# How To Use Filetree
Add **filetree** to a project with:

```shell
    $ npm install @acransac/filetree
```

and import the needed functionalities:

```javascript
    const { branches, entryName, insertInFileTree, isDirectoryEntry, isFileSelected, makeFileEntry, makeFileTree, makeSelectionInFileTree, parseFilePath, refreshSelectedFileTree, root, selectedBranch, selectedEntry, selectedEntryBranchName, selectedEntryHandle, selectedEntryLeafName, selectedEntryName, selectNext, selectPrevious, visitChildBranch, visitParentBranch } = require('@acransac/filetree');
```

## Make a File Tree And Selection
Create an empty _file tree_ and selection with `makeFileTree` and `makeSelectionInFileTree`. Then, use `insertInFileTree` to add entries which are created with `makeFileEntry`. After each insertion, the selection is updated with `refreshSelectedFileTree`.

A file tree can be inspected with `root` and `branches`, and an entry with `entryName` or `isDirectoryEntry` though it is preferred to inspect the selection. This is done with `selectedBranch`, `selectedEntry`, `selectedEntryBranchName`, `selectedEntryHandle`, `selectedEntryLeafName`, `selectedEntryName` or `isFileSelected`:
* `makeFileTree:: (Maybe<String>, Maybe<Branches>) -> FileTree`
  | Parameter | Type              | Description |
  |-----------|-------------------|-------------|
  | root      | Maybe\<String>    | The path to the root of the file tree, written `/path/to/root`. Default: the empty string, it is deduced when inserting files. Specify if implementing new behaviour |
  | branches  | Maybe\<Branches>  | The initial branches of the tree. Default: the empty branch. Specify if implementing new behaviour |

* `makeSelectionInFileTree:: (FileTree, Maybe<Branches>, Maybe<SelectedEntry>) -> Selection`
  | Parameter      | Type                  | Description |
  |----------------|-----------------------|-------------|
  | fileTree       | FileTree              | The file tree on which the selection is made. It has to be the empty file tree unless implementing new behaviour |
  | selectedBranch | Maybe\<Branches>      | Not used when the file tree is empty. When defining new behaviour, it is the branch to which the selected entry belongs |
  | selectedEntry  | Maybe\<SelectedEntry> | Not used when the file tree is empty. When defining new behaviour, it is the selected entry |

* `insertInFileTree:: (FileTree, String, FileEntry) -> FileTree`
  | Parameter | Type      | Description                                                      |
  |-----------|-----------|------------------------------------------------------------------|
  | fileTree  | FileTree  | The file tree to insert to                                       |
  | path      | String    | The path to the file without the file name, written `/some/path` |
  | file      | FileEntry | The file entry to insert                                         |

* `makeFileEntry:: (String, Any) -> FileEntry`
  | Parameter | Type   | Description                                                                                         |
  |-----------|--------|-----------------------------------------------------------------------------------------------------|
  | name      | String | The file name read in `/path/name`                                                                  |
  | handle    | Any    | The handle can be anything relevant in the application's context such as a file id, a callback, etc |

* `refreshSelectedFileTree:: (Selection, FileTree) -> Selection`
  | Parameter           | Type      | Description                                    |
  |---------------------|-----------|------------------------------------------------|
  | selectionInFileTree | Selection | The selection with an outdated referenced tree |
  | newFileTree         | FileTree  | The referenced tree after insertion            |

* `parseFilePath:: String -> (String, String)
  | Parameter / Returned | Type             | Description                                                        |
  |----------------------|------------------|--------------------------------------------------------------------|
  | fullPath             | String           | The path to a file with its name included, written `/path/to/file` |
  | _returned_           | (String, String) | An array of two strings. The first one is the path to the file `/path/to` and the second is the file name |

* `root:: FileTree -> String`
  | Parameter / Returned | Type     | Description                                   |
  |----------------------|----------|-----------------------------------------------|
  | fileTree             | FileTree | A file tree                                   |
  | _returned_           | String   | The path to the root, written `/path/to/root` |

* `branches:: FileTree -> Branches`
  | Parameter / Returned | Type     | Description              |
  |----------------------|----------|--------------------------|
  | fileTree             | FileTree | A file tree              |
  | _returned_           | Branches | The branches of the tree |

* `entryName:: Entry -> String`
  | Parameter / Returned | Type   | Description                                                           |
  |----------------------|--------|-----------------------------------------------------------------------|
  | entry                | Entry  | An entry, file or directory                                           |
  | _returned_           | String | The name of the entry, which is the last element of the absolute path |

* `isDirectoryEntry:: Entry -> Boolean`
  | Parameter | Type  | Description       |
  |-----------|-------|-------------------|
  | entry     | Entry | The entry checked |

* `selectedBranch:: Selection -> Branches`
  | Parameter / Returned | Type      | Description                                                                 |
  |----------------------|-----------|-----------------------------------------------------------------------------|
  | selectionInFileTree  | Selection | A selection                                                                 |
  | _returned_           | Branches  | The branch to which the selection belongs. Use if implementing new behavior |

* `selectedEntry:: Selection -> SelectedEntry`
  | Parameter           | Type      | Description |
  |---------------------|-----------|-------------|
  | selectionInFileTree | Selection | A selection |

* `selectedEntryBranchName:: SelectedEntry -> String`
  | Parameter / Returned | Type          | Description      |
  |----------------------|---------------|------------------|
  | selectedEntry        | SelectedEntry | A selected entry |
  | _returned_           | String        | The path to the entry without its name and without the selected file tree's root path, written `/pathFromRoot/justBeforeTheEntry` |

* `selectedEntryHandle:: SelectedEntry -> Any`
  | Parameter / Returned | Type          | Description           |
  |----------------------|---------------|-----------------------|
  | selectedEntry        | SelectedEntry | A selected entry      |
  | _returned_           | Any           | The associated handle |

* `selectedEntryLeafName:: SelectedEntry -> String`
  | Parameter / Returned | Type          | Description                                                           |
  |----------------------|---------------|-----------------------------------------------------------------------|
  | selectedEntry        | SelectedEntry | A selected entry                                                      |
  | _returned_           | String        | The name of the entry, which is the last element of the absolute path |

* `selectedEntryName:: SelectedEntry -> String`
  | Parameter / Returned | Type          | Description                                                           |
  |----------------------|---------------|-----------------------------------------------------------------------|
  | selectedEntry        | SelectedEntry | A selected entry                                                      |
  | _returned_           | String        | The path to the entry with its name but without the selected file tree's root path, written `/pathFromRoot/to/entry` |

* `isFileSelected:: SelectedEntry -> Boolean`
  | Parameter     | Type          | Description      |
  |---------------|---------------|------------------|
  | selectedEntry | SelectedEntry | A selected entry |

Example:

```javascript
    const { insertInFileTree, isFileSelected, makeFileEntry, makeFileTree, makeSelectionInFileTree, parseFilePath, refreshSelectedFileTree, selectedEntry, selectedEntryBranchName, selectedEntryHandle, selectedEntryLeafName, selectedEntryName } = require('@acransac/filetree');

    const emptyFileTree = makeFileTree();

    const emptySelection = makeSelectionInFileTree(emptyFileTree);

    const [filePath, fileName] = parseFilePath("/root/file");

    const selection = refreshSelectedFileTree(emptySelection,
                                              insertInFileTree(emptyFileTree,
                                                               filePath,
                                                               makeFileEntry(fileName, () => "File handled")));

    reportOnSelection(selection);

    function reportOnSelection(selection) {
      console.log(`Is the selection a file? ${isFileSelected(selectedEntry(selection)) ? "Yes" : "No"}`);
      console.log(`Full entry name: \"${selectedEntryName(selectedEntry(selection))}\"`);
      console.log(`Entry branch name: \"${selectedEntryBranchName(selectedEntry(selection))}\"`);
      console.log(`Entry leaf name: \"${selectedEntryLeafName(selectedEntry(selection))}\"`);
      console.log(`Using the handle: ${selectedEntryHandle(selectedEntry(selection))()}`);
    }
```

```shell
    $ node example.js
    Is the selection a file? Yes
    Full entry name: "/file"
    Entry branch name: ""
    Entry leaf name: "file"
    Using the handle: File handled
```

## Navigate The File Tree
A file tree which has multiple entries can be navigated with a selection. The latter can visit the content of a directory or inspect parent or nested directories. At any point, the selection refers to a selected branch to which the selected entry belongs. The navigation is realized with `selectNext`, `selectPrevious`, `visitChildBranch` and `visitParentBranch`:
* `selectNext:: Selection -> Selection`
  | Parameter / Returned | Type      | Description |
  |----------------------|-----------|-------------|
  | selectionInFileTree  | Selection | A selection |
  | _returned_           | Selection | A new selection set on the next entry in the selected branch. If the input selection is the last of the branch, it is returned |

* `selectPrevious:: Selection -> Selection`
  | Parameter / Returned | Type      | Description |
  |----------------------|-----------|-------------|
  | selectionInFileTree  | Selection | A selection |
  | _returned_           | Selection | A new selection set on the previous entry in the selected branch. If the input selection is the first of the branch, it is returned |

* `visitChildBranch:: Selection -> Selection`
  | Parameter / Returned | Type      | Description |
  |----------------------|-----------|-------------|
  | selectionInFileTree  | Selection | A selection |
  | _returned_           | Selection | If the input selection is a directory, the new selection has its selected branch changed to the content of this directory and is set on its first entry. If the input selection is a file, it is returned |

* `visitParentBranch:: Selection -> Selection`
  | Parameter / Returned | Type      | Description |
  |----------------------|-----------|-------------|
  | selectionInFileTree  | Selection | A selection |
  | _returned_           | Selection | If the input selection has a parent directory, the new selection has its selected branch changed to the content of this directory and is set on its first entry. Otherwise, the selection is set on the first entry in the current directory, and the selected branch remains unchanged |

Example:

```javascript
    const { insertInFileTree, isFileSelected, makeFileEntry, makeFileTree, makeSelectionInFileTree, parseFilePath, refreshSelectedFileTree, selectedEntry, selectedEntryBranchName, selectedEntryHandle, selectedEntryLeafName, selectedEntryName, selectNext, selectPrevious, visitChildBranch, visitParentBranch } = require('@acransac/filetree');

    const [fileTree, selection] = insertFile(makeFileTree(),
                                             makeSelectionInFileTree(makeFileTree()),
                                             ...parseFilePath("/root/fileA"));

    const [newFileTree, newSelection] = insertFile(fileTree, selection, ...parseFilePath("/root/dir/fileB"));

    reportOnSelection(selectNext(newSelection));

    reportOnSelection(selectPrevious(selectNext(newSelection)));

    reportOnSelection(visitChildBranch(selectNext(newSelection)));

    reportOnSelection(visitParentBranch(visitChildBranch(selectNext(newSelection))));

    function insertFile(fileTree, selection, filePath, fileName) {
      return (fileTree => [fileTree, refreshSelectedFileTree(selection, fileTree)])
               (insertInFileTree(fileTree, filePath, makeFileEntry(fileName, () => `${fileName} handled`)));
    }

    function reportOnSelection(selection) {
      console.log(`Is the selection a file? ${isFileSelected(selectedEntry(selection)) ? "Yes" : "No"}`);
      console.log(`Full entry name: \"${selectedEntryName(selectedEntry(selection))}\"`);
      console.log(`Entry branch name: \"${selectedEntryBranchName(selectedEntry(selection))}\"`);
      console.log(`Entry leaf name: \"${selectedEntryLeafName(selectedEntry(selection))}\"`);

      if (isFileSelected(selectedEntry(selection))) {
        console.log(`Using the handle: ${selectedEntryHandle(selectedEntry(selection))()}`);
      }

      console.log("\n");
    }
```

```shell
    $ node example.js
    Is the selection a file? No
    Full entry name: "/dir"
    Entry branch name: ""
    Entry leaf name: "dir"


    Is the selection a file? Yes
    Full entry name: "/fileA"
    Entry branch name: ""
    Entry leaf name: "fileA"
    Using the handle: fileA handled


    Is the selection a file? Yes
    Full entry name: "/dir/fileB"
    Entry branch name: "/dir"
    Entry leaf name: "fileB"
    Using the handle: fileB handled


    Is the selection a file? Yes
    Full entry name: "/fileA"
    Entry branch name: ""
    Entry leaf name: "fileA"
    Using the handle: fileA handled


```
