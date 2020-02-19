const { branches, entryName, fileHandle, insertInFileTree, makeFileEntry, makeFileTree, makeSelectionInFileTree, parseFilePath, refreshSelectedFileTree, root, selectedBranch, selectedEntry, selectedEntryBranchName, selectedEntryHandle, selectedEntryLeafName, selectedEntryName, selectedEntryType, selectNext, selectPrevious, visitChildBranch, visitParentBranch } = require('./filetree.js');
const Test = require('tester');

function makeFileTreeWithFiles(...filePaths) {
  const makeFileTreeWithFilesImpl = (fileTree, selection, fileHandle, filePaths) => {
    if (filePaths.length === 0) {
      return [fileTree, selection];
    }
    else {
      return makeFileTreeWithFilesImpl(...((path, file) => {
	                                 return (newFileTree => [newFileTree, refreshSelectedFileTree(selection, newFileTree)])
	                                   (insertInFileTree(fileTree, path, makeFileEntry(file, fileHandle)));
                                       })(...parseFilePath(filePaths[0])),
	                               fileHandle + 1,
	                               filePaths.slice(1));
    }
  };

  return makeFileTreeWithFilesImpl(makeFileTree(), makeSelectionInFileTree(makeFileTree()), 0, filePaths);
}

function test_emptyFileTree(finish, check) {
  const emptyFileTree = makeFileTree();

  return finish(check(root(emptyFileTree) === undefined && branches(emptyFileTree).length === 0));
}

function test_selectionInEmptyFileTree(finish, check) {
  const emptySelection = makeSelectionInFileTree(makeFileTree());

  return finish(check(selectedBranch(emptySelection).length === 0
	                && selectedEntryName(selectedEntry(emptySelection)) === ""
	                && selectedEntryLeafName(selectedEntry(emptySelection)) === ""
	                && selectedEntryBranchName(selectedEntry(emptySelection)) === ""
	                && selectedEntryHandle(selectedEntry(emptySelection)) === undefined
	                && selectedEntryType(selectedEntry(emptySelection)) === "file"));
}

function test_parseFilePath(finish, check) {
  const [path, fileName] = parseFilePath("/root/file.ext");

  return finish(check(path === "/root" && fileName === "file.ext"));
}

function test_fileTreeWithOneFile(finish, check) {
  const fileTree = makeFileTreeWithFiles("/root/file.ext")[0];

  return finish(check(root(fileTree) === "/root"
	                && branches(fileTree).length === 1
	                && entryName(branches(fileTree)[0]) === "file.ext"
	                && fileHandle(branches(fileTree)[0]) === 0));
}

function test_selectionInFileTreeWithOneFile(finish, check) {
  const selection = refreshSelectedFileTree(makeSelectionInFileTree(makeFileTree()),
	                                    makeFileTreeWithFiles("/root/file.ext")[0]);

  return finish(check(selectedBranch(selection).length === 1
	                && selectedEntryName(selectedEntry(selection)) === "/file.ext"
	                && selectedEntryLeafName(selectedEntry(selection)) === "file.ext"
	                && selectedEntryBranchName(selectedEntry(selection)) === ""
	                && selectedEntryHandle(selectedEntry(selection)) === 0
	                && selectedEntryType(selectedEntry(selection)) === "file"));
}

function test_fileTreeWithTwoFiles(finish, check) {
  const [fileTree, selection] = makeFileTreeWithFiles("/root/fileA.ext", "/root/DIR/fileB.ext");

  return finish(check(root(fileTree) === "/root"
	                && selectedEntryName(selectedEntry(selection)) === "/fileA.ext"
	                && (directoryEntry => selectedEntryName(directoryEntry) === "/DIR"
				                && selectedEntryBranchName(directoryEntry) === ""
				                && selectedEntryLeafName(directoryEntry) === "DIR"
				                && selectedEntryHandle(directoryEntry) === undefined
				                && selectedEntryType(directoryEntry) === "directory")
	                     (selectedEntry(selectNext(selection)))
	                && (secondFileEntry => selectedEntryName(secondFileEntry) === "/DIR/fileB.ext"
				                 && selectedEntryBranchName(secondFileEntry) === "/DIR"
				                 && selectedEntryLeafName(secondFileEntry) === "fileB.ext"
				                 && selectedEntryHandle(secondFileEntry) === 1
				                 && selectedEntryType(secondFileEntry) === "file")
	                     (selectedEntry(visitChildBranch(selectNext(selection))))));
}

function test_upwardSelection(finish, check) {
  const [fileTree, selection] = makeFileTreeWithFiles("/root/fileA.ext", "/root/DIR/fileB.ext");

  const isFirstFileEntry = entry => {
    return selectedEntryName(entry) === "/fileA.ext"
	     && selectedEntryBranchName(entry) === ""
	     && selectedEntryLeafName(entry) === "fileA.ext"
	     && selectedEntryHandle(entry) === 0
	     && selectedEntryType(entry) === "file";
  };

  return finish(check(isFirstFileEntry(selectedEntry(selectPrevious(selectNext(selection))))
	                && isFirstFileEntry(selectedEntry(visitParentBranch(visitChildBranch(selectNext(selection)))))));
}

Test.run([
  Test.makeTest(test_emptyFileTree, "Empty File Tree"),
  Test.makeTest(test_selectionInEmptyFileTree, "Selection In Empty File Tree"),
  Test.makeTest(test_parseFilePath, "Parse File Path"),
  Test.makeTest(test_fileTreeWithOneFile, "File Tree With One File"),
  Test.makeTest(test_selectionInFileTreeWithOneFile, "Selection In File Tree With One File"),
  Test.makeTest(test_fileTreeWithTwoFiles, "File Tree With Two Files"),
  Test.makeTest(test_upwardSelection, "Upward Selection"),
]);
