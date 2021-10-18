"use strict";
// Visual C++ uses red black tree for std::map
// https://en.wikipedia.org/wiki/Red%E2%80%93black_tree
Object.defineProperty(exports, "__esModule", { value: true });
exports.CxxMap = void 0;
const tslib_1 = require("tslib");
const capi_1 = require("./capi");
const cxxfunctional_1 = require("./cxxfunctional");
const cxxpair_1 = require("./cxxpair");
const nativeclass_1 = require("./nativeclass");
const nativetype_1 = require("./nativetype");
const singleton_1 = require("./singleton");
const templatename_1 = require("./templatename");
const util = require("util");
var _Redbl;
(function (_Redbl) {
    _Redbl[_Redbl["_Red"] = 0] = "_Red";
    _Redbl[_Redbl["_Black"] = 1] = "_Black";
})(_Redbl || (_Redbl = {}));
class CxxTreeNode extends nativeclass_1.NativeClass {
    next() {
        let _Ptr = this;
        if (_Ptr._Right._Isnil) { // climb looking for right subtree
            let _Pnode;
            while (!(_Pnode = _Ptr._Parent)._Isnil && _Ptr.equals(_Pnode._Right)) {
                _Ptr = _Pnode; // ==> parent while right subtree
            }
            _Ptr = _Pnode; // ==> parent (head if end())
        }
        else {
            _Ptr = _Min(_Ptr._Right); // ==> smallest of right subtree
        }
        return _Ptr;
    }
    previous() {
        let _Ptr = this;
        if (_Ptr._Isnil) {
            _Ptr = _Ptr._Right; // end() ==> rightmost
        }
        else if (_Ptr._Left._Isnil) { // climb looking for left subtree
            let _Pnode;
            while (!(_Pnode = _Ptr._Parent)._Isnil && _Ptr.equals(_Pnode._Left)) {
                _Ptr = _Pnode; // ==> parent while left subtree
            }
            if (!_Ptr._Isnil) { // decrement non-begin()
                _Ptr = _Pnode; // ==> parent if not head
            }
        }
        else {
            _Ptr = _Max(_Ptr._Left); // ==> largest of left subtree
        }
        return _Ptr;
    }
    static make(type) {
        return singleton_1.Singleton.newInstance(CxxTreeNode, type, () => {
            var CxxTreeNodeImpl_1;
            let CxxTreeNodeImpl = CxxTreeNodeImpl_1 = class CxxTreeNodeImpl extends CxxTreeNode {
            };
            (0, tslib_1.__decorate)([
                (0, nativeclass_1.nativeField)(CxxTreeNodeImpl_1.ref())
            ], CxxTreeNodeImpl.prototype, "_Left", void 0);
            (0, tslib_1.__decorate)([
                (0, nativeclass_1.nativeField)(CxxTreeNodeImpl_1.ref())
            ], CxxTreeNodeImpl.prototype, "_Parent", void 0);
            (0, tslib_1.__decorate)([
                (0, nativeclass_1.nativeField)(CxxTreeNodeImpl_1.ref())
            ], CxxTreeNodeImpl.prototype, "_Right", void 0);
            (0, tslib_1.__decorate)([
                (0, nativeclass_1.nativeField)(nativetype_1.int8_t)
            ], CxxTreeNodeImpl.prototype, "_Color", void 0);
            (0, tslib_1.__decorate)([
                (0, nativeclass_1.nativeField)(nativetype_1.int8_t)
            ], CxxTreeNodeImpl.prototype, "_Isnil", void 0);
            (0, tslib_1.__decorate)([
                (0, nativeclass_1.nativeField)(type, { noInitialize: true })
            ], CxxTreeNodeImpl.prototype, "_Myval", void 0);
            CxxTreeNodeImpl = CxxTreeNodeImpl_1 = (0, tslib_1.__decorate)([
                (0, nativeclass_1.nativeClass)()
            ], CxxTreeNodeImpl);
            return CxxTreeNodeImpl;
        });
    }
}
function _Max(_Pnode) {
    while (!_Pnode._Right._Isnil) {
        _Pnode = _Pnode._Right;
    }
    return _Pnode;
}
function _Min(_Pnode) {
    while (!_Pnode._Left._Isnil) {
        _Pnode = _Pnode._Left;
    }
    return _Pnode;
}
class CxxMap extends nativeclass_1.NativeClass {
    get _Myhead() {
        return this.getPointerAs(this.nodeType, 0);
    }
    size() {
        return this.getUint64AsFloat(8);
    }
    [nativetype_1.NativeType.ctor]() {
        const head = capi_1.capi.malloc(0x20).as(this.nodeType); // allocate without value size
        this.setPointer(head, 0);
        this.setUint64WithFloat(0, 8);
        head._Left = head;
        head._Parent = head;
        head._Right = head;
        head._Color = _Redbl._Black;
        head._Isnil = 1;
    }
    [nativetype_1.NativeType.dtor]() {
        this.clear();
        nativeclass_1.NativeClass.delete(this.getPointerAs(this.nodeType, 0));
    }
    /**
     * @return [node, isRight]
     */
    _search(key) {
        const key_comp = this.key_comp;
        let bound = this._Myhead;
        let node = bound._Parent;
        let parent = node;
        let isRight = true;
        while (!node._Isnil) {
            parent = node;
            if (key_comp(node._Myval.first, key)) {
                isRight = true;
                node = node._Right;
            }
            else {
                isRight = false;
                bound = node;
                node = node._Left;
            }
        }
        return { bound, parent, isRight };
    }
    _Lrotate(_Wherenode) {
        const _Pnode = _Wherenode._Right;
        _Wherenode._Right = _Pnode._Left;
        if (!_Pnode._Left._Isnil) {
            _Pnode._Left._Parent = _Wherenode;
        }
        _Pnode._Parent = _Wherenode._Parent;
        const _Myhead = this._Myhead;
        if (_Wherenode.equals(_Myhead._Parent)) {
            _Myhead._Parent = _Pnode;
        }
        else if (_Wherenode.equals(_Wherenode._Parent._Left)) {
            _Wherenode._Parent._Left = _Pnode;
        }
        else {
            _Wherenode._Parent._Right = _Pnode;
        }
        _Pnode._Left = _Wherenode;
        _Wherenode._Parent = _Pnode;
    }
    _Rrotate(_Wherenode) {
        const _Pnode = _Wherenode._Left;
        _Wherenode._Left = _Pnode._Right;
        if (!_Pnode._Right._Isnil) {
            _Pnode._Right._Parent = _Wherenode;
        }
        _Pnode._Parent = _Wherenode._Parent;
        const _Myhead = this._Myhead;
        if (_Wherenode.equals(_Myhead._Parent)) {
            _Myhead._Parent = _Pnode;
        }
        else if (_Wherenode.equals(_Wherenode._Parent._Right)) {
            _Wherenode._Parent._Right = _Pnode;
        }
        else {
            _Wherenode._Parent._Left = _Pnode;
        }
        _Pnode._Right = _Wherenode;
        _Wherenode._Parent = _Pnode;
    }
    _insert(key) {
        const { parent, bound, isRight } = this._search(key);
        if (!bound._Isnil && !this.key_comp(key, bound._Myval.first)) {
            return [bound, false];
        }
        const size = this.size() + 1;
        this.setUint64WithFloat(size, 8);
        const _Head = this._Myhead;
        const _Newnode = this.nodeType.allocate();
        _Newnode._Myval.construct();
        _Newnode._Myval.setFirst(key);
        _Newnode._Isnil = 0;
        _Newnode._Left = _Head;
        _Newnode._Right = _Head;
        _Newnode._Parent = parent;
        if (parent.equals(_Head)) { // first node in tree, just set head values
            _Newnode._Color = _Redbl._Black; // the root is black
            _Head._Left = _Newnode;
            _Head._Parent = _Newnode;
            _Head._Right = _Newnode;
            return [_Newnode, true];
        }
        _Newnode._Color = _Redbl._Red;
        if (isRight) { // add to right of parent
            parent._Right = _Newnode;
            if (parent.equals(_Head._Right)) { // remember rightmost node
                _Head._Right = _Newnode;
            }
        }
        else { // add to left of parent
            parent._Left = _Newnode;
            if (parent.equals(_Head._Left)) { // remember leftmost node
                _Head._Left = _Newnode;
            }
        }
        for (let _Pnode = _Newnode; _Pnode._Parent._Color === _Redbl._Red;) {
            if (_Pnode._Parent.equals(_Pnode._Parent._Parent._Left)) { // fixup red-red in left subtree
                const _Parent_sibling = _Pnode._Parent._Parent._Right;
                if (_Parent_sibling._Color === _Redbl._Red) { // parent's sibling has two red children, blacken both
                    _Pnode._Parent._Color = _Redbl._Black;
                    _Parent_sibling._Color = _Redbl._Black;
                    _Pnode._Parent._Parent._Color = _Redbl._Red;
                    _Pnode = _Pnode._Parent._Parent;
                }
                else { // parent's sibling has red and black children
                    if (_Pnode.equals(_Pnode._Parent._Right)) { // rotate right child to left
                        _Pnode = _Pnode._Parent;
                        this._Lrotate(_Pnode);
                    }
                    _Pnode._Parent._Color = _Redbl._Black; // propagate red up
                    _Pnode._Parent._Parent._Color = _Redbl._Red;
                    this._Rrotate(_Pnode._Parent._Parent);
                }
            }
            else { // fixup red-red in right subtree
                const _Parent_sibling = _Pnode._Parent._Parent._Left;
                if (_Parent_sibling._Color === _Redbl._Red) { // parent's sibling has two red children, blacken both
                    _Pnode._Parent._Color = _Redbl._Black;
                    _Parent_sibling._Color = _Redbl._Black;
                    _Pnode._Parent._Parent._Color = _Redbl._Red;
                    _Pnode = _Pnode._Parent._Parent;
                }
                else { // parent's sibling has red and black children
                    if (_Pnode.equals(_Pnode._Parent._Left)) { // rotate left child to right
                        _Pnode = _Pnode._Parent;
                        this._Rrotate(_Pnode);
                    }
                    _Pnode._Parent._Color = _Redbl._Black; // propagate red up
                    _Pnode._Parent._Parent._Color = _Redbl._Red;
                    this._Lrotate(_Pnode._Parent._Parent);
                }
            }
        }
        _Head._Parent._Color = _Redbl._Black; // root is always black
        return [_Newnode, true];
    }
    _Extract(node) {
        const _Erasednode = node; // node to erase
        const _Myhead = this._Myhead;
        let _Fixnode; // the node to recolor as needed
        let _Fixnodeparent; // parent of _Fixnode (which may be nil)
        let _Pnode = _Erasednode;
        if (_Pnode._Left._Isnil) {
            _Fixnode = _Pnode._Right; // stitch up right subtree
        }
        else if (_Pnode._Right._Isnil) {
            _Fixnode = _Pnode._Left; // stitch up left subtree
        }
        else { // two subtrees, must lift successor node to replace erased
            _Pnode = node; // _Pnode is successor node
            _Fixnode = _Pnode._Right; // _Fixnode is only subtree
        }
        if (_Pnode.equals(_Erasednode)) { // at most one subtree, relink it
            _Fixnodeparent = _Erasednode._Parent;
            if (!_Fixnode._Isnil) {
                _Fixnode._Parent = _Fixnodeparent; // link up
            }
            if (_Myhead._Parent.equals(_Erasednode)) {
                _Myhead._Parent = _Fixnode; // link down from root
            }
            else if (_Fixnodeparent._Left.equals(_Erasednode)) {
                _Fixnodeparent._Left = _Fixnode; // link down to left
            }
            else {
                _Fixnodeparent._Right = _Fixnode; // link down to right
            }
            if (_Myhead._Left.equals(_Erasednode)) {
                _Myhead._Left = _Fixnode._Isnil ? _Fixnodeparent // smallest is parent of erased node
                    : _Min(_Fixnode); // smallest in relinked subtree
            }
            if (_Myhead._Right.equals(_Erasednode)) {
                _Myhead._Right = _Fixnode._Isnil ? _Fixnodeparent // largest is parent of erased node
                    : _Max(_Fixnode); // largest in relinked subtree
            }
        }
        else { // erased has two subtrees, _Pnode is successor to erased
            _Erasednode._Left._Parent = _Pnode; // link left up
            _Pnode._Left = _Erasednode._Left; // link successor down
            if (_Pnode.equals(_Erasednode._Right)) {
                _Fixnodeparent = _Pnode; // successor is next to erased
            }
            else { // successor further down, link in place of erased
                _Fixnodeparent = _Pnode._Parent; // parent is successor's
                if (!_Fixnode._Isnil) {
                    _Fixnode._Parent = _Fixnodeparent; // link fix up
                }
                _Fixnodeparent._Left = _Fixnode; // link fix down
                _Pnode._Right = _Erasednode._Right; // link next down
                _Erasednode._Right._Parent = _Pnode; // right up
            }
            if (_Myhead._Parent.equals(_Erasednode)) {
                _Myhead._Parent = _Pnode; // link down from root
            }
            else if (_Erasednode._Parent._Left.equals(_Erasednode)) {
                _Erasednode._Parent._Left = _Pnode; // link down to left
            }
            else {
                _Erasednode._Parent._Right = _Pnode; // link down to right
            }
            _Pnode._Parent = _Erasednode._Parent; // link successor up
            const swap = _Pnode._Color;
            _Pnode._Color = _Erasednode._Color;
            _Erasednode._Color = swap; // recolor it
        }
        if (_Erasednode._Color === _Redbl._Black) { // erasing black link, must recolor/rebalance tree
            for (; !_Fixnode.equals(_Myhead._Parent) && _Fixnode._Color === _Redbl._Black; _Fixnodeparent = _Fixnode._Parent) {
                if (_Fixnode.equals(_Fixnodeparent._Left)) { // fixup left subtree
                    _Pnode = _Fixnodeparent._Right;
                    if (_Pnode._Color === _Redbl._Red) { // rotate red up from right subtree
                        _Pnode._Color = _Redbl._Black;
                        _Fixnodeparent._Color = _Redbl._Red;
                        this._Lrotate(_Fixnodeparent);
                        _Pnode = _Fixnodeparent._Right;
                    }
                    if (_Pnode._Isnil) {
                        _Fixnode = _Fixnodeparent; // shouldn't happen
                    }
                    else if (_Pnode._Left._Color === _Redbl._Black
                        && _Pnode._Right._Color === _Redbl._Black) { // redden right subtree with black children
                        _Pnode._Color = _Redbl._Red;
                        _Fixnode = _Fixnodeparent;
                    }
                    else { // must rearrange right subtree
                        if (_Pnode._Right._Color === _Redbl._Black) { // rotate red up from left sub-subtree
                            _Pnode._Left._Color = _Redbl._Black;
                            _Pnode._Color = _Redbl._Red;
                            this._Rrotate(_Pnode);
                            _Pnode = _Fixnodeparent._Right;
                        }
                        _Pnode._Color = _Fixnodeparent._Color;
                        _Fixnodeparent._Color = _Redbl._Black;
                        _Pnode._Right._Color = _Redbl._Black;
                        this._Lrotate(_Fixnodeparent);
                        break; // tree now recolored/rebalanced
                    }
                }
                else { // fixup right subtree
                    _Pnode = _Fixnodeparent._Left;
                    if (_Pnode._Color === _Redbl._Red) { // rotate red up from left subtree
                        _Pnode._Color = _Redbl._Black;
                        _Fixnodeparent._Color = _Redbl._Red;
                        this._Rrotate(_Fixnodeparent);
                        _Pnode = _Fixnodeparent._Left;
                    }
                    if (_Pnode._Isnil) {
                        _Fixnode = _Fixnodeparent; // shouldn't happen
                    }
                    else if (_Pnode._Right._Color === _Redbl._Black
                        && _Pnode._Left._Color === _Redbl._Black) { // redden left subtree with black children
                        _Pnode._Color = _Redbl._Red;
                        _Fixnode = _Fixnodeparent;
                    }
                    else { // must rearrange left subtree
                        if (_Pnode._Left._Color === _Redbl._Black) { // rotate red up from right sub-subtree
                            _Pnode._Right._Color = _Redbl._Black;
                            _Pnode._Color = _Redbl._Red;
                            this._Lrotate(_Pnode);
                            _Pnode = _Fixnodeparent._Left;
                        }
                        _Pnode._Color = _Fixnodeparent._Color;
                        _Fixnodeparent._Color = _Redbl._Black;
                        _Pnode._Left._Color = _Redbl._Black;
                        this._Rrotate(_Fixnodeparent);
                        break; // tree now recolored/rebalanced
                    }
                }
            }
            _Fixnode._Color = _Redbl._Black; // stopping node is black
        }
        const size = this.size();
        if (0 < size) {
            this.setUint64WithFloat(size - 1, 8);
        }
        return _Erasednode;
    }
    _Eqrange(_Keyval) {
        // find range of nodes equivalent to _Keyval
        const _Myhead = this._Myhead;
        let _Pnode = _Myhead._Parent;
        let _Lonode = _Myhead; // end() if search fails
        let _Hinode = _Myhead; // end() if search fails
        while (!_Pnode._Isnil) {
            const _Nodekey = _Pnode._Myval.first;
            if (this.key_comp(_Nodekey, _Keyval)) {
                _Pnode = _Pnode._Right; // descend right subtree
            }
            else { // _Pnode not less than _Keyval, remember it
                if (_Hinode._Isnil && this.key_comp(_Keyval, _Nodekey)) {
                    _Hinode = _Pnode; // _Pnode greater, remember it
                }
                _Lonode = _Pnode;
                _Pnode = _Pnode._Left; // descend left subtree
            }
        }
        _Pnode = _Hinode._Isnil ? _Myhead._Parent : _Hinode._Left; // continue scan for upper bound
        while (!_Pnode._Isnil) {
            if (this.key_comp(_Keyval, _Pnode._Myval.first)) {
                // _Pnode greater than _Keyval, remember it
                _Hinode = _Pnode;
                _Pnode = _Pnode._Left; // descend left subtree
            }
            else {
                _Pnode = _Pnode._Right; // descend right subtree
            }
        }
        return [_Lonode, _Hinode];
    }
    _delete(node) {
        this._Extract(node);
        node._Myval.destruct();
        nativeclass_1.NativeClass.delete(node._Myval);
    }
    _deleteAll(_First, _Last) {
        const head = this._Myhead;
        if (_First.equals(head._Left) && _Last._Isnil) {
            // erase all
            this.clear();
            return;
        }
        // partial erase, one at a time
        while (!_First.equals(_Last)) {
            const next = _First.next();
            this._delete(_First);
            _First = next;
        }
        return;
    }
    _Erase_tree(_Rootnode) {
        while (!_Rootnode._Isnil) { // free subtrees, then node
            this._Erase_tree(_Rootnode._Right);
            const deleteTarget = _Rootnode;
            _Rootnode = _Rootnode._Left;
            deleteTarget._Myval.destruct();
            nativeclass_1.NativeClass.delete(deleteTarget);
        }
    }
    has(key) {
        const { bound } = this._search(key);
        return !bound._Isnil && !this.key_comp(key, bound._Myval.first);
    }
    get(key) {
        const { bound } = this._search(key);
        if (bound._Isnil || this.key_comp(key, bound._Myval.first))
            return null;
        return bound._Myval.second;
    }
    /**
     * it returns the [pair, boolean].
     * - first item (pair)
     * it's std::pair<K, V>, and it can be modified
     * - second item (boolean)
     * if it insert new, return true for second item.
     * if the item is already there, return false for second item.
     */
    insert(key, value) {
        const [node, inserted] = this._insert(key);
        if (inserted && value != null)
            node._Myval.setSecond(value);
        return [node._Myval, inserted];
    }
    set(key, value) {
        const [node] = this.insert(key);
        node.setSecond(value);
    }
    delete(key) {
        const [min, max] = this._Eqrange(key);
        if (min.equals(max))
            return false;
        this._deleteAll(min, max);
        return true;
    }
    clear() {
        const _Head = this._Myhead;
        this._Erase_tree(_Head._Parent);
        _Head._Parent = _Head;
        _Head._Left = _Head;
        _Head._Right = _Head;
        this.setUint64WithFloat(0, 8);
    }
    /**
     * @deprecated Typo!
     */
    entires() {
        return this.entries();
    }
    *entries() {
        let node = this._Myhead._Left;
        while (!node._Isnil) {
            const pair = node._Myval;
            const next = node.next();
            yield [pair.first, pair.second];
            node = next;
        }
    }
    *keys() {
        let node = this._Myhead._Left;
        while (!node._Isnil) {
            const pair = node._Myval;
            const next = node.next();
            yield pair.first;
            node = next;
        }
    }
    *values() {
        let node = this._Myhead._Left;
        while (!node._Isnil) {
            const pair = node._Myval;
            const next = node.next();
            yield pair.second;
            node = next;
        }
    }
    static make(key, value) {
        const k = key;
        const v = value;
        const comptype = cxxpair_1.CxxPair.make(k, v);
        const nodetype = CxxTreeNode.make(comptype);
        const key_comp = cxxfunctional_1.CxxLess.make(k);
        return singleton_1.Singleton.newInstance(CxxMap, comptype, () => {
            let CxxMapImpl = class CxxMapImpl extends CxxMap {
            };
            CxxMapImpl.componentType = comptype;
            CxxMapImpl.key_comp = key_comp;
            CxxMapImpl = (0, tslib_1.__decorate)([
                (0, nativeclass_1.nativeClass)(0x10)
            ], CxxMapImpl);
            CxxMapImpl.prototype.componentType = comptype;
            CxxMapImpl.prototype.nodeType = nodetype;
            CxxMapImpl.prototype.key_comp = key_comp;
            Object.defineProperty(CxxMapImpl, 'name', {
                value: getMapName(comptype)
            });
            return CxxMapImpl;
        });
    }
    toArray() {
        return [...this.entries()];
    }
    [util.inspect.custom](depth, options) {
        const map = new Map(this.toArray());
        return `CxxMap ${util.inspect(map, options).substr(4)}`;
    }
}
exports.CxxMap = CxxMap;
function getMapName(pair) {
    const key = pair.firstType;
    const value = pair.secondType;
    return (0, templatename_1.templateName)('std::map', key.name, value.name, (0, templatename_1.templateName)('std::less', key.name), (0, templatename_1.templateName)('std::allocator', pair.name));
}
//# sourceMappingURL=cxxmap.js.map