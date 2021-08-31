


// Visual C++ uses red black tree for std::map
// https://en.wikipedia.org/wiki/Red%E2%80%93black_tree

import { capi } from "./capi";
import { CxxLess } from "./cxxfunctional";
import { CxxPair, CxxPairType } from "./cxxpair";
import { NativeClass, nativeClass, NativeClassType, nativeField } from "./nativeclass";
import { int8_t, NativeType, Type } from "./nativetype";
import { Singleton } from "./singleton";
import { templateName } from "./templatename";
import util = require('util');

enum _Redbl { // colors for link to parent
    _Red,
    _Black
}


interface CxxTreeNodeType<T extends NativeClass> extends NativeClassType<CxxTreeNode<T>> {
}

abstract class CxxTreeNode<T extends NativeClass> extends NativeClass {
	_Left:CxxTreeNode<T>; // left subtree, or smallest element if head
	_Parent:CxxTreeNode<T>; // parent, or root of tree if head
	_Right:CxxTreeNode<T>; // right subtree, or largest element if head
	_Color:_Redbl; // _Red or _Black, _Black if head
	_Isnil:int8_t; // true only if head (also nil) node; TRANSITION, should be bool
    _Myval:T;

    next():CxxTreeNode<T> {
        let _Ptr:CxxTreeNode<T> = this;
        if (_Ptr._Right._Isnil) { // climb looking for right subtree
            let _Pnode:CxxTreeNode<T>;
            while (!(_Pnode = _Ptr._Parent)._Isnil && _Ptr.equals(_Pnode._Right)) {
                _Ptr = _Pnode; // ==> parent while right subtree
            }

            _Ptr = _Pnode; // ==> parent (head if end())
        } else {
            _Ptr = _Min(_Ptr._Right); // ==> smallest of right subtree
        }
        return _Ptr;
    }

    previous():CxxTreeNode<T> {
        let _Ptr:CxxTreeNode<T> = this;
        if (_Ptr._Isnil) {
            _Ptr = _Ptr._Right; // end() ==> rightmost
        } else if (_Ptr._Left._Isnil) { // climb looking for left subtree
            let _Pnode:CxxTreeNode<T>;
            while (!(_Pnode = _Ptr._Parent)._Isnil && _Ptr.equals(_Pnode._Left)) {
                _Ptr = _Pnode; // ==> parent while left subtree
            }

            if (!_Ptr._Isnil) { // decrement non-begin()
                _Ptr = _Pnode; // ==> parent if not head
            }
        } else {
            _Ptr = _Max(_Ptr._Left); // ==> largest of left subtree
        }
        return _Ptr;
    }

    static make<T extends NativeClass>(type:NativeClassType<T>):CxxTreeNodeType<T> {
        return Singleton.newInstance(CxxTreeNode, type, ()=>{
            @nativeClass()
            class CxxTreeNodeImpl extends CxxTreeNode<T> {
                @nativeField(CxxTreeNodeImpl.ref())
                _Left:CxxTreeNodeImpl;
                @nativeField(CxxTreeNodeImpl.ref())
                _Parent:CxxTreeNodeImpl;
                @nativeField(CxxTreeNodeImpl.ref())
                _Right:CxxTreeNodeImpl;
                @nativeField(int8_t)
                _Color:_Redbl;
                @nativeField(int8_t)
                _Isnil:int8_t;
                @nativeField(type, {noInitialize:true})
                _Myval:T;
            }
            return CxxTreeNodeImpl;
        });
    }
}

function _Max<T extends NativeClass>(_Pnode:CxxTreeNode<T>):CxxTreeNode<T> { // return rightmost node in subtree at _Pnode
    while (!_Pnode._Right._Isnil) {
        _Pnode = _Pnode._Right;
    }

    return _Pnode;
}

function _Min<T extends NativeClass>(_Pnode:CxxTreeNode<T>):CxxTreeNode<T> { // return leftmost node in subtree at _Pnode
    while (!_Pnode._Left._Isnil) {
        _Pnode = _Pnode._Left;
    }

    return _Pnode;
}

export interface CxxMapType<K, V> extends NativeClassType<CxxMap<K, V>> {
    readonly componentType:CxxPairType<K, V>;
    readonly key_comp:(a:K, b:K)=>boolean;
}

export abstract class CxxMap<K, V> extends NativeClass {
    private get _Myhead():CxxTreeNode<CxxPair<K, V>> {
        return this.getPointerAs(this.nodeType, 0);
    }
    size():number {
        return this.getUint64AsFloat(8);
    }

    abstract readonly key_comp:CxxLess<K>;
    abstract readonly componentType:CxxPairType<K, V>;
    static readonly key_comp:CxxLess<any>;
    static readonly componentType:CxxPairType<any, any>;
    protected abstract readonly nodeType:CxxTreeNodeType<CxxPair<K, V>>;

    [NativeType.ctor]():void {
        const head = capi.malloc(0x20).as(this.nodeType) as CxxTreeNode<CxxPair<K, V>>; // allocate without value size
        this.setPointer(head, 0);
        this.setUint64WithFloat(0, 8);

        head._Left = head;
        head._Parent = head;
        head._Right = head;
        head._Color = _Redbl._Black;
        head._Isnil = 1;
    }
    [NativeType.dtor]():void {
        this.clear();
        NativeClass.delete(this.getPointerAs(this.nodeType, 0));
    }

    /**
     * @return [node, isRight]
     */
    private _search(key:K):{bound:CxxTreeNode<CxxPair<K, V>>, parent:CxxTreeNode<CxxPair<K, V>>, isRight:boolean} {
        const key_comp = this.key_comp;
        let bound = this._Myhead;
        let node = bound._Parent;
        let parent:CxxTreeNode<CxxPair<K, V>> = node;
        let isRight = true;
        while (!node._Isnil) {
            parent = node;
            if (key_comp(node._Myval.first, key)) {
                isRight = true;
                node = node._Right;
            } else {
                isRight = false;
                bound = node;
                node = node._Left;
            }
        }
        return {bound, parent, isRight};
    }


    private _Lrotate(_Wherenode:CxxTreeNode<CxxPair<K, V>>):void { // promote right node to root of subtree
        const _Pnode    = _Wherenode._Right;
        _Wherenode._Right = _Pnode._Left;

        if (!_Pnode._Left._Isnil) {
            _Pnode._Left._Parent = _Wherenode;
        }

        _Pnode._Parent = _Wherenode._Parent;

        const _Myhead = this._Myhead;
        if (_Wherenode.equals(_Myhead._Parent)) {
            _Myhead._Parent = _Pnode;
        } else if (_Wherenode.equals(_Wherenode._Parent._Left)) {
            _Wherenode._Parent._Left = _Pnode;
        } else {
            _Wherenode._Parent._Right = _Pnode;
        }

        _Pnode._Left       = _Wherenode;
        _Wherenode._Parent = _Pnode;
    }

    private _Rrotate(_Wherenode:CxxTreeNode<CxxPair<K, V>>):void { // promote left node to root of subtree
        const _Pnode   = _Wherenode._Left;
        _Wherenode._Left = _Pnode._Right;

        if (!_Pnode._Right._Isnil) {
            _Pnode._Right._Parent = _Wherenode;
        }

        _Pnode._Parent = _Wherenode._Parent;

        const _Myhead = this._Myhead;
        if (_Wherenode.equals(_Myhead._Parent)) {
            _Myhead._Parent = _Pnode;
        } else if (_Wherenode.equals(_Wherenode._Parent._Right)) {
            _Wherenode._Parent._Right = _Pnode;
        } else {
            _Wherenode._Parent._Left = _Pnode;
        }

        _Pnode._Right      = _Wherenode;
        _Wherenode._Parent = _Pnode;
    }

    private _insert(key:K):[CxxTreeNode<CxxPair<K, V>>, boolean] {
        const {parent, bound, isRight} = this._search(key);
        if (!bound._Isnil && !this.key_comp(key, bound._Myval.first)) {
            return [bound, false];
        }
        const size = this.size()+1;
        this.setUint64WithFloat(size, 8);
        const _Head  = this._Myhead;

        const _Newnode = this.nodeType.allocate() as CxxTreeNode<CxxPair<K, V>>;
        _Newnode._Myval.construct();
        _Newnode._Myval.setFirst(key);
        _Newnode._Isnil = 0;
        _Newnode._Left = _Head;
        _Newnode._Right = _Head;
        _Newnode._Parent = parent;
        if (parent.equals(_Head)) { // first node in tree, just set head values
            _Newnode._Color = _Redbl._Black; // the root is black
            _Head._Left     = _Newnode;
            _Head._Parent   = _Newnode;
            _Head._Right    = _Newnode;
            return [_Newnode, true];
        }
        _Newnode._Color = _Redbl._Red;

        if (isRight) { // add to right of parent
            parent._Right = _Newnode;
            if (parent.equals(_Head._Right)) { // remember rightmost node
                _Head._Right = _Newnode;
            }
        } else { // add to left of parent
            parent._Left = _Newnode;
            if (parent.equals(_Head._Left)) { // remember leftmost node
                _Head._Left = _Newnode;
            }
        }

        for (let _Pnode = _Newnode; _Pnode._Parent._Color === _Redbl._Red;) {
            if (_Pnode._Parent.equals(_Pnode._Parent._Parent._Left)) { // fixup red-red in left subtree
                const _Parent_sibling = _Pnode._Parent._Parent._Right;
                if (_Parent_sibling._Color === _Redbl._Red) { // parent's sibling has two red children, blacken both
                    _Pnode._Parent._Color          = _Redbl._Black;
                    _Parent_sibling._Color          = _Redbl._Black;
                    _Pnode._Parent._Parent._Color = _Redbl._Red;
                    _Pnode                           = _Pnode._Parent._Parent;
                } else { // parent's sibling has red and black children
                    if (_Pnode.equals(_Pnode._Parent._Right)) { // rotate right child to left
                        _Pnode = _Pnode._Parent;
                        this._Lrotate(_Pnode);
                    }

                    _Pnode._Parent._Color          = _Redbl._Black; // propagate red up
                    _Pnode._Parent._Parent._Color = _Redbl._Red;
                    this._Rrotate(_Pnode._Parent._Parent);
                }
            } else { // fixup red-red in right subtree
                const _Parent_sibling = _Pnode._Parent._Parent._Left;
                if (_Parent_sibling._Color === _Redbl._Red) { // parent's sibling has two red children, blacken both
                    _Pnode._Parent._Color          = _Redbl._Black;
                    _Parent_sibling._Color          = _Redbl._Black;
                    _Pnode._Parent._Parent._Color = _Redbl._Red;
                    _Pnode                           = _Pnode._Parent._Parent;
                } else { // parent's sibling has red and black children
                    if (_Pnode.equals(_Pnode._Parent._Left)) { // rotate left child to right
                        _Pnode = _Pnode._Parent;
                        this._Rrotate(_Pnode);
                    }

                    _Pnode._Parent._Color          = _Redbl._Black; // propagate red up
                    _Pnode._Parent._Parent._Color = _Redbl._Red;
                    this._Lrotate(_Pnode._Parent._Parent);
                }
            }
        }

        _Head._Parent._Color = _Redbl._Black; // root is always black
        return [_Newnode, true];
    }

    private _Extract(node:CxxTreeNode<CxxPair<K, V>>):CxxTreeNode<CxxPair<K, V>> {
        const _Erasednode = node; // node to erase

        const _Myhead = this._Myhead;
        let _Fixnode:CxxTreeNode<CxxPair<K, V>>; // the node to recolor as needed
        let _Fixnodeparent:CxxTreeNode<CxxPair<K, V>>; // parent of _Fixnode (which may be nil)
        let _Pnode = _Erasednode;

        if (_Pnode._Left._Isnil) {
            _Fixnode = _Pnode._Right; // stitch up right subtree
        } else if (_Pnode._Right._Isnil) {
            _Fixnode = _Pnode._Left; // stitch up left subtree
        } else { // two subtrees, must lift successor node to replace erased
            _Pnode   = node; // _Pnode is successor node
            _Fixnode = _Pnode._Right; // _Fixnode is only subtree
        }

        if (_Pnode.equals(_Erasednode)) { // at most one subtree, relink it
            _Fixnodeparent = _Erasednode._Parent;
            if (!_Fixnode._Isnil) {
                _Fixnode._Parent = _Fixnodeparent; // link up
            }

            if (_Myhead._Parent.equals(_Erasednode)) {
                _Myhead._Parent = _Fixnode; // link down from root
            } else if (_Fixnodeparent._Left.equals(_Erasednode)) {
                _Fixnodeparent._Left = _Fixnode; // link down to left
            } else {
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
        } else { // erased has two subtrees, _Pnode is successor to erased
            _Erasednode._Left._Parent = _Pnode; // link left up
            _Pnode._Left               = _Erasednode._Left; // link successor down

            if (_Pnode.equals(_Erasednode._Right)) {
                _Fixnodeparent = _Pnode; // successor is next to erased
            } else { // successor further down, link in place of erased
                _Fixnodeparent = _Pnode._Parent; // parent is successor's
                if (!_Fixnode._Isnil) {
                    _Fixnode._Parent = _Fixnodeparent; // link fix up
                }

                _Fixnodeparent._Left        = _Fixnode; // link fix down
                _Pnode._Right               = _Erasednode._Right; // link next down
                _Erasednode._Right._Parent = _Pnode; // right up
            }

            if (_Myhead._Parent.equals(_Erasednode)) {
                _Myhead._Parent = _Pnode; // link down from root
            } else if (_Erasednode._Parent._Left.equals(_Erasednode)) {
                _Erasednode._Parent._Left = _Pnode; // link down to left
            } else {
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
                        _Pnode._Color         = _Redbl._Black;
                        _Fixnodeparent._Color = _Redbl._Red;
                        this._Lrotate(_Fixnodeparent);
                        _Pnode = _Fixnodeparent._Right;
                    }

                    if (_Pnode._Isnil) {
                        _Fixnode = _Fixnodeparent; // shouldn't happen
                    } else if (_Pnode._Left._Color === _Redbl._Black
                               && _Pnode._Right._Color === _Redbl._Black) { // redden right subtree with black children
                        _Pnode._Color = _Redbl._Red;
                        _Fixnode       = _Fixnodeparent;
                    } else { // must rearrange right subtree
                        if (_Pnode._Right._Color === _Redbl._Black) { // rotate red up from left sub-subtree
                            _Pnode._Left._Color = _Redbl._Black;
                            _Pnode._Color        = _Redbl._Red;
                            this._Rrotate(_Pnode);
                            _Pnode = _Fixnodeparent._Right;
                        }

                        _Pnode._Color         = _Fixnodeparent._Color;
                        _Fixnodeparent._Color = _Redbl._Black;
                        _Pnode._Right._Color = _Redbl._Black;
                        this._Lrotate(_Fixnodeparent);
                        break; // tree now recolored/rebalanced
                    }
                } else { // fixup right subtree
                    _Pnode = _Fixnodeparent._Left;
                    if (_Pnode._Color === _Redbl._Red) { // rotate red up from left subtree
                        _Pnode._Color         = _Redbl._Black;
                        _Fixnodeparent._Color = _Redbl._Red;
                        this._Rrotate(_Fixnodeparent);
                        _Pnode = _Fixnodeparent._Left;
                    }

                    if (_Pnode._Isnil) {
                        _Fixnode = _Fixnodeparent; // shouldn't happen
                    } else if (_Pnode._Right._Color === _Redbl._Black
                               && _Pnode._Left._Color === _Redbl._Black) { // redden left subtree with black children
                        _Pnode._Color = _Redbl._Red;
                        _Fixnode       = _Fixnodeparent;
                    } else { // must rearrange left subtree
                        if (_Pnode._Left._Color === _Redbl._Black) { // rotate red up from right sub-subtree
                            _Pnode._Right._Color = _Redbl._Black;
                            _Pnode._Color         = _Redbl._Red;
                            this._Lrotate(_Pnode);
                            _Pnode = _Fixnodeparent._Left;
                        }

                        _Pnode._Color         = _Fixnodeparent._Color;
                        _Fixnodeparent._Color = _Redbl._Black;
                        _Pnode._Left._Color  = _Redbl._Black;
                        this._Rrotate(_Fixnodeparent);
                        break; // tree now recolored/rebalanced
                    }
                }
            }

            _Fixnode._Color = _Redbl._Black; // stopping node is black
        }

        const size = this.size();
        if (0 < size) {
            this.setUint64WithFloat(size-1, 8);
        }

        return _Erasednode;
    }

    private _Eqrange(_Keyval:K):[CxxTreeNode<CxxPair<K, V>>, CxxTreeNode<CxxPair<K, V>>] {
        // find range of nodes equivalent to _Keyval
        const _Myhead = this._Myhead;
        let _Pnode   = _Myhead._Parent;
        let _Lonode  = _Myhead; // end() if search fails
        let _Hinode  = _Myhead; // end() if search fails

        while (!_Pnode._Isnil) {
            const _Nodekey = _Pnode._Myval.first;
            if (this.key_comp(_Nodekey, _Keyval)) {
                _Pnode = _Pnode._Right; // descend right subtree
            } else { // _Pnode not less than _Keyval, remember it
                if (_Hinode._Isnil && this.key_comp(_Keyval, _Nodekey)) {
                    _Hinode = _Pnode; // _Pnode greater, remember it
                }

                _Lonode = _Pnode;
                _Pnode  = _Pnode._Left; // descend left subtree
            }
        }

        _Pnode = _Hinode._Isnil ? _Myhead._Parent : _Hinode._Left; // continue scan for upper bound
        while (!_Pnode._Isnil) {
            if (this.key_comp(_Keyval, _Pnode._Myval.first)) {
                // _Pnode greater than _Keyval, remember it
                _Hinode = _Pnode;
                _Pnode  = _Pnode._Left; // descend left subtree
            } else {
                _Pnode = _Pnode._Right; // descend right subtree
            }
        }

        return [_Lonode, _Hinode];
    }

    private _delete(node:CxxTreeNode<CxxPair<K, V>>):void{
        this._Extract(node);
        node._Myval.destruct();
        NativeClass.delete(node._Myval);
    }

    private _deleteAll(_First:CxxTreeNode<CxxPair<K, V>>, _Last:CxxTreeNode<CxxPair<K, V>>):void{
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

    private _Erase_tree(_Rootnode:CxxTreeNode<CxxPair<K, V>>):void {
        while (!_Rootnode._Isnil) { // free subtrees, then node
            this._Erase_tree(_Rootnode._Right);
            const deleteTarget = _Rootnode;
            _Rootnode = _Rootnode._Left;
            deleteTarget._Myval.destruct();
            NativeClass.delete(deleteTarget);
        }
    }

    has(key:K):boolean {
        const {bound} = this._search(key);
        return !bound._Isnil && !this.key_comp(key, bound._Myval.first);
    }

    get(key:K):V|null {
        const {bound} = this._search(key);
        if (bound._Isnil || this.key_comp(key, bound._Myval.first)) return null;
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
    insert(key:K, value?:V):[CxxPair<K, V>, boolean] {
        const [node, inserted] = this._insert(key);
        if (inserted && value != null) node._Myval.setSecond(value);
        return [node._Myval, inserted];
    }

    set(key:K, value:V):void {
        const [node] = this.insert(key);
        node.setSecond(value);
    }

    delete(key:K):boolean {
        const [min, max] = this._Eqrange(key);
        if (min.equals(max)) return false;
        this._deleteAll(min, max);
        return true;
    }

    clear():void {
        const _Head = this._Myhead;
        this._Erase_tree(_Head._Parent);
        _Head._Parent  = _Head;
        _Head._Left    = _Head;
        _Head._Right   = _Head;
        this.setUint64WithFloat(0, 8);
    }

    /**
     * @deprecated Typo!
     */
    entires():IterableIterator<[K, V]> {
        return this.entries();
    }

    *entries():IterableIterator<[K, V]> {
        let node = this._Myhead._Left;
        while (!node._Isnil) {
            const pair = node._Myval;
            const next = node.next();
            yield [pair.first, pair.second];
            node = next;
        }
    }

    *keys():IterableIterator<K> {
        let node = this._Myhead._Left;
        while (!node._Isnil) {
            const pair = node._Myval;
            const next = node.next();
            yield pair.first;
            node = next;
        }
    }

    *values():IterableIterator<V> {
        let node = this._Myhead._Left;
        while (!node._Isnil) {
            const pair = node._Myval;
            const next = node.next();
            yield pair.second;
            node = next;
        }
    }

    static make<K, V>(key:{prototype:K}, value:{prototype:V}):CxxMapType<K, V> {
        const k = key as Type<K>;
        const v = value as Type<V>;
        const comptype = CxxPair.make(k, v);
        const nodetype = CxxTreeNode.make(comptype);
        const key_comp = CxxLess.make(k);
        return Singleton.newInstance(CxxMap, comptype, ()=>{
            @nativeClass(0x10)
            class CxxMapImpl extends CxxMap<K, V> {
                static componentType:CxxPairType<K, V> = comptype;
                static key_comp:CxxLess<K> = key_comp;
                componentType:CxxPairType<K, V>;
                key_comp:CxxLess<K>;
                nodeType:CxxTreeNodeType<CxxPair<K, V>>;
            }
            CxxMapImpl.prototype.componentType = comptype;
            CxxMapImpl.prototype.nodeType = nodetype;
            CxxMapImpl.prototype.key_comp = key_comp;
            Object.defineProperty(CxxMapImpl, 'name', {
                value:getMapName(comptype)
            });
            return CxxMapImpl;
        });
    }

    toArray():[K, V][] {
        return [...this.entries()];
    }

    [util.inspect.custom](depth:number, options:Record<string, any>):unknown {
        const map = new Map<K, V>(this.toArray());
        return `CxxMap ${util.inspect(map, options).substr(4)}`;
    }
}

function getMapName(pair:CxxPairType<any, any>):string {
    const key = pair.firstType;
    const value = pair.secondType;
    return templateName('std::map', key.name, value.name, templateName('std::less', key.name), templateName('std::allocator', pair.name));
}
