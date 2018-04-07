function getQueryVariable(variable)
{
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++)
  {
   var pair = vars[i].split("=");
   if(pair[0] == variable){return pair[1];}
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
    if (res.success == "true")
    {
      $('#login').show();
      $('#logout').hide();
    }
  });
}

sc2.setAccessToken(getQueryVariable('access_token'));

function commentWinnerList(author, authorPermlink, winners)
{
  if(sessionStorage.user == author)
  {
    var permlink = steem.formatter.commentPermlink(author, 'winner-announcement');
    console.log(winners);
    list_winners = winners.join(", @");
    var message = "<a href='https://deadz.github.io/SteemRandomDraw/'><img src='https://deadz.github.io/SteemRandomDraw/images/random.png' height='150px'/></a><br />"+$('#sc2').text()+"<b>@"+list_winners+"</b>.";
    console.log(message);
    sc2.comment(author, authorPermlink, author, permlink, '', message, '', function(err, result)
    {
      console.log(err, result);
      if(!err && result)
      {
        $('#post').hide();
        $('#post').before("<a href='https://busy.org/@"+author+"/"+authorPermlink+"/#@"+author+"/"+permlink+"'>https://busy.org/@"+author+"/"+authorPermlink+"/#@"+author+"/"+permlink+"</a>");
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
    logout();
  });

  $('#post').on("click", function()
  {
    console.log("commentWinnerList");
    commentWinnerList(sessionStorage.author, sessionStorage.permlink, win_list);
  });

});
