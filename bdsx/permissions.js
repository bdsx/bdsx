"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Permissions = void 0;
const path = require("path");
const fsutil_1 = require("./fsutil");
const event_1 = require("./event");
throw new Error("The permissions system is currently on hold. Please wait to use it until it is finished.");
const PERMISSIONS_FILE = 'bdsxpermissions.json';
const permissionsPath = path.join(fsutil_1.fsutil.projectPath, PERMISSIONS_FILE);
var Permissions;
(function (Permissions) {
    let allPermissions = new Map();
    class RootPermissionNode {
        constructor() {
            this.children = new Map();
        }
        registerChild(...newChildren) {
            for (const child of newChildren) {
                if (this.children.has(child.name))
                    throw new Error(`PermissionNode ${this.getFullName()} cannot register child ${child.name} twice`);
                this.children.set(child.name, child);
                child.parent = this;
            }
        }
        getFullName() {
            return '';
        }
        getUser(_userXuid) {
            return false;
        }
        hasChild(child) {
            const first = child.split('.')[0];
            if (!first)
                return true;
            if (this.children.has(first))
                return this.children.get(first).hasChild(child.substr(first.length + 1));
            return false;
        }
        getChild(child) {
            if (!this.hasChild(child))
                return null;
            const nodes = child.split('.');
            const first = nodes.shift();
            if (nodes.length === 0)
                return this.children.get(first);
            return this.children.get(first).getChild(nodes.join('.'));
        }
    }
    Permissions.RootPermissionNode = RootPermissionNode;
    const rootNode = new RootPermissionNode();
    let dirty = false;
    class PermissionNode extends RootPermissionNode {
        constructor(name, description, defaultValue) {
            super();
            this.name = name;
            this.description = description;
            this.parent = rootNode;
            this.defaultValue = defaultValue;
        }
        getUser(player) {
            if (typeof player !== 'string')
                player = player.getCertificate().getXuid();
            if (!this.isUserDefined(player))
                return this.parent.getUser(player);
            return allPermissions.get(player)[this.getFullName()];
        }
        isUserDefined(player) {
            if (typeof player !== 'string')
                player = player.getCertificate().getXuid();
            const userPermissions = allPermissions.get(player);
            if (!userPermissions)
                return false;
            return userPermissions[this.getFullName()] !== undefined;
        }
        setUser(player, value) {
            if (typeof player !== 'string')
                player = player.getCertificate().getXuid();
            if (typeof value === 'boolean') {
                let userPermissions;
                if (allPermissions.has(player)) {
                    userPermissions = allPermissions.get(player);
                }
                else {
                    userPermissions = {};
                    allPermissions.set(player, userPermissions);
                }
                userPermissions[this.getFullName()] = value;
            }
            else if (allPermissions.has(player)) {
                const userPermissions = allPermissions.get(player);
                userPermissions[this.getFullName()] = undefined;
                if (Object.keys(userPermissions).length === 0)
                    allPermissions.delete(player);
            }
            dirty = true;
        }
        getFullName() {
            const ret = this.parent.getFullName() + "." + this.name;
            if (ret.startsWith('.'))
                return ret.substr(1);
            return ret;
        }
    }
    Permissions.PermissionNode = PermissionNode;
    function permissionNodeFromString(permission) {
        return rootNode.getChild(permission);
    }
    Permissions.permissionNodeFromString = permissionNodeFromString;
    function getUserAllPermissions(player) {
        var _a;
        return (_a = allPermissions.get(typeof player === 'string' ? player : player.getCertificate().getXuid())) !== null && _a !== void 0 ? _a : {};
    }
    Permissions.getUserAllPermissions = getUserAllPermissions;
    function registerPermission(name, description, parent, defaultValue) {
        const permission = new PermissionNode(name, description, defaultValue);
        permission.parent = parent !== null && parent !== void 0 ? parent : rootNode;
        if (parent)
            parent.registerChild(permission);
        else
            rootNode.registerChild(permission);
        return permission;
    }
    Permissions.registerPermission = registerPermission;
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
    async function saveData() {
        if (!dirty)
            return;
        dirty = false;
        const data = {};
        for (const user of allPermissions) {
            data[user[0]] = user[1];
        }
        await fsutil_1.fsutil.writeJson(permissionsPath, data);
        console.log("done");
    }
    Permissions.saveData = saveData;
    async function loadData(data) {
        if (!data)
            data = JSON.parse(await fsutil_1.fsutil.readFile(permissionsPath));
        const dataAsArray = [];
        for (const xuid in data) {
            dataAsArray.push([xuid, data[xuid]]);
        }
        allPermissions = new Map(dataAsArray);
    }
    Permissions.loadData = loadData;
    function registerPermissionBulk(data) {
        var _a;
        for (const permission of data) {
            (_a = permissionNodeFromString(permission.parent)) === null || _a === void 0 ? void 0 : _a.registerChild(new PermissionNode(permission.name, permission.description, permission.default));
        }
    }
    Permissions.registerPermissionBulk = registerPermissionBulk;
    setInterval(saveData, 60000).unref();
})(Permissions = exports.Permissions || (exports.Permissions = {}));
Permissions.loadData();
event_1.events.serverClose.on(() => {
    Permissions.saveData();
});
//# sourceMappingURL=permissions.js.map