import * as path from "path";
import { fsutil } from "./fsutil";
import { Player } from "./bds/player";
import { events } from "./event";

throw new Error("The permissions system is currently on hold. Please wait to use it until it is finished.");

const PERMISSIONS_FILE = 'bdsxpermissions.json';

const permissionsPath = path.join(fsutil.projectPath, PERMISSIONS_FILE);

export namespace Permissions {
    let allPermissions = new Map<string, {[permission: string]: boolean | undefined}>();

    export class RootPermissionNode {
        children: Map<string, PermissionNode> = new Map();
        registerChild(...newChildren: PermissionNode[]): void {
            for (const child of newChildren) {
                if(this.children.has(child.name)) throw new Error(`PermissionNode ${this.getFullName()} cannot register child ${child.name} twice`);
                this.children.set(child.name, child);
                child.parent = this;
            }
        }
        getFullName(): string {
            return '';
        }
        getUser(_userXuid: string): boolean {
            return false;
        }
        hasChild(child: string): boolean {
            const first = child.split('.')[0];
            if(!first) return true;
            if(this.children.has(first)) return this.children.get(first)!.hasChild(child.substr(first.length + 1));
            return false;
        }
        getChild(child: string): PermissionNode | null {
            if(!this.hasChild(child)) return null;
            const nodes = child.split('.');
            const first = nodes.shift()!;
            if(nodes.length === 0) return this.children.get(first)!;
            return this.children.get(first)!.getChild(nodes.join('.'));
        }
    }

    const rootNode = new RootPermissionNode();

    let dirty = false;

    export class PermissionNode extends RootPermissionNode {

        name: string;
        parent: RootPermissionNode;
        defaultValue: boolean;
        description: string;

        constructor(name: string, description: string, defaultValue: boolean) {
            super();
            this.name = name;
            this.description = description;
            this.parent = rootNode;
            this.defaultValue = defaultValue;
        }
        getUser(player: Player): boolean;
        getUser(playerXuid: string): boolean;
        getUser(player: string | Player): boolean {
            if(typeof player !== 'string') player = player.getCertificate().getXuid();
            if(!this.isUserDefined(player)) return this.parent.getUser(player);
            return allPermissions.get(player)![this.getFullName()]!;
        }
        isUserDefined(player: Player): boolean;
        isUserDefined(playerXuid: string): boolean;
        isUserDefined(player: string | Player): boolean {
            if(typeof player !== 'string') player = player.getCertificate().getXuid();
            const userPermissions = allPermissions.get(player);
            if(!userPermissions) return false;
            return userPermissions[this.getFullName()] !== undefined;
        }
        setUser(player: Player, value: boolean | null): void;
        setUser(playerXuid: string, value: boolean | null): void;
        setUser(player: string | Player, value: boolean | null): void {
            if(typeof player !== 'string') player = player.getCertificate().getXuid();
            if(typeof value === 'boolean') {
                let userPermissions;
                if(allPermissions.has(player)) {
                    userPermissions = allPermissions.get(player)!;
                } else {
                    userPermissions = {};
                    allPermissions.set(player, userPermissions);
                }
                userPermissions[this.getFullName()] = value;
            } else if(allPermissions.has(player)) {
                const userPermissions = allPermissions.get(player)!;
                userPermissions[this.getFullName()] = undefined;
                if(Object.keys(userPermissions).length === 0) allPermissions.delete(player);
            }
            dirty = true;
        }
        getFullName(): string {
            const ret = this.parent.getFullName() + "." + this.name;
            if(ret.startsWith('.')) return ret.substr(1);
            return ret;
        }
    }

    export function permissionNodeFromString(permission: string): PermissionNode | null {
        return rootNode.getChild(permission);
    }

    export function getUserAllPermissions(player: Player): any;
    export function getUserAllPermissions(playerXuid: string): any;
    export function getUserAllPermissions(player: string | Player): any {
        return allPermissions.get(typeof player === 'string' ? player : player.getCertificate().getXuid()) ?? {};
    }

    export function registerPermission(name: string, description: string, parent: RootPermissionNode | null, defaultValue: boolean): PermissionNode {
        const permission = new PermissionNode(name, description, defaultValue);
        permission.parent = parent ?? rootNode;
        if(parent) parent.registerChild(permission);
        else rootNode.registerChild(permission);
        return permission;
    }

    // export function registerPermissionRecursive(permission: string, ) {
    //     const nodes = permission.split('.');
    //     if(nodes.length < 1) return null;
    //     let currentNode = rootNode;
    //     for(const node of nodes) {
    //         if(!currentNode.hasChild(node)) {
    //             const newNode = new PermissionNode(node);
    //             currentNode.registerChild(newNode);
    //             currentNode = newNode;
    //         } else {
    //             currentNode = currentNode.getChild(node)!;
    //         }
    //     }
    // }

    export async function saveData(): Promise<void> {
        if(!dirty) return;
        dirty = false;
        const data: any = {};
        for(const user of allPermissions) {
            data[user[0]] = user[1];
        }
        await fsutil.writeJson(permissionsPath, data);
        console.log("done");
    }

    type permissionData = {
        [xuid: string]: {
            [permission: string]: boolean
        }
    };

    export async function loadData(data?: permissionData): Promise<void> {
        if(!data) data = JSON.parse(await fsutil.readFile(permissionsPath));
        const dataAsArray: [string, any][] = [];
        for(const xuid in data) {
            dataAsArray.push([xuid, data[xuid]]);
        }
        allPermissions = new Map(dataAsArray);
    }

    export function registerPermissionBulk(data: {parent: string, name: string, default: boolean, description: string}[]): void {
        for (const permission of data) {
            permissionNodeFromString(permission.parent)?.registerChild(new PermissionNode(permission.name, permission.description, permission.default));
        }
    }
    setInterval(saveData, 60000).unref();
}

Permissions.loadData();
events.serverClose.on(() => {
    Permissions.saveData();
});

