class Vue {
    constructor(options = {}) {
        this.$el = options.el
        this.$data = options.data
        this.$methods = options.methods
        new Observer(this.$data)
        this.proxy(this.$data)
        this.proxy(this.$methods)
        if (this.$el) {
            new Compile(this.$el, this)
        }
    }

    proxy(data) {
        //proxy vm.$data properties to vue instance
        Object.keys(data).forEach((key) => {
            Object.defineProperty(this, key, {
                enumerable: true,
                configurable: true,
                get() {
                    return data[key]
                },
                set(v) {
                    if (v === data[key]) return
                    data[key] = v
                }
            })
        })
    }
}
