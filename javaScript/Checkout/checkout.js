// console.log('hello')
import { cart,deleteProduct,updateDeliveryOption ,updateCartQuantity} from "../cart.js";
import { products,loadProducts } from "../../Data/productData.js";
import { deliveryOptions,getDeliveryOption } from '../../Data/deliveryOption.js';
// import { updateCartQuantity } from './utils/quantity.js';
import dayjs from 'https://cdn.jsdelivr.net/npm/dayjs@1.11.13/+esm';
import {renderPayment} from './Check_payment.js';

async function loadData(params) {
	await loadProducts();
	renderCheckoutHTML();
	renderPayment();
}

loadData();
// renderCheckoutHTML();
// renderPayment();


function renderCheckoutHTML(){

	let checkoutHTML='';

	cart.forEach((cartItem)=>{
		const productId=cartItem.id;
		let matchingItem='';

		products.forEach((product)=>{
			if(product.id===productId){
				matchingItem=product;
			}
		});
		// console.log(matchingItem) //testing

		let deliveryOptionId=cartItem.deliveryOptionId

		

		let deliveryOption = getDeliveryOption(deliveryOptionId);
		if (!deliveryOption) {
			console.error(`Invalid delivery option for ID: ${deliveryOptionId}`);
			return; // Skip processing for this item
		}
		// console.log(deliveryOption); //testing

		const today=dayjs();
		const format=today.format('D MMMM, YYYY');

		const deliveryDate=today.add(deliveryOption.days,'Days');
		const deliveryDateString=deliveryDate.format('D MMMM, YYYY');
		// console.log(deliveryDateString); //testing

		checkoutHTML+=
			`
				<div class="cart-item-container 
				js-cart-item-container-${matchingItem.id}">
					<div class="delivery-date">
						Delivery date: ${deliveryDateString}
					</div>

					<div class="cart-item-details-grid">
						<img class="product-image"
							src="${matchingItem.image}">

						<div class="cart-item-details">
							<div class="product-name">
								${matchingItem.name}
							</div>
							<div class="product-price">
									₹${matchingItem.price}
							</div>
							<div class="product-quantity">
								<span>
									Quantity: <span class="quantity-label js-quantity-label-${productId}">${cartItem.quantity}</span>
								</span>
								<span class="update-quantity-link link-primary js-update-link"
								data-product-id="${productId}">
									Update
								</span>
								<span class="delete-quantity-link link-primary js-delete-link" 
								data-product-id="${productId}">
									Delete
								</span>
								<input class="quantity-input js-quantity-input-${matchingItem.id}">
								<span class="save-quantity-link link-primary js-save-link"
									data-product-id="${matchingItem.id}">
									Save
								</span>
							</div>
						</div>

						<div class="delivery-options">
							<div class="delivery-options-title">
								Choose a delivery option:
							</div>
								${deliveryOptionUpdate(matchingItem,cartItem)}

						</div>
					</div>
				</div>
				
			`;

			// console.log(checkoutHTML);
	});

	document.querySelector('.js-order-summary')
		.innerHTML=checkoutHTML;

	function deliveryOptionUpdate(matchingItem,cartItem){
		let radiobtnHtml='';

		deliveryOptions.forEach((deliveryOption)=>{
			const today=dayjs();
			const format=today.format('D MMMM, YYYY');
			// console.log(format);

			const deliveryDate=today.add(deliveryOption.days,'Days');
			const deliveryDateString=deliveryDate.format('D MMMM, YYYY');

			let deliveryPriceString=(deliveryOption.price===0)?
			"Free Delivery":`₹${deliveryOption.price}-Charges`;
			// console.log(deliveryDateString);
			const isChecked=deliveryOption.id===cartItem.deliveryOptionId;

			radiobtnHtml+=
			`
				<div class="delivery-option js-delivery-option"
				data-product-id="${matchingItem.id}"
				data-delivery-option-id="${deliveryOption.id}">
				<input type="radio" ${(isChecked)?'Checked':''}  
					class="delivery-option-input"
					name="delivery-option-${matchingItem.id}">
				<div>
					<div class="delivery-option-date">
						${deliveryDateString}
					</div>
					<div class="delivery-option-price">
						${deliveryPriceString}
					</div>
				</div>
				</div>
			`;
		});
		// console.log(radiobtnHtml);
		return radiobtnHtml;	
	}

	document.querySelectorAll('.js-delivery-option')
		.forEach((radioBtn)=>{
			radioBtn.addEventListener('click',()=>{
				const {deliveryOptionId,productId}=radioBtn.dataset;
				// console.log(productId);
				// console.log(deliveryOptionId); //testing

				updateDeliveryOption(productId,deliveryOptionId);
				renderCheckoutHTML();
				renderPayment();
			});
		});

	//Delete Link
	document.querySelectorAll('.js-delete-link')
		.forEach((deleteLink)=>{
			deleteLink.addEventListener('click',()=>{
				const productId=deleteLink.getAttribute("data-product-id");
				// console.log(productId);

				deleteProduct(productId);
				// console.log(cart);

				const container=document.querySelector(`.js-cart-item-container-${productId}`);
				container.remove();

				updateCheckoutCartQuantity();
				renderPayment();
			});
		});

    //update link
	document.querySelectorAll('.js-update-link')
	.forEach((link)=>{
		link.addEventListener('click',()=>{
			const productId=link.getAttribute("data-product-id");
			// console.log(productId);
			
			//select the perticuler container.
			const container=document.querySelector(
				`.js-cart-item-container-${productId}`
			);
			container.classList.add('is-editing-quantity');
		});
	});
        
	//save link
	document.querySelectorAll('.js-save-link')
	.forEach((link) => {
		link.addEventListener('click', () => {
		const productId = link.dataset.productId;
		// console.log(productId);
			
		const quantityInput=document.querySelector(`.js-quantity-input-${productId}`);
		const newQuantity=Number(quantityInput.value);
		// console.log(newQuantity);
		//validation
		if (newQuantity < 0 || newQuantity >= 1000) {
			alert('Quantity must be at least 0 and less than 1000');
			return;
		}

		updateCartQuantity(productId,newQuantity);

		//select the perticuler container.
		const container = document.querySelector(
			`.js-cart-item-container-${productId}`
		);
		container.classList.remove('is-editing-quantity');

		//update the html
		document.querySelector(`.js-quantity-label-${productId}`)
			.innerHTML=newQuantity;

		updateCheckoutCartQuantity();
		renderPayment();
		});
	});

	//Updates the header quantity of checkout
	function updateCheckoutCartQuantity(){
		let totalCartquantity=0;
		cart.forEach((cartItem)=>{
			totalCartquantity+=cartItem.quantity;
		});
		
		// console.log(totalCartquantity); //testing

		document.querySelector('.js-checkout-totalQuantity')
			.innerHTML=`${totalCartquantity} items`;
	}
	updateCheckoutCartQuantity();
}