const express = require('express');
const app = express();
const querystring = require('querystring');
const url = require('url');
const bodyParser = require('body-parser');
let config = require("./config.json");
const fetch = require("node-fetch");

const  jwt_decode =require("jwt-decode");

let canviewConsultorias = false;
let canviewNormas = false;
let isLogged = false;
id_token = null;
let username = null;

app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/views'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.get('/', async function (req, res) {

  id_token  =  req.query.id_token;
  let normas;
  console.log(id_token);
  let alertMessage = "";
  if (id_token !== undefined) {
    let jwtToken  = jwt_decode(id_token);
    username = jwtToken.email;
    isLogged = true;
    for (let attr in jwtToken) {
      if (attr == "cognito:groups") {
        if (jwtToken[attr] == "GestaoNormas") { 
          canviewNormas = true;
          obj = {
            method: "GET", 
            headers: 
              {
                Authorization: "Bearer "+id_token
              }
          };
          normas = await fetch(config.endpointsBaseUrl+"/norma", obj)
          .then(response => response.json());
          
        };
        if (jwtToken[attr] == "AssessoriasConsultorias") { canviewConsultorias = true};
        
      }
    }
    if (canviewNormas == false && canviewConsultorias == false ) {
      alertMessage = "Você não possui privilégios para visualizar nenhum módulo. Entre em contato com o administrador";
    }

  }
  console.log(alertMessage);

    await res.render('index.ejs', { 
      canviewNormas: canviewNormas, 
      canviewConsultorias : canviewConsultorias,
      isLogged : isLogged, 
      config: config,
      alertMessage :alertMessage,
      normas:normas, 
      id_token, 
      username
    });
});


/**
 * Visualiza normas (Lambda)
 */
app.get('/normas', async function (req, res) {

  obj = {
    method: "GET", 
    headers: 
      {
        Authorization: "Bearer "+id_token
      }
  };
  let jsonResp = await fetch(config.endpointsBaseUrl+"/norma", obj)
  .then(response => response.json());
   res.status(200).send(jsonResp);

});


app.post("/buscaNorma",   async function (req, res){
  
    let obj2 = {
    method: "POST", 
    headers: {
      "Authorization": "Bearer "+id_token,
      "Content-Type" : "application/json",
      "Access-Control-Allow-Origin" : "*",
      "Access-Control-Allow-Credentials" : "true",
      "Accept": "*/*",
      "Content-Length": "999",
      "User-Agent": "PostmanRuntime/7.26.10",
      "Host" : "msn7hkpwfi.execute-api.sa-east-1.amazonaws.com"
    },
    body: JSON.stringify({"titulo": req.body.titulo})
  };
  let jsonResp =  await fetch("https://msn7hkpwfi.execute-api.sa-east-1.amazonaws.com/dev/norma/busca", obj2)
  .then(response => response.json());

  console.log(jsonResp);
   res.status(200).send(jsonResp);
});



app.post("/parecer",  async function (req, res) {
  let jsonResp = "Enviado com sucesso";
  let obj = {
    method: "POST", 
    headers: {
    "Authorization": "Bearer "+id_token,
    "Content-Type" : "application/json",
    "Access-Control-Allow-Origin" : "*",
    "Access-Control-Allow-Credentials" : "true",
    "Accept": "*/*",
    "User-Agent": "PostmanRuntime/7.26.10",
    "Host" : "msn7hkpwfi.execute-api.sa-east-1.amazonaws.com"
  },
    body  : JSON.stringify(req.body)
  };
  console.log(req.body);
  jsonResp =  await fetch("https://msn7hkpwfi.execute-api.sa-east-1.amazonaws.com/dev/parecer", obj)
  .then(response => response);
  console.log(jsonResp);
  res.status(200).send(JSON.stringify("Enviado com sucesso"));

});




app.get('/signin', async function (req, res) {
  await res.render('signin.ejs', {});
});



app.get('/signout', async function (req, res) {
   canviewConsultorias = false;
   canviewNormas = false;
   isLogged = false;
   id_token = null;
    username = null;

  res.render('signout.ejs', {});
});


app.listen(3000, function () {
  console.log('listening on 3000')
});


const  populateNormas = function()
{
  normas = {};
  return normas;
}