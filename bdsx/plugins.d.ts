export declare const loadedPlugins: string[];
export declare const loadedPackages: {
    name: string;
    loaded: boolean;
    jsonpath: string | null;
    json: any | null;
}[];
export declare function loadAllPlugins(): Promise<void>;
