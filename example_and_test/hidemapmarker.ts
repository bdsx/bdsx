import { hook } from "bdsx/hook";
import { MapItemSavedData } from "bdsx/minecraft";

hook(MapItemSavedData, '_updateTrackedEntityDecoration').call(()=>false);
