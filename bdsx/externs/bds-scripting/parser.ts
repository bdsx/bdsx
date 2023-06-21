/**
 * This script is the parser for bedrock scripting API documents.
 * but Bedrock scripting API is removed.
 */
import * as path from "path";
import { FileWriter } from "../../writer/filewriter";
import { HtmlSearcher, htmlutil } from "./htmlutil";

async function writeTableKeyUnion(
    name: string,
    prefix: string,
    rows: HtmlSearcher.TableRow[],
    key: string,
    value: (id: string) => string | null,
    writer: FileWriter,
): Promise<void> {
    await writer.write(`interface ${name}Map {\n`);
    const tabi = "    ";
    for (const row of rows) {
        const id = row[key].text;
        if (!id.startsWith(prefix)) {
            console.error(`   └ ${id}: Prefix is not ${prefix}`);
            continue;
        }
        const v = value(id);
        if (v === null) continue;
        await writer.write(`${tabi}${JSON.stringify(v)}:void;\n`);
    }
    await writer.write(`}\n`);
    await writer.write(`type ${name} = keyof ${name}Map;\n\n`);
}

const DOCURL_ADDONS = "https://bedrock.dev/docs/1.20.0.0/1.20.0.1/Addons";

const OUT_ADDONS = path.join(__dirname, "../generated.addons.d.ts");

const TOP_COMMENT = `/**
 * Generated based on ${DOCURL_ADDONS}
 * Please check bdsx/bds-scripting/parser.ts
 * Please DO NOT modify this directly.
 */
declare global {
`;

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
    await writer.write(TOP_COMMENT);

    try {
        s.searchHead(); // skip first Blocks

        for (;;) {
            const id = s.searchHead();
            switch (id) {
                case "Blocks": {
                    if (blockParsed) break;
                    blockParsed = true;
                    const table = s.searchTableAsObject();
                    console.log(`${id} - ${table.length} items`);
                    await writeTableKeyUnion("BlockId", "minecraft:", table, "Name", v => v, writer);
                    break;
                }
                case "Entities": {
                    const table = s.searchTableAsObject();
                    console.log(`${id} - ${table.length} items`);
                    await writeTableKeyUnion("EntityId", "", table, "Identifier", v => `minecraft:${v}`, writer);
                    // await writeTableKeyUnion('EntityFullId', '', table, 'Identifier', row=>row.FullID.text, writer);
                    // await writeTableKeyUnion('EntityShortId', '', table, 'Identifier', row=>row.ShortID.text, writer);
                    break;
                }
                case "Items": {
                    const table = s.searchTableAsObject();
                    console.log(`${id} - ${table.length} items`);
                    await writeTableKeyUnion(
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
                    // await writeTableKeyUnion('ItemNumberId', '', table, 'Name', row=>row['ID'].text, writer);
                    break;
                }
                case "Entity Damage Source": {
                    const table = s.searchTableAsObject();
                    console.log(`${id} - ${table.length} items`);
                    await writeTableKeyUnion("MinecraftDamageSource", "", table, "DamageSource", v => v, writer);
                    break;
                }
                default:
                    console.log(`${id} - ignored`);
                    break;
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
