$(function() {  
    $('.btn-6')
      .on('mouseenter', function(e) {
              var parentOffset = $(this).offset(),
                relX = e.pageX - parentOffset.left,
                relY = e.pageY - parentOffset.top;
              $(this).find('span').css({top:relY, left:relX})
      })
      .on('mouseout', function(e) {
              var parentOffset = $(this).offset(),
                relX = e.pageX - parentOffset.left,
                relY = e.pageY - parentOffset.top;
          $(this).find('span').css({top:relY, left:relX})
      });
    $('[href=#]').click(function(){return false});
  });

function rotate() {
  document.getElementById("cube").tabIndex = -1;
  document.getElementById('cube').focus();
  setTimeout(redirect, 1000);
}

function redirect() {
  document.getElementById('cube').removeAttribute("tabindex");
  document.getElementById('experiment').focus();
  window.location.href = "/login";
}