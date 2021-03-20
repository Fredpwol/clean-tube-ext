var slider = document.getElementById("myRange");
var aiSwitch = document.getElementById("ai-detection");
var output = document.getElementById("output");
var videoSwitch = document.getElementById("video-clip");
var videoRange = document.getElementById("video-range");
var blacklist = document.getElementById("blacklist");
var censorAll = document.getElementById("censor-all");

var radioButtons = videoRange.querySelectorAll("input");
var radioButtonsLabel = videoRange.querySelectorAll("label");

chrome.storage.local.get("blurRange", (result) => {
    if (!result.blurRange) {
        chrome.storage.local.set({"blurRange": 5})
        slider.value = 5;
        return
    }
    slider.value = result.blurRange;
})

var lists = "sam,goat,jane";


blacklist.value = localStorage.getItem("blacklist");



// var input = $(el).data('taginput');
// input.val("sam,fred");

chrome.storage.local.get("aiDetection", (result) => {
    if (!result.aiDetection) {
        chrome.storage.local.set({"aiDetection": false})
        aiSwitch.checked = false;
        return
    }
    aiSwitch.checked = result.aiDetection;
})

chrome.storage.local.get("thumbnailRange", (result) => {
    radioButtons.forEach(node => {
        if (node.value === result.thumbnailRange){
            node.checked = true;
        }
    })
})

chrome.storage.local.get("censorAll", (storage) => {
    censorAll.checked = storage.censorAll || false;
})
chrome.storage.local.get("videoClip", (result) => {
    if (!result.videoClip) {
        chrome.storage.local.set({"videoClip": false})
        videoSwitch.checked = false;
        return
    }
    videoSwitch.checked = result.videoClip;
    radioButtonsLabel.forEach(node => {
        node.hidden = !result.videoClip;
    });
    radioButtons.forEach(node => {
        node.hidden = !result.videoClip;
    });
})

// Update the current slider value (each time you drag the slider handle)
slider.oninput = function() {
  chrome.storage.local.set({"blurRange": this.value})
}
aiSwitch.onchange = function(){
    chrome.storage.local.set({"aiDetection": this.checked})
}
videoSwitch.onchange = function(){
    chrome.storage.local.set({"videoClip": this.checked})
    radioButtonsLabel.forEach(node => {
        node.hidden = !this.checked;
    });
    radioButtons.forEach(node => {
        node.hidden = !this.checked;
    });
}
censorAll.onchange = function(){
    chrome.storage.local.set({"censorAll": this.checked})
}

radioButtons.forEach(node => {
    node.onchange = function () {
        chrome.storage.local.set({"thumbnailRange": this.value});
      }
})

function onTag(tag, val, values){
    localStorage.setItem("blacklist", values)
    chrome.storage.local.set({"blacklist": values})
}

function onRemove(tag, val, values) { 
    localStorage.setItem("blacklist", values)
    chrome.storage.local.set({"blacklist": values})
}