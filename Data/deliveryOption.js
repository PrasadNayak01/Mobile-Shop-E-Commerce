export let deliveryOptions=[{
    id:'1',
    days:7,
    price:0
},{
    id:'2',
    days:4,
    price:49
},{
    id:'3',
    days:1,
    price:99
}];

export function getDeliveryOption(productId){
    let deliveryOption;
    deliveryOptions.forEach((option)=>{
        if(option.id==productId){
            deliveryOption=option;
        }
    })
    return deliveryOption;
}