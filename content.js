setInterval(function (){
  document.querySelectorAll("a#thumbnail yt-img-shadow img").forEach(image =>{
    image.style.filter = "blur(10px)"
})
}, 3000)


