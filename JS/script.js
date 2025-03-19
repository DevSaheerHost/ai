const $ = (selector) => document.querySelector(selector);

const closeOverView = $("#closeOverView");

// public vareables start here
const overData = {}
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

// functions bodys start end-----//

// User Events line click , scroll, hover, etc...

closeOverView.onclick = () => {
  $("#overView").classList.remove("active");
  $("#overView").classList.add("close");
};

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

  window.location.href = `../product/index.html?array=${encodedArray}`;



};

// user events end---//
