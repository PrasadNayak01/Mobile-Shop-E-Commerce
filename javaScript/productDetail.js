import {cart} from './cart.js';
import {updateCartQuantity } from './utils/quantity.js';
import {saveToStorage} from './cart.js';

// Extract the query parameters from the URL
const params = new URLSearchParams(window.location.search);
const productId = params.get('id');
const productName = params.get('name');
const productImage = decodeURIComponent(params.get('image'));
const productPrice = params.get('price');
const productRating = params.get('rating');
const productCamera = params.get('camera');
const productBattery = params.get('battery');
const productDescription = params.get('description');
const productOs = params.get('os');
const productScreenSize= params.get('screen-size');
const productMemory = params.get('memory');
const productBrand = params.get('brand');


let ProductHtml='';
ProductHtml =
    `
    <div class="product-image">
        <img src="${productImage}" alt="${productName}">
    </div>
    <div class="product-details">
        <h1>${productName}</h1>
        <p><strong>Brand:</strong>${productBrand}</p>
        <p><strong>Operating System:</strong>${productOs}</p>
        <p><strong>Memory Storage Capacity:</strong>${productMemory}</p>
        <p><strong>Camera:</strong>${productCamera}</p>
        <p><strong>Screen Size:</strong>${productScreenSize}</p>
        <p><strong>Battery:</strong>${productBattery}</p>
        <p class="price"><strong>Price: ₹${productPrice}</strong></p>
        <p><strong>Description:</strong></p>
        <p>${productDescription}</p>
        <button class="add-to-cart-button 
        js-add-to-cart-button"
        data-product-id="${productId}">
            Add to Cart
        </button>
    </div>
    `;

document.querySelector('.product-container')
    .innerHTML=ProductHtml;

document.querySelectorAll('.js-add-to-cart-button')
    .forEach((button)=>{
        button.addEventListener('click',()=>{
            //use trim() => removes extra space before or after data
            const productId=button.getAttribute(`data-product-id`).trim();
            // console.log(productId);//testing
            
            let matchingItem;

            cart.forEach((cartItem)=>{
                if(productId === cartItem.id){
                    matchingItem=cartItem;
                }
                // console.log(productId===cartItem.id); 
                // console.log(typeof productId, typeof cartItem.id);
            });

            //if product already in cart then just increse the qty.
            if(matchingItem){
                matchingItem.quantity+=1;
            }
            else{
                cart.push({
                    id:productId ,
                    quantity:1,
                    deliveryOptionId:'1'
                })
            }
            // console.log(cart); //testing

            saveToStorage();
            updateCartQuantity();            
        });
    });

//update the html of cart quantity at header
updateCartQuantity();  

    