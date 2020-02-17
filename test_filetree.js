const { branches, entryName, fileHandle, insertInFileTree, makeFileEntry, makeFileTree, parseFilePath, root } = require('./filetree.js');
const Test = require('tester');

function test_emptyFileTree(finish, check) {
  const emptyFileTree = makeFileTree();

  return finish(check(root(emptyFileTree) === undefined && branches(emptyFileTree).length === 0));
}

function test_parseFilePath(finish, check) {
  const [path, fileName] = parseFilePath("/root/file.ext");

  return finish(check(path === "/root" && fileName === "file.ext"));
}

function test_fileTreeWithOneFile(finish, check) {
  const fileTree = ((path, file) => insertInFileTree(makeFileTree(),
	                                             path,
	                                             makeFileEntry(file, 0)))(...parseFilePath("/root/file.ext"));

  return finish(check(root(fileTree) === "/root"
	                && entryName(branches(fileTree)[0]) === "file.ext"
	                && fileHandle(branches(fileTree)[0]) === 0));
}

Test.run([
  Test.makeTest(test_emptyFileTree, "Empty File Tree"),
  Test.makeTest(test_parseFilePath, "Parse File Path"),
  Test.makeTest(test_fileTreeWithOneFile, "File Tree With One File"),
]);
