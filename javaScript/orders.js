import { updateCartQuantity } from './utils/quantity.js';
import { orders,getOrdersForUser } from '../Data/ordersData.js';
import { getProduct, loadProducts } from '../Data/productData.js';
import { getDeliveryOption } from '../Data/deliveryOption.js';

// import dayjs from 'https://unpkg.com/dayjs@1.11.10/esm/index.js';
// import dayjs from 'https://cdn.jsdelivr.net/npm/dayjs@1.11.10/esm/index.js';
// import dayjs from 'https://unpkg.com/dayjs@1.11.10/esm/index.js?module';

import {getCustomerEmail} from './utils/authHelper.js'
// import { v4 as uuidv4 } from 'https://jspm.dev/uuid';

async function loadData() {
	await loadProducts();
	updateCartQuantity();
	displayOrderHistory();
}

loadData();

// updateCartQuantity();
console.log(orders);


async function displayOrderHistory() {

	const email=await getCustomerEmail();
	// console.log('Current User Email:', email);

		// Filter orders to include only those for the current user
		let userOrders = getOrdersForUser(email);

	let orderHistoryHtml = ''
	userOrders.map((order) => {
		const orderPlaced = dayjs(order.orderTime);
		// console.log(orderPlaced);
		const orderPlaceString = orderPlaced.format('dddd, MMMM D');
		orderHistoryHtml +=
			`
    <div class="order-container">

			<div class="order-header">
				<div class="order-header-left-section">
					<div class="order-date">
							<div class="order-header-label">Order Placed:</div>
							<div>${orderPlaceString}</div>
					</div>
					<div class="order-total">
							<div class="order-header-label">Total:</div>
							<div>₹${order.orderPrice}</div>
					</div>
				</div>

				<div class="order-header-right-section">
					<div class="order-header-label">Order ID:</div>
					<div>${order.orderId}</div>
				</div>
			</div>

    	<div class="order-details-grid">
				${displayOrders(order)}
			</div>
		</div>
  `;

	})

	function displayOrders(order) {
		let productsGrid = '';
		order.orderProducts.forEach((product) => {
			// console.log('Products:', product); 
			let matchingItem = getProduct(product.id);
			// console.log('Matching item:', matchingItem); 
			let deliveryOption = getDeliveryOption(product.deliveryOptionId);
			// console.log(deliveryOption);

			let today = dayjs();

			let orderDate=dayjs(order.orderTime);
			// console.log("Order Date",orderDate);
			let arrivingDate=orderDate.add(deliveryOption.days, 'days');
			let arrivingDateString=arrivingDate.format('dddd, MMM D');
			console.log(arrivingDateString);


			productsGrid +=
				`
			<div class="product-image-container">
				<img src="Assets/${matchingItem.image}">
			</div>

			<div class="product-details">
				<div class="product-name">
					${matchingItem.name}
				</div>
				<div class="product-delivery-date">
					Arriving on: ${arrivingDateString}
				</div>
				<div class="product-quantity">
					Quantity: ${product.quantity}
				</div>
			</div>

			<div class="product-actions">
				<a href="tracking.html?productId=${product.id}&orderId=${order.orderId}">
					<button class="track-package-button button-secondary">
						Track package
					</button>
				</a>
			</div>
		`;
		});
		return productsGrid;
	}

	document.querySelector('.js-orders-grid')
		.innerHTML = orderHistoryHtml;
}
// 4242 4242 4242 4242