## Code Contribution Guideline
`BDSX` accepts any codes for extending. but it needs to keep little rules for maintaining it.

### 1. Keep the legacy
User scripts can be broken If identifier names are changed or removed.  
Please keep the old names as deprecated if you want to change the name.

### 2. Use the getter functions
The class structure can be changed after the update.  
Please use the getter function if it exists.

### 3. Reduce using offsets
The offset is easily changed after the update.  
Make sure the size of the previous field and remove the offset if it's possible.  

### 4. Following Minecraft official name
To make it easy to guess for everyone, use the known official name of Minecraft if it's possible.

### 5. Don't use the \$ sign for the identifier name
`BDSX` uses the \$ sign for indicating the namespace.  
but it's more reasonable using the TS namespace instead.  
So, Except in cases where it is impossible to create the namespace, please don't use the \$ sign.

### 6. Avoid multiple accessing of the native field
If the native field is the object type. it will allocate a new object per accessing.  
and it's accessed with the wrapper. So it has an overhead even it's a primitive field.
Please assign it to the local variable and reuse it.

### 7. Avoid changing the format of old code whenever possible
I wish to keep the previous contributor's intentions.  
If you think it's more useful, please discuss it on the GitHub or Discord server.

### 8. Don't make functions that take global variables as parameters.
It just makes unnecessary steps for using the function.

## Information about native level

### 1. Allocation methods
The native level allocation method cannot be collected by GC.  
It means it should be deleted manually. It can make memory leaks.  
* `construct()`, `constructWith(...)` - must be deleted with `destruct()`. it will call the destructor of the class.
* `allocate()`, `allocateWith()` - must be deleted with `dispose()`. almost all classes allocate the instance with `malloc` but a few cases are using different methods.
* `create()` - no need to delete it.

### 2. nativeClass(null) 
`nativeClass(null)` defines the class as an unknown size, and it prevents using the wrong calculated size.  
`nativeClass()` will assume the class size from the fields.

### 3. AbstractClass 
AbstractClass indicates it's not constructible.  
NativeClass will construct each field. but if the field is not provided, it will not be constructed.  
using the field without constructing can make the runtime error.

## Tips
* `./bdsx` directory is using ESLint for the code formatting. it would be better to use ESLint Extension for VSCode.

## About NPM Modules
* @types/node@12 - BDSX uses chakra-node and it's not updated more. need to use v12.
* eslint@7 and plugins - eslint@8 has an indent issue about the TS decorator. Waiting for the patch.
* source-map - JS version issue about chakra-core.
* strip-json-comments - JS version issue about chakra-core.
