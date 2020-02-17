// Helpers --
function parseFilePath(fullPath) {
  return (elements => [elements.slice(0, -1).join("/"), elements[elements.length - 1]])(fullPath.split("/"));
}

// Types --
// Directory
function makeDirectoryEntry(name, content) {
  return [name, content];
}

function isDirectoryEntry(entry) {
  return Array.isArray(entry) && entry.length === 2 && typeof entry[0] === "string" && Array.isArray(entry[1])
}

function directoryName(directoryEntry) {
  return directoryEntry[0];
}

function directoryContent(directoryEntry) {
  return directoryEntry[1];
}

// File
function makeFileEntry(name, handle) {
  return [name, handle];
}

function fileName(fileEntry) {
  return fileEntry[0];
}

function fileHandle(fileEntry) {
  return fileEntry[1];
}

// Entry
function entryName(entry) {
  return isDirectoryEntry(entry) ? directoryName(entry) : fileName(entry);
}

// File tree
function makeFileTree(root, branches) {
  return [root, branches ? branches : []];
}

function root(fileTree) {
  return fileTree[0];
}

function branches(fileTree) {
  return fileTree[1];
}

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
    return makeFileTree(path, insertInFileTreeImpl([],
	                                               [file],
	                                               root(fileTree).slice(path.length).split("/").slice(1),
	                                               ...branches(fileTree)));
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

// Selection in file tree
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

function selectedBranch(selectionInFileTree) {
  return selectionInFileTree[1];
}

function selectedEntry(selectionInFileTree) {
  return selectionInFileTree[2];
}

function refreshSelectedFileTree(selectionInFileTree, newFileTree) {
  const newSelectionBranchName = root(selectedFileTree(selectionInFileTree))
    ? root(selectedFileTree(selectionInFileTree)).slice(root(newFileTree).length)
    : "";

  const entry = selectedEntry(selectionInFileTree);

  return makeSelectionInFileTree(newFileTree, 
                                   lookupBranch(newFileTree, `${newSelectionBranchName}${selectedEntryBranchName(entry)}`),
	                           makeSelectedEntry(`${newSelectionBranchName}${selectedEntryName(entry)}`,
					             selectedEntryHandle(entry),
				                     selectedEntryType(entry)));
}

function selectAnotherEntryInBranch(selectionInFileTree, selector) {
  const otherEntry = selector(selectedBranch(selectionInFileTree),
	                      selectedEntryLeafName(selectedEntry(selectionInFileTree)),
	                      entry => {});

  return makeSelectionInFileTree(selectedFileTree(selectionInFileTree),
                                   selectedBranch(selectionInFileTree),
	                           makeSelectedEntry(selectedEntryBranchName(selectedEntry(selectionInFileTree)) + `/${entryName(otherEntry)}`,
                                                     isDirectoryEntry(otherEntry) ? undefined : fileHandle(otherEntry),
                                                     isDirectoryEntry(otherEntry) ? "directory" : "file"));
}

function selectNext(selectionInFileTree) {
  return selectAnotherEntryInBranch(selectionInFileTree, lookupNextInBranch);
}

function selectPrevious(selectionInFileTree) {
  return selectAnotherEntryInBranch(selectionInFileTree, lookupPreviousInBranch);
}

function selectAnotherBranch(selectionInFileTree, branchName) {
  const newBranch = lookupBranch(selectedFileTree(selectionInFileTree), branchName);

  return makeSelectionInFileTree(selectedFileTree(selectionInFileTree),
                                   newBranch,
	                           makeSelectedEntry(selectedEntryBranchName(selectedEntry(selectionInFileTree)) + `/${entryName(newBranch[0])}`,
                                                     isDirectoryEntry(newBranch[0]) ? undefined : fileHandle(newBranch[0]),
                                                     isDirectoryEntry(newBranch[0]) ? "directory" : "file"));
}

function visitChildBranch(selectionInFileTree) {
  if (isDirectorySelected(selectedEntry(selectionInFileTree))) {
    return selectAnotherBranch(selectionInFileTree, selectedEntryName(selectedEntry(selectionInFileTree)));
  }
  else {
    return selectionInFileTree;
  }
}

function visitParentBranch(selectionInFileTree) {
  const newBranchName = selectedEntryBranchName(selectedEntry(selectionInFileTree)) === ""
    ? ""
    : selectedEntryBranchName(selectedEntry(selectionInFileTree)).split("/").slice(0, -1).join("/");

  return selectAnotherBranch(selectionInFileTree, newBranchName);
}

// Selected entry
function makeSelectedEntry(name, handle, type) {
  return [name ? name : "", handle, type ? type : "file"];
}

function selectedEntryName(selectedEntry) {
  return selectedEntry[0];
}

function selectedEntryLeafName(selectedEntry) {
  return selectedEntryName(selectedEntry).split("/").slice(-1)[0];
}

function selectedEntryBranchName(selectedEntry) {
  if (selectedEntryName(selectedEntry) === "") {
    return "";
  }
  else {
    return selectedEntryName(selectedEntry).split("/").slice(0, -1).join("/");
  }
}

function selectedEntryHandle(selectedEntry) {
  return selectedEntry[1];
}

function selectedEntryType(selectedEntry) {
  return selectedEntry[2];
}

function isFileSelected(selectedEntry) {
  return selectedEntryType(selectedEntry) === "file";
}

function isDirectorySelected(selectedEntry) {
  return selectedEntryType(selectedEntry) === "directory";
}

module.exports = {
  branches,
  entryName,
  fileHandle,
  insertInFileTree,
  isDirectoryEntry,
  isFileSelected,
  makeFileEntry,
  makeSelectionInFileTree,
  makeFileTree,
  parseFilePath,
  refreshSelectedFileTree,
  root,
  selectedBranch,
  selectedEntry,
  selectedEntryBranchName,
  selectedEntryHandle,
  selectedEntryLeafName,
  selectedEntryName,
  selectedEntryType,
  selectNext,
  selectPrevious,
  visitChildBranch,
  visitParentBranch
};
