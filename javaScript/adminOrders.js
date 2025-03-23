import { orders, getOrder } from '../Data/ordersData.js'
// import dayjs from 'https://unpkg.com/dayjs@1.11.10/esm/index.js';
import { getProduct, loadProducts, products } from '../Data/productData.js';

async function loadData(params) {
  await loadProducts();
  renderAdminOrders();
}
loadData();

function renderAdminOrders(){

  let ordersGrid = '';

  orders.map((order) => {
    // console.log(order)

    let orderTime=dayjs(order.orderTime);
    let orderDateString=orderTime.format('dddd, MMMM D')
    // console.log(orderDateString);

    ordersGrid +=
      `
      <div class="order-card">
        <div class="order-header">
          Order ID: ${order.orderId}
        </div>
        <p><strong>Customer Email:</strong>${order.customerEmail}</p>
        <p><strong>Order Date:</strong>${orderDateString}</p>
        
        <div class="order-details">
          ${orderInDetails(order)}
        </div>
        
        <p class="order-total">Total Price: ₹${order.orderPrice}</p>
      </div>
      `;

      document.querySelector('.ordersGrid')
        .innerHTML=ordersGrid;


    function orderInDetails(order){
      // console.log(order.orderProducts);

      let productsGrid='';
      order.orderProducts.map((item)=>{
        let matchingProduct=getProduct(item.id);
        // console.log(matchingProduct);
          productsGrid +=
          `
          <p><strong>Product:</strong>${matchingProduct.name}</p>
          <p><strong>Quantity:</strong>${item.quantity}</p>
          <p><strong>Price:</strong> ₹${matchingProduct.price}</p>
          `
      });
      return productsGrid;
    }
  });
}