import { tsw } from "./tswriter";

export const tswNames = {
    overloadInfo: new tsw.NameProperty('overloadInfo'),
    this: new tsw.NameProperty('this'),
    add: new tsw.NameProperty('add'),
    overloads: new tsw.NameProperty('overloads'),
    definePointedProperty: new tsw.NameProperty('definePointedProperty'),
    make: new tsw.NameProperty('make'),
    get: new tsw.NameProperty('get'),
    constructWith:new tsw.NameProperty('constructWith'),
    structureReturn: new tsw.NameProperty('structureReturn'),
    ctor: new tsw.NameProperty('ctor'),
    dtor: new tsw.NameProperty('dtor'),
    ID: new tsw.NameProperty('ID'),
    idMap: new tsw.NameProperty('idMap'),
    T: new tsw.TypeName('T'),
};
