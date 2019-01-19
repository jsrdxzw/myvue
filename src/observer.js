//add getter and setter to vm.$data
//data listener

class Observer {
    constructor(data) {
        this.data = data
        this.walk(data)
        this.dep = new Dep()
    }

    //iterate data , add getter and setter
    walk(data) {
        if (!data || typeof data !== 'object') {
            return
        }
        Object.keys(data).forEach((key) => {
            this.defineReactive(data, key, data[key])
            //intercept such as {car:{brand:'benz'}}
            this.walk(data[key])
        })
    }

    //intercept data
    defineReactive(obj, key, value) {
        const that = this
        //modify existing property
        Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,
            get() {
                //store the observer
                Dep.target && that.dep.addSub(Dep.target)
                return value
            },
            set(newValue) {
                if (value === newValue) {
                    return
                }
                value = newValue
                //if newValue is a object
                if (typeof value === 'object'){
                    that.walk(value)
                }

                //notify all the subscribers
                that.dep.notify()
            }
        })
    }

}
