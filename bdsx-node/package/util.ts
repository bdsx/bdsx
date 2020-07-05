import archiver = require('archiver');
import fs = require('fs');

export async function zip(zippath:string, onzip:(archive:archiver.Archiver)=>void):Promise<number>
{
    return new Promise((resolve, reject)=>{
        // create a file to stream archive data to.
        var output = fs.createWriteStream(zippath);
        var archive = archiver('zip', {
            zlib: { level: 9 } // Sets the compression level.
        });
        
        output.on('close', ()=>{
            resolve(archive.pointer());
        });
        
        archive.on('warning', err=>{
            console.error(err.stack);
        });
        
        archive.on('error', reject);
        
        // pipe archive data to the file
        archive.pipe(output);

        onzip(archive);
        archive.finalize();
    });
}

export function copy(from:string, to:string)
{
    console.log(`copy "${from}" "${to}"`);
    try
    {
        fs.copyFileSync(from, to);
    }
    catch (err)
    {
        console.error(err.stack);
    }
}

export function mkdir(path:string)
{
    try { fs.mkdirSync(path); } catch (err) {}
}