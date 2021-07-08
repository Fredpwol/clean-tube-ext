// use this variable to track the length of videos in case of list updates.
// Settings Trackers or Extension states.//
let visitedThumbnails = new Set();
let lastThumbnailLength = 0;
let prevBlurRange = 0; // tracks if the blur value changes.
let prevVideoClip = null;
let updatedThumbnails = new Set(); // use this to check if the video thumbnail has been updated
let thumbnailClip = "";
let previousList = [];
let prevCensorAll = null;
let prevAiSetting = false;
let originalThumbnails = new Map();
let images = new Map();
const timeFrame = 1000; // amount of time in milliseconds to parse the page for any updates.

function isEqaul(firstArr, secondArr) {
  if (firstArr.length !== secondArr.length) return false;

  firstArr.sort();
  secondArr.sort();
  for (let index = 0; index < firstArr.length; index++) {
    if (firstArr[index] != secondArr[index]) return false;
  }
  return true;
}

// runs
setInterval(function () {
  const thumbnailLinks = document.querySelectorAll("a#thumbnail");
  chrome.storage.local.get(null, (store) => {
    const {
      aiDetection,
      thumbnailRange,
      videoClip,
      blacklist,
      censorAll,
      blurRange,
    } = store;

    const channels = blacklist?.map((channel) => channel.toLowerCase()) || [];
    thumbnailLinks.forEach((link, key) => {
      if (
        (!visitedThumbnails.has(key) ||
          prevBlurRange != blurRange ||
          prevVideoClip != videoClip ||
          prevAiSetting != aiDetection ||
          !isEqaul(channels, previousList) ||
          prevCensorAll != censorAll ||
          thumbnailRange != thumbnailClip) &&
        key != thumbnailLinks.length - 1
      ) {
        const image = link.querySelector("yt-img-shadow img");
        const videoID = parseLink(link.href);
        if (!images.has(videoID)) {
          // used to hold a mapping of video id and image node object
          images.set(videoID, image);
        }
        !originalThumbnails.has(videoID) && image.src.match("https://i.ytimg.com/vi/.*/(hqdefault|mqdefault|hq720).jpg?.*") && originalThumbnails.set(videoID, image.src);
        let channelName = link.parentElement.nextElementSibling.querySelector("a#avatar-link")?.title.toLowerCase();
        if (!Boolean(channelName)) {
          // checks search screen videos.
          let name = link.parentElement.nextElementSibling.querySelector("#channel-info")?.querySelector("yt-formatted-string a").innerHTML;
          channelName = name?.toLowerCase();
        }
        if (!Boolean(channelName)) {
          // checks subscribe screen videos.
          let name = link.parentElement.nextElementSibling.querySelector("ytd-channel-name")?.querySelector("yt-formatted-string#text a")?.innerHTML;
          channelName = name?.toLowerCase();
        }
        if (!Boolean(channelName)) {
          // checks video screen videos.
          let name = link.parentElement.nextElementSibling.querySelector("ytd-channel-name")?.querySelector("yt-formatted-string#text")?.innerHTML;
          channelName = name?.toLowerCase();
        }
        if (channels.includes(channelName) || censorAll) {
          updateVideoThumbnail(
            videoClip,
            image,
            blurRange,
            videoID,
            thumbnailRange
          );
        } else if (previousList.includes(channelName)) {
          // restores thumbnail to default values and settings for video whose channel was removed from the blacklist
          // if the channel is'nt found on the current list but on the previous means it was removed from the blacklist
          // so we its the reason we have a previous list to compare for changes.
          image.src = originalThumbnails.get(videoID);
          image.style.filter = "blur(0px)";
        } else if (aiDetection && !visitedThumbnails.has(key)) {
          fetch(`http://localhost:5001/predict-clickbait/${videoID}`)
            .then((res) => {
              if (res.status == 200) {
                return res.json();
              }
            })
            .then((data) => {
              if (data.score > 0.5) {
                updateVideoThumbnail(
                  videoClip,
                  images.get(data._id),
                  blurRange,
                  data._id,
                  thumbnailRange
                );
              }
            })
            .catch((err) => console.error(err));
        }
        visitedThumbnails.add(key);
      }
    });
    prevVideoClip = videoClip;
    thumbnailClip = thumbnailRange;
    prevBlurRange = blurRange;
    prevCensorAll = censorAll;
    prevAiSetting = aiDetection;
    previousList = channels;
  });
  // lastThumbnailLength = thumbnailLinks.length-1;
}, timeFrame);

function parseLink(link) {
  return link.replace(/(https|http):\/\/www.youtube.com\/watch\?v=/, "");
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

function updateVideoThumbnail(
  videoClip,
  image,
  blurRange,
  videoID,
  thumbnailRange
) {
  if (!videoClip) {
    // converting to the original thumbnail if the setting for video has been turned off
    // this is to make sure that the thumbnails return to their default image
    if (
      !image.src.match(
        "https://i.ytimg.com/vi/.*/(hqdefault|mqdefault|hq720).jpg?.*"
      ) &&
      originalThumbnails.has(videoID)
    ) {
      image.src = originalThumbnails.get(videoID);
    }
    image.style.filter = `blur(${blurRange}px)`;
  } else {
    if (image.src) {
      let clip;
      switch (thumbnailRange) {
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
    }
  }
}
