//axie API
const axieAPI = "https://graphql-gateway.axieinfinity.com/graphql"; 
//body criteria
const bodyData ={
  "operationName": "GetAxieBriefList",
  "query": "query GetAxieBriefList($auctionType: AuctionType, $criteria: AxieSearchCriteria, $from: Int, $sort: SortBy, $size: Int, $owner: String) {\naxies(auctionType: $auctionType, criteria: $criteria, from: $from, sort: $sort, size: $size, owner: $owner) {\n  total\n  results {\n    ...AxieBrief\n    __typename\n  }\n  __typename\n}\n      }\n\n      fragment AxieBrief on Axie {\nid\nname\nstage\nclass\nbreedCount\nimage\ntitle\ngenes\nbattleInfo {\n  banned\n  __typename\n}\nauction {\n  currentPrice\n  currentPriceUSD\n  __typename\n}\nstats {\n  ...AxieStats\n  __typename\n}\nparts {\n  id\n  name\n  class\n  type\n  specialGenes\n  __typename\n}\n__typename\n      }\n    \n      fragment AxieStats on AxieStats {\n       hp\n       speed\n       skill\n       morale\n__typename\n      }",
  "variables": {
      "auctionType": "Sale",
      "criteria": {
          "classes": ["Aquatic"],
          "parts": ["tail-nimo", "back-goldfish", "mouth-risky-fish"],
          "hp": [45,61],
          "speed": [57],
          "skill": null,
          "morale": null,
          "breedCount": [0],
          "pureness": [],
          "numMystic": [],
          "title": null,
          "region": null,
          "stages": [
              3,
              4
          ]
      },
      "from": 0,
      "size": 24,
      "sort": "PriceAsc",
      "owner": null
  }
}
//------- App -------

function start(){
    getAxieGenes();
  // getAxieData(handleAxieList,2);

}

//------- Run -------
start();

var axieDict;

var clsDict={
  '0000':"Beast",
  '0001':"Bug",
  '0010':"Bird",
  '0011':"Plant",
  '0100':"Aquatic",
  '0101':"Reptile",
  '1000':"Mech",
  '1001':"Dawn",
  '1010':"Dusk",
  
};

function getAxieGenes(callback){
  var a =fetch("./db.json")
    .then(response=>{
      return response.json();
    })
    .then(response=>{
      axieDict = response;
    })
    // .then(combineAxieGenes)
    .then(getAxieData())
    .then(()=>{
      console.log(axieDict);
  
    })
    // .then(()=>{console.log(combineAxieGenes(geneTest))})
}


//------- Functions -------

function getAxieData(callback, number){
  bodyData.variables.length = number*24;
  var request= {
    "method": 'POST',
    "mode": "cors",
    "credentials": "include",
    "referrer": "https://marketplace.axieinfinity.com/",
    "referrerPolicy": "strict-origin-when-cross-origin",
    "headers": {
      "accept": "*/*",
      "accept-language": "en-US,en;q=0.9,vi;q=0.8",
      "authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50SWQiOjEyMDQ1MDUsImFjdGl2YXRlZCI6dHJ1ZSwicm9uaW5BZGRyZXNzIjoiMHhkNjQ1OTAwOWQ2OWNkMGIwYjhlYTBhNmI3N2I3MjJlY2RmZWI0YjdjIiwiZXRoQWRkcmVzcyI6bnVsbCwiaWF0IjoxNjMzMDE3NDQ5LCJleHAiOjE2MzM2MjIyNDksImlzcyI6IkF4aWVJbmZpbml0eSJ9.xXO2nhc3fPGPosfyUJxt4qQzIrWTx0Chxy4IYmSi-2o",
      "content-type": "application/json",
      "sec-ch-ua": "\"Chromium\";v=\"94\", \"Google Chrome\";v=\"94\", \";Not A Brand\";v=\"99\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Windows\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site"
    },   
    "body": JSON.stringify(bodyData)
  }
  fetch(axieAPI, request)
      .then( response =>{
        return response.json();
      })
      .then (response =>{
        data = response;
        console.log(data.data);
        return data;
      })
      .then (data =>{
        var reponse = [];
        return data.data.axies.results.map( x=> {
          return {[x.id] : x.genes}
        })
      })
      // .then (response=>console.log(response))
      .then (response=>{return combineAxieGenes(response)})
      .then (response=>console.log(response))
      


}


function handleAxieList(){
  var axieList = document.querySelector('ul');
  var html = testData.data.axies.results.map( x =>{
    let price =(x.auction.currentPrice* Math.pow(10,-19)).toFixed(5);
    return `<li><a href="https://marketplace.axieinfinity.com/axie/${x.id}"><div class="axieList-name">${x.name}</div>
    <img src="${x.image}"></a>     
    <div class="axieList-name">$${price}</div>
    </li>
          `;
  })
  axieList.innerHTML = html.join('');
}

function showData(){
  console.log(data);
}


// getAxieGenes();


function splitAxieGenes(genes){
  return {
    eyes: genes.slice(64,96),
    ears: genes.slice(128,160),
    mouth: genes.slice(96,128),   
    horn: genes.slice(160,192),
    back: genes.slice(192,224),
    tail: genes.slice(224,256),
  }
}
var gene="00001100001000010010000011000010";


function combineAxieGenes(listGenes){
  var gens = listGenes.map(x=>{
    partsCode = splitAxieGenes(hex2bin(Object.values(x)[0]));
    var gen ={};
    for (const part in partsCode ){
      gen[part] = parseAxieGenes(partsCode[part],part); 
    }
    return {
      id: Object.keys(x)[0],
      parts: gen
    }
  });
  return gens;
}

function parseAxieGenes(genes, bpart){
  var clsGene = genes.slice(2,6);
  var partGene = genes.slice(6,12);
  var cls = clsDict[clsGene];
  
  var clsR1Gene = genes.slice(12,16);
  var partR1Gene = genes.slice(16,22);
  var clsR1 = clsDict[clsR1Gene];
  
  var clsR2Gene = genes.slice(22,26);
  var partR2Gene = genes.slice(26,32);
  var clsR2 = clsDict[clsR2Gene];

  return ({
    'D':(axieDict[cls.toLowerCase()][bpart][partGene]["global"]),
    'R1':(axieDict[clsR1.toLowerCase()][bpart][partR1Gene]["global"]),
    'R2':(axieDict[clsR2.toLowerCase()][bpart][partR2Gene]["global"]),
  })
}

function hex2bin(x){
  var hexPart = Array.from(x.slice(2));
  var binPart = hexPart.map( c=>{
    return parseInt(c,16).toString(2).padStart(4,0);
  })
  return binPart.join("");
}


// var a =splitAxieGenes(hex2bin("0x30000000012094220c2120c210a308c8088008440c4230040cc1300a00c20948"));
// console.log(a);
// var b = "00001100001000010010000011000010";
// console.log(parseAxieGenes(b));



// function testUl(){
//     var hexCode = "0x30000000012094220c2120c210a308c8088008440c4230040cc1300a00c20948";
//     const { AxieGene } = require("agp-npm/dist/axie-gene")
//     const axieGene = new AxieGene(hexCode);
//     console.log(axieGene.getGeneQuality());
//     genes = document.querySelector("ul");
// }

function showGenes(){
  console.log(data.data.axies.results.map(x=>x.genes));
}

function parseGenes(){

}




// console.log(hex2bin("0x30000000012094220c2120c210a308c8088008440c4230040cc1300a00c20948"));

