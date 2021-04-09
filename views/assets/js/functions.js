
import jwt_decode from "./jwt-decode";
export default class Functions {
  

  preparePage() {
    let config = undefined
    let id_token = undefined

    alert('loaded');
  

    elementsNorma = document.getElementsByClassName('content_norma');
    for (i =0; i < elementsNorma.length; i++) {
        elementsNorma[i].classList.add("d-none");
    }
    
  
    elementsNorma = document.getElementsByClassName('content_consultoria');
    for (i =0; i < elementsNorma.length; i++) {
        elementsNorma[i].classList.add("d-none");
    }
  

    id_token = getIDToken()
    
    // TODO: simplification: if id_token undefined, redirect to authentication
    if (id_token !== undefined){
      //document.getElementById('authentication-display').innerText = "Authenticated"
      
      elementsLogged = document.getElementsByClassName('not_logged_in');
      for (i =0; i < elementsLogged.length; i++) {
          elementsLogged[i].classList.remove("d-none");
          elementsLogged[i].classList.add("d-none");
      }
      elementsLogged = document.getElementsByClassName('logged_in');
      for (i =0; i < elementsLogged.length; i++) {
          elementsLogged[i].classList.remove("d-none");
          elementsLogged[i].classList.add("d-block");
      }
      document.getElementById("username").innerText = "usuario";

    }

    // load config.json and call stuff that depends on it
    fetch('./config.json').then(res => res.json())
    .then((configJson) => {
      config = configJson
      prepareAuthenticationLink(config['authenticationURL'])
      
      if(id_token !== undefined) {
        showServiceCallButton()
        setCurlCommand()
      }

    }).catch(err => console.error(err))
  }

  prepareAuthenticationLink(authenticationURL) {
    let authLink = document.getElementById('authentication-link')
    authLink.href = config['authenticationURL']
  }

  showServiceCallButton(){
    document.getElementById('call-service-button').hidden=false
  }

  getIDToken(){
    let url = new URL(location.href)
    let this_id_token = undefined

    url.hash.substr(1).split('&').some(
      function(keyValueString){
        let keyValueArray = keyValueString.split('=')
        if(keyValueArray[0]==="id_token"){
          this_id_token = keyValueArray[1]
          return true
        }
      }
    )

    console.log(jwt_decode(id_token));

    return this_id_token;
  }

   callService(){
    let serviceURL = config['serviceURL']

    //console.log('calling service witj id token: ' + id_token)

    fetch(serviceURL,
      {
        credentials: 'include',
        headers: {
          'Authorization': id_token
        }
      }).then(res => res.json())
      .then((resultJson) => {
        console.log(resultJson)
        document.getElementById('call-result').innerText = 'Result: ' + resultJson.message
      }).catch(err => {
        console.assert('Error Calling Service:')
        console.error(err)
        document.getElementById('call-result').innerText = 'ERROR: ' + err
    })
  }

  setCurlCommand(){
    let curlCommand= "curl"
    curlCommand += " -H \"Authorization:" + " " + id_token + "\" "
    curlCommand +=  config['serviceURL']
    document.getElementById('curl-command').innerText = curlCommand
  }


}

