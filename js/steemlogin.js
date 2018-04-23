function getQueryVariable(variable)
{
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++)
  {
   var pair = vars[i].split("=");
   if(pair[0] == variable)
    {
      localStorage.setItem("token", pair[1]);
      return pair[1];
    }
  }
  return(false);
}

sc2.init({
    app:'delayed-upvotes',
    callbackURL: 'https://deadz.github.io/SteemRandomDraw/',
    accessToken: 'access_token',
    scope: ['comment']
})

//authentication
function login()
{
  var link = sc2.getLoginURL();
  if (window.location.search == "")
    window.location.replace(link);
}

function logout()
{
  sc2.revokeToken(function (err, res)
  {
    console.log(err, res)
    if(res.success)
    {
      $('#login').show();
      $('#logout').hide();
      localStorage.removeItem('token');
      localStorage.removeItem('t_use');
    }
  });
}

if(localStorage.token != null) 
{
  sc2.setAccessToken(localStorage.token);
  sc2.me(function (err, result) 
  {
    //console.log('/me', err, result); // DEBUG
    if (!err) 
    {
      localStorage.setItem("t_use", result.user);
      show_btn();
    }
  });
}
else
{
  sc2.setAccessToken(getQueryVariable('access_token'));
  sc2.me(function (err, result) 
  {
    //console.log('/me', err, result); // DEBUG
    if (!err) 
    {
      console.log(result.user);
      localStorage.setItem("t_use", result.user);
      show_btn();
    }
  });
}

function commentWinnerList(author, authorPermlink, winners)
{
  if(localStorage.t_use == author)
  {
    var permlink = steem.formatter.commentPermlink(author, 'winner-announcement');
    list_winners = winners.join(", @");
    var message = "<a href='https://deadz.github.io/SteemRandomDraw/'><center><img src='https://deadz.github.io/SteemRandomDraw/images/random.png'/></center></a><br />"+$('#sc2').text()+"<b>@"+list_winners+"</b>.";
    sc2.comment(author, authorPermlink, author, permlink, '', message, '', function(err, result)
    {
      console.log(err, result);
      if(!err && result)
      {
        $('#send').before("<p><b>"+$('#comsend').text()+" : <a href='https://busy.org/@"+author+"/"+authorPermlink+"/#@"+author+"/"+permlink+"'>https://busy.org/@"+author+"/"+authorPermlink+"/#@"+author+"/"+permlink+"</a></b></p>");
        $('#send_wait').hide();
      }
    });
  }
}

function show_btn()
{
  if(localStorage.t_use != null)
  {
    $('#user').text(localStorage.t_use);
    $('#logout').show();
    $('#login').hide();
  }
  else
  {
    $('#logout').hide();
    $('#login').show();
  }
}

$('#send_wait').hide();

$(document).ready(function()
{
  $('#login').click(function()
  {
    console.log("Login");
    login();
  });

  $('#logout').click(function()
  {
    console.log("Logout");
    $('#login').show();
    $('#logout').hide();
    logout();
  });

  $('#send').on("click", function()
  {
    console.log("commentWinnerList");
    $('#send').hide();
    $('#send_wait').show();
    commentWinnerList(sessionStorage.author, sessionStorage.permlink, win_list);
  });

  show_btn();

});