import { cart,saveToStorage } from "../cart.js"; // Assuming cart is an array of cart items
import { getProduct } from "../../Data/productData.js";
import { getDeliveryOption } from "../../Data/deliveryOption.js";

export function renderPayment() {

  let totalProducts = 0;
  let totalProductPrice = 0;
  let deliveryCharges = 0;
  let totalPrice = 0;

  cart.forEach((cartItem) => {
    totalProducts += cartItem.quantity;

    let product = getProduct(cartItem.id);
    // console.log("Products:", product.price);
    totalProductPrice += product.price * cartItem.quantity;

    let deliveryOption = getDeliveryOption(cartItem.deliveryOptionId);
    deliveryCharges += deliveryOption.price;

    totalPrice = totalProductPrice + deliveryCharges;
  });

  console.log("Total Products:", totalProducts);
  console.log("Total Product Price:", totalProductPrice);
  console.log("Delivery Charges:", deliveryCharges);

  let paymentHtml = `
        <div class="payment-summary-title">
            Order Summary
        </div>

        <div class="payment-summary-row">
            <div>Total Items :</div>
            <div class="payment-summary-money">${totalProducts}</div>
        </div>

        <div class="payment-summary-row">
            <div>Products Price:</div>
            <div class="payment-summary-money"> ₹${totalProductPrice}</div>
        </div>

        <div class="payment-summary-row">
            <div>Shipping &amp; Handling:</div>
            <div class="payment-summary-money"> ₹${deliveryCharges}</div>
        </div>

        <div class="payment-summary-row total-row">
            <div>Order Total:</div>
            <div class="payment-summary-money"> ₹${totalPrice}</div>
        </div>

        <form action="/checkout" method="post">
            <button class="place-order-button button-primary">
                Place your order
            </button>
        </form>
    `;

  document.querySelector(".js-payment-summary")
    .innerHTML = paymentHtml;


  // Attach event listener to the place order button
  document
    .querySelector(".place-order-button")
    .addEventListener("click", (event) => {
      event.preventDefault();
      // Preparing the cart data with product details and quantity
      // Preparing the cart data with product details and quantity
      const checkoutCart = cart.map((cartItem) => {
        const product = getProduct(cartItem.id);
        const deliveryOption = getDeliveryOption(cartItem.deliveryOptionId);

        return {
          id: cartItem.id, // Product ID
          name: product.name, // Product Name
          price: product.price, // Product Price
          quantity: cartItem.quantity, // Quantity
          deliveryOptionId: cartItem.deliveryOptionId, // Delivery Option ID
          deliveryPrice: deliveryOption.price, // Delivery Option Price
        };

        
      });

      fetch("http://localhost:5001/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cart: checkoutCart }), // Send the cart to the backend
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          if (data.url) {
            // Redirect to the Stripe Checkout page
            window.location.href = data.url;
          } else {
            console.error("Stripe session URL not found in response");
          }
        })
        .catch((error) => {
          console.error("Error submitting order:", error);
        });
    });
}

// // Ensure renderPayment is called after DOM is fully loaded
// document.addEventListener("DOMContentLoaded", () => {
//   renderPayment();
// });
