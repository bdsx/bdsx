"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.partialTrace = exports.getCurrentFrameInfo = exports.install = exports.getErrorSource = exports.remapAndPrintError = exports.remapStackLine = exports.remapStack = exports.remapError = exports.mapSourcePosition = exports.retrieveSourceMap = void 0;
const source_map_1 = require("source-map");
const util_1 = require("./util");
const path = require("path");
const fs = require("fs");
const util = require("util");
const colors = require("colors");
const HIDE_UNDERSCOPE = true;
// Only install once if called multiple times
let uncaughtShimInstalled = false;
// Maps a file path to a string containing the file contents
const fileContentsCache = {};
// Maps a file path to a source map for that file
const sourceMapCache = {};
// Regex for detecting source maps
const reSourceMap = /^data:application\/json[^,]+base64,/;
// Priority list of retrieve handlers
const retrieveFileHandlers = [];
const retrieveMapHandlers = [];
function hasGlobalProcessEventEmitter() {
    return ((typeof process === 'object') && (process !== null) && (typeof process.on === 'function'));
}
function handlerExec(list) {
    return function (arg) {
        for (let i = 0; i < list.length; i++) {
            const ret = list[i](arg);
            if (ret != null) {
                return ret;
            }
        }
        return null;
    };
}
const retrieveFile = handlerExec(retrieveFileHandlers);
retrieveFileHandlers.push((path) => {
    // Trim the path to make sure there is no extra whitespace.
    path = path.trim();
    if (/^file:/.test(path)) {
        // existsSync/readFileSync can't handle file protocol, but once stripped, it works
        path = path.replace(/file:\/\/\/(\w:)?/, (protocol, drive) => drive != null ?
            '' : // file:///C:/dir/file -> C:/dir/file
            '/' // file:///root-dir/file -> /root-dir/file
        );
    }
    if (path in fileContentsCache) {
        return fileContentsCache[path];
    }
    let contents = '';
    try {
        if (fs.existsSync(path)) {
            // Otherwise, use the filesystem
            contents = fs.readFileSync(path, 'utf8');
        }
    }
    catch (er) {
        /* ignore any errors */
    }
    return fileContentsCache[path] = contents;
});
// Support URLs relative to a directory, but be careful about a protocol prefix
// in case we are in the browser (i.e. directories may start with "http://" or "file:///")
function supportRelativeURL(file, url) {
    if (!file)
        return url;
    const dir = path.dirname(file);
    const match = /^\w+:\/\/[^/]*/.exec(dir);
    let protocol = match ? match[0] : '';
    const startPath = dir.slice(protocol.length);
    if (protocol && /^\/\w:/.test(startPath)) {
        // handle file:///C:/ paths
        protocol += '/';
        return protocol + path.resolve(dir.slice(protocol.length), url).replace(/\\/g, '/');
    }
    return protocol + path.resolve(dir.slice(protocol.length), url);
}
function retrieveSourceMapURL(source) {
    // Get the URL of the source map
    const fileData = retrieveFile(source);
    const re = /(?:\/\/[@#][\s]*sourceMappingURL=([^\s'"]+)[\s]*$)|(?:\/\*[@#][\s]*sourceMappingURL=([^\s*'"]+)[\s]*(?:\*\/)[\s]*$)/mg;
    // Keep executing the search to find the *last* sourceMappingURL to avoid
    // picking up sourceMappingURLs from comments, strings, etc.
    let lastMatch = null;
    let match;
    while ((match = re.exec(fileData)) !== null)
        lastMatch = match;
    if (!lastMatch)
        return null;
    return lastMatch[1];
}
// Can be overridden by the retrieveSourceMap option to install. Takes a
// generated source filename; returns a {map, optional url} object, or null if
// there is no source map.  The map field may be either a string or the parsed
// JSON object (ie, it must be a valid argument to the SourceMapConsumer
// constructor).
exports.retrieveSourceMap = handlerExec(retrieveMapHandlers);
retrieveMapHandlers.push(source => {
    let sourceMappingURL = retrieveSourceMapURL(source);
    if (!sourceMappingURL)
        return null;
    // Read the contents of the source map
    let sourceMapData;
    if (reSourceMap.test(sourceMappingURL)) {
        // Support source map URL as a data url
        const rawData = sourceMappingURL.slice(sourceMappingURL.indexOf(',') + 1);
        sourceMapData = Buffer.from(rawData, "base64").toString();
        sourceMappingURL = source;
    }
    else {
        // Support source map URLs relative to the source URL
        sourceMappingURL = supportRelativeURL(source, sourceMappingURL);
        sourceMapData = retrieveFile(sourceMappingURL);
    }
    if (!sourceMapData) {
        return null;
    }
    return {
        url: sourceMappingURL,
        map: sourceMapData
    };
});
function mapSourcePosition(position) {
    let sourceMap = sourceMapCache[position.source];
    if (!sourceMap) {
        // Call the (overrideable) retrieveSourceMap function to get the source map.
        const urlAndMap = (0, exports.retrieveSourceMap)(position.source);
        if (urlAndMap) {
            sourceMap = sourceMapCache[position.source] = {
                url: urlAndMap.url,
                map: new source_map_1.SourceMapConsumer(urlAndMap.map)
            };
            // Load all sources stored inline with the source map into the file cache
            // to pretend like they are already loaded. They may not exist on disk.
            if (sourceMap.map) {
                for (const source of sourceMap.map.sources) {
                    const contents = sourceMap.map.sourceContentFor(source);
                    if (contents) {
                        const url = supportRelativeURL(sourceMap.url, source);
                        fileContentsCache[url] = contents;
                    }
                }
            }
        }
        else {
            sourceMap = sourceMapCache[position.source] = {
                url: null,
                map: null
            };
        }
    }
    // Resolve the source URL relative to the URL of the source map
    if (sourceMap != null && sourceMap.map) {
        const originalPosition = sourceMap.map.originalPositionFor(position);
        // Only return the original position if a matching line was found. If no
        // matching line is found then we return position instead, which will cause
        // the stack trace to print the path and line for the compiled file. It is
        // better to give a precise location in the compiled file than a vague
        // location in the original file.
        if (originalPosition.source !== null) {
            originalPosition.source = supportRelativeURL(sourceMap.url, originalPosition.source);
            return originalPosition;
        }
    }
    return position;
}
exports.mapSourcePosition = mapSourcePosition;
function remapError(err) {
    err.stack = remapStack(err.stack);
    return err;
}
exports.remapError = remapError;
function frameToString(frame) {
    const pos = frame.position;
    if (pos !== null) {
        return `${colors.cyan(pos.source)}:${colors.brightYellow(pos.line + '')}:${colors.brightYellow(pos.column + '')}`;
    }
    else {
        return colors.cyan(frame.stackLine);
    }
}
/**
 * remap filepath to original filepath
 */
function remapStack(stack) {
    if (stack === undefined)
        return undefined;
    const state = { nextPosition: null, curPosition: null };
    const frames = stack.split('\n');
    const nframes = [];
    let i = frames.length - 1;
    for (; i >= 1; i--) {
        const frame = remapStackLine(frames[i], state);
        if (HIDE_UNDERSCOPE && frame.hidden)
            continue;
        if (frame.internal)
            continue;
        nframes.push(frame.stackLine);
        state.nextPosition = state.curPosition;
        i--;
        break;
    }
    let showFirstInternal = true;
    for (; i >= 1; i--) {
        const frame = remapStackLine(frames[i], state);
        if (HIDE_UNDERSCOPE && frame.hidden)
            continue;
        if (frame.internal) {
            if (showFirstInternal) {
                showFirstInternal = false;
            }
            else {
                continue;
            }
        }
        else {
            showFirstInternal = true;
        }
        nframes.push(frame.stackLine);
        state.nextPosition = state.curPosition;
    }
    nframes.push(frames[0]);
    // hide the RuntimeError constructor
    const runtimeErrorIdx = nframes.findIndex(line => line.startsWith('   at RuntimeError ('));
    if (runtimeErrorIdx !== -1) {
        nframes.length = runtimeErrorIdx - 1;
    }
    return nframes.reverse().join('\n');
}
exports.remapStack = remapStack;
const stackLineMatcher = /^ +at (.+) \(([^(]+)\)$/;
/**
 * remap filepath to original filepath for one line
 */
function remapStackLine(stackLine, state = { nextPosition: null, curPosition: null }) {
    const matched = stackLineMatcher.exec(stackLine);
    if (matched === null)
        return { hidden: false, stackLine, internal: false, position: null };
    const fnname = matched[1];
    const source = matched[2];
    // provides interface backward compatibility
    if (source === 'native code' || source === 'native code:0:0') {
        state.curPosition = null;
        return { hidden: false, stackLine, internal: false, position: null };
    }
    const srcmatched = /^(.+):(\d+):(\d+)$/.exec(source);
    if (!srcmatched)
        return { hidden: false, stackLine, internal: false, position: null };
    const isEval = fnname === 'eval code';
    if (isEval) {
        return { hidden: false, stackLine, internal: false, position: null };
    }
    const file = srcmatched[1];
    const line = +srcmatched[2];
    const column = +srcmatched[3] - 1;
    const position = mapSourcePosition({
        source: file,
        line: line,
        column: column
    });
    state.curPosition = position;
    return {
        hidden: fnname === '_',
        stackLine: `   at ${fnname} (${position.source}:${position.line}:${position.column + 1})`,
        internal: position.source.startsWith('internal/'),
        position,
    };
}
exports.remapStackLine = remapStackLine;
/**
 * remap stack and print
 */
function remapAndPrintError(err) {
    if (err != null && err.stack != null) {
        console.error(remapStack(err.stack));
    }
    else {
        console.error(err);
    }
}
exports.remapAndPrintError = remapAndPrintError;
// Generate position and snippet of original source with pointer
function getErrorSource(error) {
    const match = /\n {3}at [^(]+ \((.*):(\d+):(\d+)\)/.exec(error.stack);
    if (match) {
        const source = match[1];
        const line = +match[2];
        const column = +match[3];
        // Support the inline sourceContents inside the source map
        let contents = fileContentsCache[source];
        // Support files on disk
        if (contents == null && fs.existsSync(source)) {
            try {
                contents = fs.readFileSync(source, 'utf8');
            }
            catch (er) {
                contents = null;
            }
        }
        // Format the line from the original source code like node does
        if (contents != null) {
            const code = contents.split(/(?:\r\n|\r|\n)/)[line - 1];
            if (code != null) {
                return `${source}:${line}\n${code}\n${new Array(column).join(' ')}^`;
            }
        }
    }
    return null;
}
exports.getErrorSource = getErrorSource;
function printErrorAndExit(error) {
    const source = getErrorSource(error);
    // Ensure error is printed synchronously and not truncated
    const handle = process.stderr._handle;
    if (handle != null && handle.setBlocking != null) {
        handle.setBlocking(true);
    }
    if (source) {
        console.error();
        console.error(source);
    }
    console.error(error.stack);
    process.exit(1);
}
function shimEmitUncaughtException() {
    const origEmit = process.emit;
    process.emit = function (type, ...args) {
        if (type === 'uncaughtException') {
            const err = args[0];
            if (err != null && err.stack != null) {
                err.stack = remapStack(err.stack);
                const hasListeners = (this.listeners(type).length > 0);
                if (!hasListeners) {
                    return printErrorAndExit(err);
                }
            }
        }
        else if (type === 'unhandledRejection') {
            const err = args[0];
            if (err != null && err.stack != null)
                err.stack = remapStack(err.stack);
        }
        return origEmit.apply(this, arguments);
    };
}
function install() {
    if (uncaughtShimInstalled)
        return;
    let installHandler = true;
    try {
        const worker_threads = module.require('worker_threads');
        if (worker_threads.isMainThread === false) {
            installHandler = false;
        }
    }
    catch (e) { }
    if (installHandler && hasGlobalProcessEventEmitter()) {
        uncaughtShimInstalled = true;
        shimEmitUncaughtException();
    }
    console.trace = function (...messages) {
        const err = remapStack((0, util_1.removeLine)(Error(messages.map(msg => typeof msg === 'string' ? msg : util.inspect(msg, false, 2, true)).join(' ')).stack || '', 1, 2));
        console.error(`Trace${err.substr(5)}`);
    };
}
exports.install = install;
function getCurrentFrameInfo(stackOffset = 0) {
    return remapStackLine((0, util_1.getLineAt)(Error().stack, stackOffset + 2));
}
exports.getCurrentFrameInfo = getCurrentFrameInfo;
function partialTrace(message, offset = 0) {
    const stack = remapStack(new Error().stack);
    const idx = (0, util_1.indexOfLine)(stack, 2 + offset);
    if (idx === -1) {
        console.error(message);
    }
    else {
        console.error('Trace: ' + message);
        console.error(stack.substr(idx));
    }
}
exports.partialTrace = partialTrace;
//# sourceMappingURL=source-map-support.js.map