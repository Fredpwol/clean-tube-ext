// use this variable to track the length of videos in case of list updates.
// Settings Trackers or Extension states.//
var visitedThumbnails = new Set();
var lastThumbnailLength = 0;
var blurRange = 0; //tracks if the blur value changes.
var videoClip = null;
var updatedThumbnails = new Set(); // use this to check if the video thumbnail has been updated
var thumbnailClip = "";

setInterval(function () {
  var thumbnailLinks = document.querySelectorAll("a#thumbnail");
  chrome.storage.local.get("videoClip", (res) => {
    chrome.storage.local.get("blurRange", (result) => {
      chrome.storage.local.get("thumbnailRange", (thumbnailRangeStore) => {
        thumbnailLinks.forEach((link, key) => {
          if (
            (!visitedThumbnails.has(key) ||
              (blurRange != result.blurRange) ||
              (videoClip != res.videoClip) ||
              !updatedThumbnails.has(key) ||
              (thumbnailRangeStore.thumbnailRange != thumbnailClip)) &&
            (key != thumbnailLinks.length - 1)
          ) {
            {
              const image = link.querySelector("yt-img-shadow img");
              const channelName = link.parentElement.nextElementSibling.querySelector("a#avatar-link").title.toLowerCase();
              chrome.storage.local.get("blacklist", (storage) => {
                const channels = storage.blacklist.split(",").map(channel => channel.toLowerCase());
                if (!channels.includes(channelName)){
                  if (!res.videoClip) {
                    if (!image.src.match("https://i.ytimg.com/vi/.*/(hqdefault|mqdefault|hq720).jpg?.*")){
                      updateThumbnails("hq720",image)
                    }
                    image.style.filter = `blur(${result.blurRange}px)`;
                  } else {
                    if (image.src) {
                      let clip;
                      switch (thumbnailRangeStore.thumbnailRange) {
                        case "start":
                          clip = "hq1";
                          break;
                        case "middle":
                          clip = "hq2";
                          break;
                        case "end":
                          clip = "hq3";
                          break;
                        default:
                          clip = "hq1";
                      }
                      console.log(clip, thumbnailRangeStore.thumbnailRange)
                      updateThumbnails(clip, image);
                      updatedThumbnails.add(key);
                    }
                  }
                }
              })
              
            }
            parseLink(link.href)
            visitedThumbnails.add(key);
          }
        });
        videoClip = res.videoClip;
        thumbnailClip = thumbnailRangeStore.thumbnailRange;
        blurRange = result.blurRange;
      });
    });
  });
  // lastThumbnailLength = thumbnailLinks.length-1;
}, 1000);

function parseLink(link) {
  let start = link.indexOf("=") + 1;
  let res = link.slice(start, start + 11);
  return res;
}

function updateThumbnails(newImage, imgObject) {
  if (
    imgObject.src.match(
      "https://i.ytimg.com/vi/.*/(hq1|hq2|hq3|hqdefault|mqdefault|hq720).jpg?.*"
    )
  ) {
    let url = imgObject.src.replace(
      /(hq1|hq2|hq3|hqdefault|mqdefault|hq720).jpg/,
      `${newImage}.jpg`
    );

    if (!url.match(".*stringtokillcache")) {
      url += "?stringtokillcache";
    }

    imgObject.src = url;
    imgObject.style.filter = "";
  }
}
