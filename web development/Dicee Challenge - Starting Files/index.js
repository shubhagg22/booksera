var random1=Math.floor(Math.random()*6)+1;
var imgsource1="images/dice"+random1+".png";
var image1=document.querySelectorAll("img")[0];
image1.setAttribute("src",imgsource1);

var random2=Math.floor(Math.random()*6)+1;
var imgsource2="images/dice"+random2+".png";
var image2=document.querySelectorAll("img")[1]
image2.setAttribute("src",imgsource2);
if(random1>random2){
    document.querySelector("h1").innerHTML="Player 1 ka game";
}
else if(random 1<random2){
    document.querySelector("h1").innerHTML="Player 2 ka game";
}
else
document.querySelector("h1").innerHTML="Draw";