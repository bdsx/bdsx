declare module "../minecraft" {
    interface Block {
        blockLegacy: BlockLegacy;
    }
    namespace Block {
        /**
         * @param blockName Formats like 'minecraft:wool' and 'wool' are both accepted
         */
        function create(blockName: string, data?: number): Block | null;
    }
}
export {};
