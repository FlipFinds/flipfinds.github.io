(function () {
  var trigger = document.getElementById('ff-demo-open');
  var dialog = document.getElementById('ff-demo');
  if (!trigger || !dialog || typeof dialog.showModal !== 'function') return;
  var video = dialog.querySelector('video');
  trigger.setAttribute('aria-haspopup', 'dialog');
  trigger.setAttribute('aria-controls', dialog.id);
  trigger.addEventListener('click', function (event) {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    // A poster downloads even in a closed dialog; request it only on demand.
    if (!video.hasAttribute('poster')) {
      video.setAttribute('poster', video.getAttribute('data-poster'));
    }
    dialog.showModal();
  });
  dialog.querySelector('.ff-demo-close').addEventListener('click', function () {
    dialog.close();
  });
  dialog.addEventListener('click', function (event) {
    if (event.target !== dialog) return;
    var bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('close', function () {
    video.pause();
    trigger.focus({ preventScroll: true });
  });
})();
