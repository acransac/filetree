// Copyright (c) Adrien Cransac
// License: MIT

const {
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
} = require('./filetree.js');

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
