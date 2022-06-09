
import { checkAndReport } from './checkreport';
import { cgate } from './core';
import * as nversion from './version-bdsx.json';

checkAndReport('BDSX Core', cgate.bdsxCoreVersion, nversion);
