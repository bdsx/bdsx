const { cgate, runtimeError } = require('../core');
const { asm } = require('../assembler');
require('../codealloc');
const buffer = cgate.allocExecutableMemory(3364, 8);
buffer.setBuffer(new Uint8Array([
// pointer_np2js
0x48,0x83,0xec,0x28,0x48,0x89,0x54,0x24,0x38,0x4c,0x89,0x44,0x24,0x40,0x4c,0x8d,0x4c,0x24,0x20,0x48,0x8d,0x54,0x24,0x30,0x48,0x8b,0x05,0x19,0x0a,0x00,0x00,0x49,0xc7,0xc0,0x01,0x00,0x00,0x00,0x48,0x89,0x02,0xff,0x15,0xf9,0x09,0x00,0x00,0x85,0xc0,0x75,0x1e,0x48,0x8b,0x54,0x24,0x40,0x48,0x8b,0x4c,0x24,0x20,0x48,0x89,0x0a,0xff,0x15,0x2a,0x0a,0x00,0x00,0x48,0x8b,0x4c,0x24,0x38,0x48,0x89,0x48,0x10,0x31,0xc0,0x48,0x83,0xc4,0x28,0xc3,
// breakBeforeCallNativeFunction
0xcc,
// callNativeFunction
0x55,0x53,0x48,0x89,0xe5,0x48,0x83,0xec,0x28,0x4c,0x89,0xc3,0x31,0xc0,0x48,0x8d,0x55,0x28,0x48,0x89,0x02,0x48,0x8b,0x4b,0x08,0xff,0x15,0xe2,0x09,0x00,0x00,0x48,0x2b,0x65,0x28,0x4c,0x8d,0x45,0x38,0x48,0x89,0xe2,0x48,0x8b,0x0d,0xf0,0x09,0x00,0x00,0xe8,0x73,0xff,0xff,0xff,0x85,0xc0,0x0f,0x85,0x9c,0x00,0x00,0x00,0x48,0x8b,0x4b,0x18,0x4c,0x8d,0x4d,0x28,0x4c,0x8b,0x05,0xc4,0x09,0x00,0x00,0x48,0x8d,0x55,0x30,0x4c,0x89,0x45,0x30,0x49,0xc7,0xc0,0x02,0x00,0x00,0x00,0x48,0x83,0xec,0x20,0xff,0x15,0xa3,0x09,0x00,0x00,0x85,0xc0,0x75,0x70,0x48,0x8b,0x4b,0x10,0xff,0x15,0xa5,0x09,0x00,0x00,0x48,0x83,0xc4,0x20,0x48,0x8b,0x0c,0x24,0x48,0x8b,0x54,0x24,0x08,0x4c,0x8b,0x44,0x24,0x10,0x4c,0x8b,0x4c,0x24,0x18,0xf2,0x0f,0x10,0x04,0x24,0xf2,0x0f,0x10,0x4c,0x24,0x08,0xf2,0x0f,0x10,0x54,0x24,0x10,0xf2,0x0f,0x10,0x5c,0x24,0x18,0xff,0x50,0x10,0x48,0x89,0x45,0x18,0xf2,0x0f,0x11,0x45,0x20,0x48,0x8b,0x4b,0x20,0x4c,0x8d,0x4d,0x28,0x48,0x8d,0x55,0x30,0x49,0xc7,0xc0,0x02,0x00,0x00,0x00,0x48,0x83,0xec,0x20,0xff,0x15,0x3e,0x09,0x00,0x00,0x48,0x85,0xc0,0x75,0x0a,0x48,0x8b,0x45,0x28,0x48,0x89,0xec,0x5b,0x5d,0xc3,0x48,0x8b,0x05,0x30,0x09,0x00,0x00,0x48,0x89,0xec,0x5b,0x5d,0xc3,
// callJsFunction
0x48,0x81,0xec,0xa8,0x00,0x00,0x00,0x4c,0x89,0x9c,0x24,0xa0,0x00,0x00,0x00,0x48,0x89,0x4c,0x24,0x48,0x48,0x89,0x54,0x24,0x50,0x4c,0x89,0x44,0x24,0x58,0x4c,0x89,0x4c,0x24,0x60,0xf2,0x0f,0x11,0x44,0x24,0x68,0xf2,0x0f,0x11,0x4c,0x24,0x70,0xf2,0x0f,0x11,0x54,0x24,0x78,0xf2,0x0f,0x11,0x9c,0x24,0x80,0x00,0x00,0x00,0x4c,0x89,0x54,0x24,0x30,0x4c,0x8d,0x44,0x24,0x40,0x48,0x8d,0x54,0x24,0x48,0x48,0x8b,0x0d,0xe6,0x08,0x00,0x00,0xe8,0x69,0xfe,0xff,0xff,0x85,0xc0,0x75,0x45,0x48,0x8b,0x4c,0x24,0x30,0x4c,0x8d,0x4c,0x24,0x28,0x49,0xc7,0xc0,0x02,0x00,0x00,0x00,0x48,0x8b,0x05,0x85,0x08,0x00,0x00,0x48,0x8d,0x54,0x24,0x38,0x48,0x89,0x44,0x24,0x38,0xff,0x15,0x9d,0x08,0x00,0x00,0x85,0xc0,0x75,0x19,0x48,0x8b,0x84,0x24,0x90,0x00,0x00,0x00,0xf2,0x0f,0x10,0x84,0x24,0x98,0x00,0x00,0x00,0x48,0x81,0xc4,0xa8,0x00,0x00,0x00,0xc3,0x48,0x8b,0x4c,0x24,0x48,0x48,0x8b,0x54,0x24,0x50,0x4c,0x8b,0x44,0x24,0x58,0x4c,0x8b,0x4c,0x24,0x60,0xf2,0x0f,0x10,0x44,0x24,0x68,0xf2,0x0f,0x10,0x4c,0x24,0x70,0xf2,0x0f,0x10,0x54,0x24,0x78,0xf2,0x0f,0x10,0x9c,0x24,0x80,0x00,0x00,0x00,0x48,0x81,0xc4,0xa8,0x00,0x00,0x00,0xff,0x64,0x24,0xf8,
// crosscall_on_gamethread
0x53,0x48,0x83,0xec,0x20,0x48,0x8b,0x59,0x20,0x4c,0x8d,0x43,0x40,0x48,0x8d,0x53,0x48,0x48,0x8b,0x0d,0x46,0x08,0x00,0x00,0xe8,0xc9,0xfd,0xff,0xff,0x85,0xc0,0x75,0x38,0x48,0x8b,0x4b,0x30,0x4c,0x8d,0x4b,0x28,0x49,0xc7,0xc0,0x02,0x00,0x00,0x00,0x48,0x8b,0x05,0xe7,0x07,0x00,0x00,0x48,0x8d,0x53,0x38,0x48,0x89,0x43,0x38,0xff,0x15,0x01,0x08,0x00,0x00,0x85,0xc0,0x75,0x10,0x48,0x8b,0x4b,0x20,0xff,0x15,0x4b,0x08,0x00,0x00,0x48,0x83,0xc4,0x20,0x5b,0xc3,0x48,0x83,0xc4,0x20,0x5b,0xe9,0x85,0x00,0x00,0x00,
// jsend_crossthread
0x48,0x81,0xec,0xa8,0x00,0x00,0x00,0x3d,0x03,0x00,0x01,0x00,0x75,0x77,0x31,0xc9,0x31,0xd2,0x45,0x31,0xc0,0x45,0x31,0xc9,0xff,0x15,0x0d,0x08,0x00,0x00,0x48,0x89,0x44,0x24,0x20,0x48,0x8d,0x0d,0x73,0xff,0xff,0xff,0x48,0xc7,0xc2,0x08,0x00,0x00,0x00,0xff,0x15,0xdc,0x07,0x00,0x00,0x48,0x89,0x44,0x24,0x18,0x48,0x89,0xc1,0xff,0x15,0xd6,0x07,0x00,0x00,0x48,0x8b,0x44,0x24,0x18,0x48,0x89,0xe2,0x48,0x8b,0x4c,0x24,0x20,0x48,0x89,0x50,0x20,0xba,0xff,0xff,0xff,0xff,0xff,0x15,0xe2,0x07,0x00,0x00,0x48,0x8b,0x4c,0x24,0x20,0xff,0x15,0xc7,0x07,0x00,0x00,0x48,0x8b,0x84,0x24,0x90,0x00,0x00,0x00,0xf2,0x0f,0x10,0x84,0x24,0x98,0x00,0x00,0x00,0x48,0x81,0xc4,0xa8,0x00,0x00,0x00,0xc3,
// jsend_crash
0x89,0xc1,0x81,0xc9,0x00,0x00,0x00,0xe0,0xe9,0x1f,0x01,0x00,0x00,0xc3,
// jsend_returnZero
0x48,0x83,0xec,0x18,0x48,0x8d,0x4c,0x24,0x10,0xff,0x15,0x11,0x07,0x00,0x00,0x85,0xc0,0x75,0x0b,0x48,0x8b,0x4c,0x24,0x10,0xff,0x15,0x72,0x07,0x00,0x00,0x31,0xc0,0x48,0x83,0xc4,0x18,0xc3,
// logHookAsyncCb
0x4c,0x8b,0x41,0x28,0x48,0x8d,0x51,0x30,0x48,0x8b,0x49,0x20,0xff,0x25,0xd1,0x06,0x00,0x00,0xc3,
// logHook
0x53,0x48,0x83,0xec,0x20,0x89,0x4c,0x24,0x30,0x48,0x89,0x54,0x24,0x38,0x4c,0x89,0x44,0x24,0x40,0x4c,0x89,0x4c,0x24,0x48,0x4c,0x8d,0x4c,0x24,0x40,0x49,0x89,0xd0,0x31,0xd2,0x89,0xd1,0xff,0x15,0xae,0x06,0x00,0x00,0x48,0x85,0xc0,0x0f,0x88,0x60,0x00,0x00,0x00,0x48,0x89,0xc3,0x48,0x8d,0x50,0x11,0x48,0x8d,0x0d,0xac,0xff,0xff,0xff,0xff,0x15,0x01,0x07,0x00,0x00,0x48,0x8b,0x4c,0x24,0x30,0x48,0x89,0x48,0x20,0x48,0x89,0x58,0x28,0x4c,0x8d,0x4c,0x24,0x40,0x4c,0x8b,0x44,0x24,0x38,0x48,0x8d,0x53,0x01,0x48,0x8d,0x48,0x30,0x48,0x89,0xc3,0xff,0x15,0x69,0x06,0x00,0x00,0xff,0x15,0x53,0x06,0x00,0x00,0x48,0x89,0xd9,0x3b,0x05,0x7a,0x06,0x00,0x00,0x0f,0x85,0x07,0x00,0x00,0x00,0xe8,0x64,0xff,0xff,0xff,0xeb,0x43,0xff,0x15,0xbf,0x06,0x00,0x00,0xeb,0x3b,0x48,0xc7,0xc2,0x20,0x00,0x00,0x00,0x48,0x8d,0x0d,0x4c,0xff,0xff,0xff,0xff,0x15,0xa1,0x06,0x00,0x00,0x48,0x8b,0x54,0x24,0x30,0x48,0x89,0x50,0x20,0x48,0xc7,0x40,0x28,0x0f,0x00,0x00,0x00,0x48,0x8d,0x0d,0xc1,0x03,0x00,0x00,0x48,0x8b,0x11,0x48,0x89,0x50,0x30,0x48,0x8b,0x51,0x08,0x48,0x89,0x50,0x38,0x48,0x83,0xc4,0x20,0x5b,0xc3,
// runtime_error
0x48,0x8b,0x01,0x81,0x38,0x03,0x00,0x00,0x80,0x74,0x06,0xff,0x25,0x1b,0x06,0x00,0x00,0xc3,
// raise_runtime_error
0x48,0x81,0xec,0x88,0x05,0x00,0x00,0x48,0x8d,0x54,0x24,0x18,0x89,0x0a,0x48,0x8d,0x8a,0x98,0x00,0x00,0x00,0x48,0x89,0x54,0x24,0x08,0x48,0x89,0x4c,0x24,0x10,0xff,0x15,0xfd,0x05,0x00,0x00,0x4c,0x8d,0x04,0x25,0x94,0x00,0x00,0x00,0x48,0x8d,0x4a,0x04,0x31,0xd2,0xff,0x15,0x19,0x06,0x00,0x00,0x48,0x8d,0x4c,0x24,0x08,0xff,0x15,0xd6,0x05,0x00,0x00,0x48,0x81,0xc4,0x88,0x05,0x00,0x00,0xc3,
// debugBreak
0xcc,0xc3,
// returnRcx
0x48,0x89,0xc8,0xc3,
// returnZero
0x31,0xc0,0xc3,
// CommandOutputSenderHook
0x48,0x83,0xec,0x28,0x48,0x8d,0x4d,0x07,0xff,0x15,0x37,0x06,0x00,0x00,0x48,0x83,0xc4,0x28,0xc3,
// ConsoleInputReader_getLine_hook
0x48,0x8b,0x0d,0x33,0x06,0x00,0x00,0xff,0x25,0x35,0x06,0x00,0x00,0xc3,
// gameThreadEntry
0x48,0x83,0xec,0x28,0xff,0x15,0x3a,0x06,0x00,0x00,0x48,0x8b,0x0d,0x2b,0x06,0x00,0x00,0xff,0x15,0x3d,0x06,0x00,0x00,0xff,0x15,0x2f,0x06,0x00,0x00,0x48,0x8b,0x0d,0x40,0x06,0x00,0x00,0xff,0x15,0xea,0x05,0x00,0x00,0x48,0x83,0xc4,0x28,0xc3,
// gameThreadHook
0x48,0x83,0xec,0x28,0x48,0x89,0xcb,0x48,0x89,0x0d,0xff,0x05,0x00,0x00,0x48,0x8d,0x0d,0xbc,0xff,0xff,0xff,0xff,0x15,0x9a,0x05,0x00,0x00,0x48,0x8b,0x0d,0x13,0x06,0x00,0x00,0x48,0xc7,0xc2,0xff,0xff,0xff,0xff,0xff,0x15,0xbe,0x05,0x00,0x00,0x48,0x83,0xc4,0x28,0xff,0x25,0x04,0x06,0x00,0x00,
// wrapped_main
0x48,0x83,0xec,0x28,0x8b,0x0d,0x0a,0x06,0x00,0x00,0x48,0x8b,0x15,0xfb,0x05,0x00,0x00,0x45,0x31,0xc0,0xff,0x15,0x02,0x06,0x00,0x00,0x48,0x83,0xc4,0x28,0x48,0x8b,0x0d,0xff,0x05,0x00,0x00,0xff,0x25,0x51,0x05,0x00,0x00,
// updateWithSleep
0x48,0x83,0xec,0x28,0xff,0x15,0xf7,0x05,0x00,0x00,0x48,0x83,0xc4,0x28,0x48,0x8b,0x05,0xf4,0x05,0x00,0x00,0x48,0x85,0xc0,0x74,0x06,0xff,0x25,0xe9,0x05,0x00,0x00,0xc3,
// actorDestructorHook
0x48,0x83,0xec,0x08,0xff,0x15,0xae,0x04,0x00,0x00,0x48,0x83,0xc4,0x08,0x48,0x3b,0x05,0xd3,0x04,0x00,0x00,0x75,0x06,0xff,0x25,0xd3,0x05,0x00,0x00,0xc3,
// packetRawHook
0x8b,0x95,0x80,0x01,0x00,0x00,0x48,0x8d,0x05,0xdd,0x05,0x00,0x00,0x8a,0x04,0x10,0xa8,0x01,0x74,0x0c,0x48,0x89,0xe9,0x4c,0x89,0xf2,0xff,0x25,0xba,0x05,0x00,0x00,0x48,0x8d,0x8d,0x90,0x01,0x00,0x00,0xff,0x25,0xb5,0x05,0x00,0x00,
// packetBeforeHook
0x48,0x83,0xec,0x28,0x48,0x8d,0x95,0xe0,0x01,0x00,0x00,0x48,0x8d,0x4d,0x10,0xff,0x15,0xe8,0x06,0x00,0x00,0x48,0x83,0xc4,0x28,0x48,0x8d,0x0d,0x9d,0x05,0x00,0x00,0x44,0x8b,0x85,0x80,0x01,0x00,0x00,0x42,0x0f,0xb6,0x0c,0x01,0xf6,0xc1,0x02,0x74,0x0f,0x48,0x89,0xe9,0x48,0x89,0xe2,0x4d,0x89,0xf1,0xff,0x25,0xc5,0x06,0x00,0x00,0xc3,
// packetAfterHook
0x48,0x83,0xec,0x28,0x49,0x89,0xf0,0x4c,0x89,0xf2,0x48,0x8b,0x40,0x08,0xff,0x15,0xc8,0x06,0x00,0x00,0x4c,0x8d,0x15,0x61,0x05,0x00,0x00,0x44,0x8b,0x85,0x80,0x01,0x00,0x00,0x43,0x0f,0xb6,0x04,0x02,0x48,0x83,0xc4,0x28,0xa8,0x04,0x74,0x10,0x48,0x8b,0x8d,0x90,0x01,0x00,0x00,0x4c,0x89,0xf2,0xff,0x25,0x8d,0x06,0x00,0x00,0xc3,
// packetSendHook
0x48,0x83,0xec,0x48,0x49,0x8b,0x00,0xff,0x50,0x08,0x4c,0x8d,0x15,0x2b,0x05,0x00,0x00,0x46,0x8a,0x14,0x10,0x41,0xf6,0xc2,0x08,0x0f,0x84,0x34,0x00,0x00,0x00,0x48,0x89,0x4c,0x24,0x20,0x89,0xc1,0x48,0x89,0x54,0x24,0x28,0x4c,0x89,0x44,0x24,0x30,0x4c,0x89,0x4c,0x24,0x38,0xff,0x15,0x71,0x06,0x00,0x00,0x48,0x8b,0x4c,0x24,0x20,0x48,0x8b,0x54,0x24,0x28,0x4c,0x8b,0x44,0x24,0x30,0x4c,0x8b,0x4c,0x24,0x38,0x85,0xc0,0x75,0x0a,0x48,0x83,0xc4,0x48,0xff,0x25,0x47,0x06,0x00,0x00,0x48,0x83,0xc4,0x48,0xc3,
// packetSendAllHook
0x48,0x83,0xec,0x28,0x4c,0x89,0xe0,0x48,0x8b,0x00,0xff,0x50,0x08,0x4c,0x8d,0x15,0xc6,0x04,0x00,0x00,0x89,0xc1,0x42,0x8a,0x04,0x10,0xa8,0x08,0x74,0x1b,0x4d,0x89,0xf8,0x48,0x89,0xda,0xff,0x15,0x20,0x06,0x00,0x00,0x85,0xc0,0x74,0x0b,0x48,0x83,0xc4,0x28,0x58,0xff,0x25,0x21,0x06,0x00,0x00,0x48,0x83,0xc4,0x28,0x4c,0x89,0xe0,0x48,0x8b,0x00,0x49,0x8d,0x96,0x00,0x02,0x00,0x00,0x4c,0x89,0xe1,0x48,0x8b,0x40,0x18,0xff,0x25,0xe3,0x05,0x00,0x00,
// packetSendInternalHook
0x48,0x83,0xec,0x48,0x49,0x8b,0x00,0xff,0x50,0x08,0x4c,0x8d,0x15,0x72,0x04,0x00,0x00,0x46,0x8a,0x14,0x10,0x41,0xf6,0xc2,0x10,0x0f,0x84,0x34,0x00,0x00,0x00,0x48,0x89,0x4c,0x24,0x20,0x89,0xc1,0x48,0x89,0x54,0x24,0x28,0x4c,0x89,0x44,0x24,0x30,0x4c,0x89,0x4c,0x24,0x38,0xff,0x15,0xd0,0x05,0x00,0x00,0x48,0x8b,0x4c,0x24,0x20,0x48,0x8b,0x54,0x24,0x28,0x4c,0x8b,0x44,0x24,0x30,0x4c,0x8b,0x4c,0x24,0x38,0x85,0xc0,0x75,0x0a,0x48,0x83,0xc4,0x48,0xff,0x25,0x9e,0x05,0x00,0x00,0x48,0x83,0xc4,0x48,0xc3,
// getline
0x53,0x56,0x48,0x83,0xec,0x18,0x48,0x89,0xcb,0x48,0x8b,0x0d,0xa1,0x05,0x00,0x00,0x48,0x8d,0x14,0x25,0x28,0x00,0x00,0x00,0xff,0x15,0x33,0x03,0x00,0x00,0x48,0x89,0x58,0x40,0x48,0x89,0xc6,0x48,0x8d,0x4e,0x20,0xff,0x15,0x9a,0x05,0x00,0x00,0x48,0x8b,0x0d,0x83,0x05,0x00,0x00,0x48,0x89,0xc2,0x49,0xc7,0xc0,0x0a,0x00,0x00,0x00,0xff,0x15,0x7b,0x05,0x00,0x00,0x48,0x89,0xf1,0xff,0x15,0x0a,0x03,0x00,0x00,0xeb,0xb8,0x48,0x83,0xc4,0x18,0x5e,0x5b,0xc3,
// terminateHook
0x48,0x83,0xec,0x28,0xff,0x15,0x6f,0x02,0x00,0x00,0x3b,0x05,0x79,0x05,0x00,0x00,0x75,0x15,0x48,0x8b,0x0d,0x80,0x03,0x00,0x00,0xff,0x15,0xd2,0x02,0x00,0x00,0x31,0xc9,0xff,0x15,0x5a,0x05,0x00,0x00,0x48,0x83,0xc4,0x28,0xff,0x25,0x48,0x05,0x00,0x00,0x5b,0x66,0x6f,0x72,0x6d,0x61,0x74,0x20,0x66,0x61,0x69,0x6c,0x65,0x64,0x5d,0x00,0x01,0x00,0x00,0x00,0x01,0x00,0x00,0x00,0x01,0x05,0x03,0x05,0x05,0x03,0x02,0x30,0x01,0x50,0x00,0x00,0x01,0x07,0x02,0x00,0x07,0x01,0x15,0x00,0x01,0x05,0x02,0x00,0x05,0x32,0x01,0x30,0x01,0x07,0x02,0x00,0x07,0x01,0x15,0x00,0x01,0x00,0x00,0x00,0x01,0x04,0x01,0x00,0x04,0x22,0x00,0x00,0x01,0x00,0x00,0x00,0x01,0x05,0x02,0x00,0x05,0x32,0x01,0x30,0x01,0x00,0x00,0x00,0x01,0x07,0x02,0x00,0x07,0x01,0xb1,0x00,0x01,0x00,0x00,0x00,0x01,0x00,0x00,0x00,0x01,0x00,0x00,0x00,0x01,0x04,0x01,0x00,0x04,0x42,0x00,0x00,0x01,0x00,0x00,0x00,0x01,0x04,0x01,0x00,0x04,0x42,0x00,0x00,0x01,0x04,0x01,0x00,0x04,0x42,0x00,0x00,0x01,0x04,0x01,0x00,0x04,0x42,0x00,0x00,0x01,0x04,0x01,0x00,0x04,0x42,0x00,0x00,0x01,0x04,0x01,0x00,0x04,0x02,0x00,0x00,0x01,0x00,0x00,0x00,0x01,0x04,0x01,0x00,0x04,0x42,0x00,0x00,0x01,0x04,0x01,0x00,0x04,0x42,0x00,0x00,0x01,0x04,0x01,0x00,0x04,0x82,0x00,0x00,0x01,0x04,0x01,0x00,0x04,0x42,0x00,0x00,0x01,0x04,0x01,0x00,0x04,0x82,0x00,0x00,0x01,0x06,0x03,0x00,0x06,0x22,0x02,0x60,0x01,0x30,0x00,0x00,0x01,0x04,0x01,0x00,0x04,0x42,0x00,0x00,
// #runtime_function_table
0x00,0x00,0x00,0x00,0x56,0x00,0x00,0x00,0xd8,0x07,0x00,0x00,0x56,0x00,0x00,0x00,0x57,0x00,0x00,0x00,0xdc,0x07,0x00,0x00,0x57,0x00,0x00,0x00,0x3e,0x01,0x00,0x00,0xe0,0x07,0x00,0x00,0x3e,0x01,0x00,0x00,0x1a,0x02,0x00,0x00,0xec,0x07,0x00,0x00,0x1a,0x02,0x00,0x00,0x7d,0x02,0x00,0x00,0xf4,0x07,0x00,0x00,0x7d,0x02,0x00,0x00,0x02,0x03,0x00,0x00,0xfc,0x07,0x00,0x00,0x02,0x03,0x00,0x00,0x10,0x03,0x00,0x00,0x04,0x08,0x00,0x00,0x10,0x03,0x00,0x00,0x35,0x03,0x00,0x00,0x08,0x08,0x00,0x00,0x35,0x03,0x00,0x00,0x48,0x03,0x00,0x00,0x10,0x08,0x00,0x00,0x48,0x03,0x00,0x00,0x1c,0x04,0x00,0x00,0x14,0x08,0x00,0x00,0x1c,0x04,0x00,0x00,0x2e,0x04,0x00,0x00,0x1c,0x08,0x00,0x00,0x2e,0x04,0x00,0x00,0x7a,0x04,0x00,0x00,0x20,0x08,0x00,0x00,0x7a,0x04,0x00,0x00,0x7c,0x04,0x00,0x00,0x28,0x08,0x00,0x00,0x7c,0x04,0x00,0x00,0x80,0x04,0x00,0x00,0x2c,0x08,0x00,0x00,0x80,0x04,0x00,0x00,0x83,0x04,0x00,0x00,0x30,0x08,0x00,0x00,0x83,0x04,0x00,0x00,0x96,0x04,0x00,0x00,0x34,0x08,0x00,0x00,0x96,0x04,0x00,0x00,0xa4,0x04,0x00,0x00,0x3c,0x08,0x00,0x00,0xa4,0x04,0x00,0x00,0xd3,0x04,0x00,0x00,0x40,0x08,0x00,0x00,0xd3,0x04,0x00,0x00,0x0c,0x05,0x00,0x00,0x48,0x08,0x00,0x00,0x0c,0x05,0x00,0x00,0x37,0x05,0x00,0x00,0x50,0x08,0x00,0x00,0x37,0x05,0x00,0x00,0x58,0x05,0x00,0x00,0x58,0x08,0x00,0x00,0x58,0x05,0x00,0x00,0x76,0x05,0x00,0x00,0x60,0x08,0x00,0x00,0x76,0x05,0x00,0x00,0xa3,0x05,0x00,0x00,0x68,0x08,0x00,0x00,0xa3,0x05,0x00,0x00,0xe4,0x05,0x00,0x00,0x6c,0x08,0x00,0x00,0xe4,0x05,0x00,0x00,0x24,0x06,0x00,0x00,0x74,0x08,0x00,0x00,0x24,0x06,0x00,0x00,0x86,0x06,0x00,0x00,0x7c,0x08,0x00,0x00,0x86,0x06,0x00,0x00,0xdd,0x06,0x00,0x00,0x84,0x08,0x00,0x00,0xdd,0x06,0x00,0x00,0x3f,0x07,0x00,0x00,0x8c,0x08,0x00,0x00,0x3f,0x07,0x00,0x00,0x97,0x07,0x00,0x00,0x94,0x08,0x00,0x00,0x97,0x07,0x00,0x00,0xd8,0x07,0x00,0x00,0xa0,0x08,0x00,0x00,
]));
exports.asmcode = {
    get GetCurrentThreadId(){
        return buffer.getPointer(2576);
    },
    set GetCurrentThreadId(n){
        buffer.setPointer(n, 2576);
    },
    get addressof_GetCurrentThreadId(){
        return buffer.add(2576);
    },
    get bedrockLogNp(){
        return buffer.getPointer(2584);
    },
    set bedrockLogNp(n){
        buffer.setPointer(n, 2584);
    },
    get addressof_bedrockLogNp(){
        return buffer.add(2584);
    },
    get vsnprintf(){
        return buffer.getPointer(2592);
    },
    set vsnprintf(n){
        buffer.setPointer(n, 2592);
    },
    get addressof_vsnprintf(){
        return buffer.add(2592);
    },
    get JsConstructObject(){
        return buffer.getPointer(2600);
    },
    set JsConstructObject(n){
        buffer.setPointer(n, 2600);
    },
    get addressof_JsConstructObject(){
        return buffer.add(2600);
    },
    get JsGetAndClearException(){
        return buffer.getPointer(2608);
    },
    set JsGetAndClearException(n){
        buffer.setPointer(n, 2608);
    },
    get addressof_JsGetAndClearException(){
        return buffer.add(2608);
    },
    get js_null(){
        return buffer.getPointer(2616);
    },
    set js_null(n){
        buffer.setPointer(n, 2616);
    },
    get addressof_js_null(){
        return buffer.add(2616);
    },
    get nodeThreadId(){
        return buffer.getInt32(2624);
    },
    set nodeThreadId(n){
        buffer.setInt32(n, 2624);
    },
    get addressof_nodeThreadId(){
        return buffer.add(2624);
    },
    get runtimeErrorRaise(){
        return buffer.getPointer(2632);
    },
    set runtimeErrorRaise(n){
        buffer.setPointer(n, 2632);
    },
    get addressof_runtimeErrorRaise(){
        return buffer.add(2632);
    },
    get RtlCaptureContext(){
        return buffer.getPointer(2640);
    },
    set RtlCaptureContext(n){
        buffer.setPointer(n, 2640);
    },
    get addressof_RtlCaptureContext(){
        return buffer.add(2640);
    },
    get JsNumberToInt(){
        return buffer.getPointer(2648);
    },
    set JsNumberToInt(n){
        buffer.setPointer(n, 2648);
    },
    get addressof_JsNumberToInt(){
        return buffer.add(2648);
    },
    get JsCallFunction(){
        return buffer.getPointer(2656);
    },
    set JsCallFunction(n){
        buffer.setPointer(n, 2656);
    },
    get addressof_JsCallFunction(){
        return buffer.add(2656);
    },
    get js_undefined(){
        return buffer.getPointer(2664);
    },
    set js_undefined(n){
        buffer.setPointer(n, 2664);
    },
    get addressof_js_undefined(){
        return buffer.add(2664);
    },
    get pointer_js2class(){
        return buffer.getPointer(2672);
    },
    set pointer_js2class(n){
        buffer.setPointer(n, 2672);
    },
    get addressof_pointer_js2class(){
        return buffer.add(2672);
    },
    get NativePointer(){
        return buffer.getPointer(2680);
    },
    set NativePointer(n){
        buffer.setPointer(n, 2680);
    },
    get addressof_NativePointer(){
        return buffer.add(2680);
    },
    get memset(){
        return buffer.getPointer(2688);
    },
    set memset(n){
        buffer.setPointer(n, 2688);
    },
    get addressof_memset(){
        return buffer.add(2688);
    },
    get uv_async_call(){
        return buffer.getPointer(2696);
    },
    set uv_async_call(n){
        buffer.setPointer(n, 2696);
    },
    get addressof_uv_async_call(){
        return buffer.add(2696);
    },
    get uv_async_alloc(){
        return buffer.getPointer(2704);
    },
    set uv_async_alloc(n){
        buffer.setPointer(n, 2704);
    },
    get addressof_uv_async_alloc(){
        return buffer.add(2704);
    },
    get uv_async_post(){
        return buffer.getPointer(2712);
    },
    set uv_async_post(n){
        buffer.setPointer(n, 2712);
    },
    get addressof_uv_async_post(){
        return buffer.add(2712);
    },
    get pointer_np2js(){
        return buffer.add(0);
    },
    get breakBeforeCallNativeFunction(){
        return buffer.add(86);
    },
    get callNativeFunction(){
        return buffer.add(87);
    },
    get callJsFunction(){
        return buffer.add(318);
    },
    get jshook_fireError(){
        return buffer.getPointer(2720);
    },
    set jshook_fireError(n){
        buffer.setPointer(n, 2720);
    },
    get addressof_jshook_fireError(){
        return buffer.add(2720);
    },
    get CreateEventW(){
        return buffer.getPointer(2728);
    },
    set CreateEventW(n){
        buffer.setPointer(n, 2728);
    },
    get addressof_CreateEventW(){
        return buffer.add(2728);
    },
    get CloseHandle(){
        return buffer.getPointer(2736);
    },
    set CloseHandle(n){
        buffer.setPointer(n, 2736);
    },
    get addressof_CloseHandle(){
        return buffer.add(2736);
    },
    get SetEvent(){
        return buffer.getPointer(2744);
    },
    set SetEvent(n){
        buffer.setPointer(n, 2744);
    },
    get addressof_SetEvent(){
        return buffer.add(2744);
    },
    get WaitForSingleObject(){
        return buffer.getPointer(2752);
    },
    set WaitForSingleObject(n){
        buffer.setPointer(n, 2752);
    },
    get addressof_WaitForSingleObject(){
        return buffer.add(2752);
    },
    get jsend_crash(){
        return buffer.add(770);
    },
    get jsend_crossthread(){
        return buffer.add(637);
    },
    get raise_runtime_error(){
        return buffer.add(1070);
    },
    get jsend_returnZero(){
        return buffer.add(784);
    },
    get logHookAsyncCb(){
        return buffer.add(821);
    },
    get logHook(){
        return buffer.add(840);
    },
    get runtime_error(){
        return buffer.add(1052);
    },
    get debugBreak(){
        return buffer.add(1146);
    },
    get returnRcx(){
        return buffer.add(1148);
    },
    get returnZero(){
        return buffer.add(1152);
    },
    get CommandOutputSenderHookCallback(){
        return buffer.getPointer(2760);
    },
    set CommandOutputSenderHookCallback(n){
        buffer.setPointer(n, 2760);
    },
    get addressof_CommandOutputSenderHookCallback(){
        return buffer.add(2760);
    },
    get CommandOutputSenderHook(){
        return buffer.add(1155);
    },
    get commandQueue(){
        return buffer.getPointer(2768);
    },
    set commandQueue(n){
        buffer.setPointer(n, 2768);
    },
    get addressof_commandQueue(){
        return buffer.add(2768);
    },
    get MultiThreadQueueTryDequeue(){
        return buffer.getPointer(2776);
    },
    set MultiThreadQueueTryDequeue(n){
        buffer.setPointer(n, 2776);
    },
    get addressof_MultiThreadQueueTryDequeue(){
        return buffer.add(2776);
    },
    get ConsoleInputReader_getLine_hook(){
        return buffer.add(1174);
    },
    get gameThreadStart(){
        return buffer.getPointer(2792);
    },
    set gameThreadStart(n){
        buffer.setPointer(n, 2792);
    },
    get addressof_gameThreadStart(){
        return buffer.add(2792);
    },
    get gameThreadFinish(){
        return buffer.getPointer(2800);
    },
    set gameThreadFinish(n){
        buffer.setPointer(n, 2800);
    },
    get addressof_gameThreadFinish(){
        return buffer.add(2800);
    },
    get gameThreadInner(){
        return buffer.getPointer(2808);
    },
    set gameThreadInner(n){
        buffer.setPointer(n, 2808);
    },
    get addressof_gameThreadInner(){
        return buffer.add(2808);
    },
    get free(){
        return buffer.getPointer(2816);
    },
    set free(n){
        buffer.setPointer(n, 2816);
    },
    get addressof_free(){
        return buffer.add(2816);
    },
    get evWaitGameThreadEnd(){
        return buffer.getPointer(2824);
    },
    set evWaitGameThreadEnd(n){
        buffer.setPointer(n, 2824);
    },
    get addressof_evWaitGameThreadEnd(){
        return buffer.add(2824);
    },
    get _Cnd_do_broadcast_at_thread_exit(){
        return buffer.getPointer(2832);
    },
    set _Cnd_do_broadcast_at_thread_exit(n){
        buffer.setPointer(n, 2832);
    },
    get addressof__Cnd_do_broadcast_at_thread_exit(){
        return buffer.add(2832);
    },
    get gameThreadHook(){
        return buffer.add(1235);
    },
    get bedrock_server_exe_args(){
        return buffer.getPointer(2840);
    },
    set bedrock_server_exe_args(n){
        buffer.setPointer(n, 2840);
    },
    get addressof_bedrock_server_exe_args(){
        return buffer.add(2840);
    },
    get bedrock_server_exe_argc(){
        return buffer.getInt32(2848);
    },
    set bedrock_server_exe_argc(n){
        buffer.setInt32(n, 2848);
    },
    get addressof_bedrock_server_exe_argc(){
        return buffer.add(2848);
    },
    get bedrock_server_exe_main(){
        return buffer.getPointer(2856);
    },
    set bedrock_server_exe_main(n){
        buffer.setPointer(n, 2856);
    },
    get addressof_bedrock_server_exe_main(){
        return buffer.add(2856);
    },
    get finishCallback(){
        return buffer.getPointer(2864);
    },
    set finishCallback(n){
        buffer.setPointer(n, 2864);
    },
    get addressof_finishCallback(){
        return buffer.add(2864);
    },
    get wrapped_main(){
        return buffer.add(1292);
    },
    get cgateNodeLoop(){
        return buffer.getPointer(2872);
    },
    set cgateNodeLoop(n){
        buffer.setPointer(n, 2872);
    },
    get addressof_cgateNodeLoop(){
        return buffer.add(2872);
    },
    get updateEvTargetFire(){
        return buffer.getPointer(2880);
    },
    set updateEvTargetFire(n){
        buffer.setPointer(n, 2880);
    },
    get addressof_updateEvTargetFire(){
        return buffer.add(2880);
    },
    get updateWithSleep(){
        return buffer.add(1335);
    },
    get removeActor(){
        return buffer.getPointer(2888);
    },
    set removeActor(n){
        buffer.setPointer(n, 2888);
    },
    get addressof_removeActor(){
        return buffer.add(2888);
    },
    get actorDestructorHook(){
        return buffer.add(1368);
    },
    get onPacketRaw(){
        return buffer.getPointer(2896);
    },
    set onPacketRaw(n){
        buffer.setPointer(n, 2896);
    },
    get addressof_onPacketRaw(){
        return buffer.add(2896);
    },
    get createPacketRaw(){
        return buffer.getPointer(2904);
    },
    set createPacketRaw(n){
        buffer.setPointer(n, 2904);
    },
    get addressof_createPacketRaw(){
        return buffer.add(2904);
    },
    getEnabledPacket(idx){
        return buffer.getUint8(2912+idx);
    },
    setEnabledPacket(n, idx){
        buffer.setUint8(n, 2912+idx);
    },
    get addressof_enabledPacket(){
        return buffer.add(2912);
    },
    get packetRawHook(){
        return buffer.add(1398);
    },
    get packetBeforeOriginal(){
        return buffer.getPointer(3232);
    },
    set packetBeforeOriginal(n){
        buffer.setPointer(n, 3232);
    },
    get addressof_packetBeforeOriginal(){
        return buffer.add(3232);
    },
    get onPacketBefore(){
        return buffer.getPointer(3240);
    },
    set onPacketBefore(n){
        buffer.setPointer(n, 3240);
    },
    get addressof_onPacketBefore(){
        return buffer.add(3240);
    },
    get packetBeforeHook(){
        return buffer.add(1443);
    },
    get onPacketAfter(){
        return buffer.getPointer(3248);
    },
    set onPacketAfter(n){
        buffer.setPointer(n, 3248);
    },
    get addressof_onPacketAfter(){
        return buffer.add(3248);
    },
    get handlePacket(){
        return buffer.getPointer(3256);
    },
    set handlePacket(n){
        buffer.setPointer(n, 3256);
    },
    get addressof_handlePacket(){
        return buffer.add(3256);
    },
    get __guard_dispatch_icall_fptr(){
        return buffer.getPointer(3264);
    },
    set __guard_dispatch_icall_fptr(n){
        buffer.setPointer(n, 3264);
    },
    get addressof___guard_dispatch_icall_fptr(){
        return buffer.add(3264);
    },
    get packetAfterHook(){
        return buffer.add(1508);
    },
    get sendOriginal(){
        return buffer.getPointer(3272);
    },
    set sendOriginal(n){
        buffer.setPointer(n, 3272);
    },
    get addressof_sendOriginal(){
        return buffer.add(3272);
    },
    get onPacketSend(){
        return buffer.getPointer(3280);
    },
    set onPacketSend(n){
        buffer.setPointer(n, 3280);
    },
    get addressof_onPacketSend(){
        return buffer.add(3280);
    },
    get packetSendHook(){
        return buffer.add(1572);
    },
    get sendInternalOriginal(){
        return buffer.getPointer(3288);
    },
    set sendInternalOriginal(n){
        buffer.setPointer(n, 3288);
    },
    get addressof_sendInternalOriginal(){
        return buffer.add(3288);
    },
    get packetSendAllCancelPoint(){
        return buffer.getPointer(3296);
    },
    set packetSendAllCancelPoint(n){
        buffer.setPointer(n, 3296);
    },
    get addressof_packetSendAllCancelPoint(){
        return buffer.add(3296);
    },
    get packetSendAllHook(){
        return buffer.add(1670);
    },
    get onPacketSendInternal(){
        return buffer.getPointer(3304);
    },
    set onPacketSendInternal(n){
        buffer.setPointer(n, 3304);
    },
    get addressof_onPacketSendInternal(){
        return buffer.add(3304);
    },
    get packetSendInternalHook(){
        return buffer.add(1757);
    },
    get getLineProcessTask(){
        return buffer.getPointer(3312);
    },
    set getLineProcessTask(n){
        buffer.setPointer(n, 3312);
    },
    get addressof_getLineProcessTask(){
        return buffer.add(3312);
    },
    get std_cin(){
        return buffer.getPointer(3320);
    },
    set std_cin(n){
        buffer.setPointer(n, 3320);
    },
    get addressof_std_cin(){
        return buffer.add(3320);
    },
    get std_getline(){
        return buffer.getPointer(3328);
    },
    set std_getline(n){
        buffer.setPointer(n, 3328);
    },
    get addressof_std_getline(){
        return buffer.add(3328);
    },
    get std_string_ctor(){
        return buffer.getPointer(3336);
    },
    set std_string_ctor(n){
        buffer.setPointer(n, 3336);
    },
    get addressof_std_string_ctor(){
        return buffer.add(3336);
    },
    get getline(){
        return buffer.add(1855);
    },
    get terminate(){
        return buffer.getPointer(3344);
    },
    set terminate(n){
        buffer.setPointer(n, 3344);
    },
    get addressof_terminate(){
        return buffer.add(3344);
    },
    get ExitThread(){
        return buffer.getPointer(3352);
    },
    set ExitThread(n){
        buffer.setPointer(n, 3352);
    },
    get addressof_ExitThread(){
        return buffer.add(3352);
    },
    get bdsMainThreadId(){
        return buffer.getInt32(3360);
    },
    set bdsMainThreadId(n){
        buffer.setInt32(n, 3360);
    },
    get addressof_bdsMainThreadId(){
        return buffer.add(3360);
    },
    get terminateHook(){
        return buffer.add(1943);
    },
};
runtimeError.addFunctionTable(buffer.add(2216), 30, buffer);
asm.setFunctionNames(buffer, {"pointer_np2js":0,"breakBeforeCallNativeFunction":86,"callNativeFunction":87,"callJsFunction":318,"crosscall_on_gamethread":538,"jsend_crash":770,"jsend_crossthread":637,"raise_runtime_error":1070,"jsend_returnZero":784,"logHookAsyncCb":821,"logHook":840,"runtime_error":1052,"debugBreak":1146,"returnRcx":1148,"returnZero":1152,"CommandOutputSenderHook":1155,"ConsoleInputReader_getLine_hook":1174,"gameThreadEntry":1188,"gameThreadHook":1235,"wrapped_main":1292,"updateWithSleep":1335,"actorDestructorHook":1368,"packetRawHook":1398,"packetBeforeHook":1443,"packetAfterHook":1508,"packetSendHook":1572,"packetSendAllHook":1670,"packetSendInternalHook":1757,"getline":1855,"terminateHook":1943});
