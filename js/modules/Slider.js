
const rootSelector = '[data-js-slider]'


class Slider {
    selectors = {
        swiper:'[data-js-slider-swiper]',
        navigation:'[data-js-slider-navigation]',
        prevButton:'[data-js-slider-previous-button]',
        nextButton:'[data-js-slider-next-button]',
        pagination:'[data-js-slider-pagination]',
    }

    constructor(rootElement, customOptions = {}) {
      this.rootElement = rootElement;
      this.customOptions = customOptions;

      Object.keys(this.selectors).forEach(key => {
        if (key === 'prevButton' || key === 'nextButton') {
          // Ищем ВСЕ кнопки через querySelectorAll и конвертируем NodeList в обычный массив
          this[`${key}Elements`] = Array.from(this.rootElement.querySelectorAll(this.selectors[key]));
        } else {
          // Для остальных элементов ищем только первый попавшийся
          this[`${key}Element`] = this.rootElement.querySelector(this.selectors[key]);
        }
      });
      
      this.init();
    }

    init() {

      const defaultOptions = {
        slidesPerView:1, 
        slidesPerGroup:1,
        spaceBetween: 48,
        
        observer: true,          
        observeParents: true,    
        observeSlideChildren: true, 
        };

      
      if (this.paginationElement) {
        defaultOptions.pagination = { el: this.paginationElement };
      }

      if (this.prevButtonElements?.length || this.nextButtonElements?.length) {
        defaultOptions.navigation = {
          prevEl: this.prevButtonElements.length ? this.prevButtonElements : null,
          nextEl: this.nextButtonElements.length ? this.nextButtonElements : null,
        };
      }

      // Объединяем базовые настройки с пользовательскими 
      const finalOptions = { ...defaultOptions, ...this.customOptions };

     
      this.swiper = new Swiper(this.swiperElement, finalOptions);
    }
}


class SliderCollection {
  constructor() {
    this.init();
  }

  init() {

    document.querySelectorAll(rootSelector).forEach(element => {
      
      let customOptions = {};

      if (element.classList.contains('header-slider')) {
        customOptions = {
          loop: true,
          slidesPerView: 'auto',
          autoplay: {
            delay: 3000, 
            disableOnInteraction: true 
          }

          
        };
      }

      new Slider(element, customOptions);
    });
  }
}



export default SliderCollection

