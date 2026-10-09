const rootSelector = '[data-js-input-mask]'

class InputMask{
    selectors={
        root:rootSelector
    }

    constructor(rootElement){
        this.rootElement = rootElement
        this.init()
    }

    init(){
        const mask = this.rootElement.getAttribute(
           this.selectors.root.substring(1, this.selectors.root.length - 1)
        )
        
        IMask(this.rootElement, {mask})
    }
}

class InputMaskCollection{
    constructor(){
        this.init()
    }

    init(){
        document.querySelectorAll(rootSelector).forEach((element)=>{
            new InputMask(element)
        })
    }
}


export default InputMaskCollection