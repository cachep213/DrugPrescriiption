import Web3 from 'web3';
import "core-js/stable";
import "regenerator-runtime/runtime";
import Gymmarketplace from './abis/Gymmarketplace.json'
import Identicon from 'identicon.js';
//Declare IPFS
const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https'});

const contract_add_kovan = '0x0005069DE1ef6021695Fc4249A84E3E003A315f2';

const address_nav = document.querySelector(".address");
const user_img = document.querySelector(".user_im");
let donthuoc = [];
let img_cer = [];


async function show_address(){
    window.web3 = new Web3(window.ethereum)
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts();
    let add = accounts[0];
    let result = "";
      result += `
          <h5>${add}</h5>
   `;
    address_nav.innerHTML = result;
  
}

class load_and_show{
  
async load_img(){
  window.web3 = new Web3(window.ethereum)
  let img_count;
  const web3 = window.web3;
  // Network ID
  // const networkId = await web3.eth.net.getId()
  // const networkData = Gymmarketplace.networks[networkId]
  // if(networkData) {
    const gymmarketplace = new web3.eth.Contract(Gymmarketplace.abi, contract_add_kovan)
    //-----------------------------------------------------------------------
    img_count = await gymmarketplace.methods.imageCount().call()
    console.log("image count",img_count);
    // Load product
    for (var i = 1; i <= img_count; i++) {
      const iimg = await gymmarketplace.methods.images(i).call()
      img_cer.push(iimg);
    }
  // } else {
  //   window.alert('Contract not deployed to detected network.')
  // }
  // console.log(img_cer);
  return img_cer;

}
  
show_img_cer(input_datas){
    let result = "";
    input_datas.forEach( input_data =>{
     if(input_data.type_im == 2){
        result += `
              <div class="img-container">
                <img 
                  src=http://ipfs.infura.io/ipfs/${input_data.ahash}
                  alt="product"
                  class="product-img"
            
                  />
                  <h5>${input_data.description}</h5>
                <h5>${input_data.id_bn}</h5>
              </div>

        `;
      }
    })
      user_img.innerHTML = result;
    
}
}
async function loaddrugData() {

  let drug_Cout;
  window.web3 = new Web3(window.ethereum)
  const web3 = window.web3
  // // Load account
  // const accounts = await web3.eth.getAccounts()
  // Network ID
  // const networkId = await web3.eth.net.getId()
  // const networkData = Gymmarketplace.networks[networkId]
  // if(networkData) {
    const gymmarketplace = new web3.eth.Contract(Gymmarketplace.abi,contract_add_kovan)
    //-----------------------------------------------------------------------
    //load don thuoc
    drug_Cout = await gymmarketplace.methods.drug_count().call()
    console.log(drug_Cout);
    // Load product
    for (var i = 1; i <= drug_Cout; i++) {
      const don = await gymmarketplace.methods.drug_tracks(i).call()
      donthuoc.push(don);
    }

  // } else {
  //   window.alert('Contract not deployed to detected network.')
  // }
  console.log(img_cer);
  show_menu_drug(drug_Cout, donthuoc);
 
  
};
function show_menu_drug(length_arr, arr){
  
  var select = document.getElementById("selectNumber");

  for(var i = 0; i < length_arr; i++) {
      var opt =  arr[i].name;
      var el = document.createElement("option");
      el.textContent = opt;
      el.value = opt;
      select.appendChild(el);
  }
}

function show_map_drug(input, name_drug){
    input.forEach( (don_thuoc_1)=> {
      let drug_name = don_thuoc_1.name;
      if( drug_name === name_drug){
        $(".leaflet-marker-icon").remove();
        $(".leaflet-popup").remove();
        //clear marker
        let marker;
        let drug_lat = don_thuoc_1.lat.split(";");
        drug_lat.pop();
        let drug_lon = don_thuoc_1.lon.split(";");
        drug_lon.pop();
        let drug_id =  don_thuoc_1.owner;
        // console.log("lat", drug_lat, "lon", drug_lon);
        for (let j = 0; j < drug_lat.length; j++) {       
          let num_lat =  Number(drug_lat[j]);
          let num_lon = Number(drug_lon[j]);
          if( !isNaN(num_lon) || !isNaN(num_lat)){ 
            marker = new L.marker([num_lat,num_lon] )
            // .bindPopup('Id Divice: ' + data[j].id_device +'<a href="divice-chart.html"> View Chart</a>"').openPopup()
            .bindPopup(new L.popup().setContent(()=>{ let h5 = `<h5>${drug_name}</h5> <br>
                                                                <h5>${drug_id}</h5> `
                                                      return h5;
                                                      }))
            // .openPopup()
            .on('click', ()=>{console.log("click")})
            .addTo(mymap);
          }
       }
      }
    
    
  });
  
}


const mymap = L.map('Map_divice').setView([10.7822576,106.6503497], 12);
const attribution = '© <a href="http://osm.org/copyright">OpenStreetMap</a> contributors';
const title_url = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png';
const title = L.tileLayer(title_url, {attribution} );
title.addTo(mymap);


document.addEventListener("DOMContentLoaded",async () => {

  show_address();
  loaddrugData() ;
  const img_user = new load_and_show();
  img_user.load_img().then( (outp)=>{
    img_user.show_img_cer(outp);
  })
});


class upload_drug{
  constructor(drug_name, drug_lat, drug_lon) {
    this.drug_name = drug_name;
    this.drug_lat = drug_lat;
    this.drug_lon = drug_lon;
  }
  async drug_track() {
    window.web3 = new Web3(window.ethereum)
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts();
    // const networkId = await web3.eth.net.getId();
    // const networkData = Gymmarketplace.networks[networkId];
    // console.log(networkData);
    // if(networkData) {
      const gymmarketplace = new web3.eth.Contract(Gymmarketplace.abi, contract_add_kovan);
      gymmarketplace.methods.CreateDrug(this.drug_name, this.drug_lat, this.drug_lon).send({ from: accounts[0] })
      .once('receipt', (receipt) => {
        console.log(receipt);
      })
    // }
  }
  async drug_update() {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts();
    // const networkId = await web3.eth.net.getId();
    // const networkData = Gymmarketplace.networks[networkId];
    // console.log(networkData);
    // if(networkData) {
      const gymmarketplace = new web3.eth.Contract(Gymmarketplace.abi,contract_add_kovan);
      gymmarketplace.methods.UpdateDrug(this.drug_name, this.drug_lat, this.drug_lon).send({ from: accounts[0] })
      .once('receipt', (receipt) => {
        console.log(receipt);
      })
    // }
  }
  
}

class user_img_update{
  constructor(img_hash, img_des, img_ad_bn) {
    this.img_hash = img_hash;
    this.img_des = img_des;
    this.img_ad_bn = img_ad_bn;
  }
  async user_upload(){
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts();
    // const networkId = await web3.eth.net.getId();
    // const networkData = Gymmarketplace.networks[networkId];
    // console.log(networkData);
    // if(networkData) {
      const gymmarketplace = new web3.eth.Contract(Gymmarketplace.abi, contract_add_kovan);
      gymmarketplace.methods.uploadImage(this.img_hash, this.img_des, this.img_ad_bn, 2).send({ from: accounts[0] })
      .once('receipt', (receipt) => {
        console.log(receipt);
      })
    // }
  
  }
}


$(".drug_upload").click( ()=>{
  var string_name = document.getElementById('drug_name').value.toString();
  var string_lat = document.getElementById('drug_lat').value.toString();
  string_lat += ';';
  var string_lon = document.getElementById('drug_lon').value.toString();
  string_lon += ';';
  console.log(string_name, string_lat, string_lon);
  const drug_up = new upload_drug(string_name, string_lat, string_lon);
  drug_up.drug_track();
});

$(".drug_update").click( ()=>{
  var drug_id = document.getElementById('drug_id').value.toString();
  var string_lat = document.getElementById('drugu_lat').value.toString();
  string_lat += ';';
  var string_lon = document.getElementById('drugu_lon').value.toString();
  string_lon += ';';
  console.log(drug_id, string_lat, string_lon);
  const drug_up = new upload_drug(drug_id, string_lat, string_lon);
  drug_up.drug_update();

})

$(".drug_track").click( ()=>{
  let iddivice_go = document.getElementById('selectNumber');
  let id_divice_querry = iddivice_go.options[iddivice_go.selectedIndex].value;
  show_map_drug(donthuoc, id_divice_querry);

});


let array_buffer_converted_buffer;
$("input[type=file]").change(  (e) =>{
  array_buffer = 1;
  file =  e.target.files[0];
  const reader = new window.FileReader();
  reader.readAsArrayBuffer(file);
  reader.onloadend =  (() => {
    array_buffer_converted_buffer = Buffer(reader.result); 
    // console.log(array_buffer_converted_to_buffer)
  })
});

$(".user_ip_up").click( async ()=>{
  
  if(array_buffer == 1){
    array_buffer = 0;
    await ipfs.add(array_buffer_converted_buffer, (err, res)=>{
      if(err){
     console.log("err", err);
     return
     }
     console.log(res[0].hash)
     let xhash = res[0].hash;
     var im_des = document.getElementById('user_im_dess').value.toString();
     var im_idbn = document.getElementById('user_add_bn').value.toString();
     console.log( im_des, im_idbn);
     const upi = new user_img_update(xhash, im_des, im_idbn);
     upi.user_upload();
    });
  }
});