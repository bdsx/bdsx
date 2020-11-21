
export const bin = {
    ONE: '\u0001',
    ZERO: '',
    fromNumber(n:number):string
    {
        n = Math.floor(n);
        if (n <= 0) return '';

        const out:number[] = [];
        while (n !== 0)
        {
            out.push(n % 0x10000);
            n = Math.floor(n / 0x10000);
        }
        return String.fromCharCode(...out);
    },
    toString(v:string, radix = 10):string
    {
        const out:number[] = [];
        for (;;)
        {
            const [quotient, remainder] = bin.divn(v, radix);
            if (remainder < 10)
            {
                out.push(remainder+0x30);
            }
            else
            {
                out.push(remainder+(0x61-10));
            }
            v = quotient;
            if (v === '') break;
        }
        out.reverse();
        return String.fromCharCode(...out);
    },
    add(a:string, b:string):string
    {
        let maxtext:string;
        let minn:number;
        let maxn:number;
        if (a.length < b.length)
        {
            maxtext = b;
            minn = a.length;
            maxn = b.length;
        }
        else
        {
            maxtext = a;
            minn = b.length;
            maxn = a.length;
        }
        const values:number[] = new Array(maxn);
        let v = 0;
        let i=0;
        for (;i<minn;i++)
        {
            v += a.charCodeAt(i);
            v += b.charCodeAt(i);
            values[i] = v & 0xffff;
            v >>= 16;
        }
        for (;i<maxn;i++)
        {
            v += maxtext.charCodeAt(i);
            values[i] = v & 0xffff;
            v >>= 16;
        }
        if (v !== 0) values.push(v);
        return String.fromCharCode(...values);
    },
    sub(a:string, b:string):string
    {
        if (b.length > a.length) return '';
        const alen = a.length;
        const blen = b.length;
        const values:number[] = new Array(alen);
        let v = 0;
        let i=0;
        for (;i<blen;i++)
        {
            v += a.charCodeAt(i);
            v -= b.charCodeAt(i);
            values[i] = v & 0xffff;
            v >>= 16;
        }
        for (;i<alen;i++)
        {
            v += a.charCodeAt(i);
            values[i] = v & 0xffff;
            v >>= 16;
        }
        if (v !== 0) return '';

        for (let j=values.length-1;;j--)
        {
            const v = values[j];
            if (v !== 0)
            {
                values.length = j+1;
                break;
            }
            if (j === 0) return '';
        }
        return String.fromCharCode(...values);
    },
    divn(a:string, b:number):[string, number]
    {
        const out:number[] = new Array(a.length);
        let v = 0;
        const n = a.length-1;
        for (let i=n;i>=0;i--)
        {
            v *= 0x10000;
            v += a.charCodeAt(i);
            out[i] = Math.floor(v / b);
            v %= b;
        }
        if (out[n] === 0) out.pop();
        return [String.fromCharCode(...out), v];
    },
    muln(a:string, b:number):string
    {
        let v = 0;
        const n = a.length;
        const out:number[] = new Array(n);
        for (let i=0;i<n;i++)
        {
            v += a.charCodeAt(i)*b;
            out[i] = v % 0x10000;
            v = Math.floor(v / 0x10000);
        }
        while (v !== 0)
        {
            out.push(v % 0x10000);
            v = Math.floor(v / 0x10000);
        }
        return String.fromCharCode(...out);
    }
};