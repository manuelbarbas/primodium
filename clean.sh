#! usr/bin/bash
cd packages/contracts 
rm -rf types abi
git ls-files abi | xargs -I {} git update-index --skip-worktree {}
git ls-files types | xargs -I {} git update-index --skip-worktree {}