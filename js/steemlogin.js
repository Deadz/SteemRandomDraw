function getQueryVariable(variable)
{
       var query = window.location.search.substring(1);
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
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
var link = sc2.getLoginURL();
if (window.location.search == "")
	window.location.replace(link);
//

sc2.setAccessToken(getQueryVariable('access_token'));

function commentWinnerList(author, authorPermlink, winners)
{
	var permlink = steem.formatter.commentPermlink(author, authorPermlink);
	console.log(permlink);
	console.log(winners);
	var message = "test";
    sc2.comment(author, authorPermlink, author, permlink, '', message, '', function(err, result) {
      console.log(err, result);
    });
}