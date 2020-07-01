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
Create an empty _file tree_ and selection with `makeFileTree` and `makeSelectionInFileTree`. Then, use `insertInFileTree` to add entries which are created with `makeFileEntry`. After each insertion, the selection is updated with `refreshSelectedFileTree`: 
* `makeFileTree:: (String, Maybe<Branches>) -> FileTree`
  | Parameter | Type              | Description                                                   |
  |-----------|-------------------|---------------------------------------------------------------|
  | root      | String            | The path to the root of the file tree written `/path/to/root` |
  | branches  | Maybe\<Branches>  | The initial branches of the tree. Default: the empty branch. Used internally or to implement new behaviour |

* `makeSelectionInFileTree:: (FileTree, Maybe<Branch>, Maybe<Entry>) -> Selection`
  | Parameter      | Type           | Description |
  |----------------|----------------|-------------|
  | fileTree       | FileTree       | The file tree on which the selection is made. It has to be the empty file tree unless implementing new behaviour |
  | selectedBranch | Maybe\<Branch> | Not used when the file tree is empty. When defining new behaviour, it is the branch to which the selected entry belongs |
  | selectedEntry  | Maybe\<Entry>  | Not used when the file tree is empty. When defining new behaviour, it is the selected entry |

* `insertInFileTree:: (FileTree, String, FileEntry) -> FileTree`
  | Parameter | Type      | Description                                                     |
  |-----------|-----------|-----------------------------------------------------------------|
  | fileTree  | FileTree  | The file tree to insert to                                      |
  | path      | String    | The path to the file without the file name written `/some/path` |
  | file      | FileEntry | The file entry to insert                                        |

* `makeFileEntry:: (String, Any) -> FileEntry`
  | Parameter | Type   | Description                                                                                         |
  |-----------|--------|-----------------------------------------------------------------------------------------------------|
  | name      | String | The file name as in `/path/name`                                                                    |
  | handle    | Any    | The handle can be anything relevant in the application's context such as a file id, a callback, etc |

* `refreshSelectedFileTree:: (Selection, FileTree) -> Selection`
  | Parameter           | Type      | Description                                    |
  |---------------------|-----------|------------------------------------------------|
  | selectionInFileTree | Selection | The selection with an outdated referenced tree |
  | newFileTree         | FileTree  | The referenced tree after insertion            |
