import { proc } from "./bds/symbols";
import { checkAndReport } from "./checkreport";
import * as bdsVersion from './version-bds.json';

// check BDS version
const versions = [
    proc['?MajorVersion@SharedConstants@@3HB'].getInt32(),
    proc['?MinorVersion@SharedConstants@@3HB'].getInt32(),
    proc['?PatchVersion@SharedConstants@@3HB'].getInt32(),
    (proc['?RevisionVersion@SharedConstants@@3HB'].getInt32()+100).toString().substr(1),
];

checkAndReport('BDS', versions.join('.'), bdsVersion);
