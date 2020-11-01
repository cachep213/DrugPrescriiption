pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

contract Gymmarketplace {
  string public name;
  uint public imageCount = 0;
  mapping(uint => Image) public images;
  
  uint public productCount = 0;
  mapping(uint => Product) public products;

  uint public drug_count = 0;
  mapping(uint => drug_track) public drug_tracks;
  //struct don thuoc
  struct Product {
        uint id;
        string name;
        string soluong;
        uint price;
        address payable owner;
        string id_bn;
        bool purchased;
    }



  constructor() public {
      name = "marketplace";
    }

  //ipfs----------------------------------------------------------------------------//
  //struct benh an/ chung nhan
  struct Image {
    uint id;
    uint type_im;
    string ahash;
    string description;
    string id_bn;
    address payable author;
  }
  event ImageCreated(
    uint id,
    uint type_im,
    string ahash,
    string description,
    string id_bn,
    address payable author
  );


  function uploadImage(string memory _imgHash, string memory _description, string memory id_bn, uint type_im) public {
    // Make sure the image hash exists
    require(bytes(_imgHash).length > 0);
    // Make sure image description exists
    require(bytes(_description).length > 0);
    // Make sure uploader address exists
    // require(msg.sender!=address(0));

    // Increment image id
    imageCount ++;

    // Add Image to the contract
    images[imageCount] = Image(imageCount, type_im, _imgHash, _description, id_bn, msg.sender);
    // Trigger an event
    emit ImageCreated(imageCount, type_im, _imgHash, _description, id_bn, msg.sender);
  }
  //------------------------------------------------------------------------------------//
  event ProductCreated(
        uint id,
        string name,
        string soluong,
        uint price,
        address payable owner,
        string id_bn,
        bool purchased
  );

  event ProductPurchased(
        uint id,
        string name,
        uint price,
        address payable owner,
        string id_bn,
        bool purchased
    );

  function createProduct(string memory _name, string memory _soluong, string memory id_bn) public {
        // Require a valid name
        require(bytes(_name).length > 0);
        // Increment product count
        productCount ++;
        // Create the product
        products[productCount] = Product(productCount, _name, _soluong, 0, msg.sender, id_bn, false);
        // Trigger an event
        emit ProductCreated(productCount, _name, _soluong, 0, msg.sender, id_bn, false);
  }

  function purchaseProduct(uint _id, uint _price) public payable {
        // uint continu =0;
        // Fetch the product
        Product memory _product = products[_id];
        // Fetch the owner
        address payable _seller = _product.owner;
        // Make sure the product has a valid id
        require(_product.id > 0 && _product.id <= productCount);
        // Require that there is enough Ether in the transaction
        require(msg.value >= _price);
        // Require that the product has not been purchased already
        require(!_product.purchased);
        // Require that the buyer is not the seller
        require(_seller != msg.sender);
        // Transfer ownership to the buyer
        products[_id].owner = msg.sender;
        // Mark as purchased
        _product.purchased = true;
        // Update the product
        products[_id] = _product;
        // Pay the seller by sending them Ether
        address(_seller).transfer(msg.value);
        // Trigger an event
        emit ProductPurchased(productCount, _product.name, _price, msg.sender,_product.id_bn, true);
    }

    



  //------------------------------------------------------------------------------------//
  //struct thuoc
  struct drug_track{
    uint id;
    string name;
    string lat;
    string lon;
    address owner;
  }

  event DrugCreated(
    uint id,
    string name,
    string lat,
    string lon,
    address owner
  );

  event DrugUpdate(
   uint id,
   string name,
   string lat,
   string lon,
   address owner
  );

  function CreateDrug(string memory _name, string memory _lat, string memory _lon) public {

        // Require a valid name
        require(bytes(_name).length > 0);
        // Increment drug count
        drug_count ++;
        drug_tracks[drug_count] = drug_track(drug_count, _name, _lat, _lon, msg.sender);
        // Trigger an event
        emit DrugCreated(drug_count, _name,  _lat, _lon , msg.sender);
  }

  function UpdateDrug(uint _id, string memory _newlat, string memory _newlon ) public {
       // uint continu =0;
        // Fetch the product
        drug_track memory _drug = drug_tracks[_id];
        // Fetch the owner
        address _drug_owner = _drug.owner;
        string memory old_lat = _drug.lat;
        string memory old_lon = _drug.lon;
        // Make sure the product has a valid id
        require(_drug.id > 0 && _drug.id <= drug_count);
        // Require that the buyer is not the seller
        require(_drug_owner != msg.sender);
        // Transfer ownership to the buyer
        _drug.owner = msg.sender;
        //update lat - lon
        _drug.lat = string(abi.encodePacked(old_lat, _newlat));
        _drug.lon = string(abi.encodePacked(old_lon, _newlon));
        // Update the product
        drug_tracks[_id] = _drug;

        // Trigger an event
        emit DrugUpdate(drug_count, _drug.name, _newlat , _newlon, msg.sender);
  }

}