import * as colors from 'colors';
import { VoidPointer } from './core';
import { getCurrentStackLine } from "./source-map-support";

const printed = new Set<string>();

/**
 * print warning once even it multiple
 */
export function bdsxWarningOnce(message:string):void {
    const key = getCurrentStackLine(1);
    if (printed.has(key)) return;
    printed.add(key);
    console.error(colors.yellow('[BDSX] '+message));
}

export function bdsxEqualsAssert(actual:unknown, expected:unknown, message:string):void {
    if (expected === actual) return;
    if (expected instanceof VoidPointer && actual instanceof VoidPointer) {
        if (expected.equalsptr(actual)) return;
    }
    console.error(colors.red(`[BDSX] Equals assertion failure, ${message}`));
    console.error(colors.red(`[BDSX] Expected: ${expected}`));
    console.error(colors.red(`[BDSX] Actual: ${actual}`));
    console.error(colors.red(getCurrentStackLine(1)));
    console.error();
}
