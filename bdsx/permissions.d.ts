import { Player } from "./bds/player";
export declare namespace Permissions {
    export class RootPermissionNode {
        children: Map<string, PermissionNode>;
        registerChild(...newChildren: PermissionNode[]): void;
        getFullName(): string;
        getUser(_userXuid: string): boolean;
        hasChild(child: string): boolean;
        getChild(child: string): PermissionNode | null;
    }
    export class PermissionNode extends RootPermissionNode {
        name: string;
        parent: RootPermissionNode;
        defaultValue: boolean;
        description: string;
        constructor(name: string, description: string, defaultValue: boolean);
        getUser(player: Player): boolean;
        getUser(playerXuid: string): boolean;
        isUserDefined(player: Player): boolean;
        isUserDefined(playerXuid: string): boolean;
        setUser(player: Player, value: boolean | null): void;
        setUser(playerXuid: string, value: boolean | null): void;
        getFullName(): string;
    }
    export function permissionNodeFromString(permission: string): PermissionNode | null;
    export function getUserAllPermissions(player: Player): any;
    export function getUserAllPermissions(playerXuid: string): any;
    export function registerPermission(name: string, description: string, parent: RootPermissionNode | null, defaultValue: boolean): PermissionNode;
    export function saveData(): Promise<void>;
    type permissionData = {
        [xuid: string]: {
            [permission: string]: boolean;
        };
    };
    export function loadData(data?: permissionData): Promise<void>;
    export function registerPermissionBulk(data: {
        parent: string;
        name: string;
        default: boolean;
        description: string;
    }[]): void;
    export {};
}
