import { NativeType } from "../nativetype";
declare module "../minecraft" {
    namespace Json {
        interface Value {
            [NativeType.ctor](): void;
            constructWith(value: unknown): void;
            get(key: string | number): Json.Value;
            getValue(): any;
            setValue(value: unknown): void;
            toString(): string;
            toJSON(): any;
        }
        namespace Value {
            function constructWith(value: unknown): Value;
        }
    }
}
