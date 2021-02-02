console.log("Backgroud script")

chrome.runtime.onMessage.addListener(function(req, sender, sendResp){
    console.log(req.message)
})