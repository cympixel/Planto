const rootSelector = '[data-js-search]'

class Search {
  stateClasses = {
        isActive:'active',     
        isLock:'is-lock',
        hide:'hide',
        visuallyHidden:'visually-hidden'  
    }

    selectors = {
        searchButton: '[data-js-search-button]',
        overlay: '[data-js-search-overlay]',    
        
        fieldWrapper: '[data-js-search-field]',
        navigation:'[data-js-navigation]'
    }

  constructor(rootElement) {
    this.rootElement = rootElement

     Object.keys(this.selectors).forEach(key => {
             if (key === 'navigation') {   
                this[`${key}Element`] = this.rootElement.closest('header')?.querySelector(this.selectors[key]);
            } else {
            
                this[`${key}Element`] = this.rootElement.querySelector(this.selectors[key]);
            }
      });

    this.searchInputElement = this.rootElement.querySelector('#search-field');
    this.headerLogoElement = document.querySelector('.header__logo')
    
    this.bindEvents()
  }


    toggleSearch= () =>{
        this.searchButtonElement.classList.toggle(this.stateClasses.isActive)
        this.overlayElement.classList.toggle(this.stateClasses.isActive);
        this.navigationElement.classList.toggle(this.stateClasses.hide);
        this.headerLogoElement.classList.toggle(this.stateClasses.hide, window.matchMedia('(width < 800px)').matches && this.overlayElement.classList.contains(this.stateClasses.isActive))

        

        if (this.searchButtonElement.classList.contains(this.stateClasses.isActive)) {
          // Задержка гарантирует фокус, если overlay открывается с CSS-анимацией
          setTimeout(() => this.searchInputElement?.focus(), 50)
        } else {
          // Возвращаем фокус на кнопку открытия при закрытии
          this.searchButtonElement?.focus()
        }
    }  

    onEscapeKeyDown = (e) => {
        if (e.key === 'Escape' && this.overlayElement.classList.contains(this.stateClasses.isActive)) {
        this.toggleSearch();
        }
    }
    onCtrlKKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
          event.preventDefault();
          this.toggleSearch();
      }
    }

    bindEvents() {
        this.searchButtonElement.addEventListener('click', this.toggleSearch);
        document.addEventListener('keydown', this.onEscapeKeyDown);
        document.addEventListener('keydown', this.onCtrlKKeyDown);
    
  }
    }

class SearchCollection {
  constructor() {
    this.init()
  }

  init() {
    document.querySelectorAll(rootSelector).forEach((element) => {
      new Search(element)
    })
  }
}

export default SearchCollection