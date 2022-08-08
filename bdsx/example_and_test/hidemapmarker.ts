import { bool_t } from 'bdsx/nativetype';
import { procHacker } from "bdsx/prochacker";

// hook MapItemSavedData::_updateTrackedEntityDecoration
procHacker.hooking("?_updateTrackedEntityDecoration@MapItemSavedData@@AEAA_NAEAVBlockSource@@V?$shared_ptr@VMapItemTrackedActor@@@std@@@Z", bool_t)(()=>false);
