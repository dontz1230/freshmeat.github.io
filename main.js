//先 const 各個需要的元件吧
//1.設 cart 為空的數列
//2.設 class : 取得產品
//3.設 class : 從Products取得東西並呈現UI畫面
//4.DOMContentLoaded 開始執行囉

const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");
const cartFooter = document.querySelector('.cart-footer')

//1.設 cart 為空的數列
let cart = [];
//buttons
let buttonsDOM = [];

//2.設 class : 取得產品
class Products {
  async getProducts(){
    
    try {
      const JSONUrl = 'https://api.myjson.com/bins/18olrh';
      let result = await fetch(JSONUrl);
      let resultJSON = await result.json();
      let products = resultJSON.items;
      
      //使用map整理一下獲得的資料return出自己要的
      products = products.map( item => {
        const {title,price} = item.fields;
        const {id} = item.sys;
        const image = item.fields.image.fields.file.url
        return {
          title, price, id, image
        }
      })
      
      return products

    } catch(error) {
      console.log(error)
    }
   
    
  }
}

//3.設 class : 從Products取得東西並呈現UI畫面
class UI {
  //會先從products.getProducts()中取得{}然後再用THEN回傳
  displayProducts(products){
    let result = '';
    products.forEach(product => {
      result += `<!-- START 單一產品 -->
 <article class="product">
          <div class="img-container">
            <img src=${product.image} 
                 alt="產品01" 
                 class="product-img">
            <button class="bag-btn" data-id=${product.id}>
              <i class="fa fa-shopping-cart"></i>
              選購
            </button>
          </div>
          <h3>${product.title}</h3>
          <h4>$${product.price}</h4>
        </article> 
        <!-- END 單一產品 -->`
    });
    productsDOM.innerHTML = result;
  }
  
  //加入購物車
  getBagButtons(){
    //不使用nodelist，在前後加上[...dom內容]把他轉成array
    const buttons = [...document.querySelectorAll('.bag-btn')];
    buttonsDOM = buttons;
    
    //find() 回傳第一個滿足測試函式的元素。否則回傳 undefined。
    buttons.forEach(button =>{
      let id = button.dataset.id;
      let inCart = cart.find(item => item.id === id);
      if(inCart){
        button.innerText = "已購買";
        button.disabled= true;
      } else {
        button.addEventListener('click', (e) => {
          e.target.innerText = "已購買";
          e.target.disabled= true;
          //get product from products
            //使用...取得該object的所有property
          let cartItem = {...Storage.getProduct(id), amount:1};
          //把product加入cart[]
          cart = [...cart,cartItem];
          //把cart[]存進LS
          Storage.saveCart(cart);
          //set cart values
          this.setCartValue(cart);
          //display cart item
          this.addCartItem(cartItem);
          //show the cart
          this.showCart();
        })
      }
    })
  }




  
  setCartValue(cart){
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map(item => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount
    })
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2))
    cartItems.innerText = itemsTotal;
  }
  
  addCartItem(item){
    const div = document.createElement('div');
    div.classList.add('cart-item');
    div.innerHTML= `
          <img src=${item.image}>
          <div>
            <h4>${item.title}</h4>
            <h5>${item.price}元</h5>
            <span class="remove-item" data-id="${item.id}">Remove</span>
          </div>
          <div>
            <i class="fa fa-angle-up" data-id="${item.id}"></i>
            <p class="item-amount">${item.amount}</p>
            <i class="fa fa-angle-down" data-id="${item.id}"></i>
          </div>`;
    cartContent.appendChild(div);
  }
  
  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
  }
  
  setupAPP(){
    cart = Storage.getCart();
    this.setCartValue(cart);
    this.populate(cart);
    cartBtn.addEventListener('click', this.showCart);
    closeCartBtn.addEventListener('click', this.hideCart);
  }

   populate(cart) {
    cart.forEach(item => this.addCartItem(item));
  }
  
  hideCart() {
    cartOverlay.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
  }
  
  cartLogic() {
    // clear cart button
    clearCartBtn.addEventListener("click", () => {
      this.clearCart();
    });
    // cart functionality
    cartContent.addEventListener('click', (e) => {
      //如果點選的部分包含REMOVE ITEM的CLASS，則執行REMOVE
      if(e.target.classList.contains('remove-item')){
        let removeItem = e.target;
        let removeItemId = removeItem.dataset.id;
        //從DOM移除
       cartContent.removeChild(removeItem.parentElement.parentElement);
        //從LS移除
        this.removeItem(removeItemId); 
         //如果點選的部分包含 ^ 增加數量的CLASS，則執行增加數量
        } else if(e.target.classList.contains('fa-angle-up')) {
          let addAmount = e.target;
          let addAmountId = e.target.dataset.id;
          
          let tempItem = cart.find(item => item.id === addAmountId );
          tempItem.amount= tempItem.amount + 1;
          
          Storage.saveCart(cart);
          this.setCartValue(cart);
          addAmount.nextElementSibling.innerText = tempItem.amount;
          
          //如果點選的部分包含 v 減少數量的CLASS，則執行減少數量
        } else if(e.target.classList.contains('fa-angle-down')) {
          
          let lowerAmount = e.target;

          let lowerAmountId = e.target.dataset.id;
          let tempItem = cart.find(item => item.id === lowerAmountId );
          tempItem.amount = tempItem.amount - 1;
          //要記得減少數量不能減少成負的
            if(tempItem.amount > 0){
              Storage.saveCart(cart);
              this.setCartValue(cart);
              lowerAmount.previousElementSibling.innerText = tempItem.amount
               } else {
                 cartContent.removeChild(lowerAmount.parentElement.parentElement);
                 this.removeItem(lowerAmountId); 
            }
        }
      
    })
  }
  
clearCart() {
    let cartItems = cart.map(item => item.id);
    cartItems.forEach(id => this.removeItem(id));
    console.log(cartContent.children);

    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }
 
removeItem(id) {
    cart = cart.filter(item => item.id !== id);
    this.setCartValue(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `<i class="fas fa-shopping-cart"></i>選購`;
  }
  getSingleButton(id) {
    return buttonsDOM.find(button => button.dataset.id === id);
  }
  
}

//3.設 class : localStorage
class Storage {
//使用static的方式，就不用用instance的方式調用
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find(product => product.id === id);
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

//開始執行囉
// document.addEventListener('DOMContentLoaded', () => {
//   const ui = new UI();
//   const products = new Products();
//   const storage = new Storage();
  
//   //一開始的基本FUNCTION
//   ui.setupAPP();

//   //1.取得所有產品 2.把產品擺到畫面中 3.把產品存進LS
//   products.getProducts().then(products => {
//     ui.displayProducts(products);
//     Storage.saveProducts(products);
//   }).then(() => {
//     ui.getBagButtons();
//     ui.cartLogic();
//   })
  
  
// })
  document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();
  // setup app
  ui.setupAPP();
  // get all products
  products
    .getProducts()
    .then(products => {
      ui.displayProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getBagButtons();
      ui.cartLogic();
    });
});
  // 