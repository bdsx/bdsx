/**
 * This script is the parser for bedrock scripting API documents.
 * but Bedrock scripting API is removed.
 */
import * as path from "path";
import { FileWriter } from "../../writer/filewriter";
import * as docfixJson from "./docfix.json";
import { HtmlSearcher, htmlutil } from "./htmlutil";
import { DocFixItem, DocType } from "./type";

const DOCURL_ADDONS = "https://bedrock.dev/docs/stable/Addons";

const OUT_ADDONS = path.join(__dirname, "../generated.addons.d.ts");

const docfix = new Map<string, DocType>();
for (const [name, item] of Object.entries(docfixJson as any as Record<string, DocFixItem | string | null>)) {
    docfix.set(name, DocType.fromDocFix(item));
}

async function parseAddonsDoc(): Promise<void> {
    console.log("# Parse Addons Document");
    const base = await htmlutil.wgetElement(DOCURL_ADDONS, "html", "body", "div", "div", "div", "div", "div");
    if (base === null) {
        console.error(`Addons: Target element not found`);
        return;
    }
    const s = new HtmlSearcher(base);
    let blockParsed = false;

    const writer = new FileWriter(OUT_ADDONS);
    await writer.write(`/**\n * Generated with bdsx/bds-scripting/parser.ts\n * Please DO NOT modify this directly.\n */\n`);
    await writer.write(`declare global {\n\n`);

    try {
        for (;;) {
            const id = s.searchHead();
            console.log(id);
            switch (id) {
                case "Blocks":
                    if (blockParsed) break;
                    blockParsed = true;
                    await DocType.writeTableKeyUnion("BlockId", "minecraft:", s.searchTableAsObject(), "Name", v => v, writer);
                    break;
                case "Entities": {
                    const table = s.searchTableAsObject();
                    await DocType.writeTableKeyUnion("EntityId", "", table, "Identifier", v => `minecraft:${v}`, writer);
                    // await DocType.writeTableKeyUnion('EntityFullId', '', table, 'Identifier', row=>row.FullID.text, writer);
                    // await DocType.writeTableKeyUnion('EntityShortId', '', table, 'Identifier', row=>row.ShortID.text, writer);
                    break;
                }
                case "Items": {
                    const table = s.searchTableAsObject();
                    await DocType.writeTableKeyUnion(
                        "ItemId",
                        "",
                        table,
                        "Name",
                        name => {
                            if (name.startsWith("item.")) return null;
                            return `minecraft:${name}`;
                        },
                        writer,
                    );
                    // await DocType.writeTableKeyUnion('ItemNumberId', '', table, 'Name', row=>row['ID'].text, writer);
                    break;
                }
                case "Entity Damage Source": {
                    await DocType.writeTableKeyUnion("MinecraftDamageSource", "", s.searchTableAsObject(), "DamageSource", v => v, writer);
                    break;
                }
            }
        }
    } catch (err) {
        if (err === HtmlSearcher.EOF) return;
        console.error(err && (err.stack || err));
    } finally {
        await writer.write("}\n");
        await writer.write("export {};\n");
        await writer.end();
    }
}

(async () => {
    await parseAddonsDoc();
})();
