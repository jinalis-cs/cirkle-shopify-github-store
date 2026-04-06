if (!customElements.get('variant-swatchs')) {
  customElements.define(
    'variant-swatchs',
    class VariantSwatchs extends HTMLElement {
      constructor() {
        super();
        this.swiper = null;
        this.swatchs = this;
        this.variantData = null;
        this.prodListSlider = null;
        this.mq = null;
        //console.log(this);
      }

      connectedCallback() {
        const gridItem = this.closest('.grid__item');
        if (!gridItem) return;

        this.productImages = gridItem.querySelector('product-images');
        this.swatchRadio = this.querySelectorAll('input[type="radio"]');

        // Get variant metadata
        const variantMetaScript = this.productImages?.querySelector('script[data-variant-metafields]');
        if (variantMetaScript) {
          this.variantData = JSON.parse(variantMetaScript.textContent);
        }
        
        this.initProductListSlider();
        this.initProdImgSlider();
        // this.attachSwatchListeners();
        
        this.mq = window.matchMedia('(max-width: 767px)');
        this.mq.addEventListener('change', () => this.initProdImgSlider());
        
        this.swatchRadio.forEach((radio) => {
          radio.addEventListener('change', () => this.attachSwatchListeners(radio));
        });
      }

      initProductListSlider() {
        const cstmPrevBtn = document.querySelector('.cstm-prev-btn');
        const cstmNextBtn = document.querySelector('.cstm-next-btn');
        
        if (!cstmPrevBtn || !cstmNextBtn) return;

        this.prodListSlider = new Swiper('.prod-list-slider', {
          slidesPerView: 3,
          spaceBetween: 10,
          allowTouchMove: false,
          loop: false,
          navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          },
          breakpoints: {
            320: {
              slidesPerView: 2,
              spaceBetween: 20
            },
            480: {
              slidesPerView: 3,
              spaceBetween: 30
            },
            640: {
              slidesPerView: 3,
              spaceBetween: 40
            }
          },
          on: {
            init: (swiper) => this.syncCustomButtons(swiper, cstmPrevBtn, cstmNextBtn),
            slideChange: (swiper) => this.syncCustomButtons(swiper, cstmPrevBtn, cstmNextBtn),
            reachBeginning: (swiper) => this.syncCustomButtons(swiper, cstmPrevBtn, cstmNextBtn),
            reachEnd: (swiper) => this.syncCustomButtons(swiper, cstmPrevBtn, cstmNextBtn),
            fromEdge: (swiper) => this.syncCustomButtons(swiper, cstmPrevBtn, cstmNextBtn),
          },
        });

        cstmPrevBtn.addEventListener('click', (e) => {
          e.preventDefault();
          if (this.prodListSlider && !this.prodListSlider.isBeginning) {
            this.prodListSlider.slidePrev();
          }
        });

        cstmNextBtn.addEventListener('click', (e) => {
          e.preventDefault();
          if (this.prodListSlider && !this.prodListSlider.isEnd) {
            this.prodListSlider.slideNext();
          }
        });
      }

      initProdImgSlider() {
        const sliders = document.querySelectorAll('.prod-img-slider');
        const mq = this.mq || window.matchMedia('(max-width: 767px)');
        
        sliders.forEach((slider) => {
          if (mq.matches) {
            if (!slider.swiper) {
              new Swiper(slider, {
                slidesPerView: 1,
                spaceBetween: 10,
                pagination: {
                  el: slider.querySelector('.swiper-pagination'),
                  clickable: true,
                },
              });
            }
          } else {
            if (slider.swiper) {
              slider.swiper.destroy(true, true);
            }
          }
        });
      }

      syncCustomButtons(swiper, cstmPrevBtn, cstmNextBtn) {
        if (!cstmPrevBtn || !cstmNextBtn) return;
        
        if (swiper.isBeginning) {
          cstmPrevBtn.classList.add('swiper-button-disabled');
        } else {
          cstmPrevBtn.classList.remove('swiper-button-disabled');
        }

        if (swiper.isEnd) {
          cstmNextBtn.classList.add('swiper-button-disabled');
        } else {
          cstmNextBtn.classList.remove('swiper-button-disabled');
        }
      }

      attachSwatchListeners(radio) {
        console.log(radio);
        // Add your swatch listener implementation here
      }
    }
  );
}