const { branches, entryName, fileHandle, insertInFileTree, makeFileEntry, makeFileTree, makeSelectionInFileTree, parseFilePath, refreshSelectedFileTree, root, selectedBranch, selectedEntry, selectedEntryBranchName, selectedEntryHandle, selectedEntryLeafName, selectedEntryName, selectedEntryType } = require('./filetree.js');
const Test = require('tester');

function insertFile(fileTree, filePath, fileHandle) {
  return ((path, file) => insertInFileTree(fileTree, path, makeFileEntry(file, fileHandle)))(...parseFilePath(filePath));
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
  const fileTree = insertFile(makeFileTree(), "/root/file.ext", 0);

  return finish(check(root(fileTree) === "/root"
	                && branches(fileTree).length === 1
	                && entryName(branches(fileTree)[0]) === "file.ext"
	                && fileHandle(branches(fileTree)[0]) === 0));
}

function test_selectionInFileTreeWithOneFile(finish, check) {
  const selection = refreshSelectedFileTree(makeSelectionInFileTree(makeFileTree()),
	                                    insertFile(makeFileTree(), "/root/file.ext", 0));

  return finish(check(selectedBranch(selection).length === 1
	                && selectedEntryName(selectedEntry(selection)) === "/file.ext"
	                && selectedEntryLeafName(selectedEntry(selection)) === "file.ext"
	                && selectedEntryBranchName(selectedEntry(selection)) === ""
	                && selectedEntryHandle(selectedEntry(selection)) === 0
	                && selectedEntryType(selectedEntry(selection)) === "file"));
}

function test_fileTreeWithTwoFiles(finish, check) {
  const fileTreeOneFile = insertFile(makeFileTree(), "/root/fileA.ext", 0);

  const fileTreeTwoFiles = insertFile(fileTreeOneFile, "/root/fileB.ext", 1);

  return finish(check(root(fileTreeTwoFiles) === "/root"
	                && entryName(branches(fileTreeTwoFiles)[0]) === "fileA.ext"
	                && fileHandle(branches(fileTreeTwoFiles)[0]) === 0
	                && entryName(branches(fileTreeTwoFiles)[1]) === "fileB.ext"
	                && fileHandle(branches(fileTreeTwoFiles)[1]) === 1));
}

Test.run([
  Test.makeTest(test_emptyFileTree, "Empty File Tree"),
  Test.makeTest(test_selectionInEmptyFileTree, "Selection In Empty File Tree"),
  Test.makeTest(test_parseFilePath, "Parse File Path"),
  Test.makeTest(test_fileTreeWithOneFile, "File Tree With One File"),
  Test.makeTest(test_selectionInFileTreeWithOneFile, "Selection In File Tree With One File"),
  Test.makeTest(test_fileTreeWithTwoFiles, "File Tree With Two Files"),
]);
