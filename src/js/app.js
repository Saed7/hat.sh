const bootstrap = require('bootstrap');
var $ = require("jquery");
const popperjs = require('popper.js');
const zxcvbn = require('zxcvbn');

// compute the sha256 of a string and display its hex digest.
// function sha256(str) {
//   // We transform the string into an arraybuffer.
//   var buffer = new TextEncoder("utf-8").encode(str);
//   return crypto.subtle.digest("SHA-256", buffer).then(function (hash) {
//     return hex(hash);
//   });
// }
// //not usable anymore 
// function hex(buffer) {
//   var hexCodes = [];
//   var view = new DataView(buffer);
//   for (var i = 0; i < view.byteLength; i += 4) {
//     // Using getUint32 reduces the number of iterations needed (we process 4 bytes each time)
//     var value = view.getUint32(i)
//     // toString(16) will give the hex representation of the number without padding
//     var stringValue = value.toStr ing(16)
//     // We use concatenation and slice for padding
//     var padding = '00000000'
//     var paddedValue = (padding + stringValue).slice(-padding.length)
//     hexCodes.push(paddedValue);
//   }

//   // Join all the hex strings into one
//   return hexCodes.join("");
// }

//file input events
const inputFile = document.getElementById("customFile"); //file input
inputFile.addEventListener("change", updateNameAndSize, false); //from the updateNameAndSize function

//generate key button events
const genBtn = document.getElementById("generateButton");
genBtn.addEventListener("click", generateKey, false); //from the generateKey function

//password input events
let password = document.getElementById('inputPassword');
password.addEventListener("input", keyCheckMeter, false);

//encryption decryption buttons
const encryptBtn = document.getElementById("encryptBtn");
encryptBtn.addEventListener("click", encryptFile); //from the generateKey function

const decryptBtn = document.getElementById("decryptBtn");
decryptBtn.addEventListener("click", decryptFile); //from the generateKey function


//declarations
const DEC = {
  signature: "Encrypted Using Hat.sh",
  hash: "SHA-256",
  algoName1: "PBKDF2",
  algoName2: "AES-GCM",
  algoLength: 128,
  itr: 100000,
  perms1: ["deriveKey"],
  perms2: ['encrypt', 'decrypt'],
}

$(function(){$('[data-toggle="tooltip"]').tooltip()}) //toggle tooltip for bootstrap

function errorMsg(msg) {
  let errTag =
    `<div class="alert alert-danger alert-error" role="alert">
    <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
    <strong>Error!</strong> ${msg}
  </div>`;
  document.getElementById("error").insertAdjacentHTML('beforeEnd', errTag);//inserthtml
  window.setTimeout(function () {
    $(".alert-error").fadeTo(500, 0).slideUp(500, function () {
      $(this).remove();
    });
  }, 4000);
}

//determination of file name and size 
function updateNameAndSize() {
  let nBytes = 0,
    oFiles = inputFile.files,
    nFiles = oFiles.length,
    placeHolder = document.getElementById("file-placeholder");

  for (let nFileId = 0; nFileId < nFiles; nFileId++) {
    nBytes += oFiles[nFileId].size;
    fileName = oFiles[nFileId].name;
  }
  let sOutput = nBytes + " bytes";
  // optional code for multiples approximation
  for (let aMultiples = ["KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"], nMultiple = 0, nApprox = nBytes / 1024; nApprox > 1; nApprox /= 1024, nMultiple++) {
    sOutput = nApprox.toFixed(2) + " " + aMultiples[nMultiple];
  }
  // end of optional code

  // console.log(fileName);
  //change placeholder text
  if (!inputFile.value) {
    placeHolder.innerHTML = "Choose a file to encrypt/decrypt";
  } else {
    placeHolder.innerHTML = fileName + '  <span class="text-success">' + sOutput + '</span>';
  }


}

//check how strong is the password entered using zxcvbn.js
function keyCheckMeter() {
  let strength = {
    0: "Very Bad",
    1: "Bad",
    2: "Weak",
    3: "Good",
    4: "Strong"
  };
  let password = document.getElementById('inputPassword');
  let meter = document.getElementById('strength-meter');
  let text = document.getElementById('strength-text');
  let val = password.value;
  //console.log(val);
  let result = zxcvbn(val);
  //console.log(result);
  // Update the password strength meter
  meter.style.width = result.score * 25 + '%';
  //console.log(meter);
  // Update the text indicator
  if (val !== "") {
    text.innerHTML = strength[result.score];
  } else {
    text.innerHTML = "none.";
  }
}

//better function to convert string to array buffer
function str2ab(str) {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

// not as good as the one above
// function convertStringToArray(string) {
//   var trans = new TextEncoder("utf-8");
//   return trans.encode(string);
// }
// function convertArrayToString(array) {
//   var trans = new TextDecoder("utf-8");
//   return trans.decode(array);
// }


//this function generates the html tag and provieds the file that needs to be downloaded
function processFinished(name, data, method, dKey) {

  //methods 1->encryption , 2->decryption
  let msg;
  let status;
  let keyBtn;
  const randomId = Math.floor((Math.random() * 100) + 1);
  if (method == 1) {
    msg = " Has been <b>encrypted</b> Successfully";
    status = "encrypted";
    keyBtn = `<button type="button" class="btn btn-outline-secondary btn-sm" data-toggle="modal" data-target=".modal${randomId}"><i class="fas fa-key"></i>
    Decryption Key</button>`;
  }
  else {
    msg = " Has been <b>decrypted</b> Successfully";
    status = "decrypted"
    keyBtn = '';
  }

  const blob = new Blob(data, { type: 'application/octet-stream' }); // pass a useful mime type here
  const url = URL.createObjectURL(blob); //create a url for blob
  const htmlTag = `<div class="result">
  <div class="modal fade bd-example-modal-sm modal${randomId}" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-sm">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">decryption key</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
            <div class="modal-body">
                  ${dKey}
            </div>
        </div>
      </div>
    </div>

  <div class="alert alert-light" role="alert">
    <strong>Success!</strong><samp> The file <span class="badge badge-light">${name.replace('Encrypted-', '')}</span>${msg}</samp>
    <p><a class="btn btn-secondary btn-sm" href="${url}" download="${name}" role="button"><i class="fas fa-download"></i> ${status}
        file </a> ${keyBtn}</p>
    <hr>
  </div>
</div><!-- end result -->`;
  document.getElementById("results").insertAdjacentHTML('beforeEnd', htmlTag);//inserthtml

}

function generateKey() { //generate a random key for user

  const usedChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#_+=';
  let keyArray = new Uint8Array(16); //lenght of the key
  window.crypto.getRandomValues(keyArray); //randomize
  keyArray = keyArray.map(x => usedChars.charCodeAt(x % usedChars.length));
  const randomizedKey = String.fromCharCode.apply(null, keyArray);
  password.value = randomizedKey; //output the new key to the key input
  keyCheckMeter(); //run the key strength checker

}

//import key
function importSecretKey() { // import the entered key from the password input
  let rawPassword = str2ab(password.value); // convert the password entered in the input to an array buffer
  return window.crypto.subtle.importKey(
    "raw", //raw
    rawPassword,// array buffer password
    { length: DEC.algoLength, name: DEC.algoName1 }, //the algorithm you are using
    false,//whether the derived key is extractable 
    DEC.perms1 //limited to the options encrypt and decrypt
  );

}

// better not to use it
async function deriveSecretKey() {//derive the secret key from a master key.

  let getSecretKey = await importSecretKey();
  let rawPassword = str2ab(password.value); // convert the password entered in the input to an array buffer
  //console.log(rawPassword);
  return window.crypto.subtle.deriveKey(
    {
      name: DEC.algoName1,
      salt: rawPassword, //use the entered password as a salt
      iterations: 100000,
      hash: { name: DEC.hash },
    },
    getSecretKey, //your key from importKey
    { //the key type you want to create based on the derived bits
      name: DEC.algoName2,
      length: DEC.algoLength,
    },
    false, //whether the derived key is extractable 
    DEC.perms2 //limited to the options encrypt and decrypt
  )
  //console.log the key
  // .then(function(key){
  //     //returns the derived key
  //     console.log(key);
  // })
  // .catch(function(err){
  //     console.error(err);
  // });


}


//file encryption function

async function encryptFile() {

  const derivedKey = await deriveSecretKey(); //requiring the key
  const file = inputFile.files[0]; //file input
  const fr = new FileReader(); //request a file read

  const n = new Promise((resolve, reject) => {

    fr.onload = async () => {//load
      const iv = window.crypto.getRandomValues(new Uint8Array(16)); //generate a random iv
      const content = new Uint8Array(fr.result); //encoded file content

      await window.crypto.subtle.encrypt({ iv, name: DEC.algoName2 }, derivedKey, content) //encrypt
        .then(function (encrypted) {
          //returns an ArrayBuffer containing the encrypted data
          resolve(processFinished('Encrypted-' + file.name, [DEC.signature, iv, new Uint8Array(encrypted)], 1, password.value)); //create the new file buy adding signature and iv and content
          //console.log("file has been successuflly encrypted");
        })
        .catch(function (err) {
          errorMsg("An error occured while Encrypting the file, try again!"); //reject
        });

    }

    fr.readAsArrayBuffer(file)

  });
}

//file decryption function

async function decryptFile() {

  const derivedKey = await deriveSecretKey(); //requiring the key
  const file = inputFile.files[0]; //file input
  const fr = new FileReader(); //request a file read

  const d = new Promise((resolve, reject) => {

    fr.onload = async () => {//load 
      //console.log(fr.result);
      const iv = new Uint8Array(fr.result.slice(22, 38));//take out encryption iv

      const content = new Uint8Array(fr.result.slice(38));//take out encrypted content

      await window.crypto.subtle.decrypt({ iv, name: DEC.algoName2 }, derivedKey, content)
        .then(function (decrypted) {
          //returns an ArrayBuffer containing the decrypted data

          resolve(processFinished(file.name.replace('Encrypted-', ''), [new Uint8Array(decrypted)], 2, password.value));//create new file from the decrypted content
          //console.log("file has been successuflly decrypted");
        })
        .catch(function () {
          errorMsg("You have entered a wrong Decryption Key!");
        });

    }

    fr.readAsArrayBuffer(file) //read the file as buffer

  });
}



    