// use this variable to track the length of videos in case of list updates.
// Settings Trackers or Extension states.//
var visitedThumbnails = new Set();
var lastThumbnailLength = 0;
var blurRange = 0; //tracks if the blur value changes.
var videoClip = null;
var updatedThumbnails = new Set(); // use this to check if the video thumbnail has been updated
var thumbnailClip = "";
var previousList = [];
var prevCensorAll = null;

function isEqaul(firstArr, secondArr) {
  if (firstArr.length !== secondArr.length) return false;
  firstArr.sort()
  secondArr.sort()
  for (let index = 0; index < firstArr.length; index++) {
    if (firstArr[index] != secondArr[index]) return false;
  }
  return true;
}

setInterval(function () {
  var thumbnailLinks = document.querySelectorAll("a#thumbnail");
  chrome.storage.local.get("videoClip", (res) => {
    chrome.storage.local.get("blurRange", (result) => {
      chrome.storage.local.get("thumbnailRange", (thumbnailRangeStore) => {
        chrome.storage.local.get("blacklist", (storage) => {
          chrome.storage.local.get("censorAll", ({ censorAll }) => {
            const channels = storage.blacklist.map(channel => channel.toLowerCase());
            thumbnailLinks.forEach((link, key) => {
              if (
                (!visitedThumbnails.has(key) ||
                  (blurRange != result.blurRange) ||
                  (videoClip != res.videoClip) ||
                  !updatedThumbnails.has(key) ||
                  !isEqaul(channels, previousList) ||
                  prevCensorAll != censorAll ||
                  (thumbnailRangeStore.thumbnailRange != thumbnailClip)) &&
                (key != thumbnailLinks.length - 1)
              ) {
                {
                  const image = link.querySelector("yt-img-shadow img");
                  let channelName = link.parentElement.nextElementSibling.querySelector("a#avatar-link")?.title.toLowerCase();
                  if (!channelName) {
                  // checks search screen videos.
                    let name = link.parentElement.nextElementSibling.querySelector("#channel-info")?.querySelector("yt-formatted-string a").innerHTML;
                    channelName = name.toLowerCase();
                  }
                  if(!channelName) {
                    // checks video screen videos.
                    let name = link.parentElement.nextElementSibling.querySelector("#channel-name")?.querySelector("yt-formatted-string#text").innerHTML;
                  }
                    if (channels.includes(channelName) || censorAll){
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
                          updateThumbnails(clip, image);
                          updatedThumbnails.add(key);
                        }
                      }
                      previousList.push(channelName)
                    }
                    else if(previousList.includes(channelName))
                    {
                      updateThumbnails("hq720",image);
                      image.style.filter = "blur(0px)";
                      delete previousList[previousList.indexOf(channelName)];
                    }
                   
                }
                visitedThumbnails.add(key);
              }
              })
              videoClip = res.videoClip;
              thumbnailClip = thumbnailRangeStore.thumbnailRange;
              blurRange = result.blurRange;
              prevCensorAll = censorAll;
          })
        });
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
