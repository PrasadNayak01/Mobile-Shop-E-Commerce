export let orders=JSON.parse(localStorage.getItem('orders'))||[];

function saveToStorage(){
    localStorage.setItem('orders',JSON.stringify(orders));
}

export function addOrder(order){
    orders.unshift(order)
    saveToStorage();
    console.log(orders);
}

export function getOrder(orderId){
    let matchingOrder=''
    orders.map((order)=>{
        if(order.orderId===orderId){
            matchingOrder=order;
        }
    });
    return matchingOrder;
}

export function getOrdersForUser(customerEmail) {
    return orders.filter(order => order.customerEmail === customerEmail);
}