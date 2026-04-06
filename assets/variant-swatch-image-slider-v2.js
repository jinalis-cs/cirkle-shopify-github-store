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
        this.productCard = this.closest('.prod-card-slide');
        //console.log(this);
      }

      connectedCallback() {
        this.productImages = this.productCard.querySelector('.product-images');
        this.swatchRadio = this.querySelectorAll('input[type="radio"]');

        // Get variant metadata
        const variantMetaScript = this.productImages?.querySelector('script[data-variant-metafields]');
        console.log(variantMetaScript);
        if (variantMetaScript) {
          this.varianJSONData = JSON.parse(variantMetaScript.textContent);
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
          slidesPerView: 1,
          spaceBetween: 10,
          allowTouchMove: false,
          loop: false,
          navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          },
          breakpoints: {
            320: {
              slidesPerView: 2
            },
            480: {
              slidesPerView: 3
            },
            640: {
              slidesPerView: 4
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
        const sliders = this.productImages.querySelectorAll('.prod-img-slider');
        const mq = this.mq || window.matchMedia('(max-width: 767px)');
         
        sliders.forEach((slider) => {
          if (mq.matches) {
            if (!slider.swiper) {
              new Swiper(slider, {
                slidesPerView: 1,
                spaceBetween: 10,
                pagination: {
                  el: this.productCard.querySelector('.cstm-swiper-pagination'),
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
        const value = radio.value;
        const vid = Number(radio.dataset.variantId);
        const variant = this.varianJSONData.filter((item) => item.id == vid)[0];
        const variantPrice = Shopify.formatMoney(variant.price, window.shopify_money);
        const variantCPrice = Shopify.formatMoney(variant.price, window.shopify_money);

        this.productCard.querySelector('.prod-price').innerHTML = variantPrice;
        this.productCard.querySelector('.product-variant-id').value = vid;
        console.log(variant);
        this.updateImages(variant.images); 
      }

      updateImages(images) {
        if (!images || !images.length) return;

        /* Desktop image */
        const desktopWrap = this.productCard.querySelector('.prod-featured-img-wrap.desktop');
        if (desktopWrap) {
          desktopWrap.innerHTML = `
            <img
              src="${images[0].src}"
              alt="${images[0].alt || ''}"
              class="featured-image"
              loading="lazy"
            >
            
          `;
        }

        /* Mobile image slider */
        const mobileSliderWrap = this.productCard.querySelector('.prod-img-container');
        const swiperEl = mobileSliderWrap?.querySelector('.prod-img-slider');

        if (!swiperEl) return;

        const wrapper = swiperEl.querySelector('.swiper-wrapper');
        wrapper.innerHTML = '';

        images.forEach(img => {
          wrapper.insertAdjacentHTML(
            'beforeend',
            `<div class="image-slide swiper-slide">
              <img
                src="${img.src}"
                alt="${img.alt || ''}"
                loading="lazy"
                sizes="(min-width: 990px) 25vw, (min-width: 750px) 33vw, 50vw"
              >
            </div>`
          );
        });

        /* Swiper handling */
        const mq = this.mq || window.matchMedia('(max-width: 767px)');
        if (swiperEl.swiper) {
          swiperEl.swiper.update();
          swiperEl.swiper.slideTo(0, 0);
        } else {
          if (mq.matches) {
            new Swiper(swiperEl, {
              slidesPerView: 1,
              spaceBetween: 10,
              loop: false,
              pagination: {
                el: this.productCard.querySelector('.cstm-swiper-pagination'),
                clickable: true
              },
              watchOverflow: true
            });
          }
        }
      }
    }
  );
}