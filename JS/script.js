const firebaseConfig = {
  apiKey: "AIzaSyC68KITEcmHfXHUzq0jXjKEoukO16wmI8I",
  authDomain: "social-a26cf.firebaseapp.com",
  databaseURL: "https://social-a26cf-default-rtdb.firebaseio.com",
  projectId: "social-a26cf",
  storageBucket: "social-a26cf.firebasestorage.app",
  messagingSenderId: "351144305540",
  appId: "1:351144305540:web:08ff2d22059f1a707273d1",
  measurementId: "G-Z0FV8PGDDG",
};

firebase.initializeApp(firebaseConfig);
var database = firebase.database();

const $ = (selector) => document.querySelector(selector);

const closeOverView = $("#closeOverView");

// public vareables start here
const overData = {};
// public vareables end here----//

// functions bodys start

const openOverView = (overData) => {
  const overVIewElem = $("#overView");
  $("#overView").classList.add("active");
  $("#overView").classList.remove("close");
  const elem_img = overVIewElem.querySelector("#main_img");
  const elem_title = overVIewElem.querySelector("#title");
  const elem_price = overVIewElem.querySelector("#price");
  const elem_brand = overVIewElem.querySelector("#brand");
  const elem_color = overVIewElem.querySelector("#color");

  elem_brand.innerText = overData.productBrand;
  elem_img.src = overData.productImg;
  elem_price.innerText = overData.productPrice;
  elem_title.innerText = overData.productName;
  elem_color.innerText = overData.productColor;
};

const getProductLayout = (data) => `
  <div class="card">
            <div class="img">
              <img
                src="${data.image}"
                alt=""
                class="product-img"
              />
            </div>
            <div class="detail">
              <p class="product-name">${data.name}</p>
              <p class="brand-name">${data.brand}</p>
              <p class="product-price">${data.price}</p>
            </div>
          </div>
`;
const activeTouchEvents = () => {
  const topProducts = $("#topProducts");
  const topProductsCard = topProducts.querySelectorAll(".card");

  topProductsCard.forEach((element) => {
    element.onclick = () => {
      productImg = element.querySelector("img").getAttribute("src");
      productName = element.querySelector("p.product-name").innerText;
      productPrice = element.querySelector("p.product-price").innerText;
      productBrand = element.querySelector("p.brand-name").innerText;
      overData.productImg = productImg;
      overData.productName = productName;
      overData.productPrice = productPrice;
      overData.productBrand = productBrand;
      overData.productColor = null;
      openOverView(overData);
    };
  });
};

// functions bodys end-----//

// User Events line click , scroll, hover, etc...

closeOverView.onclick = () => {
  $("#overView").classList.remove("active");
  $("#overView").classList.add("close");
};

$("#bestSeller")
  .querySelectorAll(".img")
  .forEach((element) => {
    element.onclick = () => {
      productImg = element.querySelector("img").getAttribute("src");
      productName = `element.querySelector("p.product-name").innerText;`;
      productPrice = `element.querySelector("p.product-price").innerText;`;
      productBrand = `element.querySelector("p.brand-name").innerText;`;
      overData.productImg = productImg;
      overData.productName = `productName`;
      overData.productPrice = `productPrice`;
      overData.productBrand = `productBrand`;
      overData.productColor = null;
      openOverView(overData);

      // const storedData = localStorage.getItem("productData");

      // console.log(storedData);
    };
  });

$("#buyNowBtn").onclick = () => {
  const encodedArray = encodeURIComponent(JSON.stringify(overData));

  // window.location.href = `../product/index.html?array=${encodedArray}`;
  window.location.href = `../auth/login/#loginPage`;
};

// user events end---//

database.ref("products/").on("child_added", (snapshot) => {
  const data = snapshot.val();
  $("#topProductListElem").innerHTML += getProductLayout(data);

  activeTouchEvents();
});
