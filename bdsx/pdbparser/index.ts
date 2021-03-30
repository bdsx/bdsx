import { remapAndPrintError } from "../source-map-support";

try {
    require('./parse');
} catch (err) {
    remapAndPrintError(err);
}
