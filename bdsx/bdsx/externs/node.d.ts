
declare global {
    namespace NodeJS {
        interface Process {
            jsEngine?:'chakracore';
        }
        interface ProcessVersions {
            chakracore?:string;
        }
    }

    interface String {
        /**
         * Gets a substring beginning at the specified location and having the specified length.
         * @remark it's a legacy feature by old IE and not standard. but who cares?
         * @param from The starting position of the desired substring. The index of the first character in the string is zero.
         * @param length The number of characters to include in the returned substring.
         */
        substr(from: number, length?: number): string;
    }
}

export {};
