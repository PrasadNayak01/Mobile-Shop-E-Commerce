export function getProduct(id){
    let matchProduct='';
    products.forEach((product)=>{
        if (id.toString().trim() === product.id.toString().trim()){
            matchProduct=product
        }
    });
    return matchProduct;
}

export let products = []; // Global array to store products

export async function loadProducts() {
    try {
        const response = await fetch('/Data/products.json'); // Fetch from products.json
        products = await response.json(); // Store in global array
        // console.log(products)
    } catch (error) {
        console.error('Error loading products:', error);
    }
}




//     {
//         id:"47a",
//         image:"images/RedmiNote13Pro.jpg",
//         name:"Redmi Note 13 Pro",
//         rating:{
//             stars:4,
//             counts:995
//         },
//         price:24998,
//         camera: "200MP",
//         battery: "5100 mAh",
//         description: "The Redmi Note 13 Pro offers a 6.67-inch AMOLED display with vibrant colours and smooth performance. It features a powerful 200MP main camera for stunning photography and detailed shots. The device is powered by a Snapdragon 7 series processor and houses a 5,100 mAh battery, ensuring long-lasting performance with fast charging support. Its 5G connectivity provides seamless and fast internet speeds.",
//         os: "MIUI",
//         screen_size: "6.67 Inches",
//         memory: "256GB",
//         brand:"Redmi",
//         Keyword:["Redmi","mobile","4G"]
//     },
// ];