## Code Contribution Guide
`bdsx` accepts any codes for extending. but it needs to keep little rules for maintaining it.

### 1. Keep the legacy
Old scripts are broken If names are changed or removed. Please keep the old names as deprecated if you want to change the name.

### 2. Reduce using offsets
Offsets are hard to maintain. they are easily changed after updates. Use the function names or Make sure the size of the previous fields if it's possible.

### 3. Following Minecraft official name
To make it easy to guess for everyone, use the known official name of Minecraft.

## Tips
* `./bdsx` directory is using ESLint for the code formatting. it would be better to use ESLint Extension for VSCode.
