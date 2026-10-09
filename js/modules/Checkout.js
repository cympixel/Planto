const rootSelector = '[data-js-checkout]';

class Checkout {

    stateClasses = {
        isActive: 'pagination__btn--active', 
        hide: 'hide',
    }

    selectors = {
        checkoutPage: '[data-js-checkout-page]',
        checkoutForm: '[data-js-checkout-form]',

        orderSummary: '[data-js-checkout-order-summary]',
        orderSubmit: '[data-js-checkout-order-submit]',

        modal: '[data-js-checkout-modal]',
        modalText: '[data-js-checkout-modal-text]',
        modalIcon:'[data-js-checkout-modal-icon]'
    }


    constructor(rootElement) {
        this.rootElement = rootElement
        

        Object.keys(this.selectors).forEach(key => {
            this[`${key}El`] = this.rootElement.querySelector(this.selectors[key]);
        });

       
        try {
            this.cart = JSON.parse(localStorage.getItem('shopCart')) || [];
        } catch (e) {
            this.cart = [];
        }

        this.init();
        // this.bindEvents();
    }

    init() {
        console.log('123123')
        this.updateOrderSummary();
        // this.checkSubmitButton();
    }

    updateOrderSummary() {
        const totalSum = this.cart.reduce((sum, item) => sum + (item.price *  item.quantity ), 0);
        this.cart.forEach(i => console.log(i.quantity))
        this.orderSummaryEl.innerHTML = `

            <div class="checkout__summary-cart">

            ${this.cart.map(i => `
                <div class="checkout__summary-item">
                    <picture>
                        <source srcset="${i.image}" type="image/webp">
                                        
                        <img class="checkout__summary-item-image" src="${i.imageReserve}" alt="${i.name}">
                    </picture>

                    <div class="checkout__summary-item-details">
                        <h3 class="checkout__summary-item-name">${i.name} x${i.quantity}</h3>
                        <span class="checkout__summary-item-price">${i.price * i.quantity}$</span>
                    </div>
                </div>
            `).join('')}
               
            </div>

            <div class="checkout__summary-totals">
                <div class="checkout__summary-total-row">
                    <span class="checkout__summary-total-label">Subtotal</span>
                    <span class="checkout__summary-total-value">${totalSum}</span>
                </div>
                <div class="checkout__summary-total-row">
                    <span class="checkout__summary-total-label">Shipping</span>
                    <span class="checkout__summary-total-value">5$</span>
                </div>
                
                <div class="checkout__summary-total-row checkout__summary-total-row--final">
                    <span class="checkout__summary-total-label">Total</span>
                    <span class="checkout__summary-total-value"> ${totalSum + 5} $</span>
                </div>
            </div>
        `;
    }

    bindEvents() {
        this.inputNameEl.addEventListener('input', this.checkSubmitButton);
        this.checkoutFormEl.addEventListener('submit', this.placeOrder);
        
        this.modalEl.addEventListener('click',this.closeModal)

    }
}

class CheckoutCollection {
    constructor() {
        this.init()
    }

    init() {
        document.querySelectorAll(rootSelector).forEach((element) => {
            new Checkout(element)
        })
    }  
}


export default CheckoutCollection