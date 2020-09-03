// Copyright (c) Adrien Cransac
// License: MIT

// # File Tree Types
// ## Entry

/*
 * Get the name of an entry
 * @param {Entry} entry - The entry, file or directory
 * @return {string}
 */
function entryName(entry) {
  return isDirectoryEntry(entry) ? directoryName(entry) : fileName(entry);
}

// ## Directory Entry
function makeDirectoryEntry(name, content) {
  return [name, content];
}

/*
 * Check if an entry is a directory
 * @param {Entry} entry - The entry, file or directory
 * @return {boolean}
 */
function isDirectoryEntry(entry) {
  return Array.isArray(entry) && entry.length === 2 && typeof entry[0] === "string" && Array.isArray(entry[1])
}

function directoryName(directoryEntry) {
  return directoryEntry[0];
}

function directoryContent(directoryEntry) {
  return directoryEntry[1];
}

// ## File Entry

/*
 * Make a file entry, mapping its name to a handle
 * @param {string} name - The file name
 * @param {*} handle - Anything that is to be associated with the file
 * @return {FileEntry}
 */
function makeFileEntry(name, handle) {
  return [name, handle];
}

function fileName(fileEntry) {
  return fileEntry[0];
}

function fileHandle(fileEntry) {
  return fileEntry[1];
}

// ## File Tree

/*
 * Make a file tree. See README
 * @param {string} [root: ""] - The path to the highest entry in the tree. Automatically set when inserting files. Specify for advanced usage
 * @param {Branches} [branches: []] - The entries in the file tree. Automatically updated when inserting files. Specify for advanced usage
 * @return {FileTree}
 */
function makeFileTree(root, branches) {
  return [root, branches ? branches : []];
}

/*
 * Get the root of a file tree
 * @param {FileTree} fileTree - A file tree
 * @return {string}
 */
function root(fileTree) {
  return fileTree[0];
}

/*
 * Get the entries in a file tree
 * @param {FileTree} fileTree - A file tree
 * @return {Branches}
 */
function branches(fileTree) {
  return fileTree[1];
}

/*
 * Insert a file in a file tree
 * @param {FileTree} fileTree - A file tree
 * @param {string} path - The path to the file
 * @param {FileEntry} file - The file entry
 * @return {FileTree}
 */
function insertInFileTree(fileTree, path, file) {
  const insertInFileTreeImpl = (entries, branch, path, ...insertedFileTree) => {
    if (path.length === 0) {
      return [...entries, ...branch, ...insertedFileTree];
    }
    else if (branch.length === 0) {
      return [...entries, makeDirectoryEntry(path[0], insertInFileTreeImpl([], [], path.slice(1), ...insertedFileTree))];
    }
    else if (isDirectoryEntry(branch[0]) && directoryName(branch[0]) === path[0]) {
      return [...entries,
              makeDirectoryEntry(path[0], insertInFileTreeImpl([],
                                                               directoryContent(branch[0]),
                                                               path.slice(1),
                                                               ...insertedFileTree)),
              ...branch.slice(1)];
    }
    else {
      return insertInFileTreeImpl([...entries, branch[0]], branch.slice(1), path, ...insertedFileTree);
    }
  };

  if (root(fileTree) === undefined) {
    return makeFileTree(path, [file]);
  }
  else if (path.startsWith(root(fileTree))) {
    return makeFileTree(root(fileTree),
                        insertInFileTreeImpl([],
                                             branches(fileTree),
                                             path.slice(root(fileTree).length).split("/").slice(1),
                                             file));
  }
  else {
    const newRootAndPathsFromNewRoot = (insertedFilePath, oldRoot) => {
      const newRootAndPathsFromNewRootImpl = (newRoot, insertedFilePath, oldRoot) => {
        if (insertedFilePath.length === 0 || oldRoot.length === 0) {
          return [newRoot.join("/"), insertedFilePath, oldRoot];
        }
        else if (insertedFilePath[0] !== oldRoot[0]) {
          return [newRoot.join("/"), insertedFilePath, oldRoot];
        }
        else {
          return newRootAndPathsFromNewRootImpl([...newRoot, oldRoot[0]], insertedFilePath.slice(1), oldRoot.slice(1));
        }
      };

      return newRootAndPathsFromNewRootImpl([""], insertedFilePath.split("/").slice(1), oldRoot.split("/").slice(1));
    };

    return ((newRoot, insertedFilePathFromNewRoot, oldBranchPathFromNewRoot) => {
      return makeFileTree(newRoot, insertInFileTreeImpl([],
                                                        insertInFileTreeImpl([], [], insertedFilePathFromNewRoot, file),
                                                        oldBranchPathFromNewRoot,
                                                        ...branches(fileTree)));
    })(...newRootAndPathsFromNewRoot(path, root(fileTree)));
  }
}

function lookupBranch(fileTree, path) {
  const lookupBranchImpl = (branch, path) => {
    if (path.length === 0) {
      return branch;
    }
    else if (branch.length === 0) {
      return [];
    }
    else if (isDirectoryEntry(branch[0]) && directoryName(branch[0]) === path[0]) {
      return lookupBranchImpl(directoryContent(branch[0]), path.slice(1));
    }
    else {
      return lookupBranchImpl(branch.slice(1), path);
    }
  };

  return lookupBranchImpl(branches(fileTree), path.split("/").slice(1));
}

function lookupNextInBranch(branch, namedEntry, errorFunction) {
  if (branch.length === 0) {
    return errorFunction(namedEntry);
  }
  else if (entryName(branch[0]) === namedEntry) {
    if (branch.length === 1) {
      return branch[0];
    }
    else {
      return branch[1];
    }
  }
  else {
    return lookupNextInBranch(branch.slice(1), namedEntry, errorFunction);
  }
}

function lookupPreviousInBranch(branch, namedEntry, errorFunction) {
  const lookupPreviousInBranchImpl = (previous, branch, namedEntry, errorFunction) => {
    if (branch.length === 0) {
      return errorFunction(namedEntry);
    }
    else if (entryName(branch[0]) === namedEntry) {
      return previous;
    }
    else {
      return lookupPreviousInBranchImpl(branch[0], branch.slice(1), namedEntry, errorFunction);
    }
  };

  return lookupPreviousInBranchImpl(branch[0], branch, namedEntry, errorFunction);
}

// # Selection Types
// ## Selection

/*
 * Make a selection in a file tree. See README
 * @param {FileTree} fileTree - An empty file tree when constructing a selection. Specify for advanced usage
 * @param {Branches} [selectedBranch] - The branch containing the selected entry. Specify for advanced usage
 * @param {SelectedEntry} [selectedEntry] - The selected entry. Specify for advanced usage
 * @return {FileTree}
 */
function makeSelectionInFileTree(fileTree, selectedBranch, selectedEntry) {
  if (branches(fileTree).length === 0) {
    return [fileTree, [], makeSelectedEntry()];
  }
  else {
    return [fileTree,
            selectedBranch,
            selectedEntryName(selectedEntry) === ""
              ? makeSelectedEntry(`/${entryName(branches(fileTree)[0])}`,
                                  isDirectoryEntry(branches(fileTree)[0]) ? undefined : fileHandle(branches(fileTree)[0]),
                                  isDirectoryEntry(branches(fileTree)[0]) ? "directory" : "file")
              : selectedEntry];
  }
}

function selectedFileTree(selectionInFileTree) {
  return selectionInFileTree[0];
}

/*
 * Get the selected branch from a selection
 * @param {Selection} selectionInFileTree - A selection
 * @return {Branches}
 */
function selectedBranch(selectionInFileTree) {
  return selectionInFileTree[1];
}

/*
 * Get the selected entry from a selection
 * @param {Selection} selectionInFileTree - A selection
 * @return {SelectedEntry}
 */
function selectedEntry(selectionInFileTree) {
  return selectionInFileTree[2];
}

/*
 * Update the file tree and selected branch associated with a selection
 * @param {Selection} selectionInFileTree - A selection whose referenced file tree has just been updated
 * @param {FileTree} newFileTree - The updated file tree
 * @param {function} [branchName: selectedEntryBranchName] - A function getting the branch name from a selected entry
 * @return {Selection}
 */
function refreshSelectedFileTree(selectionInFileTree, newFileTree, branchName) {
  const newSelectionBranchName = root(selectedFileTree(selectionInFileTree))
    ? root(selectedFileTree(selectionInFileTree)).slice(root(newFileTree).length)
    : "";

  const entry = selectedEntry(selectionInFileTree);

  return makeSelectionInFileTree(newFileTree,
                                 lookupBranch(newFileTree,
                                              `${newSelectionBranchName}${(branchName ? branchName : selectedEntryBranchName)
                                                                            (entry)}`),
                                 makeSelectedEntry(`${newSelectionBranchName}${selectedEntryName(entry)}`,
                                                   selectedEntryHandle(entry),
                                                   selectedEntryType(entry)));
}

/*
 * Select the next entry in the selected branch of a selection
 * @param {Selection} selectionInFileTree - A selection
 * @param {function} [branchName: selectedEntryBranchName] - A function getting the branch name from a selected entry
 * @param {function} [leafName: selectedEntryLeafName] - A function getting the leaf name from a selected entry
 * @return {Selection} - If there is no next entry, the original selection is returned
 */
function selectNext(selectionInFileTree, branchName, leafName) {
  return selectAnotherEntryInBranch(selectionInFileTree,
                                    lookupNextInBranch,
                                    branchName ? branchName : selectedEntryBranchName,
                                    leafName ? leafName : selectedEntryLeafName);
}

/*
 * Select the previous entry in the selected branch of a selection
 * @param {Selection} selectionInFileTree - A selection
 * @param {function} [branchName: selectedEntryBranchName] - A function getting the branch name from a selected entry
 * @param {function} [leafName: selectedEntryLeafName] - A function getting the leaf name from a selected entry
 * @return {Selection} - If there is no previous entry, the original selection is returned
 */
function selectPrevious(selectionInFileTree, branchName, leafName) {
  return selectAnotherEntryInBranch(selectionInFileTree,
                                    lookupPreviousInBranch,
                                    branchName ? branchName : selectedEntryBranchName,
                                    leafName ? leafName : selectedEntryLeafName);
}

/*
 * Change the selected branch for the content of a selected directory and select its first entry
 * @param {Selection} selectionInFileTree - A selection
 * @return {Selection} - If the original selection is a file, it is returned
 */
function visitChildBranch(selectionInFileTree) {
  if (isDirectorySelected(selectedEntry(selectionInFileTree))) {
    return selectAnotherBranch(selectionInFileTree, selectedEntryName(selectedEntry(selectionInFileTree)));
  }
  else {
    return selectionInFileTree;
  }
}

/*
 * Change the selected branch for the content of the parent directory and select its first entry
 * @param {Selection} selectionInFileTree - A selection
 * @param {function} [branchName: selectedEntryBranchName] - A function getting the branch name from a selected entry
 * @return {Selection} - If the original selection has no parent directory, a selection on the first entry of the current directory is returned
 */
function visitParentBranch(selectionInFileTree, branchName) {
  const newBranchName = (branchName ? branchName : selectedEntryBranchName)(selectedEntry(selectionInFileTree)) === ""
    ? ""
    : (branchName ? branchName : selectedEntryBranchName)(selectedEntry(selectionInFileTree)).split("/").slice(0, -1).join("/");

  return selectAnotherBranch(selectionInFileTree, newBranchName);
}

function selectAnotherBranch(selectionInFileTree, branchName) {
  const newBranch = lookupBranch(selectedFileTree(selectionInFileTree), branchName);

  return makeSelectionInFileTree(selectedFileTree(selectionInFileTree),
                                 newBranch,
                                 makeSelectedEntry(`${branchName}/${entryName(newBranch[0])}`,
                                                   isDirectoryEntry(newBranch[0]) ? undefined : fileHandle(newBranch[0]),
                                                   isDirectoryEntry(newBranch[0]) ? "directory" : "file"));
}

function selectAnotherEntryInBranch(selectionInFileTree, selector, branchName, leafName) {
  const otherEntry = selector(selectedBranch(selectionInFileTree), leafName(selectedEntry(selectionInFileTree)), entry => {});

  return makeSelectionInFileTree(selectedFileTree(selectionInFileTree),
                                 selectedBranch(selectionInFileTree),
                                 makeSelectedEntry(branchName(selectedEntry(selectionInFileTree)) + `/${entryName(otherEntry)}`,
                                                   isDirectoryEntry(otherEntry) ? undefined : fileHandle(otherEntry),
                                                   isDirectoryEntry(otherEntry) ? "directory" : "file"));
}

// ## Selected Entry
function makeSelectedEntry(name, handle, type) {
  return [name ? name : "", handle, type ? type : "file"];
}

/*
 * Check if a selected entry is a directory
 * @param {SelectedEntry} selectedEntry - A selected entry
 * @return {boolean}
 */
function isDirectorySelected(selectedEntry) {
  return selectedEntryType(selectedEntry) === "directory";
}

/*
 * Check if a selected entry is a file
 * @param {SelectedEntry} selectedEntry - A selected entry
 * @return {boolean}
 */
function isFileSelected(selectedEntry) {
  return selectedEntryType(selectedEntry) === "file";
}

/*
 * Get the path from the root with the name included of a selected entry
 * @param {SelectedEntry} selectedEntry - A selected entry
 * @return {string}
 */
function selectedEntryName(selectedEntry) {
  return selectedEntry[0];
}

/*
 * Get the handle associated with a file
 * @param {SelectedEntry} selectedEntry - A selected entry that has to be a file
 * @return {*} - The handle
 */
function selectedEntryHandle(selectedEntry) {
  return selectedEntry[1];
}

function selectedEntryType(selectedEntry) {
  return selectedEntry[2];
}

/*
 * Get the path from the root with the name excluded of a selected entry
 * @param {SelectedEntry} selectedEntry - A selected entry
 * @return {string}
 */
function selectedEntryBranchName(selectedEntry) {
  if (selectedEntryName(selectedEntry) === "") {
    return "";
  }
  else {
    return selectedEntryName(selectedEntry).split("/").slice(0, -1).join("/");
  }
}

/*
 * Get the name of a selected entry
 * @param {SelectedEntry} selectedEntry - A selected entry
 * @return {string}
 */
function selectedEntryLeafName(selectedEntry) {
  return selectedEntryName(selectedEntry).split("/").slice(-1)[0];
}

// # Helpers

/*
 * Get the path and the name of a file from its full absolute path
 * @param {string} fullPath - The path to the file with its name included
 * @return {string[]} - An array of two strings. The first one is the path to the file. The second is the name of the file
 */
function parseFilePath(fullPath) {
  return (elements => [elements.slice(0, -1).join("/"), elements[elements.length - 1]])(fullPath.split("/"));
}

module.exports = {
  branches,
  entryName,
  insertInFileTree,
  isDirectoryEntry,
  isFileSelected,
  makeFileEntry,
  makeFileTree,
  makeSelectionInFileTree,
  parseFilePath,
  refreshSelectedFileTree,
  root,
  selectedBranch,
  selectedEntry,
  selectedEntryBranchName,
  selectedEntryHandle,
  selectedEntryLeafName,
  selectedEntryName,
  selectNext,
  selectPrevious,
  visitChildBranch,
  visitParentBranch
};
