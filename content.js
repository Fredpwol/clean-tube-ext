setInterval(function (){
  document.querySelectorAll("a#thumbnail yt-img-shadow img").forEach(image =>{
    image.style.filter = "blur(10px)"
})
}, 3000)


function parseLink(link) {
  let start = link.indexOf("=") + 1
  let res = link.slice(start)
  return res;
}