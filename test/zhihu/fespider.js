/**
 * @Author: Ke Shen <godzilla>
 * @Date:   2017-03-10 09:43:57
 * @Email:  keshen@sohu-inc.com
 * @Last modified by:   godzilla
 * @Last modified time: 2017-03-10 09:43:57
 */

(function () {
    
    if (window.fespider) return;

    var conf = {
        classNameUpperCase: false,
        classNameModulePrefix: true,
        moduleName: 'module',
        recoverUrlInAttr: false,
        fetchFont: true,
        serverHost: 'https://127.0.0.1:3663',
        pullContent: true,
        generateType: 'html' // 'html' | 'vue'
    };

    /**
     * String Hash
     * Ref: http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
     */
    if (!String.prototype.hashCode) {
        String.prototype.hashCode = function () {
            var hash = 0, i, chr;
            if (this.length === 0) return hash;
            for (i = 0; i < this.length; i++) {
                chr   = this.charCodeAt(i);
                hash  = ((hash << 5) - hash) + chr;
                hash |= 0; // Convert to 32bit integer
            }
            return hash;
        };
    }
    
    if (!String.prototype.endsWith) {
        String.prototype.endsWith = function (s) {
            if (typeof s !== 'string') return false;
            if (s.length > this.length) return false;
            return (this.substr(this.length - s.length) === s);
        };
    }
    
    var parseUrl = function (url) {
        var parser = document.createElement('a');
        parser.href = url;
        return {
            protocol: parser.protocol,
            host: parser.host,
            path: parser.pathname,
            search: parser.search,
            hash: parser.hash
        };
    };
    var recoverUrl = function (base, target) {
        var prefix = target.substr(0, target.indexOf(':'));
        if (prefix && /[a-z]+/.test(prefix)) {
            return target;
        }
        
        base = recoverUrl(window.location.href, base);
        var b = parseUrl(base);
        if (target.startsWith('//')) return b.protocol + target;
        if (target.startsWith('/')) return b.protocol + '//' + b.host + target;
        if (b.path.endsWith('/')) return b.protocol + '//' + b.host + b.path + target;
        return b.protocol + '//' + b.host + b.path.substring(0, b.path.lastIndexOf('/')) + '/' + target;
    };
    var recoverCssUrls = function (cssText, baseUrl) {
        var replacer = function (s, p1) {
            p1 = p1.trim();
            var inner = p1;
            if ((p1.charAt(0) === "'" && p1.charAt(p1.length - 1) === "'")
                || (p1.charAt(0) === '"' && p1.charAt(p1.length - 1) === '"')) inner = p1.substr(1, p1.length - 2);
            if (inner.startsWith('data:')) return 'url(' + inner + ')';
            return 'url(\'' + recoverUrl(baseUrl, inner) + '\')';
        };
        cssText = cssText.replace(/url\s*\((.*?)\)/g, replacer);
        return cssText;
    };

    var getCssLinks = function () {
        var sheet = document.styleSheets,
            i = sheet.length;
        var re = [];
        while (0 <= --i) {
            if (sheet[i].href) {
                re.push(sheet[i].href);
            }
        }
        return re;
    };
    var getFontFaces = function () {
        var sheet = document.styleSheets,
            rule = null,
            i = sheet.length, j;
        var urlQueue = [];
        var interRules = [];
        while (0 <= --i) {
            if (sheet[i].href) {
                urlQueue.push(sheet[i].href);
            } else {
                rule = sheet[i].rules || sheet[i].cssRules || [];
                j = rule.length;
                while (0 <= --j) {
                    if (rule[j].constructor.name === 'CSSFontFaceRule') {
                        interRules.push(recoverCssUrls(rule[j].cssText, window.location.href));
                    };
                }
            }
        }
        return Promise.all(urlQueue.map(url => {
            return fetch(conf.serverHost + '/get/' + encodeURIComponent(url), {
                mode: 'cors',
                headers: {'Content-Type': 'text/plain'}
            }).then(res => {
                return res.text().then(data => {
                    var regExp = /@font-face\s*\{[^}]+}/g;
                    var results = data.match(regExp) || [];
                    return interRules.concat(results.map(result => recoverCssUrls(result, url)));
                });
            }).catch(err => {
                console.error(err);
            });
        }));
    };
    
    const ignoreNodeName = {
        '#text': true,
        '#comment': true,
        'meta': true,
        'script': true,
        'style': true,
        'iframe': true
    };

    const PropertyTable = {
        'display': {},
        'zoom': {},
        'flex-direction': {},
        'flex-wrap': {},
        'flex-flow': {},
        'justify-content': {},
        'align-items': {},
        'align-content': {},
        'order': {},
        'flex-grow': {},
        'flex-shrink': {},
        'flex-basis': {},
        'flex': {},
        'align-self': {},
        'position': {},
        'z-index': {},
        'width': {
            default: () => 'auto'
        },
        'height': {
            default: () => 'auto'
        },
        'max-width': {
            ignore: function (v) {
                return v === 'auto' || v === 'none';
            }
        },
        'min-width': {
            ignore: function (v) {
                return v === 'auto' || v === 'none';
            }
        },
        'max-height': {
            ignore: function (v) {
                return v === 'auto' || v === 'none';
            }
        },
        'min-height': {
            ignore: function (v) {
                return v === 'auto' || v === 'none';
            }
        },
        'top': {
            default: () => 'auto'
        },
        'right': {
            default: () => 'auto'
        },
        'bottom': {
            default: () => 'auto'
        },
        'left': {
            default: () => 'auto'
        },
        'background': {},
        // 'background-color': {},
        // 'background-size': {},
        'margin': {
            default: (type) => {
                var ignore = ['ul', 'p', 'dd', 'h1', 'h2', 'h3', 'h4', 'body'];
                if (ignore.indexOf(type) >= 0) return false;
                return '0px';
            }
        },
        // 'margin-top': {},
        // 'margin-right': {},
        // 'margin-bottom': {},
        // 'margin-left': {},
        'padding': {},
        // 'padding-top': {},
        // 'padding-right': {},
        // 'padding-bottom': {},
        // 'padding-left': {},
        'border': {
            ignore: function (v) {
                return v.indexOf('none') >= 0;
            }
        },
        'border-top': {
            ignore: function (v) {
                return v.indexOf('none') >= 0;
            }
        },
        'border-right': {
            ignore: function (v) {
                return v.indexOf('none') >= 0;
            }
        },
        'border-bottom': {
            ignore: function (v) {
                return v.indexOf('none') >= 0;
            }
        },
        'border-left': {
            ignore: function (v) {
                return v.indexOf('none') >= 0;
            }
        },
        'border-radius': {},
        'border-collapse': {
            inherit: true
        },
        'border-spacing': {
            inherit: true
        },
        'box-shadow': {},
        'box-sizing': {},
        'outline': {
            ignore: function (v) {
                return v.indexOf('none') >= 0;
            }
        },
        'color': {
            inherit: true
        },
        'text-align': {
            inherit: true
        },
        'text-indent': {
            inherit: true
        },
        'text-overflow': {
            default: () => 'clip'
        },
        'overflow-x': {},
        'overflow-y': {},
        'cursor': {
            inherit: true
        },
        'float': {},
        'clear': {},
        'table-layout': {},
        'font': {
            inherit: true
        },
        /*
        'font-family': {
            inherit: true
        },
        'font-size': {
            inherit: true
        },
        'font-weight': {
            inherit: true
        },
        'font-style': {
            inherit: true
        },
        'line-height': {
            inherit: true
        },
        */
        'letter-spacing': {
            inherit: true
        },
        'list-style': {
            inherit: true
        },
        'opacity': {},
        'visibility': {
            inherit: true
        },
        'text-decoration': {},
        'vertical-align': {},
        'white-space': {
            inherit: true
        },
        'word-break': {
            inherit: true
        },
        'word-wrap': {
            inherit: true
        },
        'content': {},
        'transform': {},
        'transform-origin': {
            default: () => '50% 50%'
        },
        'transition': {},
        'fill': {}
    };

    var cleanComputedStyle = function (cs) {
        if (cs['border-top'] === cs['border']) delete cs['border-top'];
        if (cs['border-right'] === cs['border']) delete cs['border-right'];
        if (cs['border-bottom'] === cs['border']) delete cs['border-bottom'];
        if (cs['border-left'] === cs['border']) delete cs['border-left'];
    };

    var propNameCamelify = function (name) {
        var parts = name.split('-');
        var re = parts[0] || '';
        for (var i = 1, len = parts.length; i < len; i++) {
            var p = parts[1];
            re += p.substr(0, 1).toUpperCase() + p.substr(1);
        }
        return re;
    };

    var getFullStyle = function (dom, pseudo, inSvg) {
        var cs = !pseudo ? getComputedStyle(dom) : getComputedStyle(dom, ':' + pseudo);
        var ncs = (pseudo && !pseudoClassTable[pseudo].element) ? getComputedStyle(dom) 
            : getNodeDefaultCS((pseudo && pseudoClassTable[pseudo].element === 'inline') ? 'span' : dom.nodeName.toLowerCase(), inSvg);
        var re = {};
        for (var prop in PropertyTable) {
            var cprop = propNameCamelify(prop);
            if (cs[cprop] && (preventDefaultProps[dom.nodeName.toLowerCase() + ' ' + prop] || PropertyTable[prop].inherit
                || (cs[cprop] !== ncs[cprop] && (!PropertyTable[prop].ignore || !PropertyTable[prop].ignore(cs[cprop]))))) {
                re[prop] = cs[cprop];
            }
        }
        
        /* hack for pseudo elements */
        /*
        if (pseudo) {
            if (re.height === 'auto' || re.height === '0px') {
                delete re.height;
            }
        }
        */
        
        cleanComputedStyle(re);
        return re;
    };

    const pseudoClassTable = {
        'before': { element: 'inline' },
        'after': { element: 'inline' }
    };
    var getPseudoElements = function (dom, domStyle, inSvg) {
        var re = {};
        for (var p in pseudoClassTable) {
            if (pseudoClassTable[p].element) {
                var cs = getComputedStyle(dom, ':' + p);
                if (cs.content) {
                    re[p] = getFullStyle(dom, p, inSvg);
                } else {
                    continue;
                }
                var domCS = getComputedStyle(dom);
                for (var i in re[p]) {
                    if (PropertyTable[i].inherit && domCS[propNameCamelify(i)] === re[p][i]) {
                        delete re[p][i];
                    }
                }
            } else {
                // won't be reached so far
            }
        }
        if (Object.keys(re).length === 0) return null;
        return re;
    };

    const preventDefaultProps = {
        'a color': true,
        'a text-decoration': true,
        'em font': true,
        'input outline': true,
        'input border': true,
        'input border-top': true,
        'input border-right': true,
        'input border-bottom': true,
        'input border-left': true,
        'input box-sizing': true,
        'fieldset border': true,
        'fieldset border-top': true,
        'fieldset border-right': true,
        'fieldset border-bottom': true,
        'fieldset border-left': true,
        'textarea outline': true,
        'textarea border': true,
        'textarea border-top': true,
        'textarea border-right': true,
        'textarea border-bottom': true,
        'textarea border-left': true,
        'button border': true,
        'button border-top': true,
        'button border-right': true,
        'button border-bottom': true,
        'button border-left': true,
        'button color': true,
        'ul margin': true,
        'h1 font': true,
        'h2 font': true,
        'figure margin': true
    };

    var getMetaData = function (dom) {
        var metaShow = getFullMetaData(dom);
        var originalDisplay = getComputedStyle(dom)['display'];
        dom.style.display = 'none';
        var metaHide = getFullMetaData(dom);
        dom.style.display = originalDisplay;

        var propsKeptInNode1 = ['transform', 'transform-origin', 'transition'];
        var patch = function (node1, node2) {
            var nodeName = node1.nodeName;
            if (node1.style) {
                for (var p in node1.style) {
                    if (node1.style[p] === undefined) {
                        delete node1.style[p];
                        continue;
                    }
                    if (/px/.test(node1.style[p]) && propsKeptInNode1.indexOf(p) < 0) {
                        if (node2.style[p] === undefined) {
                            delete node1.style[p];
                            continue;
                        }
                        node1.style[p] = node2.style[p];
                        if ((node1.style[p] === 'auto' && !(PropertyTable[p].default && node1.style[p] !== PropertyTable[p].default(nodeName)))
                            || (!PropertyTable[p].inherit && (PropertyTable[p].default && PropertyTable[p].default(nodeName) === node1.style[p]))) {
                            delete node1.style[p];
                        }
                    }
                }
                for (var p in node2.style) {
                    if (node1.style[p] == null && node2.style[p].indexOf('auto') >= 0 && (!PropertyTable[p].default || node2.style[p] !== PropertyTable[p].default(nodeName))) {
                        node1.style[p] = node2.style[p]; // this could fix the problem of margin auto 0
                    }
                }
            }
            if (node1.childNodes) {
                for (var i = 0, len = node1.childNodes.length; i < len; i++) {
                    patch(node1.childNodes[i], node2.childNodes[i]);
                }
            }
            if (node1.pseudo) {
                for (var i in node1.pseudo) {
                    var keptProps = {};
                    for (let keptProp of propsKeptInNode1) {
                        if (node1.pseudo[i][keptProp]) keptProps[keptProp] = node1.pseudo[i][keptProp];
                    }
                    node1.pseudo[i] = extendObj(node2.pseudo[i], keptProps);
                }
            }
        };
        patch(metaShow, metaHide);
        return metaShow;
    };
    var getMetaData_test = function (dom) {
        var display = getComputedStyle(dom)['display'];
        dom.style.display = 'none';
        var re = getFullMetaData(dom);
        re.style.display = display;
        return re;
    };

    const reservedAttrs = {
        'a': ['href', 'target'],
        'img': ['src'],
        'input': ['placeholder', 'value', 'type'],
        'textarea': ['placeholder', 'value']
    };
    
    // notice: some attributes would be ignored by default, see variable 'ignoreTable' of function 'getAttributes'
    const ignoredAttrs = {
        'svg': [],
        'svg/*': [],
        'table': [],
        'table/*': []
    };
    
    var getAttributes = function (dom, ignoreAttrNames, allowAttrNames, filter) {
        var re = {}, ignoreTable = {
            'id': true,
            'class': true,
            'style': true
        };
        if (allowAttrNames) {
            for (let an of allowAttrNames) {
                var av = dom.getAttribute(an);
                if (av || av === '') {
                    re[an] = filter ? filter(an, av) : av;
                }
            }
            return re;
        }
        if (ignoreAttrNames) {
            for (let an of ignoreAttrNames) ignoreTable[an] = true;
        }
        var rawAttrs = dom.attributes;
        for (var i = 0, len = rawAttrs.length; i < len; i++) {
            var an = rawAttrs[i].name;
            if (ignoreTable[an]) continue;
            var av = rawAttrs[i].value;
            re[an] = filter ? filter(an, av) : av;
        }
        
        return re;
    };
    
    var cleanAttributes = function (dom) {
        while (dom.attributes.length > 0)
            dom.removeAttribute(dom.attributes[0].name);
        return dom;
    };
    
    var getFullMetaData = function (dom, keepAttrs, inSvg) {
        var type = dom.nodeName.toLowerCase();
        if (type === '#text') {
            return {
                nodeName: '#text',
                value: dom.nodeValue
            };
        }
        if (ignoreNodeName[type]) return null;
        
        inSvg = inSvg || (type === 'svg');
        
        var meta = {
            nodeName: type,
            style: getFullStyle(dom, null, inSvg)
        };
        
        if (keepAttrs) {
            meta.attrs = getAttributes(dom);
        } else if (ignoredAttrs[type]) {
            meta.attrs = getAttributes(dom, ignoredAttrs[type]);
        } else if (reservedAttrs[type]) {
            meta.attrs = getAttributes(dom, null, reservedAttrs[type], (attrName, attrValue) => {
                return ((attrName === 'href' || attrName === 'src') && conf.recoverUrlInAttr) ? recoverUrl(window.location.href, attrValue) : attrValue;
            });
        }
        
        if (ignoredAttrs[type + '/*']) {
            keepAttrs = true;
        }
        
        if (meta.attrs && Object.keys(meta.attrs).length === 0) {
            delete meta.attrs;
        }

        meta.pseudo = getPseudoElements(dom, meta.style, inSvg);
        if (!meta.pseudo) delete meta.pseudo;

        if (dom.childNodes.length) {
            meta.childNodes = [];
            dom.childNodes.forEach(function (el, i) {
                var childData = getFullMetaData(el, keepAttrs, inSvg);
                if (!childData) return true;
                if (childData.nodeName !== '#text') {
                    var dupProps = [];
                    for (var i in childData.style) {
                        if (!preventDefaultProps[childData.nodeName + ' ' + i]
                            && PropertyTable[i].inherit
                            && meta.style[i] === childData.style[i]) {
                            dupProps.push(i);
                        }
                    }
                    dupProps.forEach(function (p) {
                        delete childData.style[p];
                    });
                }
                meta.childNodes.push(childData);
            });
        }

        return meta;
    };

    var styleSheetData = {};
    var stringOfStyleObj = function (obj, indent) {
        indent = indent ? '\n    ' : '';
        var re = '';
        for (var p in obj) {
            re += indent + p + ('' === indent ? ':' : ': ') + obj[p] + ';';
        }
        return re;
    };

    DATA_FOR_ADDCSSRULE: {
        var nodeTypeCount = {};
        var cssRuleValueHash2Name = {};
        var cssRuleName2ValueHash = {};
    }
    var addCssRule = function (nodeName, obj, pseudo) {
        var self = obj;
        var selfHash = stringOfStyleObj(self).hashCode();
        
        var pseudoValues = {};
        var pseudoHashes = {};
        if (pseudo) {
            for (var p in pseudo) {
                pseudoValues[p] = pseudo[p] || undefined;
                pseudoHashes[p] = pseudoValues[p] ? stringOfStyleObj(pseudoValues[p]).hashCode() : undefined;
            }
        }

        if (cssRuleValueHash2Name[selfHash]) {
            var existingNameList = cssRuleValueHash2Name[selfHash];
            for (let existingName of existingNameList) {
                var consistent = true;
                for (var p in pseudoClassTable) {
                    if (cssRuleName2ValueHash[existingName + ':' + p] !== pseudoHashes[p]) {
                        consistent = false;
                        break;
                    }
                }
                if (consistent) {
                    return existingName;
                }
            }
        }
        
        if (!nodeTypeCount[nodeName]) nodeTypeCount[nodeName] = 0;
        nodeTypeCount[nodeName]++;
        var className = (conf.classNameModulePrefix ? (conf.moduleName + '-') : '') + (conf.classNameUpperCase ? nodeName.toUpperCase() : nodeName.toLowerCase()) + nodeTypeCount[nodeName];
        
        if (!cssRuleValueHash2Name[selfHash]) cssRuleValueHash2Name[selfHash] = [];
        cssRuleValueHash2Name[selfHash].push(className);
        for (var p in pseudoHashes) {
            if (pseudoHashes[p]) cssRuleName2ValueHash[className + ':' + p] = pseudoHashes[p];
        }
        cssRuleName2ValueHash[className] = selfHash;
        
        styleSheetData['.' + className] = self;
        for (var p in pseudoValues) {
            if (pseudoValues[p]) styleSheetData['.' + className + ':' + p] = pseudoValues[p];
        }
        
        return className;
    };

    var getHelperIframe = function (iframeSrc) {
        var iframeId = 'qwe123';
        var helperIframe;
        if (!window.frames[iframeId]) {
            helperIframe = document.createElement('iframe');
            helperIframe.id = iframeId;
            document.body.appendChild(helperIframe);
        } else {
            helperIframe = window.frames[iframeId];
        }
        if (iframeSrc) helperIframe.src = iframeSrc;
        return helperIframe;
    };

    var getNodeDefaultCS = function (nodeName, inSvg) {
        inSvg = inSvg || (nodeName === 'svg');
        var iframeIns = getHelperIframe();
        var iframeDoc = iframeIns.contentDocument;
        var iframeNodes = iframeDoc.getElementsByTagName(nodeName);
        var node;
        if (iframeNodes.length) node = iframeNodes[0];
        else {
            node = (!inSvg) ? iframeDoc.createElement(nodeName) : iframeDoc.createElementNS('http://www.w3.org/2000/svg', nodeName);
            iframeDoc.body.appendChild(node);
        }
        var re = extendObj({}, getComputedStyle(node));
        /*
        var originalDisplay = re['display'];
        node.style.display = 'none';
        re = extendObj({}, getComputedStyle(node), {
            display: originalDisplay
        });
        */
        ['transform-origin'].forEach(p => {
            if (!PropertyTable[p] || !PropertyTable[p].default) return;
            var dv = PropertyTable[p].default(nodeName);
            if (dv === false) return;
            re[propNameCamelify(p)] = dv;
        });
        return re;
    };
    
    var pl_extractCommonCssFromChildren = function (dom, styleData, metaData) {
        /* find all-children-share styles */
        var getChildrenCommonStyles = function (childNodes) {
            var minOfChildClassCount = 2;
            var minOfRepeatTime = 2;
            
            if (!childNodes) return null;
            // var validChildCount = 0;
            var childClassCount = 0;
            var childrenCssStat = {};
            var allChildrenHave = {};
            var checkedClasses = {};
            for (let child of childNodes) {
                if (child.nodeName === '#text') continue;
                // validChildCount++;
                if (checkedClasses[child.className]) continue;
                childClassCount++;
                checkedClasses[child.className] = true;
                var cs = styleData['.' + child.className];
                for (var i in cs) {
                    var key = i + ': ' + cs[i];
                    childrenCssStat[key] = (childrenCssStat[key] || 0) + 1;
                }
            }
            if (childClassCount >= minOfChildClassCount) {
                for (var i in childrenCssStat) {
                    if (childrenCssStat[i] < childClassCount) continue;
                    var splitPos = i.indexOf(': ');
                    allChildrenHave[i.substr(0, splitPos)] = i.substr(splitPos + 2);
                }
            }
            // console.log(allChildrenHave);
            return Object.keys(allChildrenHave).length >= minOfRepeatTime ? allChildrenHave : null;
        };
        
        /* index */
        var className2Nodes = {};
        var traverse = function (node, index = {}) {
            if (node.className) {
                if (!index[node.className]) index[node.className] = [];
                index[node.className].push(node);
            }
            if (node.childNodes) node.childNodes.forEach(child => { traverse(child, index); });
        };
        traverse(metaData, className2Nodes);
        
        var handler = function (node) {
            var className = node.className;
            if (!className) return;
            
            if (!node.followers) {
                var sameClassNodes = className2Nodes[className];
                var allChildNodes = sameClassNodes.reduce((prev, next) => { return (!next.childNodes ? prev : prev.concat(next.childNodes)); }, []);
                var commonStyles = getChildrenCommonStyles(allChildNodes);
                if (commonStyles) {
                    var checkedClasses = {};
                    var allIncluded = true;
                    for (let child of allChildNodes) {
                        if (child.nodeName === '#text') continue;
                        if (checkedClasses[child.className]) continue;
                        checkedClasses[child.className] = true;
                        var childSameClassNodes = className2Nodes[child.className];
                        for (let scn of childSameClassNodes) {
                            if (allChildNodes.indexOf(scn) < 0) {
                                allIncluded = false;
                                break;
                            }
                        }
                        if (!allIncluded) break;
                    }
                    if (allIncluded) {
                        styleData['.' + className + '>*'] = commonStyles;
                        sameClassNodes.forEach(v => { v.followers = commonStyles; });
                        
                        for (var c in checkedClasses) {
                            for (var i in commonStyles) {
                                delete styleData['.' + c][i];
                            }
                        }
                    }
                }
            }
            
            if (node.childNodes) {
                for (let child of node.childNodes) {
                    if (child.nodeName === '#text') continue;
                    handler(child);
                }
            }
        };
        
        handler(metaData);
    };
    
    var pl_overflowCombine = function (dom, styles = {}) {
        for (var sel in styles) {
            var s = styles[sel];
            if (s['overflow-x'] && (s['overflow-x'] === s['overflow-y'])) {
                s['overflow'] = s['overflow-x'];
                delete s['overflow-x'];
                delete s['overflow-y'];
            }
        }
    };
    var pl_borderCombile = function (dom, styles = {}) {
        for (var sel in styles) {
            var s = styles[sel];
            if (s['border-top'] && s['border-right'] && s['border-bottom'] && s['border-left']) {
                var bt = s['border-top'];
                var br = s['border-right'];
                var bb = s['border-bottom'];
                var bl = s['border-left'];
                if (bt === br && bt === bb && bt === bl) {
                    s['border'] = bt;
                    delete s['border-top'];
                    delete s['border-right'];
                    delete s['border-bottom'];
                    delete s['border-left'];
                }
            }
        }
    };
    var plugins = [pl_overflowCombine, pl_borderCombile];
    var plugin = function (handler) {
        plugins.push(handler);
    };
    plugins.push(pl_extractCommonCssFromChildren);

    var buildDom = function (meta, inSvg) {
        if (meta.nodeName === '#text') {
            return document.createTextNode(meta.value);
        }
        inSvg = inSvg || (meta.nodeName === 'svg');
        if (inSvg) {
            var dom = document.createElementNS('http://www.w3.org/2000/svg', meta.nodeName);
        } else {
            var dom = document.createElement(meta.nodeName);
        }

        if (meta.attrs) {
            for (var k in meta.attrs) {
                dom.setAttribute(k, meta.attrs[k]);
            }
        }
        
        var className = addCssRule(meta.nodeName, meta.style, meta.pseudo);
        dom.setAttribute('class', className);
        
        meta.className = className;

        if (meta.childNodes) {
            meta.childNodes.forEach(function (child) {
                dom.appendChild(buildDom(child, inSvg));
            });
        }

        return dom;
    };

    var extendObj = function (dest, src = {}) {
        for (var i in src) {
            dest[i] = src[i];
        }
        return dest;
    };
    var presentDom = function (dom, moduleName, options) {
        
        initData();
        
        extendObj(conf, options);
        if (moduleName) conf.moduleName = moduleName;
        moduleName = conf.moduleName;
        
        var styleSheet = document.createElement('style');
        var ndom;
        
        var output = () => {
            var outputData = {
                name: moduleName,
                type: conf.generateType,
                style: styleSheet.innerHTML,
                html: (ndom.nodeName === 'body') ? ndom.innerHTML : ndom.outerHTML
            };
            console.log(outputData);
            
            if (typeof chrome !== 'undefined') {
                chrome.runtime.sendMessage(
                    JSON.parse(JSON.stringify(outputData)),
                    function (response) {
                        console.log(response);
                    });
            }
            
            var postData = new FormData();
            postData.append('json', JSON.stringify(outputData));
            if (conf.pullContent) {
                fetch(conf.serverHost + '/post', {
                    method: 'post',
                    mode: 'cors',
                    headers: {
                        'Accept': '*'
                    },
                    body: postData
                }).then(function (res) { return res.json(); })
                .then(function (res) {
                    if (res.code === 200) {
                        console.log('[SUCCESS] to save the content.');
                    } else {
                        console.error('[ERROR] to save the content.');
                    }
                });
            }
        };
        
        var promises = [];
        
        if (conf.fetchFont) {
            promises.push(getFontFaces().then(results => {
                styleSheet.innerHTML = results.map(result => result.join('\n')).join('\n') + '\n' + styleSheet.innerHTML;
                console.log('[SUCCESS] to get all font-face rules.');
            }).catch(() => {
                console.error('[ERROR] to get all font-face rules.');
            }));
        }
        
        var rootMeta = getMetaData(dom);
        document.head.innerHTML = '';
        cleanAttributes(document.body).innerHTML = '';
        if (rootMeta.nodeName !== 'body') document.body.style.margin = '0';
        document.head.appendChild(styleSheet);
        
        ndom = buildDom(rootMeta); // will add a `className` to each valid node in `rootMeta`
        
        PLUGINS: plugins.forEach(pl => pl.call(null, ndom, styleSheetData, rootMeta));
        
        SET_MODULE_NAME: {
            var moduleClassNameAlready = ndom.getAttribute('class');
            var moduleClassAlone = !ndom.getElementsByClassName(moduleClassNameAlready).length;
            rootMeta.className = moduleClassAlone ? moduleName : (moduleName + ' ' + moduleClassNameAlready);
            ndom.setAttribute('class', rootMeta.className);
            for (var sel in styleSheetData) {
                if (!styleSheetData[sel]) {
                    delete styleSheetData[sel];
                    continue;
                }
                if (sel === '.' + moduleClassNameAlready || sel.startsWith('.' + moduleClassNameAlready + ':')
                    || sel.startsWith('.' + moduleClassNameAlready + '>')) {
                    if (moduleClassAlone) {
                        var selector = '.' + moduleName + sel.substr(1 + moduleClassNameAlready.length);
                        styleSheetData[selector] = styleSheetData[sel];
                        delete styleSheetData[sel];
                        continue;
                    } else {
                        styleSheetData['.' + moduleName + sel] = styleSheetData[sel];
                    }
                }
                styleSheetData['.' + moduleName + ' ' + sel] = styleSheetData[sel];
                delete styleSheetData[sel];
            }
        }
        
        var styles = [];
        for (var sel in styleSheetData) {
            styles.push([sel, styleSheetData[sel]]); 
        }
        styleSheet.innerHTML += styles
            .filter(rule => (Object.keys(rule[1]).length > 0))
            .map(rule => rule[0] + ' {' + stringOfStyleObj(rule[1], true) + '\n}').join('\n');

        if (rootMeta.nodeName !== 'body') document.body.appendChild(ndom);
        else {
            document.body.setAttribute('class', ndom.getAttribute('class'));
            document.body.innerHTML = ndom.innerHTML;
        }
        
        Promise.all(promises).then(() => output());
    };
    
    var initData = function () {
        styleSheetData = {};
        nodeTypeCount = {};
        cssRuleValueHash2Name = {};
        cssRuleName2ValueHash = {};
    };

    window.fespider = {
        getMetaData: getMetaData,
        present: presentDom,
        plugin: plugin
    };

})();
