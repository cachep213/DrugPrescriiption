import Web3 from 'web3';
import "core-js/stable";
import "regenerator-runtime/runtime";
import Gymmarketplace from './abis/Gymmarketplace.json'
import Identicon from 'identicon.js';
const CID = require('cids')
// variables

const contract_add_kovan = '0x0005069DE1ef6021695Fc4249A84E3E003A315f2';

//Declare IPFS
const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https'}) 

const productsDOM = document.querySelector(".products-center");
const image_bnDOM = document.querySelector(".benhan_center");
const DATA_bnDOM = document.querySelector(".DATA_center");
const address_nav = document.querySelector(".address")


const productid = document.querySelector(".productid");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");

const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");

let array_buffer = 0;

document.addEventListener("DOMContentLoaded",async () => {
    // console.log(ipfsx);
 
    const contracts = new contract();

    contracts.loadWeb3().
    then (contracts.loadaddress().
              then( addres =>{contracts.showaddress(addres);
    }));

    contracts.loadBlockchainData().then( (produtcount) =>{ contracts.displayProducts(produtcount);
      contracts.getBagButtons(produtcount);
      contracts.cartLogic(); 
    });
    contracts.loadimage().then( (ima_res)=>{
     contracts.dis_image_bnDOM(ima_res);
     contracts.dis_DATA_bnDOM(ima_res);
    })
  });


class contract {

  constructor(){ 
    this.donthuoc = [];
    this.image = [];
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }
  async loadaddress(){
    const web3 = window.web3
    // // Load account
    const accounts = await web3.eth.getAccounts()
    return accounts[0];
  }
  async showaddress(address){
    let result = "";
      result += `
          <h5>${address}</h5>
   `;
    address_nav.innerHTML = result;
  }
  async loadimage(){
    const web3 = window.web3
    // // Load account
    const accounts = await web3.eth.getAccounts()
    // Network ID
    const networkId = await web3.eth.net.getId()
    // const networkData = Gymmarketplace.networks[networkId]
    // if(networkData) {
      const gymmarketplace = new web3.eth.Contract(Gymmarketplace.abi, contract_add_kovan)
      //-----------------------------------------------------------------------
      //load don thuoc
      const imageCout = await gymmarketplace.methods.imageCount().call()
      // console.log("image count",imageCout);
      // Load product
      for (var i = 1; i <= imageCout; i++) {
        const don = await gymmarketplace.methods.images(i).call()
        this.image.push(don);
      }
    // } else {
    //   window.alert('Contract not deployed to detected network.')
    // }
    return  this.image;
  }
  async loadBlockchainData() {
    const web3 = window.web3
    // // Load account
    const accounts = await web3.eth.getAccounts()
    // Network ID
    const networkId = await web3.eth.net.getId()
    // const networkData = Gymmarketplace.networks[networkId]
    // if(networkData) {
      const gymmarketplace = new web3.eth.Contract(Gymmarketplace.abi, contract_add_kovan)
      //-----------------------------------------------------------------------
      //load don thuoc
      const productCout = await gymmarketplace.methods.productCount().call()
      // console.log("produc", productCout);
      // Load product
      for (var i = 1; i <= productCout; i++) {
        const don = await gymmarketplace.methods.products(i).call()
        this.donthuoc.push(don);
      }
    // } else {
    //   window.alert('Contract not deployed to detected network.')
    // }
    return  this.donthuoc;
  }
  async displayProducts(produts) {
    console.log(produts);
    let result = "";
      produts.forEach( produt =>{
        if(produt.id_bn.length > 15){
          var data = new Identicon(`${produt.id_bn}`, 420).toString();}
        else{
          var data = new Identicon(`0x0005069DE1ef6021695Fc4249A84E3E003A315f2`, 420).toString();}
        result += `
               <div class="img-container">
                 <img 
                  src="data:image/png;base64,` + data + `"
                  alt="product"
                  class="product-img"
                  />
                 <button class="bag-btn" data-id =${produt.id}>
                   <i class="fas fa-shopping-cart"></i>
                   BUY
                 </button>
                 <h5>${produt.id_bn}</h5>
               </div>

        `;
      })
    productsDOM.innerHTML = result;
  } 
  async dis_image_bnDOM(image_bns){
    if(image_bns.length != 0){

      let result = "";
      // console.log(image_bns);
      image_bns.forEach( image_bn =>{
        if(image_bn.type_im == 1){
          // console.log(image_bn)
          result += `
                <div class="img-container">
                  <img 
                    src=http://ipfs.infura.io/ipfs/${image_bn.ahash}
                    alt="product"
                    class="product-img"
                    style={{maxWidth = '420px'}}
                    />
                    <h5>${image_bn.description}</h5>
                  <h5>${image_bn.id_bn}</h5>
                </div>

          `;
        }
      })
      image_bnDOM.innerHTML = result;
    }
}
  dis_DATA_bnDOM(image_bnsdt){
  if(image_bnsdt.length != 0){

    let result = "";
    // console.log(image_bns);
    image_bnsdt.forEach( image_bnd =>{
      if(image_bnd.type_im == 3){
        // console.log(image_bn)
        result += `
              <div class="img-container">
                <img 
                  src=http://ipfs.infura.io/ipfs/${image_bnd.ahash}
                  alt="product"
                  class="product-img"
                  style={{maxWidth = '420px'}}
                  />
                  <h5>${image_bnd.description}</h5>
                <h5>${image_bnd.id_bn}</h5>
              </div>

        `;
      }
    })
  
    DATA_bnDOM.innerHTML = result;
  }
}

  //cart -----------------------------------------------------------------------
  getBagButtons(produts) {
    let chose;
    let id_but = 0;
    const buttons = [...document.querySelectorAll(".bag-btn")];
    // console.log("button", buttons)
    buttons.forEach( button => {
      button.addEventListener("click", event => {
        // disable button
        id_but = button.dataset.id;
        // console.log(id_but);
        event.target.innerText = "In Bag";
        // event.target.disabled = true;
        console.log(id_but)
        chose = produts[id_but-1]; 
        // console.log(chose)
        this.setCartValues(chose);
        this.addCartItem(chose);
        this.showCart()
      });
    })
;

   
  }
  setCartValues(cart) {
      if(cart.length != 0){
        productid.innerText = cart.id;
        console.log("chose",cart)
        let soluong = cart.soluong.split(",");
        let sum = soluong.reduce((a, b) => {
          return Number(a) + Number(b);
        }, 0);
        // console.log("sum", sum)
        let tempTotal = sum * 0.01;
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
      }
      else{
        cartTotal.innerText = 0;
      }


  }
  makeTableHTML(array_name, array_sl) {
    var result = "<table border=1> <thead><tr><th>STT</th><th>Tên Thuốc</th> <th>Số Lượng</th></tr></thead>";
    for(var i=0; i<array_name.length; i++) {
      result += "<tr>";
      result += "<td>"+(i+1)+"</td><td>"+array_name[i]+"</td><td>"+array_sl[i]+"</td>" ;
      result += "</tr>";
    }
    result += "</table>";

    return result;
  }
  addCartItem(item) {
   
    let tenthuoc = item.name.split(",");
    let soluong = item.soluong.split(",");
    let ten_thuoc = this.makeTableHTML(tenthuoc, soluong);
  
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `<!-- cart item -->
           
            <!-- item info -->
            <div>
              ${ten_thuoc}
            </div>
            <!-- item functionality -->
            
          <!-- cart item -->
    `;
    cartContent.appendChild(div);
  }
  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
  }

  hideCart() {
    cartOverlay.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
  }
  cartLogic() {

      clearCartBtn.addEventListener("click", () => {
        this.clearCart();
      });
      cartContent.addEventListener("click", event => {
        if (event.target.classList.contains("remove-item")) {
          let removeItem = event.target;
          let id = removeItem.dataset.id;
          cart = cart.filter(item => item.id !== id);
          console.log(cart);

          this.setCartValues(cart);
          
          cartContent.removeChild(removeItem.parentElement.parentElement);
          const buttons = [...document.querySelectorAll(".bag-btn")];
          buttons.forEach(button => {
            if (parseInt(button.dataset.id) === id) {
              button.disabled = false;
              button.innerHTML = `<i class="fas fa-shopping-cart"></i>BUY`;
            }
          });
        } else if (event.target.classList.contains("fa-chevron-up")) {
          let addAmount = event.target;
          let id = addAmount.dataset.id;
          let tempItem = cart.find(item => item.id === id);
          tempItem.amount = tempItem.amount + 1;

          this.setCartValues(cart);
          addAmount.nextElementSibling.innerText = tempItem.amount;
        } else if (event.target.classList.contains("fa-chevron-down")) {
          let lowerAmount = event.target;
          let id = lowerAmount.dataset.id;
          let tempItem = cart.find(item => item.id === id);
          tempItem.amount = tempItem.amount - 1;
          if (tempItem.amount > 0) {

            this.setCartValues(cart);
            lowerAmount.previousElementSibling.innerText = tempItem.amount;
          } else {
            cart = cart.filter(item => item.id !== id);
  
            this.setCartValues(cart);

            cartContent.removeChild(lowerAmount.parentElement.parentElement);
            const buttons = [...document.querySelectorAll(".bag-btn")];
            buttons.forEach(button => {
              if (parseInt(button.dataset.id) === id) {
                button.disabled = false;
                button.innerHTML = `<i class="fas fa-shopping-cart"></i>BUY`;
              }
            });
          }
        }
    });
    // }
  }
  clearCart() {

     let cart = [];
     this.setCartValues(cart);

    const buttons = [...document.querySelectorAll(".bag-btn")];
    buttons.forEach(button => {
      button.disabled = false;
      button.innerHTML = `<i class="fas fa-shopping-cart"></i>BUY`;
    });
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }
  //end cart--------------------------------------------------------------------
}

class upload_dt{
  constructor(dt_name, dt_sl, dt_idbn) {
    this.dt_name = dt_name;
    this.dt_sl = dt_sl;
    this.dt_idbn = dt_idbn;
  }
  async createProduct() {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts();
    // const networkId = await web3.eth.net.getId();
    // const networkData = Gymmarketplace.networks[networkId];
    // if(networkData) {
      const gymmarketplace = new web3.eth.Contract(Gymmarketplace.abi, contract_add_kovan);
      gymmarketplace.methods.createProduct(this.dt_name, this.dt_sl, this.dt_idbn).send({ from: accounts[0] })
      .once('receipt', (receipt) => {
        console.log(receipt);
      })
    // }
  }

  
}
async function buyProduct(id_product, price){
  const web3 = window.web3
  let hexString = web3.utils.toWei (price, 'Ether');
  // let price_e = web3.utils.numberToHex(price);// await web3.eth.utils.fromWei(price.toString(), 'Ether')
  const accounts = await web3.eth.getAccounts();
  // const networkId = await web3.eth.net.getId();
  // const networkData = Gymmarketplace.networks[networkId];
  // if(networkData) {
    const gymmarketplace = new web3.eth.Contract(Gymmarketplace.abi, contract_add_kovan);
    gymmarketplace.methods.purchaseProduct(id_product, 1).send({ from: accounts[0], value: hexString })
    .once('receipt', (receipt) => {
      console.log(receipt);
    })
  // }
}
class upload_ipfss{
  constructor(hash, im_des, im_idbn) {
    this.hash = hash;
    this.im_des = im_des;
    this.im_idbn = im_idbn;
  }
  async  upload_ipfs(){
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts();
    // const networkId = await web3.eth.net.getId();
    // const networkData = Gymmarketplace.networks[networkId];
    // if(networkData) {
      const gymmarketplace = new web3.eth.Contract(Gymmarketplace.abi, contract_add_kovan);
      gymmarketplace.methods.uploadImage(this.hash, this.im_des,this.im_idbn, 1 ).send({ from: accounts[0]  })
      .once('receipt', (receipt) => {
        console.log(receipt);
      })
    // }
  }


}
class upload_drug{
  constructor(drug_name, drug_lat, drug_lon) {
    this.drug_name = drug_name;
    this.drug_lat = drug_lat;
    this.drug_lon = drug_lon;
  }
  async drug_track() {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts();
    const networkId = await web3.eth.net.getId();
    const networkData = Gymmarketplace.networks[networkId];
    if(networkData) {
      const gymmarketplace = new web3.eth.Contract(Gymmarketplace.abi, networkData.address);
      gymmarketplace.methods.CreateDrug(this.drug_name, this.drug_lat, this.drug_lon).send({ from: accounts[0] })
      .once('receipt', (receipt) => {
        console.log(receipt);
      })
    }
  }
  
}

$(".add-row").click(() =>{
  var name = $("#name").val();
  var email = $("#soluong").val();
  var markup = "<tr><td><input type='checkbox' name='record'></td><td>" + name + "</td><td>" + email + "</td></tr>";
  $("table tbody").append(markup);
  $("#name").val('');
  $("#soluong").val('');
});

// Find and remove selected table rows
$(".delete-row").click(()=>{
  $("table tbody").find('input[name="record"]').each(function(){
    if($(this).is(":checked")){
          $(this).parents("tr").remove();
      }
  });
});

$(".upload_donthuoc").click( ()=>{
  var name = [];
  var sl = [];
  var id_bn =  $("#id_bn").val();
  var table = document.getElementById('table_dt'), 
  rows = table.getElementsByTagName('tr'),
  i, j, cells, customerId,slsl;

  for (i = 0, j = rows.length; i < j; ++i) {
    cells = rows[i].getElementsByTagName('td');
    if (!cells.length) {
        continue;
    }
    customerId = cells[1].innerHTML;
    slsl = cells[2].innerHTML;
    name.push(customerId);
    sl.push(slsl)
    }
  var string_name = name.toString();
  var string_sl = sl.toString();
  console.log(string_name,string_sl,id_bn);
  //send to blockchain dt_name, dt_sl, dt_idbn, dt_pur
  const conta = new upload_dt(string_name,string_sl,id_bn);
  conta.createProduct();
});

let file ;
let array_buffer_converted_to_buffer;

$(".butt_ifps").click( async ()=>{
  
  if(array_buffer == 1){
    array_buffer = 0;
    await ipfs.add(array_buffer_converted_to_buffer, (err, res)=>{
      if(err){
     console.log("err", err);
     return
     }
     console.log(res[0].hash)
     let xhash = res[0].hash;
     var im_des = document.getElementById('benh_an').value.toString();
     var im_idbn = document.getElementById('benhan_add_bn').value.toString();
     console.log( im_des, im_idbn);
     const upi = new upload_ipfss(xhash, im_des, im_idbn);
     upi.upload_ipfs();
    });
  }
});

$("input[type=file]").change(  (e) =>{
  array_buffer = 1;
  file =  e.target.files[0];
  const reader = new window.FileReader();
  reader.readAsArrayBuffer(file);
  reader.onloadend =  (() => {
    array_buffer_converted_to_buffer = Buffer(reader.result); 
    // console.log(array_buffer_converted_to_buffer)
  })
});

$(".drug_upload").click( ()=>{
  var string_name = document.getElementById('drug_name').value;
  var string_lat = document.getElementById('drug_lat').value;
  var string_lon = document.getElementById('drug_lon').value;
  console.log(string_name, string_lat, string_lon);
  const drug_up = new upload_drug(string_name, string_lat, string_lon);
  drug_up.drug_track();
});

$(".produc_purchase").click( ()=>{
  var value_eth = cartTotal.innerText;
  var id_pro = productid.innerText;
  buyProduct(id_pro,value_eth);
})