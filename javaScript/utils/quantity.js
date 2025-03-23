import{cart} from '../cart.js';

export function updateCartQuantity(){
    let totalCartquantity=cart.length;

    // console.log(totalCartquantity); //testing

    document.querySelector('.js-cart-quantity')
        .innerHTML=totalCartquantity;
}