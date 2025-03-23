import { products,loadProducts } from '../Data/productData.js';
// import { filtersData } from './homeSidebar.js';
import{cart,addToCart} from'./cart.js';
import { updateCartQuantity } from './utils/quantity.js';

async function loadData() {
    await loadProducts();
    renderHomePage();
}

loadData();

function renderHomePage(filterprod=products){
    
    let ProductHtml='';

    filterprod.forEach((product)=>{
        ProductHtml+=
        `
            <div class="product-container">
                <div class="product-image-container">
                    <img class="product-image" src="Assets/${product.image}">
                </div>
                <div class="product-name" data-product-id="${product.id}">
                    ${product.name}
                </div>
                <div class="products-ratings">
                    <img class="products-ratings-img" src="images/ratings/rating-${product.rating.stars*10}.png">
                    <div class="rating-count">${product.rating.counts}</div>
                </div>
                <div class="product-price">
                    ₹${product.price}
                </div>
                <div class="product-quantity-container">
                    <select class="js-quantity-dropdown-${product.id}">
                        <option selected value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                    </select>
                </div>
                <div class="added-msg js-added-msg-${product.id}">
                    Added ✅
                </div>
                <div>
                    <button class="add-to-cart-button js-add-to-cart-button" 
                    data-product-id="${product.id}">
                        Add to Cart
                    </button>
                </div>  
            </div>
        `;   
    });

    document.querySelector('.products-grid')
        .innerHTML=ProductHtml;

    //Detailed Product Information 
    document.querySelectorAll('.product-name')
    .forEach((name)=>{
        name.addEventListener('click',()=>{
            const productId=name.dataset.productId;  //name.getAttribute('data-product-id')   
            // console.log(productId);
            const product = products.find(p => p.id == productId);

            if (product) {
                window.location.href = 
                `
                productDetail.html?id=${product.id}
                &name=${product.name}&image=${product.image}
                &price=${product.price}&rating=${product.rating.stars}
                &camera=${product.camera}&battery=${product.battery}
                &description=${product.description}&os=${product.os}
                &screen-size=${product.screen_size}&memory=${product.memory}
                &brand=${product.brand}
                `;
            }
        });   
    });

    //update the html of cart quantity at header
    // updateCartQuantity('.js-cart-quantity');
    updateCartQuantity();

    //add to cart
    let addedMsgTimeoutId;
    document.querySelectorAll('.js-add-to-cart-button')
    .forEach((button)=>{
        button.addEventListener('click',()=>{
            //get id of perticuler product
            const productId=button.getAttribute("data-product-id");
            // console.log(productId); //testing

            addToCart(productId);
            updateCartQuantity();

            //to show added msg
            const addedMsg=document.querySelector(`.js-added-msg-${productId}`);
            addedMsg.classList.add('added-msg-visible');

            
            //if there is prev timeout the it will remove it
            if(addedMsgTimeoutId){
                clearTimeout(addedMsgTimeoutId);
            }

            let timeoutId =setTimeout(()=>{
                addedMsg.classList.remove('added-msg-visible');
            },1800);

            addedMsgTimeoutId=timeoutId
        });
        //added-msg-visible
    });  

}


//Search Bar->
const searchBtn=document.querySelector('.js-search-button');
const searchText=document.querySelector('.js-search-bar');

function searchProduct(){
    const searchValue=String(searchText.value).toLowerCase();
    // console.log(searchValue);

        if(searchValue.length===0){
            alert('product ch nav tari tak yedya');
            searchText.value='';
            renderHomePage(products);
            // console.log('Search button clicked');
            return;
        }
    
    let searchprod=[];
    products.forEach((product)=>{

        //const custValue = product.name.toLowerCase() + ' ' + product.brand.toLowerCase();
        if (
        product.name.toLowerCase()===searchValue || 
        product.brand.toLowerCase()===searchValue )
        {
            searchprod.push(product);
        }
    });
    // renderHomePage(searchprod);

    if (searchprod.length === 0) {
        document.querySelector('.products-grid').innerHTML = "----No such Product Found---- Refresh to Search Again";
        searchText.value = ''; // Optionally reset the search bar
    } else {
        // Render the filtered products
        renderHomePage(searchprod);
    }  
}

//for the searchbtn
searchBtn.addEventListener('click',()=>{
    searchProduct();
});

//function for onkeydown enter
function omsk (event){
    if (event.key === 'Enter') {
        searchProduct();
    }
}
searchText.onkeydown=omsk;




//Filter btns-->
document.querySelectorAll('.filter-button')
    .forEach((button)=>{
        button.addEventListener('click',()=>{
            const filterValue=button.getAttribute("data-filter");
            console.log(filterValue); //testing 

            const filterRating=parseInt(filterValue);
            const filterPrice=parseInt(filterValue);

            let searchprod=[];
            products.forEach((product)=>{
                if (
                    product.brand.toLowerCase()===filterValue.toLowerCase() || 
                    // product.Keyword.includes(filterValue) ||
                    (filterValue=== "4G" && !product.Keyword.includes("5G"))||
                    (filterValue === "4G" && !"5G") ||
                    (
                        (filterRating===3 && product.rating.stars < 4)||
                        (filterRating===4 && product.rating.stars <= 4.5)||
                        (filterRating===5 && product.rating.stars === 5)
                    )||
                    (
                        (filterPrice === 30000 && product.price < 30000) ||
                        (filterPrice === 50000 && product.price < 50000) ||
                        (filterPrice === 100000 && product.price < 100000) ||
                        (filterValue === "Above 100000" && product.price > 100000)
                    )
                )
                {
                    searchprod.push(product);
                }
            });
            if(filterValue==="Default"){
                renderHomePage();
            }
            else{
                renderHomePage(searchprod);
            }      
        })
    });

