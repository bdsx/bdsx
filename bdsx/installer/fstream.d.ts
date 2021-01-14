
declare module 'fstream'
{
    export function Writer(opts:{ path: string }):NodeJS.WritableStream;
}
