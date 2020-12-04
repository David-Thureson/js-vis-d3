// const Words = require("Words5000");
// const Util = require("../Util");

'use strict';

const compareDefault = function(a, b) {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
};

const printIndent = function(depth, s) {
    const prefix = depth >= 0 ? '\t'.repeat(depth) : "";
    console.log(`${prefix}${s}`);
};

// console.log(Util.wordsRankedByFrequency);

const LetterTrie = {

    _init(parent, key = "", label = "", isWord) {
        this._parent = parent;
        this._key = key;
        this._label = label;
        this._isWord = isWord;
        this._childNodeMap = new Map();
        this._childNodes = undefined;
        this._childNodeCount = undefined;
        this._wordCount = undefined;
        this._allNodeCount = undefined;
        this._freq = undefined;
        this._depth = (parent) ? parent._depth + 1 : 0;
        this._height = undefined;
        this._prefix = parent ? `${parent._prefix}${label}` : "";
        return this;
    },

    _fillFromList(wordList, maxWords = Number.MAX_SAFE_INTEGER) {
        for (let wordIndex = 0; wordIndex < Math.min(wordList.length, maxWords); wordIndex++) {
            let charArray = wordList[wordIndex].toLowerCase().split('');
            this._fillFromWord(charArray, 0);
        }
        this._recalc();
        return this;
    },

    _fillFromWord(charArray, charIndex) {
        const lastIndex = charArray.length - 1;
        const isWord = charIndex === lastIndex;
        const char = charArray[charIndex];
        var childNode;
        if (this._childNodeMap.has(char)) {
            childNode = this._childNodeMap.get(char);
        } else {
            childNode = LetterTrie.make(this, `${this._key}${char}`, char, isWord);
            this._childNodeMap.set(char, childNode);
        }
        if (isWord) {
            childNode._isWord = true;
        }
        childNode._count++;
        if (charIndex < lastIndex) {
            childNode._fillFromWord(charArray, charIndex + 1);
        }
    },

    _isRoot() { return this._key === "" },

    _isLeaf() { return this._childNodeMap.size === 0 },

    _recalc() {
        if (this._isRoot()) {
            this._freq = 1.0;
        }
        if (this._isLeaf()) {
            this._childNodes = [];
            this._childNodeCount = 0;
            this._height = 1;
            this._wordCount = 1;
            this._allNodeCount = 1;
        } else {
            this._childNodes = Array.from(this._childNodeMap.values());
            this._childNodes.sort((a, b) => compareDefault(a._label, b._label));
            this._childNodeCount = this._childNodes.length;

            this._childNodes.forEach(node => node._recalc());

            this._height = 1 + this._childNodes.map(node => node._height).reduce((max, cur) => Math.max(max, cur));
            this._wordCount = (this._isWord ? 1: 0) + this._childNodes.map(node => node._wordCount).reduce((sum, cur) => sum + cur);
            this._allNodeCount = 1 + this._childNodes.map(node => node._allNodeCount).reduce((sum, cur) => sum + cur);
            this._childNodes.forEach(node => node._freq = node._wordCount / this._wordCount);
        }
    },

    _getResolvedFrequency(currentRootNode) { return this._wordCount / currentRootNode._wordCount; },

    /*
    _getChildNodes() {
        if (!this._childNodes) {
            this._childNodes = Array.from(this._childNodeMap.values());
            this._childNodes.sort((a, b) => Util.compareDefault(a._label, b._label));
        }
        return this._childNodes;
    },
    */
    _getChildNodesByFrequency() { return this._childNodes.slice().sort((a, b) => compareDefault(b._freq, a._freq)) },

    /*
    // height() { return 1 + Math.max(Array.from(this._childNodes.values()).map(node => node.height())) },
    height() {
        if (this._childNodeMap.size === 0) {
            return 1;
        } else {
            // const childNodeArray = Array.from(this._childNodes.values());
            // const maxChildHeight = Math.max(...childNodeArray.map(node => node.height()));
            // return maxChildHeight + 1;
            return 1 + this._getChildNodes().map(node => node.height()).reduce((max, cur) => Math.max(max, cur))
        }
        },

    nodeCount() {
        if (this._childNodeMap.size === 0) {
            return 1;
        } else {
            // const childNodeArray = Array.from(this._childNodes.values());
            return 1 + this._getChildNodes().map(node => node.nodeCount()).reduce((sum, cur) => sum + cur);
        }
    },

    setChildFreq() {
        const childCountSum = this._getChildNodes().map(node => node._count).reduce((sum, cur) => sum + cur);
        this._getChildNodes().forEach(node => node._freq = node._count / childCountSum);
    },

    _getFreq() {
        if (!this._freq) {}
            if ()
            if (this._parent) {
                this._parent.setChildFreq();
            }
        }
        return this._freq;
    },
    */

    printByFrequency(depth, maxDepth, maxChildNodesPerItem) {
        if (this._label === "") {
            printIndent(depth, "{root}");
        } else {
            const name = `${this._isWord ? "*" : ""}${this._key}`;
            printIndent(depth, `${name}\t${this._wordCount}\t${this._freq.toFixed(3)}`);
        }
        if (depth < maxDepth) {
            this._getChildNodesByFrequency().slice(0, maxChildNodesPerItem).forEach(node => node.printByFrequency(depth + 1, maxDepth, maxChildNodesPerItem));
        }
    },

    printByResolvedFrequency(rootNodeKey = "", maxItems = Number.MAX_SAFE_INTEGER) {
        const currentRootNode = this.findNodeByKey(rootNodeKey);
        const ar = currentRootNode._allNodes().slice().sort((a, b) => compareDefault(b._wordCount, a._wordCount)).slice(0, maxItems);
        ar.forEach( node => {
            const freq = node._freq.toFixed(3);
            const resolvedFreq = node._getResolvedFrequency(currentRootNode).toFixed(3);
            console.log(`${node._key}\t${node._wordCount}\t${freq}\t${resolvedFreq}`);
        });
    },

    // This has not been optimized. It's just for testing.
    _allNodes() {
        const ar = [];
        this._addToAllNodes(ar);
        /*
        this._childNodes.forEach(node => {
            const childNodeAllNodes = node._allNodes();
            ar.push(...childNodeAllNodes);
            // ar.push(this._childNodes.map(node => node._allNodes()).flat());
        })
         */
        return ar;
    },

    _addToAllNodes(ar) {
        ar.push(this);
        this._childNodes.forEach(node => node._addToAllNodes(ar) );
    },

    findNodeByKey(key) {
        // This has not been optimized. It's just for testing.
        const allNodes = this._allNodes();
        return allNodes.find(node => node._key === key);
    },

    forD3Tree(parentNode, maxDepth) {
        const thisNode = {
            data: {
                id: this._key,
                label: this._label
            },
            height: this._height,
            depth: this._depth,
            parent: parentNode,
            id: this._key
        };
        if (parentNode) {
            parentNode.children.push(thisNode);
        }
        if (maxDepth > this._depth) {
            thisNode.children = [];
            this._childNodes.forEach(childNode => {
                childNode.forD3Tree(thisNode, maxDepth)
            });
        }
        return thisNode;
    },

    _idForD3TreeArray() {
        if (this._isRoot()) {
            return '{root}';
        } else {
            return `${this._parent._idForD3TreeArray()}.${this._label}`;
        }
    },

    _idForD3TreeArrayAltRoot(rootNode) {
        if (this._isRoot()) {
            return '{root}';
        } else {
            if (this === rootNode) {
                return this._prefix;
            } else {
                return `${this._parent._idForD3TreeArrayAltRoot(rootNode)}.${this._label}`;
            }
        }
    },

    d3TreeArray(maxDepth) {
        const ar = [];
        ar.columns = ["id", "value"];
        this._addToD3TreeArray(ar, maxDepth);
        return ar;
    },

    _addToD3TreeArray(ar, maxDepth) {
        ar.push( {id: this._idForD3TreeArray(), value: this._key } );
        if (this._depth < maxDepth) {
            this._childNodes.forEach(childNode => {
                childNode._addToD3TreeArray(ar, maxDepth);
            });
        }
    },

    d3TreeArrayAltRoot(maxDepth) {
        const ar = [];
        ar.columns = ["id", "value"];
        this._addToD3TreeArrayAltRoot(ar, this, maxDepth);
        return ar;
    },

    _addToD3TreeArrayAltRoot(ar, rootNode, maxDepth) {
        const label = (this === rootNode) ? this._prefix : this._label;
        // const label = (this === rootNode || this._isWord) ? this._prefix : this._label;
        ar.push( {id: this._idForD3TreeArrayAltRoot(rootNode), currentRootKey: rootNode._key, value: this._key, label: label, trieNode: this } );
        const relativeDepth = this._depth - rootNode._depth;
        if (relativeDepth < maxDepth) {
            this._childNodes.forEach(childNode => {
                childNode._addToD3TreeArrayAltRoot(ar, rootNode, maxDepth);
            });
        }
    }

};

LetterTrie.make = function(parent, key, label) { return Object.assign({}, LetterTrie )._init(parent, key, label) };

LetterTrie.makeFromList = function(wordList, maxWords) { return LetterTrie.make()._fillFromList(wordList, maxWords); };

LetterTrie.makeForD3Tree = function(maxWords, maxDepth) {
    const trie = LetterTrie.makeFromList(words5000, maxWords);
    const root = trie.forD3Tree(null, maxDepth);
    return root;
};

LetterTrie.makeForD3TreeArray = function(maxWords, maxDepth) {
    const trie = LetterTrie.makeFromList(words5000, maxWords);
    const ar = trie.d3TreeArray(maxDepth);
    return ar;
};

function debugPrintD3TreeArray(ar) {
    var s = `debugPrintD3TreeArray(): count = ${ar.length}\n`;
    ar.forEach(item => {
        s += `id = ${item.id}; value = ${item.value}; label = "${item.label}"\n`;
    });
    console.log(s);
}

/*
const wordList = words5000;

// Full list.
const trie1 =  LetterTrie.makeFromList(wordList);
console.log(`height = ${trie1._height}; nodes = ${trie1._allNodeCount}`);
//  trie1._getChildNodesByFrequency().forEach(node => console.log(`${node._label}\t${node._key}\t${node._count}\t${node._getFreq()}`));
// trie1.printByFrequency(0, 5, 2);

// const oneNode = trie1.findNodeByKey("str");

// trie1._allNodes().forEach(node => console.log(node._key));

// trie1.printByResolvedFrequency("", 25);
trie1.printByResolvedFrequency("con", 25);
*/


