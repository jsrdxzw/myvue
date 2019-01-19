class Compile {
    constructor(el, vm) {
        //el selector
        this.el = typeof el === 'string' ? document.querySelector(el) : el
        //vm instance of vue
        this.vm = vm

        //compile template
        //can not compile dom structure one by one, recommend to use fragment
        if (this.el) {
            //compile fragment in memory and let it to render page finally
            const fragment = this.node2fragment(this.el)

            //now the page renders nothing because the doms have been set into fragment
            // console.log(fragment)
            //handle fragment and compile
            this.compile(fragment)

            //render page
            this.el.appendChild(fragment)
        }
    }


    node2fragment(node) {
        const fragment = document.createDocumentFragment()
        //add sub-node to fragment
        const childNodes = Array.from(node.childNodes) // like-array to array
        childNodes.forEach((item) => {
            fragment.appendChild(item)
        })
        return fragment
    }

    compile(fragment) {
        const childNodes = Array.from(fragment.childNodes)
        childNodes.forEach((node) => {
            //judge if the node is textNode or elementNode
            //textNode {{}} will be compiled
            if (this._isElementNode(node)) {
                //directive will be compiled
                this._compileElement(node)
            }
            if (this._isTextNode(node)) {
                //{{}} will be compiled
                this._compileText(node)
            }

            //if the node has child node，we need do recursion
            if (node.childNodes && node.childNodes.length > 0) {
                this.compile(node)
            }
        })
    }

    _isElementNode(node) {
        //1 is element node 3 is text node
        return node.nodeType === 1
    }

    _isTextNode(node) {
        //1 is element node 3 is text node
        return node.nodeType === 3
    }

    //compile element node
    _compileElement(node) {
        //get all attributes of node
        const attributes = Array.from(node.attributes)
        attributes.forEach((attr) => {
            //get name of attribute
            const attrName = attr.name
            if (this._isDirective(attrName)) {
                const type = attrName.substr('v-'.length)
                const value = attr.value
                // if (type === 'text') {
                //     CompileUtil[type](node, this.vm, value)//data -> render
                // }
                // if (type === 'html') {
                //     node.innerHTML = this.vm.$data[value]
                // }
                // if (type === 'model') {
                //     node.value = this.vm.$data[value]
                // }

                if (this._isEventDirective(type)) {
                    //compile event type
                    CompileUtil.eventHandler(node, this.vm, type, value)
                } else {
                    //compile other directive
                    if (CompileUtil.hasOwnProperty(type)) {
                        CompileUtil[type](node, this.vm, value)
                    }
                }
            }
        })
    }

    //compile text node such as {{}}
    _compileText(node) {
        CompileUtil.mustache(node, this.vm)
    }

    _isDirective(attrName) {
        return attrName.startsWith('v-')
    }

    //on:click,on:mouseover
    _isEventDirective(attr) {
        return attr.split(':')[0] === 'on'
    }

}

//compile tool
//avoid to many if-else
const CompileUtil = {
    mustache(node, vm) {
        const content = node.textContent
        //we need to parse the {{}} explain and render data
        const reg = /\{\{(.+)\}\}/
        if (reg.test(content)) {
            const expr = reg.exec(content)[1]
            const value = this.getVMValue(vm, expr)
            node.textContent = content.replace(reg, value)
            new Watcher(vm, expr, (newValue) => {
                node.textContent = content.replace(reg, newValue)
            })
        }
    },
    //parse v-text
    text(node, vm, value) {
        node.textContent = this.getVMValue(vm, value)
        //watch data
        new Watcher(vm, value, (newValue) => {
            node.textContent = newValue
        })

    },
    html(node, vm, value) {
        node.innerHTML = this.getVMValue(vm, value)
        new Watcher(vm, value, (newValue) => {
            node.innerHTML = newValue
        })
    },
    model(node, vm, expr) {
        node.value = this.getVMValue(vm, expr)
        const that = this
        node.addEventListener('input', function () {
            that.setVMValue(vm, expr, this.value)
        })
        new Watcher(vm, expr, (newValue) => {
            node.value = newValue
        })
    },
    eventHandler(node, vm, type, value) {
        const eventType = type.split(':')[1]
        const fn = vm.$methods && vm.$methods[value]
        if (eventType && fn) {
            node.addEventListener(eventType, fn.bind(vm))
        }
    },
    //get vue model data
    getVMValue(vm, expr) {
        //get data in vue
        let data = vm.$data
        // if data like {
        //   car:{color:'red'}
        // }
        // we need extract value 'red'
        expr.split('.').forEach((item) => {
            data = data[item]
        })
        return data
    },
    setVMValue(vm, expr, value) {
        let data = vm.$data
        const arr = expr.split('.')
        arr.forEach((key, index) => {
            //if index is last one
            if (index < arr.length - 1) {
                data = data[key]
            } else {
                data[key] = value
            }
        })
    }
}

