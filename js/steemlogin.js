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

// Request user details if token is available
if (localStorage.token != null) 
{
  sc2.setAccessToken(localStorage.token);
  sc2.me(function (err, result) 
  {
    console.log('/me', err, result); // DEBUG
    if (!err) 
    {
      console.log(result);
      localStorage.setItem("t_use", result.account);
    }
  });
}
else
{
  sc2.setAccessToken(getQueryVariable('access_token'));
  sc2.me(function (err, result) 
  {
    console.log('/me', err, result); // DEBUG
    if (!err) 
    {
      console.log(result);
      localStorage.setItem("t_use", result.account);
    }
  });
}

function commentWinnerList(author, authorPermlink, winners)
{
  if(sessionStorage.user == author)
  {
    var permlink = steem.formatter.commentPermlink(author, 'winner-announcement');
    console.log(winners);
    list_winners = winners.join(", @");
    var message = "<a href='https://deadz.github.io/SteemRandomDraw/'><center><img src='https://deadz.github.io/SteemRandomDraw/images/random.png'/></center></a><br />"+$('#sc2').text()+"<b>@"+list_winners+"</b>.";
    console.log(message);
    sc2.comment(author, authorPermlink, author, permlink, '', message, '', function(err, result)
    {
      console.log(err, result);
      if(!err && result)
      {
        $('#post').hide();
        $('#post').before("<p><b>"+$('#comsend').text()+" : <a href='https://busy.org/@"+author+"/"+authorPermlink+"/#@"+author+"/"+permlink+"'>https://busy.org/@"+author+"/"+authorPermlink+"/#@"+author+"/"+permlink+"</a></b></p>");
      }
    });
  }
}

function getUser()
{
  sc2.me(function (err, res) 
  {
    //console.log(err, res)
    if (!err && res != null)
    {
      $('#user').html(res.user);
      sessionStorage.setItem("user", res.user);
      $('#login').hide();
      $('#logout').show();
      $('#post').hide();
      console.log(res.user);
    }
    else
    {
      $('#logout').hide();
      $('#post').hide();
    } 
  });
}

getUser();

$(document).ready(function()
{
  $('#login').click(function()
  {
    console.log("Login");
    login();
    console.log(getUser());
  });

  $('#logout').click(function()
  {
    console.log("Logout");
    $('#login').show();
    $('#logout').hide();
    logout();
  });

  $('#post').on("click", function()
  {
    console.log("commentWinnerList");
    commentWinnerList(sessionStorage.author, sessionStorage.permlink, win_list);
  });

});