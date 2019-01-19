/*
* watcher is the bridge of compile model and observer model
*/

class Watcher {

    constructor(vm, expr, cb) {
        this.vm = vm
        this.expr = expr
        this.cb = cb

        Dep.target = this
        //compare oldValue with newValue
        this.oldValue = this.getVMValue(vm, expr)

        Dep.target = null

    }

    //update data to render view
    update() {
        //compare expr , if changed callback cb
        const oldValue = this.oldValue
        const newValue = this.getVMValue(this.vm, this.expr)
        if (oldValue !== newValue) {
            this.cb(newValue, oldValue)
        }
    }

    //get vue model data
    getVMValue(vm, expr) {
        //get data in vue
        let data = vm.$data
        // if data like car.color
        // we need extract value 'red'
        expr.split('.').forEach((item) => {
            data = data[item]
        })
        return data
    }

}

//Dep is used to manage all the subscribers and notify them
class Dep {
    constructor() {
        //store subscribers
        this.subs = []
    }

    addSub(watcher) {
        this.subs.push(watcher)
    }

    notify() {
        this.subs.forEach((sub) => {
            sub.update()
        })
    }
}
