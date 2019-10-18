#!/usr/bin/env node

import { loadProperties } from "./properties";
import { spawnSync } from "child_process";
import path = require('path');

interface ServerXProperties
{
    name?:string;
}

// const props = loadProperties('server-x.properties') as ServerXProperties;

const injector = path.join(__dirname, 'injector.exe');
const chakraX = path.join(__dirname, 'chakraX.dll');

spawnSync(injector, ['.\\bedrock_server.exe', chakraX], {stdio: 'inherit'});