document.addEventListener('click', function (e) {

  /* --------------------------
     APPLY DISCOUNT
  ---------------------------*/
  const applyBtn = e.target.closest('.btn-apply');
  if (applyBtn) {
    addDiscount(e);
    return;
  }

  /* --------------------------
     REMOVE DISCOUNT
  ---------------------------*/
  const removeBtn = e.target.closest('.remove-discount');
  if (removeBtn) { console.log(66666);
    removeDiscount(e);
    return;
  }

});


var addDiscount = async (e) => {
  e.preventDefault();
  let target = e.target;
  let cartWrapper = target.closest('[data-cart]');
  let cartDiscountContent = cartWrapper?.querySelector('.cart-discount-content');
  let cartType = cartDiscountContent.dataset.source;
  let discountErrorWrap = cartDiscountContent?.querySelector('.discount-error-wrap');
  let discountCode = cartDiscountContent.querySelector('.input_discount').value;
  let cartSource =  target.dataset.source;
  let itemsId = document.getElementById('main-cart-items')?.dataset.id;
  let footerId = document.getElementById('main-cart-footer')?.dataset.id;
  let sections = [itemsId, footerId, 'cart-drawer', 'cart-icon-bubble'];

  const existingDiscount = existingDiscounts(target);
  if(existingDiscount.includes(discountCode)) return;
  
  existingDiscount.push(discountCode);   
  
  const body = JSON.stringify({ discount: existingDiscount.join(','),sections: sections, sections_url: window.location.pathname });
    
  try {
    const response = await fetch(`${routes.cart_update_url}`, {
      ...fetchConfig(),
      body
    });
    
    const data = await response.json();
   
    if(data.discount_codes.length > 0 && data.discount_codes.find((discount) => {
      return discount.code === discountCode && discount.applicable == false
    })){ 
      cartDiscountContent.querySelector('.discount').value = '';
      discountErrorWrap.classList.remove('hidden');
      console.log('error-wrap',cartDiscountContent.querySelector('.discount-error-wrap'));
    }else{      

      if (cartType === 'cart-drawer') {
        const cartDrawer = document.querySelector('cart-drawer');
        cartDrawer?.renderContents(data);
        //console.log(cartDiscountContent.querySelector('.drawer_discount_applied'));
        // document.querySelector('.drawer_discount_applied').style.display = "block";
        // setTimeout(function() {
        //     document.querySelector('.drawer_discount_applied').style.display = "none";
        // }, 3000);
      }else if(cartType === 'main-cart'){ 

        const mainCartItmes = document.querySelector('#main-cart-items');
        mainCartItmes.innerHTML = data.sections[itemsId];
        const mainCartFooter = document.querySelector('#main-cart-footer');
        mainCartFooter.innerHTML = data.sections[footerId];
        
        // document.querySelector('.main_cart_discount_applied').style.display = "block";
        // setTimeout(function() {
        //     document.querySelector('.main_cart_discount_applied').style.display = "none";
        // }, 3000);
      } 
    }    
    
  } catch (error) {
    console.error('Discount apply error:', error);
  }
}

var existingDiscounts = (target) => {
  let discountCodes1 = [];
  console.log(target.closest('.cart-discount-content'));
  const discountPills = target.closest('.cart-discount-content').querySelectorAll('.discount-item');
  discountCodes1 = Array.from(discountPills)
    .filter(pill => pill instanceof HTMLLIElement && pill.dataset.discountCode)
    .map(pill => pill.dataset.discountCode);
  return discountCodes1;
}

var removeDiscount = async (e) => {
  e.preventDefault();
  let target = e.target.closest('.discount-item');
  let cartWrapper = target.closest('[data-cart]');
  let cartDiscountContent = cartWrapper.querySelector('.cart-discount-content');
  let cartType = cartDiscountContent.dataset.source;
  let discountCode = target.dataset.discountCode;
  let existingDiscount = existingDiscounts(target);
  let itemsId = document.getElementById('main-cart-items')?.dataset.id;
  let footerId = document.getElementById('main-cart-footer')?.dataset.id;
  let sections = [itemsId, footerId, 'cart-drawer', 'cart-icon-bubble'];
  
  const index = existingDiscount.indexOf(discountCode);
  
  if (index === -1) return;

  existingDiscount.splice(index, 1);
  const body = JSON.stringify({ discount: existingDiscount.join(','),sections: sections, sections_url: window.location.pathname });  

  try {
    const response = await fetch(`${routes.cart_update_url}`, {
      ...fetchConfig(),
      body
    });
    
    const data = await response.json();
    if(data.discount_codes.length > 0 &&  data.discount_codes.find((discount) => {
      return discount.code == discountCode && discount.applicable == false
    })){
      cartDiscountContent.querySelector('.discount').value = '';
      cartDiscountContent.querySelector('.discount-error-wrap').classList.remove('hidden');
    }   

    if (cartType == 'cart-drawer') {
      const cartDrawer = document.querySelector('cart-drawer');
      cartDrawer?.renderContents(data);
    }
    if (cartType == 'main-cart') { 
        const mainCartItmes = document.querySelector('#main-cart-items');
        mainCartItmes.innerHTML = data.sections[itemsId];
        const mainCartFooter = document.querySelector('#main-cart-footer');
        mainCartFooter.innerHTML = data.sections[footerId];
    }
  } catch (error) {
    console.error('Discount apply error:', error);
  }
}