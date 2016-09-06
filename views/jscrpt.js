$(document).ready(function(){
   $("#btnReg").click(function(){
       if($("#uName").val() == "" ){
            $("#uNameAlert").css("display","block");
                 setTimeout(function(){
                $("#uNameAlert").css("display","none");
                }, 3000);
                
       }else if($("#pass1").val() == "" ){
            $("#pass1Alert").css("display","block");
                 setTimeout(function(){
                $("#pass1Alert").css("display","none");
                }, 3000);
     }else if($("#pass2").val() == "" ){
            $("#pass2Alert").css("display","block");
                 setTimeout(function(){
                $("#pass2Alert").css("display","none");
                }, 3000);   
     }else{
       if($("#pass1").val() == $("#pass2").val())
            $("#regForm").submit();
      else{
            $("#passAlert").css("display","block");
                 console.log("laer");
                 setTimeout(function(){
                $("#passAlert").css("display","none");
                }, 3000);
      }
     }
   });
   
   $("#btnLog").click(function(){
             if($("#logUName").val() == "" ){
            $("#loguNameAlert").css("display","block");
                 setTimeout(function(){
                $("#loguNameAlert").css("display","none");
                }, 3000);
                
       }else if($("#logPass").val() == "" ){
            $("#logPassAlert").css("display","block");
                 setTimeout(function(){
                $("#logPassAlert").css("display","none");
                }, 3000);
                
       }else
            $("#logForm").submit();
       
   });
   
      $("#btnUp").click(function(){
            $("#upForm").submit();
       
   });
   var cntr=0;

   $("#btnAdd").click(function() {
       $("#loading").css("display","block");
       cntr=0;
      if($("#bookName").val() != "" ){

        $.getJSON("/imagesearch/" +$("#bookName").val().replace(/Ğ/g, "G").replace(/ğ/g, "g").replace(/İ/g, "I").replace(/ı/g, "i")+" "+$("#author").val().replace(/Ğ/g, "G").replace(/ğ/g, "g").replace(/İ/g, "I").replace(/ı/g, "i")+"%20book%20kitap", function( data ) {
        $("#loading").css("display","none");
        $("#images").attr("src",data[cntr].thumbnail);
        $("#urlInput").val(data[cntr].thumbnail);
        $("#book_author").val($("#bookName").val()+"_"+$("#author").val());
        $("#chooseImg").css("display","block");
        $("#chooseImgBtns").css("display","block");
        });
      }else{
        $("#searchAlert").css("display","block");
        setTimeout(function(){
            $("#searchAlert").css("display","none");
            }, 3000); 
      }
   });
   
  $("#books").click(function() {
    $("#addBookForm").submit();
      cntr=0;
  }) ;
  
    $("#next").click(function() {
     $("#loading").css("display","block");
      cntr++;
       $.getJSON("/imagesearch/" +$("#bookName").val().replace(/Ğ/g, "G").replace(/ğ/g, "g").replace(/İ/g, "I").replace(/ı/g, "i")+" "+$("#author").val().replace(/Ğ/g, "G").replace(/ğ/g, "g").replace(/İ/g, "I").replace(/ı/g, "i")+"%20book%20kitap", function( data ) {
        $("#loading").css("display","none");
        $("#images").attr("src",data[cntr].thumbnail);
        $("#urlInput").val(data[cntr].thumbnail);
    }) ;
    });
   

});
function myFunction(id) {
    var x = document.getElementById(id);
    if (x.className.indexOf("w3-show") == -1) {
        x.className += " w3-show";
    } else { 
        x.className = x.className.replace(" w3-show", "");
    }
}