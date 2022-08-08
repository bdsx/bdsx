import { remapAndPrintError } from "../source-map-support";

try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('./symbolwriter');
} catch (err) {
    remapAndPrintError(err);
}
