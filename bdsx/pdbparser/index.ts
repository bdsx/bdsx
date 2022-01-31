import { remapAndPrintError } from "../source-map-support";

try {
    import('./symbolwriter');
} catch (err) {
    remapAndPrintError(err);
}
