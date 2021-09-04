
import colors = require('colors');

if ((global as any).bdsx != null) {
    console.error(colors.red('[BDSX] multiple imported'));
    console.error(colors.red('First Import: '+(global as any).bdsx));
    console.error(colors.red('Dupplicated: '+__dirname));
}
(global as any).bdsx = __dirname;

import type {} from './externs';
import './polyfill';
import enums = require('./enums');

export interface CANCEL {
    __CANCEL_OBJECT__?:void;
    toString():'CANCEL';
}

export const CANCEL:CANCEL = {toString(){ return 'CANCEL'; }};

/** @deprecated import it from 'bdsx/enums' */
export const AttributeName = enums.AttributeName;
/** @deprecated import it from 'bdsx/enums' */
export type AttributeName = enums.AttributeName;


/** @deprecated import it from 'bdsx/enums' */
export const DeviceOS = enums.DeviceOS;
/** @deprecated import it from 'bdsx/enums' */
export type DeviceOS = enums.DeviceOS;

export enum Encoding {
	Utf16=-2,
	Buffer=-1,
	Utf8=0,
	None,
	Ansi
}

export type TypeFromEncoding<T extends Encoding> = T extends Encoding.Buffer ? Uint8Array : string;

export type TypedArrayBuffer = Uint8Array | Uint16Array | Uint32Array |
	Uint8ClampedArray | Int8Array | Int16Array | Int32Array |
	Float32Array | Float64Array;
export type Bufferable = TypedArrayBuffer | ArrayBuffer | DataView;

export type AnyFunction = (this:any, ...args:any[])=>any;

export type NonNullableFields<T extends any[]> = {[key in keyof T]:NonNullable<T[key]>};
export type NonNullableParameters<THIS, T> = T extends (...args:infer ARGS)=>infer RET ?
    (this:THIS, ...args:NonNullableFields<ARGS>)=>RET : never;

export function emptyFunc():void{
	// empty
}

export function abstract():never {
    throw Error('abstract');
}

export function unreachable():never {
    throw Error('unreachable');
}

export function notImplemented():never {
    throw Error('not implemented');
}

// eslint-disable-next-line @typescript-eslint/ban-types
export type AbstractClass<T> = Function&{prototype:T};
