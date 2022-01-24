## Code Contribution Guideline
`BDSX` accepts any codes for extending. but it needs to keep little rules for maintaining it.

### 1. Keep the legacy
Old scripts can be broken If identifier names are changed or removed. Please keep the old names as deprecated if you want to change the name.

### 2. Use the getter functions
The class structure can be changed after the update.  
Please use the getter function if it exists.

### 3. Reduce using offsets
The offset is easily changed after the update.  
Make sure the size of the previous field and remove the offset if it's possible.  

### 4. Following Minecraft official name
To make it easy to guess for everyone, use the known official name of Minecraft if it's possible.

### 5. Don't use the $ sign for the identifier name
`BDSX` uses the $ sign for indicating the namespace.
but it's more reasonable using the TS namespace instead.  
So, Except in cases where it is impossible to create the namespace, please don't use the $ sign.

### 6. Avoid multiple accessing of the native field
If the native field is the object type. it will allocate a new object per accessing.  
Please assign it to the local variable and reuse it.

## Tips
* `./bdsx` directory is using ESLint for the code formatting. it would be better to use ESLint Extension for VSCode.

## About NPM Modules
* @types/node@12 - BDSX uses chakra-node and it's not updated more. need to use v12.
* eslint@7 and plugins - eslint@8 has an indent issue about the TS decorator. Waiting for the patch.
* source-map - JS version issue about chakra-core.
* strip-json-comments - JS version issue about chakra-core.
