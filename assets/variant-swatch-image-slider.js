if (!customElements.get('variant-swatchs')) {
  customElements.define(
    'variant-swatchs',
    class VariantSwatchs extends HTMLElement {
      constructor() {
        super();
        this.swiper = null;
        this.variantData = null;
      }

      connectedCallback() {
        const gridItem = this.closest('.grid__item');
        if (!gridItem) return;

        this.productImages = gridItem.querySelector('variant-images');
        this.swatchRadio = this.querySelectorAll('.option_circles input[type="radio"]');

        // Get variant metadata
        const variantMetaScript = this.productImages?.querySelector('script[data-variant-metafields]');
        if (variantMetaScript) {
          this.variantData = JSON.parse(variantMetaScript.textContent);
        }

        this.initializeSwiperSlider();
        this.attachSwatchListeners();
      }

      initializeSwiperSlider() {
        const slider = this.closest('.grid__item').querySelector('variant-images .prod_card_variant_slider');
        if (!slider || this.swiper) return;

        // Change the wrapper class to match Swiper's expectations
        const wrapper = slider.querySelector('.swipper_wrapper');
        if (wrapper) {
          wrapper.classList.add('swiper-wrapper');
        }

        // Create custom pagination element if it doesn't exist
        let customPagination = slider.querySelector('.custom-pagination');
        if (!customPagination) {
          customPagination = document.createElement('div');
          customPagination.className = 'custom-pagination';
          customPagination.style.cssText = `
            position: absolute;
            bottom: 10px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 10;
            background: white;
            padding: 8px 16px;
            border-radius: 25px;
            border: 1px solid #e0e0e0;
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 13px;
            font-weight: 500;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          `;
          slider.appendChild(customPagination);
        }

        this.swiper = new Swiper(slider, {
          loop: true,
          slidesPerView: 1,
          spaceBetween: 10,
          speed: 400,
          navigation: {
            nextEl: slider.querySelector('.swiper-button-next'),
            prevEl: slider.querySelector('.swiper-button-prev'),
          },
          on: {
            init: (swiper) => {
              this.updateCustomPagination(swiper);
            },
            slideChange: (swiper) => {
              this.updateCustomPagination(swiper);
            }
          }
        });
      }

      updateCustomPagination(swiper) {
        const slider = swiper.el;
        const customPagination = slider.querySelector('.custom-pagination');
        if (!customPagination) return;

        const realIndex = swiper.realIndex + 1;
        const totalSlides = swiper.slides.length - (swiper.loopedSlides ? swiper.loopedSlides * 2 : 0);

        customPagination.innerHTML = `
          <button class="prev-btn" style="
            border: none;
            background: none;
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
            font-size: 18px;
            color: #333;
            transition: opacity 0.2s;
            line-height: 1;
          " onmouseover="this.style.opacity='0.6'" onmouseout="this.style.opacity='1'">‹</button>
          
          <div style="
            position: relative;
            width: 40px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          ">
            <span class="current-number" style="
              position: absolute;
              transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              font-weight: 500;
            ">${realIndex}</span>
          </div>
          
          <span style="color: #999;">|</span>
          
          <span style="color: #666; font-weight: 400;">${totalSlides}</span>
          
          <button class="next-btn" style="
            border: none;
            background: none;
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
            font-size: 18px;
            color: #333;
            transition: opacity 0.2s;
            line-height: 1;
          " onmouseover="this.style.opacity='0.6'" onmouseout="this.style.opacity='1'">›</button>
        `;

        // Attach click events to custom buttons
        const prevBtn = customPagination.querySelector('.prev-btn');
        const nextBtn = customPagination.querySelector('.next-btn');

        prevBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.animateNumberChange(customPagination, 'prev');
          swiper.slidePrev();
        });

        nextBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.animateNumberChange(customPagination, 'next');
          swiper.slideNext();
        });
      }

      animateNumberChange(paginationEl, direction) {
        const currentNumber = paginationEl.querySelector('.current-number');
        if (!currentNumber) return;

        // Determine animation direction
        const translateY = direction === 'next' ? '-100%' : '100%';
        const translateYFrom = direction === 'next' ? '100%' : '-100%';

        // Animate out
        currentNumber.style.transform = `translateY(${translateY})`;
        currentNumber.style.opacity = '0';

        // Animate in after a short delay
        setTimeout(() => {
          currentNumber.style.transition = 'none';
          currentNumber.style.transform = `translateY(${translateYFrom})`;
          currentNumber.style.opacity = '0';

          // Force reflow
          currentNumber.offsetHeight;

          // Animate in
          currentNumber.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
          currentNumber.style.transform = 'translateY(0)';
          currentNumber.style.opacity = '1';
        }, 150);
      }

      attachSwatchListeners() {
        this.swatchRadio.forEach((radio) => {
          radio.addEventListener('click', (e) => {
            const variantId = parseInt(e.target.dataset.variantId);
            if (variantId) {
              this.updateSliderImages(variantId);
            }
          });

          radio.addEventListener('change', (e) => {
            const variantId = parseInt(e.target.dataset.variantId);
            if (variantId) {
              this.updateSliderImages(variantId);
            }
          });

          const label = radio.closest('.option_circles')?.querySelector('label');
          if (label) {
            label.addEventListener('click', (e) => {
              const input = label.querySelector('input');
              if (input) {
                const variantId = parseInt(input.dataset.variantId);
                if (variantId) {
                  setTimeout(() => {
                    this.updateSliderImages(variantId);
                  }, 50);
                }
              }
            });
          }
        });
      }

      updateSliderImages(variantId) {
        if (!this.variantData || !this.swiper) return;

        const variant = this.variantData.variants.find(v => v.id === variantId);
        if (!variant || !variant.images) return;
        
        const swiperWrapper = this.swiper.el.querySelector('.swipper_wrapper');
        if (!swiperWrapper) return;

        const slides = swiperWrapper.querySelectorAll('.swiper-slide');
        
        variant.images.forEach((imagePath, index) => {
          if (slides[index]) {
            const img = slides[index].querySelector('img');
            if (img) {
              img.src = `${imagePath}?width=533&t=${Date.now()}`;
            }
          }
        });
        
        this.swiper.update();
        this.swiper.updateSlides();
        this.swiper.updateProgress();
        this.swiper.updateSlidesClasses();
        this.swiper.slideTo(0, 0);
      }
    }
  );
}