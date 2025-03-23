// import { deliveryOptions } from '../Data/deliveryOption.js';
// import { products } from '../Data/productData.js';

export let cart;

cart=JSON.parse(localStorage.getItem('cart'));
if(!cart){
    cart=[{
        id:"1a",
        quantity:2,
        deliveryOptionId:'1'
    }];
}
// console.log(cart);


export function saveToStorage(){
    localStorage.setItem('cart',JSON.stringify(cart));
}

export function addToCart(productId){
    //get full product from product data 
    let matchingItem;
    cart.forEach((cartItem)=>{
        if(productId===cartItem.id){
            matchingItem=cartItem;
        }
        
    });

    //select quantity from dropdown
    const selctedQuantity=document.querySelector(`.js-quantity-dropdown-${productId}`);
    const quantity=Number(selctedQuantity.value);
    // console.log(quantity); //testing

    //if product already in cart then just increse the qty.
    if(matchingItem){
        matchingItem.quantity+=quantity;
    }
    // console.log(matchingItem); //testing
    else{
        cart.push({
            id:productId,
            quantity:quantity,
            deliveryOptionId:'1'
        })
    }
    // console.log(cart); //testing
    saveToStorage();
}

export function deleteProduct(productId){
    const newCart=[];

    cart.forEach((cartItem)=>{
        if(cartItem.id!==productId){
            newCart.push(cartItem);
        }    
    });

    cart=newCart;
    saveToStorage();
}

export function updateDeliveryOption(productId,deliveryOptionId){
    let matchingItem;
    cart.forEach((item)=>{
        if(productId===item.id){
            matchingItem=item;
        }

    });

    // console.log("before change:",matchingItem);
    matchingItem.deliveryOptionId=deliveryOptionId;
    // console.log("After change:",matchingItem);
    
    saveToStorage();
}

//for save link in ordersummary new quantity
export function updateCartQuantity(productId,newQuantity){
    let matchingItem;

    cart.forEach((cartItem)=>{
        if(cartItem.id===productId){
            matchingItem=cartItem;
        }
    });
    matchingItem.quantity=newQuantity;
    saveToStorage();
}