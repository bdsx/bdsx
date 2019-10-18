
import fs = require('fs');
import express = require('express');
import bodyParser = require('body-parser');
import fileUpload = require('express-fileupload');
import unzipper = require('unzipper');

const pages = {
    ERR404: '{"error":"잘못된 페이지"}',
    ERR400: '{"error":"잘못된 요청"}',
};

export function openPackUploadServer(port:number = 80):void
{
    const app = express();

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended:true}));
    app.use(fileUpload({
        useTempFiles : true,
        tempFileDir : './temp'
    }));
    
    app.post('/', async(req, res)=>{
        if (!req.files)
        {
            res.status(400).send(pages.ERR400);
            return;
        }
        const zip = req.files.zip;
        if (!zip)
        {
            res.status(400).send(pages.ERR400);
            return;
        }
        if (zip instanceof Array)
        {
            res.status(400).send(pages.ERR400);
            return;
        }
        const name = zip.name;
        console.log('Sending: '+name);
        fs.createReadStream(zip.tempFilePath)
        .pipe(unzipper.Extract({path: '.'}))
        .on('close',()=>{
            console.log('Send Done: '+name);
            fs.unlink(zip.tempFilePath, ()=>{});
        });
        res.send(JSON.stringify({}));
    });
    app.use((req, res, next)=>{
        res.status(404).send(pages.ERR404);
    });
    app.listen(port, ()=>{ console.log('express web server started'); });
    
}
