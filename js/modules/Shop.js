import { products} from "../../products/products.js"
import BaseComponent from "./generic/BaseComponent.js" 

const rootSelector = '[data-js-shop]'

class Shop extends BaseComponent {

    products = products

    activeSuggestionIndex = -1
    
    stateClasses = {
        hide: 'hide',
        dNone: 'd-none',
        isDisabled:'is-disabled',
        isCurrent: 'is-current',
        isOpen: 'is-open',
    }

    selectors = {
        shopPage: '[data-js-shop-page]',
        headerHero:'[data-js-shop-hero]',
        headerTrendy: '[data-js-shop-trendy]',
        
        searchButton: '[data-js-shop-search-button]',
        clearSearchButton: '[data-js-shop-clear-button]',
        searchInput:'[data-js-shop-input]',
        suggestions: '[data-js-shop-suggestions]',
        
        product:'[data-js-shop-product]',
             
        cart:'[data-js-shop-cart]',
        cartButton:'[data-js-shop-cart-button]',
        cartList: '[data-js-shop-cart-list]',
        clearCart: '[data-js-shop-clear-cart]',
        cartCounter:'[data-js-shop-cart-counter]',
        totalPrice: '[data-js-shop-total-price]',
        checkoutButton: '[data-js-shop-checkout-button]',
    }

    initialState = {
        cart: [],
        filteredProducts: [],
        isSearching: false,
    }
    
    

    constructor(rootElement) { 
        super()

        this.rootElement = rootElement

        // Поиск всех элементов по селекторам
        Object.keys(this.selectors).forEach(key => {
             if (key === 'product') {          
                this[`${key}Els`] = Array.from(this.rootElement.querySelectorAll(this.selectors[key]));
            } else {
 
                this[`${key}El`] = this.rootElement.querySelector(this.selectors[key]);
            }
        });

        this.shopPageChildren = Array.from(this.shopPageEl.children);

        this.suggestionItems = [] 
        
        this.searchResultsEl = document.createElement('section');
        this.searchResultsEl.className = `catalog catalog--search-results ${this.stateClasses.dNone}`;
        this.searchResultsEl.innerHTML = `
            <div class="catalog__inner container">
                <div class="catalog__grid"></div>
            </div>
        `;
        this.shopPageEl.appendChild(this.searchResultsEl); 

        this.searchResultsGridEl = this.searchResultsEl.querySelector('.catalog__grid');


        let initialCart = []
        try {
            const storedCart = JSON.parse(localStorage.getItem('shopCart'));
            initialCart = Array.isArray(storedCart) ? storedCart : [];
        } catch (e) {
            initialCart = [];
        }

    

        this.state = this.getProxyState({
            ...this.initialState,
            cart: initialCart,                  
            filteredProducts: [...this.products],
        })


        //Настройка Fuse.js

        const fuseOptions = {
            keys: [
                { name: 'name', weight: 1 },
            ],
            // Порог чувствительности к опечаткам:
            threshold: 0.4,


            // Искать совпадения по всей строке, независимо от расположения
            ignoreLocation: true,

            // Минимальное количество символов для запуска поиска
            minMatchCharLength: 1
        };

        this.fuse = new Fuse(this.products, fuseOptions);

        
        this.init()
        this.bindEvents()
    }

    init() {
        this.renderCards()
        this.updateUI()
    }

    //! Вызывается автоматически при любом изменении this.state.
    updateUI() {
        localStorage.setItem('shopCart', JSON.stringify(this.state.cart))
        this.renderCart()
        this.renderCatalog()
    }
 

    //! URL
    //* Метод для обновления URL браузера
    updateURL() {
        const url = new URL(window.location);
    
        // Синхронизируем параметр search
        const searchText = this.searchInputEl.value.trim();
        if (searchText === '') {
            url.searchParams.delete('search');
        } else {
            url.searchParams.set('search', searchText);
        }

        // Сохраняем в историю
        window.history.pushState({search: searchText }, '', url);
    }
    
    onPopState = () => {
        // Параметры url после "?"
        const urlParams = new URLSearchParams(window.location.search);

        const searchFromUrl = urlParams.get('search') || '';

        // Синхронизаация значение поля поиска и страницы
        if (this.searchInputEl) {
            this.searchInputEl.value = searchFromUrl;
        }

        this.filterProducts(searchFromUrl)
    }
   
    //! КАРТОЧКИ ТОВАРОВ

    //* Метод определяет тип карточки и вызывает нужный метод
    renderCards() {
        this.productEls.forEach(cardEl => {
            const id = parseInt(cardEl.dataset.jsShopProductId);
            const productInfo = this.products.find(product => product.id === id);
            
            if (!productInfo) return;

            switch (true) {
                case cardEl.classList.contains('header__trendy-card'):
                    this.renderTrendyCard(cardEl, productInfo);
                    break;
                case cardEl.classList.contains('header__slider-card'):
                    this.renderSliderCard(cardEl, productInfo);
                    break;
                case cardEl.classList.contains('product-card--catalog'):
                    this.renderCatalogCard(cardEl, productInfo);
                    break;
            }
        });
    }
    //* Рендер catalog
    renderCatalog = () => {
        const { isSearching, filteredProducts, cart } = this.state

        if(isSearching){
            this.shopPageChildren.forEach(el => el.classList.add(this.stateClasses.dNone));
            this.headerHeroEl.classList.add(this.stateClasses.dNone)
            this.headerTrendyEl.classList.add(this.stateClasses.dNone)

            
            this.searchResultsGridEl.innerHTML = '';
            this.searchResultsEl.classList.remove(this.stateClasses.dNone);

            if (filteredProducts.length === 0) {
                this.searchResultsGridEl.innerHTML = '<p>Nothing found.</p>';
            } 
            else {

                filteredProducts.forEach(p => {

                    // Ищем, есть ли товар в корзине и выбор нужных элементов взаимодействия
                    let actionHtml = this.createActionHtml(p.id);

                    

                    // Создание карточки товара
                    const productCard = document.createElement('div')
                    productCard.className = 'product-card product-card--catalog transp-background'
                    productCard.setAttribute('id', p.name)
                    productCard.setAttribute('data-js-shop-product', '')
                    productCard.setAttribute('data-js-shop-product-id', p.id)
                    productCard.innerHTML = `
                        
                                <picture>
                                    <source srcset="${p.image}" type="image/webp">
                                                    
                                    <img class="product-card__img" src="${p.imageReserve}">
                                </picture>
                                <div class="product-card__info product-card__info--catalog">
                                    <h3>
                                        ${p.name}
                                    </h3>
                                    <p>It needs bright, diffused light, a stable room temperature, moderately moist soil, and fairly high air humidity.</p>
                                    <div class="product-card__bottom">
                                        <div class="product-card__price">${p.price}$</div>
                                        <div class="product-card__actions actions" data-js-shop-actions-id="${p.id}">
                                            ${actionHtml}
                                        </div>
                                    </div>
                                </div>    
                    
                    `
                    this.searchResultsGridEl.appendChild(productCard)

            })
        }
        } 
        else {
            this.searchResultsEl.classList.add(this.stateClasses.dNone);
            this.shopPageChildren.forEach(el => el.classList.remove(this.stateClasses.dNone));
            this.headerHeroEl.classList.remove(this.stateClasses.dNone)
            this.headerTrendyEl.classList.remove(this.stateClasses.dNone)
        }
        if (cart.length !== 0) {
            cart.forEach(item => this.updateProductButton(item.id));
        }
    }

    //* Trendy-карточка 
    renderTrendyCard(cardEl, p) {
        cardEl.querySelector('source').srcset = p.image;
        cardEl.querySelector('.header__trendy-img').src = p.imageReserve;
        cardEl.querySelector('h3').textContent = p.trendyTitle ?? p.name;
        cardEl.querySelector('p').textContent = p.description;
        cardEl.querySelector('.header__trendy-card-price').textContent = `${p.price}$`;
        cardEl.querySelector('.header__explore').setAttribute('href', `#${p.name.replace(/\s+/g, '-')}`);

        const actionsEl = cardEl.querySelector('.header__trendy-actions');
        actionsEl.dataset.jsShopActionsId = p.id;
        actionsEl.innerHTML = this.createActionHtml(p.id);
    }

    //* Slider-карточка 
    renderSliderCard(cardEl, p) {
        cardEl.querySelector('source').srcset = p.image;
        cardEl.querySelector('.product-card__img').src = p.imageReserve;
        cardEl.querySelector('[data-js-shop-slider-name]').textContent = p.name;
        cardEl.querySelector('.button').setAttribute('href', `#${p.name.replace(/\s+/g, '-')}`);
    }

    //* catalog карточка 
    renderCatalogCard(cardEl, p) {
        cardEl.querySelector('source').srcset = p.image;
        cardEl.querySelector('.product-card__img').src = p.imageReserve;
        cardEl.querySelector('h3').textContent = p.name;
        cardEl.querySelector('.product-card__info--catalog p').textContent = p.description;
        cardEl.querySelector('.product-card__price').textContent = `${p.price}$`;

        const actionsEl = cardEl.querySelector('.product-card__actions');
        actionsEl.dataset.jsShopActionsId = p.id;
        actionsEl.innerHTML = this.createActionHtml(p.id);
    }

    //* Общий шаблон для actions карточек
    createActionHtml(id) {
        const cartItem = this.state.cart.find(item => item.id === id);

        if (cartItem) {
            return `
                <div class="actions__quantity-controls">
                    <button class="actions__quantity-controls-button" data-js-shop-product-id="${id}" data-delta="-1">-</button>
                    <span>${cartItem.quantity}</span>
                    <button class="actions__quantity-controls-button" data-js-shop-product-id="${id}" data-delta="1">+</button>
                </div>
            `;
        }

        return `<button class="actions__cart-button button" data-js-shop-product-id="${id}"><img src="./img/cart-white.svg" alt=""></button>`;
    }
  
    //! КОРЗИНА
    
    //* Рендер корзины
    renderCart = () => {
        const { cart } = this.state
        const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        // Очистка предыдущего HTML-кода
        this.cartListEl.innerHTML = ''

        // Инициализация счетчика для расчета общей суммы заказа
        let total = 0

        // Обработка пустой корзины
        if (cart.length === 0) {
            this.cartListEl.innerText = 'Корзина пуста'
            this.totalPriceEl.innerText = '0 $'
            this.cartCounterEl.innerText = totalCount
            this.checkoutButtonEl.classList.add(this.stateClasses.isDisabled) 
            this.checkoutButtonEl.ariaDisabled = 'true'
            return
        }

        // Генерация списка товаров
        cart.forEach(item => {
            total += item.price * item.quantity

            // Создание отдельного элемента товара
            const itemEl = document.createElement('div')
            itemEl.className = 'cart__item'
            itemEl.innerHTML = `
                <span class="cart__item-name">${item.name}</span>
                <div class="cart-item__actions actions">
                    <div class="actions__quantity-controls actions__quantity-controls--cart">
                        <button class="actions__quantity-controls-button" data-js-shop-product-id="${item.id}" data-delta="-1">-</button>
                        <span class="actions__quantity-controls-amount">${item.quantity}</span>
                        <button class="actions__quantity-controls-button" data-js-shop-product-id="${item.id}" data-delta="1">+</button>
                    </div>
                </div>
                <span class="cart__item-price">${item.price * item.quantity}$</span>
                `
            this.cartListEl.appendChild(itemEl)
        })

        this.totalPriceEl.innerText = `${total} $`
        this.cartCounterEl.innerText = totalCount   
        this.checkoutButtonEl.classList.remove(this.stateClasses.isDisabled) 
        this.checkoutButtonEl.ariaDisabled = 'false'
    }

    //* Очистка корзины
    clearCart = () => {
        // Собираем id всех товаров, которые были в корзине, до её очистки
        const clearedIds = this.state.cart.map(item => item.id);

        
        this.state.cart = []

        
        clearedIds.forEach(id => this.updateProductButton(id));
    }

    //* Открытие/закрытие панели корзины по клику
    toggleCart = () => {
        const isOpen = this.cartEl.classList.toggle(this.stateClasses.isOpen);
        this.cartButtonEl.setAttribute('aria-expanded', String(isOpen));
    }
 
    closeCart = () => {
        this.cartEl.classList.remove(this.stateClasses.isOpen);
        this.cartButtonEl.setAttribute('aria-expanded', 'false');
    }

    //! ИЗМЕНЕНИЕ КОЛЛИЧЕСТВА

    //* Добавление товара из каталога в корзину
    addToCart = (e) => {

        const addBtn = e.target.closest('.actions__cart-button');

        if (addBtn) {
            const id = parseInt(addBtn.dataset.jsShopProductId);
            const product = this.products.find(p => p.id === id);
           
            this.state.cart = [...this.state.cart, { ...product, quantity: 1 }];
        }

    }

    //* По какому именно элементу в корзине кликнул пользователь и извлекает параметры товара.
    onChangeQuantityClick = (e) => {
        const quantityBtn = e.target.closest('.actions__quantity-controls-button'); 

        if (quantityBtn) {
            const id = parseInt(quantityBtn.dataset.jsShopProductId);
            const delta = parseInt(quantityBtn.dataset.delta);
            this.changeQuantity(id, delta);
        }
    }

    //* Изменение количества конкретного товара в корзине
    changeQuantity(id, delta) {
        const item = this.state.cart.find(i => i.id === id)

        if (!item) return

        const newQuantity = item.quantity + delta

        if (newQuantity <= 0) {
            this.state.cart = this.state.cart.filter(i => i.id !== id);
            this.updateProductButton(id);
        } else {
            this.state.cart = this.state.cart.map(i =>
                i.id === id ? { ...i, quantity: newQuantity } : i
            );
        }
    }

      //* Метод для точечного обновления кнопки
    updateProductButton(id) {
        // Ищем обертку кнопок конкретного товара в документе
        const actionWrappers = document.querySelectorAll(`[data-js-shop-actions-id="${id}"]`);
        
        // Если товара сейчас нет на странице, ничего не делаем
        if (actionWrappers.length === 0) return;

        // Проверяем, есть ли товар в корзине
        let actionHtml = this.createActionHtml(id);
        
        actionWrappers.forEach(actionWrapper => actionWrapper.innerHTML = actionHtml)
    
    }


    //! ПОИСК

    onSearchButton = () => { 
             
        const query = this.searchInputEl.value.trim();      
        this.filterProducts(query)
        this.updateURL(); 

        window.scrollTo({ top: 0, behavior: 'smooth' })

    }
    
    clearInput = () => {    
        this.searchInputEl.value = '';
        this.searchInputEl.focus();
        this.onSearchButton(); 
    }

    filterProducts(query){
        const isSearch = query.length > 0

        this.state.filteredProducts = isSearch
            ? this.fuse.search(this.fixLayout(query)).map(({ item }) => item)
            : [...this.products]

        this.state.isSearching = isSearch
    }

    fixLayout = (text) => {
        const ru = "йцукенгшщзхъфывапролджэячсмитьбю.ЙЦУКЕНГШЩЗХЪФЫВАПРОЛДЖЭЯЧСМИТЬБЮ,";
        const en = "qwertyuiop[]asdfghjkl;'zxcvbnm,./QWERTYUIOP{}ASDFGHJKL:\"ZXCVBNM<>?";

        return text.split('').map(char => {
            const index = ru.indexOf(char);
            return index !== -1 ? en[index] : char;
        }).join('');
    }
    
    //! ПОДСКАЗКИ

    //* Показать/скрыть список подсказок
    toggleSuggestions = (isVisible) => {
        this.suggestionsEl.classList.toggle(this.stateClasses.hide, !isVisible)
        this.searchInputEl.setAttribute('aria-expanded', String(isVisible))

        if (!isVisible) this.setActiveSuggestion(-1)
    }

    onKeydown = (e) => {
        const items = this.suggestionItems
        const isOpen = items.length > 0 && !this.suggestionsEl.classList.contains(this.stateClasses.hide)
        
        switch (e.key) {
            case 'ArrowDown':
                if (items.length === 0) return
                e.preventDefault()

                // Список закрыт — первое нажатие просто открывает его
                if (!isOpen) {
                    this.toggleSuggestions(true)
                    return
                }

                this.setActiveSuggestion((this.activeSuggestionIndex + 1) % items.length)
                break

            case 'ArrowUp':
                if (!isOpen) return
                e.preventDefault() 

                this.setActiveSuggestion(
                    this.activeSuggestionIndex <= 0 ? items.length - 1 : this.activeSuggestionIndex - 1
                )
                break

            case 'Enter':
                if (isOpen && this.activeSuggestionIndex >= 0) {
                    e.preventDefault()
                    this.selectSuggestion(items[this.activeSuggestionIndex].textContent.trim())
                } else {
                    this.toggleSuggestions(false)
                    this.onSearchButton()
                }
                break

            case 'Escape':
                if (isOpen) {
                    e.stopPropagation()
                    this.toggleSuggestions(false)
                }
                break
        }
    }
    
   

    renderSuggestions = () => {
        const query = this.searchInputEl.value.trim()

        this.suggestionsEl.innerHTML = ''
        this.suggestionItems = []       
        this.setActiveSuggestion(-1)


        const results = this.fuse.search(this.fixLayout(query))

        if (results.length === 0) {
            this.toggleSuggestions(false)
            return
        }

        this.toggleSuggestions(true)

        results.slice(0, 5).forEach(({ item }, index) => {
            const itemEl = document.createElement('div')
            itemEl.id = `${this.suggestionsEl.id}-option-${index}` 
            itemEl.className = 'search__suggestions-item'
            itemEl.setAttribute('role', 'option')
            itemEl.textContent = item.name
            itemEl.addEventListener('click', () => this.selectSuggestion(item.name))

            this.suggestionsEl.appendChild(itemEl)
            this.suggestionItems.push(itemEl)
        })
    }

     //* Подсветить подсказку с индексом 
    setActiveSuggestion = (index) => {
        this.activeSuggestionIndex = index
        const items = this.suggestionItems

        items.forEach((el, i) => {
            const isCurrent = i === index
            el.classList.toggle(this.stateClasses.isCurrent, isCurrent)
            el.setAttribute('aria-selected', String(isCurrent))
        
        })

        const activeEl = items[index]

        if (activeEl) {
            this.searchInputEl.setAttribute('aria-activedescendant', activeEl.id)

        } else {
            this.searchInputEl.removeAttribute('aria-activedescendant')
        }
    }

    //* Выбор подсказки (клик мышью или Enter)
    selectSuggestion = (name) => {
        this.searchInputEl.value = name
        this.toggleSuggestions(false)
        this.onSearchButton()
    }



    bindEvents() { 

        this.searchButtonEl.addEventListener('click', this.onSearchButton)
        this.searchInputEl.addEventListener('keydown', this.onKeydown)
        this.searchInputEl.addEventListener('input', this.renderSuggestions)

        this.clearSearchButtonEl.addEventListener('click', this.clearInput)
        

        this.rootElement.addEventListener('click', (e) => {
            this.addToCart(e);
            this.onChangeQuantityClick(e);
        });

        this.cartButtonEl.addEventListener('click', this.toggleCart)
        this.clearCartEl.addEventListener('click', this.clearCart)

        this.checkoutButtonEl.addEventListener('click', (e) => {
            if (this.state.cart.length === 0) {
                e.preventDefault();
            }
        })
        

        window.addEventListener('popstate', this.onPopState);

       document.addEventListener('click', (e) => {
            const path = e.composedPath();

            if (!path.includes(this.searchInputEl) && !path.includes(this.suggestionsEl)) {
                this.toggleSuggestions(false);  
            }
            if (!path.includes(this.cartEl)) {
                this.closeCart();
            }
        });
            
    }
}

class ShopCollection {
    constructor() {
        this.init()
    }

    init() {    
        document.querySelectorAll(rootSelector).forEach((element) => {
           new Shop(element)
        })
    }
}

export default ShopCollection