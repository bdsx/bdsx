import archiver = require('archiver');
import fs = require('fs');
import tar = require('tar-fs');
import zlib = require('zlib');
import path = require('path');
import { sep } from 'path';

export function targz(src:string, dest:string, mods:Map<string, number>)
{
    src = path.join(src);
    const srcsep = src+sep;
    console.log(`tar.gz ${dest}`);
    return new Promise((resolve, reject)=>{
        const opts_gz:zlib.ZlibOptions = {
            level: 6,
            memLevel: 6,
        };
        const opts_tar:tar.PackOptions = {
            map(header){
                let mod = mods.get(header.name);
                if (!mod)
                {
                    if (header.type === 'directory')
                    {
                        mod = 0o755;
                    }
                    else
                    {
                        mod = 0o711;
                    }
                }
                header.mode = (header.mode & ~0o777) | mod;
                return header;
            },
            ignore(name) {
                if (name.startsWith(srcsep))
                {
                    name = name.substr(srcsep.length);
                }
                return mods.get(name) === 0;
            }
        };
        process.nextTick(()=>{
            tar.pack(src, opts_tar)
                .on('error', reject)
                .pipe(zlib.createGzip(opts_gz)
                    .on('error', reject))
                .pipe(fs.createWriteStream(dest)
                    .on('error', reject)
                    .on('finish', ()=>{        
                        console.log(`tar.gz done`);
                        resolve();
                    }));
        });
    });
}

export function zip(dest:string, onzip:(archive:archiver.Archiver)=>void):Promise<number>
{
    console.log(`zip ${dest}`);
    return new Promise((resolve, reject)=>{
        // create a file to stream archive data to.
        var output = fs.createWriteStream(dest);
        var archive = archiver('zip', {
            zlib: { level: 9 } // Sets the compression level.
        });
        
        output.on('close', ()=>{
            console.log('zip done');
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