import { remapAndPrintError } from "../source-map-support";

try {
    require('./symbolwriter');
} catch (err) {
    remapAndPrintError(err);
}
