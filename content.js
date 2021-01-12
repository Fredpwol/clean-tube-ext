// use this variable to track the length of videos in case of list updates.
var visitedThumbnails = new Set();
var visitedThumbnailLinks = new Set();
var lastThumbnailLength = 0;

setInterval(function (){
  var thumbnails = document.querySelectorAll("a#thumbnail yt-img-shadow img");
  var thumbnailLinks = document.querySelectorAll("a#thumbnail");

    thumbnails.forEach((image, key) =>{
      if ((!visitedThumbnails.has(key)) || key === lastThumbnailLength){
        chrome.storage.local.get("blurRange", result => {
          image.style.filter = `blur(${result.blurRange}px)`
        })
        visitedThumbnails.add(key);
      }
    })
    lastThumbnailLength = thumbnails.length-1;
    thumbnailLinks.forEach((link, key) => {
      if(! visitedThumbnailLinks.has(key)){
        parseLink(link.href);
        visitedThumbnailLinks.add(key);
      }
    })
}, 3000)


function parseLink(link) {
  let start = link.indexOf("=") + 1
  let res = link.slice(start)
  return res;
}