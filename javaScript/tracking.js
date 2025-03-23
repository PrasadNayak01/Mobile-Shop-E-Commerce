import { updateCartQuantity } from './utils/quantity.js';
import { getProduct, loadProducts } from '../Data/productData.js';
import { orders, getOrder } from '../Data/ordersData.js';
import { getDeliveryOption } from '../Data/deliveryOption.js';
// import dayjs from 'https://unpkg.com/dayjs@1.11.10/esm/index.js';


async function loadData(params) {
  await loadProducts();
  updateCartQuantity();
  renderTrackingHtml();
}

loadData();


const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('productId');
const orderId = urlParams.get('orderId');
// console.log(productId);
// console.log(orderId);

function renderTrackingHtml() {

  let trackingHtml = '';

  let matchingOrder = getOrder(orderId);
  // console.log("match:", matchingOrder);

  let matchingItem = getProduct(productId);
  // console.log(matchingItem);

  let productDetails = ''
  matchingOrder.orderProducts.forEach((product) => {
    // console.log(product.id)
    if (product.id === matchingItem.id) {
      productDetails = product
    }
  })
  // console.log(productDetails);

  let deliveryOption = getDeliveryOption(productDetails.deliveryOptionId);
  console.log(deliveryOption);

  let today = dayjs();

  let orderDate=dayjs(matchingOrder.orderTime);
  // console.log("Order Date",orderDate);
  let arrivingDate=orderDate.add(deliveryOption.days, 'days');
  let arrivingDateString=arrivingDate.format('dddd, MMM D');
  // console.log(arrivingDateString);

  const orderTime = dayjs(matchingOrder.orderTime);
  const deliveryTime = dayjs(arrivingDate);
  const percentProgress = ((today - orderTime) / (deliveryTime - orderTime)) * 100;
  console.log(percentProgress);

  trackingHtml =
    `
      <a class="back-to-orders-link link-primary" href="orders.html">
        View all orders
      </a>

      <div class="delivery-date">
        Arriving on ${arrivingDateString}
      </div>

      <div class="product-info">
        ${matchingItem.name}
      </div>

      <div class="product-info">
        Quantity: ${productDetails.quantity}
      </div>

      <img class="product-image" src="Assets/${matchingItem.image}">

      <div class="progress-labels-container">
        <div class="progress-label">
          Preparing
        </div>
        <div class="progress-label">
          Shipped
        </div>
        <div class="progress-label">
          Delivered
        </div>
      </div>

      <div class="progress-bar-container">
        <div class="progress-bar" style="width:${percentProgress}%"></div>
      </div>
    `

  document.querySelector('.order-tracking')
    .innerHTML = trackingHtml;
}