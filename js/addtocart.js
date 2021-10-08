function addtocart(id) {
    qty=1;
    var bool = $(".qty_input").val()

    if (bool) {
        qty = parseInt(bool);
 
    }
     console.log("I am here");
     var xhttp = new XMLHttpRequest();
     var obj = { id: id, qty: qty };
     xhttp.onreadystatechange = function () {
         if (this.readyState == 4 && this.status == 200) {
             if (this.responseText == "ok") {
                 alert("Cart has been updated!!!");
             }
             else {
                 alert("Something went wrong");
             }
         }
     }
     xhttp.open("POST", "/addtocart", true)
     xhttp.setRequestHeader("content-type", "application/json")
     xhttp.send(JSON.stringify(obj));
 }