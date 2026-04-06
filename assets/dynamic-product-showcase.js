document.addEventListener('DOMContentLoaded', function() {

  console.log(window.allProductHandle);


    const section = document.querySelector('.dynamic-product-showcase');
    const sectionId = section.dataset.sectionId;
    const grid = section.querySelector('.product-grid');
    const button = section.querySelector('.js-load-more');
    const btnAddToCarts = section.querySelectorAll('.btn-addtocart');
    let tagArr = [], availabilityArr = [];
    let min = document.querySelector('input[name="min-price"]').dataset.min;
    let max = document.querySelector('input[name="max-price"]').dataset.max;

    /* Start: Product add to cart */
    grid.addEventListener('click', function(e) {
        const btn = e.target.closest('.btn-addtocart');
        if (!btn) return;
        e.preventDefault();
        const variant_id = btn.dataset.vid;
        //productAddToCart(variant_id);
    });

    function productAddToCart(variant_id){
        let sections = ['cart-drawer', 'cart-icon-bubble'];
        fetch(window.Shopify.routes.root + 'cart/add.js', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                                id: variant_id,
                                quantity: 1,
                                sections: sections
                            }),
        })
        .then((res) => res.json())
        .then((response) => { 
            const cartbtn = document.querySelector('#cart-icon-bubble');
            const cartDrawer = document.querySelector('cart-drawer');
            
            cartDrawer.classList.remove('is-empty');    
            cartDrawer.renderContents(response);
            setTimeout(() => {   
                cartbtn.dispatchEvent(new Event("click", { bubbles: true })); 
            }, 800);
                    
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }
    /* End: Product add to cart */

    /* Start: Load more */
    if (!button) return; 

    const limit = parseInt(button.dataset.limit, 10);
    let page = 1;

    // button.addEventListener('click', function() {
    //   page++;
    //   const products = window.allProducts;
    //   const start = (page - 1) * limit;
    //   const end = page * limit;      
    //   const productCards = products.slice(start, end);
      
    //   productCards.forEach(product => {
    //     const div = document.createElement('div');
    //     div.className = 'grid__item product-card';
    //     div.dataset.tags = product.tags;
    //     div.dataset.price = product.price;
    //     div.dataset.available = product.available;

    //     // Build product card HTML
    //     let priceHtml = '';
    //     if (product.compare_at_price && product.compare_at_price > product.price) {
    //       priceHtml = `<s class="old-price">${Shopify.formatMoney(product.compare_at_price, window.shopify_money)}</s>
    //                    <span class="sale-price">${Shopify.formatMoney(product.price, window.shopify_money)}</span>
    //                    <span class="badge">Sale</span>`;
    //     } else {
    //       priceHtml = `<span class="price">${Shopify.formatMoney(product.price, window.shopify_money)}</span>`;
    //     }

    //     let availabilityHtml = '';
    //     if (product.available) {
    //       availabilityHtml = `<button type="button" class="btn-addtocart button" data-vid="${product.selected_variant_id}">Add to Cart</button>`;
    //     } else {
    //       availabilityHtml = `<span class="badge">Out of Stock</span>`;
    //     }

    //     div.innerHTML = `
    //       <div class="product-card-info">
    //         <a href="${product.url}" class="full-unstyled-link">
    //             <img src="${product.featured_image || ''}" alt="${product.title}">
    //             <h3>${product.title}</h3>
    //         </a>
    //         ${priceHtml}
    //         ${availabilityHtml}
    //       </div>
    //     `;

    //     grid.appendChild(div);
    //   });

    //   // Hide button if no more products
    //   if (end >= products.length) {
    //     button.style.display = 'none';
    //   }
    // });
    /* End: Load more */

    // document.querySelector('.filters').addEventListener('change', function(e) {
    //   const target = e.target;
    //   if(target.closest('.chk-tag')){
    //     const checkbox = target.closest('.chk-tag').querySelector('input[type="checkbox"]');
    //     const value = checkbox.value;        
    //     if(checkbox.checked){
    //       tagArr.push(value);   
    //     }else{
    //       const index = tagArr.indexOf(value);          
    //       if(index > -1) tagArr.splice(index,1);
    //     }
    //     renderProducts();
    //   }

    //   if(target.closest('.chk-availability')){
    //     const checkbox = target.closest('.chk-availability').querySelector('input[type="checkbox"]');
    //     const value = checkbox.value;
    //     if(checkbox.checked){
    //       availabilityArr.push(value);   
    //     }else{
    //       const index = availabilityArr.indexOf(value);          
    //       if(index > -1) availabilityArr.splice(index,1);
    //     } 
    //     renderProducts();
    //   }
    // });

    document.querySelector('.filters').addEventListener('keydown', function(e) {
      const target = e.target;
      const value = parseInt(target.value);      
      // (target.name == 'min-price') ? min = value : max = value;
      if(target.name == 'min-price'){
        document.querySelector('input[name="min-price"], input[name="max-price"]').dataset.min = value;
        min = value*100;
      }else{
        document.querySelector('input[name="min-price"], input[name="max-price"]').dataset.max = value;
        max = value*100;
      }
      // min = parseInt(target.dataset.min);
      // max = parseInt(target.dataset.max);
     
      renderProducts();

    });

    const renderProductCard = (product) => {

      console.log(product.id);

    }

    function renderProducts() {  
      let productArr = window.allProducts.slice(); // start with all products
      let priceHtml = '';

      console.log(productArr);
      console.log(min);
      console.log(max);
      productArr = productArr.filter(product => product.price > min && product.price < max);
      
      if(availabilityArr.length > 0){ 
        productArr = productArr.filter(product => availabilityArr.includes(`${product.available}`));
      }
      
      if(tagArr.length > 0){     
        console.log('tagArr',tagArr);   
        productArr = productArr.filter(product => {
          const productTags = product.tags.split(',').map(tag => tag.trim());
          return tagArr.every(tag => productTags.includes(tag));
        });
      }
      console.log('productArr', productArr);
      grid.innerHTML = '';
      productArr.forEach(product => {
        const div = document.createElement('div');
        div.className = 'grid__item product-card';
        div.dataset.tags = product.tags;
        div.dataset.price = product.price;
        div.dataset.available = product.available;

        // Build product card HTML
        let priceHtml = '';
        if (product.compare_at_price && product.compare_at_price > product.price) {
          priceHtml = `<s class="old-price">${Shopify.formatMoney(product.compare_at_price, window.shopify_money)}</s>
                       <span class="sale-price">${Shopify.formatMoney(product.price, window.shopify_money)}</span>
                       <span class="badge">Sale</span>`;
        } else {
          priceHtml = `<span class="price">${Shopify.formatMoney(product.price, window.shopify_money)}</span>`;
        }

        let availabilityHtml = '';
        if (product.available) {
          availabilityHtml = `<button type="button" class="btn-addtocart button" data-vid="${product.selected_variant_id}">Add to Cart</button>`;
        } else {
          availabilityHtml = `<span class="badge">Out of Stock</span>`;
        }

        div.innerHTML = `
          <div class="product-card-info">
            <a href="${product.url}" class="full-unstyled-link">
                <img src="${product.featured_image || ''}" alt="${product.title}">
                <h3>${product.title}</h3>
            </a>
            ${priceHtml}
            ${availabilityHtml}
          </div>
        `;

        console.log(div);
        
        grid.appendChild(div);
      });
     
    }
});