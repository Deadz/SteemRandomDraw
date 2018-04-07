$('#logout').hide();
$('#login').hide();
$('#post').hide();

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
  });
}

sc2.setAccessToken(getQueryVariable('access_token'));

function commentWinnerList(author, authorPermlink, winners)
{
  if (getUser() == author)
  {
    var permlink = steem.formatter.commentPermlink(author, authorPermlink);
    console.log(permlink);
    console.log(winners);
    var message = "test";
    sc2.comment('', '', author, authorPermlink, '', message, '', function(err, result)
    {
      console.log(err, result);
    });
  }
}

function getUser()
{
  sc2.me(function (err, res) 
  {
    //console.log(err, res)
    if (!err)
    {
      console.log(res.user);
    }  
  });
}

$(document).ready(function()
{
  // use = await getUser();
  // if(use != false)
  // {
  //   console.log(getUser());
  //   $('#login').hide();
  //   $('#user').html(use);
  //   $('#logout').show();
  //   $('#post').show();
  // }
  // else
  // {
  //   if(use == null)
  //   {
  //     $('#login').show();
  //     $('#logout').hide();
  //   }
  // }

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
});
