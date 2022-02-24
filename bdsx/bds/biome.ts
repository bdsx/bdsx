import { abstract } from "../common";
import { VoidPointer } from "../core";
import { AbstractClass, nativeClass, nativeField } from "../nativeclass";
import { CxxString } from "../nativetype";

export enum VanillaBiomeTypes {
    Beach = 0,
    Desert = 1,
    ExtremeHills = 2,
    Flat = 3,
    Forest = 4,
    Hell = 5,
    Ice = 6,
    Jungle = 7,
    Mesa = 8,
    MushroomIsland = 9,
    Ocean = 10,
    Plain = 11,
    River = 12,
    Savanna = 13,
    StoneBeach = 14,
    Swamp = 15,
    Taiga = 16,
    TheEnd = 17,
    DataDriven = 18,
}

@nativeClass(null)
export class Biome extends AbstractClass {
    @nativeField(VoidPointer)
    vftable:VoidPointer;
    @nativeField(CxxString)
    name:CxxString;

    /**
     * Returns the type of the biome (not the name)
     */
    getBiomeType():VanillaBiomeTypes {
        abstract();
    }
}
