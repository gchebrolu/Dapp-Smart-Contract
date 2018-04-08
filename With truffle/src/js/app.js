
//web3 initialization//
if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source like Metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }
  
//Setting Default Account
  web3.eth.defaultAccount = web3.eth.accounts[0];

//Deployed Contract ABI
  PayRollContract = web3.eth.contract([{"constant":false,"inputs":[{"name":"transferTo","type":"address"}],"name":"directTransfer","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[],"name":"executeTransactions","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"loadAmount","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[],"name":"getPayees","outputs":[{"name":"","type":"address[]"},{"name":"","type":"address[]"},{"name":"","type":"uint256[]"},{"name":"","type":"uint8[]"},{"name":"","type":"uint8[]"},{"name":"","type":"uint16[]"},{"name":"","type":"bool[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"employees","outputs":[{"name":"sender","type":"address"},{"name":"receiver","type":"address"},{"name":"amount","type":"uint256"},{"name":"dayDD","type":"uint8"},{"name":"monthMM","type":"uint8"},{"name":"yearYYYY","type":"uint16"},{"name":"isTransactionDone","type":"bool"},{"name":"senderName","type":"string"},{"name":"receiverName","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"address1","type":"address"},{"name":"address2","type":"address"}],"name":"showAliasName","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"reqBalanceInEth","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"availableBalanceInEth","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"sender","type":"address"},{"name":"receiver","type":"address"},{"name":"amountInEth","type":"uint256"},{"name":"dayDD","type":"uint8"},{"name":"monthMM","type":"uint8"},{"name":"yearYYYY","type":"uint16"},{"name":"senderName","type":"string"},{"name":"receiverName","type":"string"}],"name":"addPayee","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"contractAddress","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":true,"stateMutability":"payable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"}]);

  //Deployed Contract Address
  PayRoll = PayRollContract.at('0xa21a0db50e359ee12392571099a7cc9c289ae2ba');
  console.log(PayRoll);


$(document).ready(function(){
$("#loader").hide();



  //Shows Newtwork according to NetworkID
  var ethereumNetwork;
  web3.version.getNetwork((err, netId) => {
    switch (netId) {
      case "1":
          ethereumNetwork = 'MainNet';
        console.log('This is mainnet')
        break
      case "2":
      ethereumNetwork = 'Morden Testnet';
        console.log('This is the deprecated Morden test network.')
        break
      case "3":
      ethereumNetwork = 'Ropsten Testnet';
        console.log('This is the ropsten test network.')
        break
      default:
      ethereumNetwork = 'Unknown Network';
        console.log('This is an unknown network.')
    }
    $("#networkLabel").html(ethereumNetwork);
  });


  SetDefaultAddress();
  ShowAvailableEth();
  ShowReqEth();
  ShowPayeeOnClick();
  //setInterval(SetDefaultAddress, 1000);
  //setInterval(ShowAvailableEth, 10000);
  //setInterval(ShowReqEth, 10000);
});


function SetDefaultAddress() {
    $("#instantTransferFromAddressTextBox").val(web3.eth.defaultAccount);
    $("#loadAmountFromAddressTextBox").val(web3.eth.defaultAccount);
    $("#addPayeeFromAddressTextBox").val(web3.eth.defaultAccount);
    
}


function AddPayeeOnClick() {
    $("#loader").show();
    var fromAddress = $("#addPayeeFromAddressTextBox").val();
    var toAddress = $("#addPayeeToAddressTextBox").val();
    var amount = $("#addPayeeAmountTextBox").val();
    var fromAddressName = $("#fromAddressName").val();
    var toAddressName = $("#toAddressName").val();
    var date = new Date(document.getElementById("addPayeeDateTextBox").value);
    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();
    PayRoll.addPayee(fromAddress, toAddress, amount, day, month, year, fromAddressName, toAddressName, function(error, result) {
        if (error) {
            $("#loader").hide();
            console.log(error);
        }
        else {
           $("#loader").hide();
           console.log(result);
           location = location;
        }
    });
}





PayRoll.contractAddress(function(error, result){
  if(!error)
      {
          $("#contractAddressLabel").html(result);
          console.log(result);
      }
  else
  {
    console.log(error);
  }
});


function ShowAvailableEth() {
PayRoll.availableBalanceInEth(function(error, result){
  if(!error)
      {
          $("#availableBalanceLabel").text(result + ' Ether');
          console.log(result);
      }
  else
  {
    console.log(error);
  }
});
}

function ShowReqEth() {
PayRoll.reqBalanceInEth(function(error, result){
    if(!error)
        {
            $("#requiredBalanceLabel").text(result + ' Ether');
            console.log(result);
        }
    else{
        console.log(error);
    }
});
}
    

function ExecuteTransactionsOnClick() {
    $("#loader").show();
    PayRoll.executeTransactions(function(error, result){
      if(!error)
          {
            $("#loader").hide();
            location = location;
            console.log(result);
          }
      else
      {
        $("#loader").hide();
        console.log(error);
      }
    });
}



function ShowPayeeOnClick(){
    $("#loader").show();
    PayRoll.getPayees(function(error, result){
        if(!error)
        {
        var arrayLength = result[0].length;
        $("#payeeListTable").empty();
        $("#payeeListTable").append('<tr><th>From Address</th><th>To Address</th><th>Amount in eth</th><th id="dateCol" class="tdh" onclick="sorter(this, 2, true);">Date(mm/dd/yyyy)</th><th>IsDone</th></tr>');
            var msgSender = web3.eth.defaultAccount;
            for(var i=0; i<arrayLength; i++ ){

                $("#payeeListTable").append('<tr><td>' + result[0][i] + '</td>' + '' + '<td>' + result[1][i] + '</td>' + '<td>' + result[2][i]/1000000000000000000 + '</td>' + ' '+ '<td>' + result[4][i] + '/' + result[3][i] + '/' + result[5][i] + '</td>' + '  '+ '<td>' + result[6][i] + '</td>' + '</tr>');
            }

        $("#payeeListDiv").show();
        $("#loader").hide();
        console.log(result);
        }
        else{
            console.log(error);
        }
    });
}

function LoadAmountOnClick() {
    $("#loader").show();
    var val = $("#loadAmountAmountTextBox").val();
    PayRoll.loadAmount({from: web3.eth.defaultAccount, value: web3.toWei(val,  'ether')},function(error, result){
    if(!error)
        {
            $("#loader").hide();
            location = location;
            console.log(result);
        }
    else
    {
        $("#loader").hide();
        console.log(error);
    }
    });
}


function InstantTransferOnClick() {
    $("#loader").show();
    var address = $("#instantTransferToAddressTextBox").val();
    var amount = $("#instantTransferAmountTextBox").val();
    PayRoll.directTransfer(address, {from: web3.eth.defaultAccount, value: web3.toWei(amount,  'ether')},function(error, result){
    if(!error)
        {
            $("#loader").hide();
            location = location;
            console.log(result);
        }
    else
    {
        $("#loader").hide();
        console.log(error);
    }
    });
}



function CheckBalanceOnClick() {
    var address = $("#checkBalanceAddressTextBox").val();
    web3.fromWei(web3.eth.getBalance(address,function(error, result){
        if(!error)
            {
                var result = result/1000000000000000000;
                $("#checkBalanceAmountTextBox").text(result + ' Ether');
                console.log(result);
            }
        else
            console.log(error);
      }));
}

function sorter(td, column, isDate) {

    var th = td.outerText.replace(/↑|↓/g, "");
    var tbl = document.getElementById('payeeListTable');
    var rows = Array.prototype.slice.call(tbl.rows, 1);

    var order = td.getAttribute("order") == "asc" ? "desc" : "asc";
    td.setAttribute("order", order);

    rows = rows.sort(function(a, b) {

        var valA = a.cells[column].innerText;
        var valB = b.cells[column].innerText;

        var compA = (isDate) ? new Date(valA) : valA;
        var compB = (isDate) ? new Date(valB) : valB;

        if (order == "asc") {
        if (compA < compB) return -1;
        if (compA > compB) return 1;
        document.getElementById('dateCol').textContent = th + '↑';
        }

        if (order == "desc") {
        if (compA > compB) return -1;
        if (compA < compB) return 1;
        document.getElementById('dateCol').textContent = th + '↓';
        }

        return 0;

    });

    var tbody = document.querySelector("#payeeListTable tbody");

    rows.forEach(function(v) {
        tbody.appendChild(v); 
        });
    }