import * as fs from "fs";
import * as path from "path";
import { Config } from "./config";

type ServerPropertiesKeys =
    | "server-name"
    | "gamemode"
    | "force-gamemode"
    | "difficulty"
    | "allow-cheats"
    | "max-players"
    | "online-mode"
    | "white-list"
    | "server-port"
    | "server-portv6"
    | "view-distance"
    | "tick-distance"
    | "player-idle-timeout"
    | "max-threads"
    | "level-name"
    | "level-seed"
    | "default-player-permission-level"
    | "texturepack-required"
    | "content-log-file-enabled"
    | "compression-threshold"
    | "server-authoritative-movement"
    | "player-movement-score-threshold"
    | "player-movement-distance-threshold"
    | "player-movement-duration-threshold-in-ms"
    | "correct-player-movement"
    | "server-authoritative-block-breaking";

class Property {
    constructor(public key: string, public value: string, public content: string) {}
}

export namespace spropsUtil {
    export function* read(content: string): IterableIterator<Property> {
        let index = 0;
        let eof = false;
        let propStart = 0;

        let prop = new Property("", "", "");
        while (!eof) {
            let lineEnd = content.indexOf("\n", index);
            if (lineEnd === -1) {
                lineEnd = content.length;
                eof = true;
            }
            const lineBegin = index;
            let parse = content.substring(lineBegin, lineEnd);
            index = lineEnd + 1;
            const commentBegin = parse.indexOf("#");
            if (commentBegin !== -1) {
                parse = parse.substr(0, commentBegin);
            }
            const equal = parse.indexOf("=");
            if (equal === -1) continue;

            prop.content = content.substring(propStart, lineBegin);
            yield prop;

            const key = parse.substr(0, equal).trim();
            const value = parse.substr(equal + 1).trim();
            propStart = lineBegin;
            prop = new Property(key, value, "");
        }

        prop.content = content.substring(propStart);
        yield prop;
    }

    export function merge(oldProps: string, newProps: string): string {
        interface PropertyEx extends Property {
            newProps?: Property[];
        }
        const props: PropertyEx[] = [...spropsUtil.read(oldProps)];
        const namemap = new Map<string, PropertyEx>();
        for (const prop of props) {
            namemap.set(prop.key, prop);
        }

        let prev: PropertyEx | null = null;
        let out = "";
        for (const newProp of spropsUtil.read(newProps)) {
            const oldProp = namemap.get(newProp.key);
            if (oldProp === undefined) {
                // new prop
                if (prev !== null) {
                    if (prev.newProps === undefined) prev.newProps = [];
                    prev.newProps.push(newProp);
                } else {
                    out += newProp.content;
                }
            } else {
                prev = oldProp;
            }
        }

        for (const prop of props) {
            out += prop.content;
            if (prop.newProps !== undefined) {
                for (const newProp of prop.newProps) {
                    out += newProp.content;
                }
            }
        }
        return out;
    }
}

export const serverProperties: { [key in ServerPropertiesKeys]: string } & { [key: string]: string } = {} as any;

try {
    const propertyFile = Config.BDS_PATH + path.sep + "server.properties";
    const properties = fs.readFileSync(propertyFile, "utf8");
    for (const prop of spropsUtil.read(properties)) {
        serverProperties[prop.key] = prop.value;
    }
} catch (err) {
    if (err.code !== "ENOENT") {
        throw err;
    }
}
