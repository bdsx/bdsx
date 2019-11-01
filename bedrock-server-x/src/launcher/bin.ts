#!/usr/bin/env node

import { spawnSync } from "child_process";
import path = require('path');

const injector = path.join(__dirname, 'injector.exe');
const chakraX = path.join(__dirname, 'chakraX.dll');

spawnSync(injector, ['.\\bedrock_server.exe', chakraX], {stdio: 'inherit'});