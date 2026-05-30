document.addEventListener("DOMContentLoaded", function () {
  var shell = document.querySelector("[data-player]");

  if (!shell) {
    return;
  }

  var video = shell.querySelector("video");
  var button = shell.querySelector("[data-play-button]");
  var stream = shell.getAttribute("data-stream");
  var hlsInstance = null;

  function attachStream() {
    if (!video || !stream) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      if (video.getAttribute("src") !== stream) {
        video.setAttribute("src", stream);
      }
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      if (!hlsInstance) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      }
    }
  }

  function startPlayback() {
    attachStream();
    shell.classList.add("is-playing");

    var promise = video.play();

    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener("click", startPlayback);
  }

  if (video) {
    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayback();
      }
    });

    video.addEventListener("play", function () {
      shell.classList.add("is-playing");
    });
  }
});
