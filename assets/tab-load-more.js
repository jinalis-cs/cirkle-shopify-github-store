class TabCollections{
    constructor(){
        this.tabs = document.querySelectorAll('.collection-tab');
        this.tabContants = document.querySelectorAll('.collection-tab-content');
        this.productSlider = document.querySelectorAll('.product-image-slider');
        this.tabs.forEach((tab) => {
            tab.addEventListener('click', this.changetab.bind(this));
        });
        this.btnloadMore = document.querySelectorAll('.js-load-more');
        document.addEventListener('click', (event) => {
            if (event.target.classList.contains('js-load-more')) {
                this.loadExtraProducts(event);
            }
        });
        const firstActiveTab = document.querySelector('.collection-tab-content.active');
        if (firstActiveTab) {
            this.initializeSwipers(firstActiveTab);
        }
    } 

    initializeSwipers(scope) {
        const sliderOptions = {
            loop: false, // 🔴 IMPORTANT (see note below)
            speed: 600,
            slidesPerView: 1,
            spaceBetween: 5,
            effect: 'slide',
            grabCursor: true,
            observer: true,
            observeParents: true,
            navigation: {
                nextEl: scope.querySelector('.swiper-button-next'),
                prevEl: scope.querySelector('.swiper-button-prev')
            },
            scrollbar: {
                el: scope.querySelector('.swiper-scrollbar'),
                draggable: true
            }
        };

        scope.querySelectorAll('.product-image-slider').forEach(slider => {
            if (!slider.swiper) {
                new Swiper(slider, sliderOptions);
            }
        });        
    }

    changetab(event){
        event.preventDefault();
        const target = event.target;
        this.tabs.forEach((el) => el.classList.remove('active'));
        this.tabContants.forEach((el) => el.classList.remove('active'));
        target.classList.add('active');
        const targetContent = document.getElementById(target.dataset.tab);
        targetContent.classList.add('active');
        this.initializeSwipers(targetContent);
    }

    loadExtraProducts(event){
        event.preventDefault();
        const button = event.target;

        const collectionHandle = button.dataset.collection;
        const limit = Number(button.dataset.limit);
        const currentShow = Number(button.dataset.currentShow);
        const total = Number(button.dataset.total);

        const activeTabContent = button.closest('.collection-tab-content');
        const productList = activeTabContent.querySelector('.product-grid');

        fetch(`${window.Shopify.routes.root}collections/${collectionHandle}?view=load-more-prod-card`)
            .then(resp => resp.text())
            .then((responseText) => {
                const html = new DOMParser().parseFromString(responseText, 'text/html');
                const newProducts = html.querySelectorAll('.cstm-prod-list .product-card');

                let addedCount = 0;

                newProducts.forEach((product, index) => {
                    if (index >= currentShow && addedCount < limit) {
                        productList.appendChild(product);
                        addedCount++;
                    }
                });

                const updatedShow = currentShow + addedCount;
                button.dataset.currentShow = updatedShow;

                // Hide button if all products are loaded
                if (updatedShow >= total) {
                    button.style.display = 'none';
                }
            });
    } 
}

new TabCollections();