import './commandorigin';
declare module "../minecraft" {
    interface ServerCommandOrigin extends CommandOrigin {
        /** @deprecated is CommandOrigin constructor */
        constructWith(): void;
    }
}
