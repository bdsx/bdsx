'use strict';

export function memdiff(dst:number[]|Uint8Array, src:number[]|Uint8Array):number[]
{
    const size = src.length;
    if (dst.length !== size) throw Error(`size unmatched(dst[${dst.length}] != src[${src.length}])`);

    const diff:number[] = [];
	let needEnd = false;

    for (let i = 0; i !== size; i++)
    {
        if (src[i] == dst[i])
        {
            if (!needEnd) continue;
            diff.push(i);
            needEnd = false;
        }
        else
        {
            if (needEnd) continue;
            diff.push(i);
            needEnd = true;
        }
    }
    if (needEnd) diff.push(size);
    return diff;
}
export function memdiff_contains(larger:number[], smaller:number[]):boolean
{
    let small_i = 0;
    const smaller_size = smaller.length;
    const larger_size = larger.length;
    if (larger_size === 0)
    {
        return smaller_size === 0;
    }
	for (let i=0;i<larger_size;)
	{
        const large_from = larger[i++];
        const large_to = larger[i++];

		for (;;)
		{
			if (small_i == smaller_size) return true;
            
            const small_from = smaller[small_i];
			if (small_from < large_from) return false;
			if (small_from > large_to) break;
            if (small_from == large_to) return false;
            
            const small_to = smaller[small_i+1];
			if (small_to > large_to) return false;
			if (small_to == large_to)
			{
				small_i += 2;
				break;
			}
			small_i += 2;
		}
	}
	return true;
}
export function memcheck(code:Uint8Array, originalCode:number[], skip?:number[]):number[]|null
{
    const diff = memdiff(code, originalCode);
    if (skip !== undefined)
    {
        if (memdiff_contains(skip, diff)) return null;
    }
    return diff;
}
export function hex(values:number[]|Uint8Array, nextLinePer?:number):string
{
    const size = values.length;
    if (size === 0) return '';
    if (nextLinePer === undefined) nextLinePer = size;
    
    let out:number[] = [];
    for (let i=0;i<size;)
    {
        const v = values[i];
        const n1 = (v & 0xf);
        if (n1 < 10) out.push(n1+0x30);
        else out.push(n1+(0x41-10));
        const n2 = (v & 0xf);
        if (n2 < 10) out.push(n2+0x30);
        else out.push(n2+(0x41-10));
        out.push(0x20);
        i++;
        if (i % nextLinePer === 0) out.push(10);
    }
    out.pop();
    return String.fromCharCode(...out);
}
export const _tickCallback:()=>void = (process as any)._tickCallback;
