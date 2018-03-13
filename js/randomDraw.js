// SET

// SET.VIEW
	$('#wait').hide();
	$('#participants').hide();
	$('#result').hide();
	$('#err_div').hide();
// END SET.VIEW

// SET.VAR
	steem.api.setOptions({ url: 'https://api.steemit.com' });
	var vote_participant = [];
	var coms_participant = [];
	var participants = [];
	var number_of_draws = "1";
// END SET.VAR

// END SET

// FUNCTION

function getAuthorPermlink(link_full)
{
	console.log("getInfoLink");

		regex_v1 = new RegExp("/@");
		regex_v2 = new RegExp("/");

		if (regex_v1.test(link_full) == true)
		{
			link_split = link_full.split(regex_v1)[1];
			sessionStorage.setItem("link_site", link_full.split(regex_v2)[0]+"//"+link_full.split(regex_v2)[2]);
			//console.log(sessionStorage.link_site);
			sessionStorage.setItem("author", link_split.split(regex_v2)[0]);
			//console.log(sessionStorage.author);
			sessionStorage.setItem("permlink", link_split.split(regex_v2)[1]);
			//console.log(sessionStorage.permlink);
			return true;
		}
		else
		{
			$('#err_title').html("Error");
			$('#err_body').html("Please, Provide a valid link like https://busy.org/fr/@deadzy/my-contribution");
			$('#err_div').show();
			$("#wait").hide();
			return false;
		}
}

async function getInfoFull(author, permlink)
{
	console.log("getInfoFull");

	await steem.api.getContent(author, permlink, function(err, result) 
	{
		//console.log(err, result);
		if (result.active_votes != "" && err == null) 
		{
			sessionStorage.setItem("vote", JSON.stringify(result.active_votes));

			vote_list = JSON.parse(sessionStorage.getItem("vote"));
			console.log(vote_list);
			vote_min = $('#vote_field')[0].value; // Minimum voting percentage
			i = 0;
			vote_valid = 0; // Votes valid
			sessionStorage.setItem("vote_nb", vote_list.length);
			if (vote_min !== null && vote_min !== "") { vote_min = vote_min*100; }
			else { vote_min = 0; }
			while (i < vote_list.length)
			{
			    if(vote_list[i].percent >= vote_min)
			    {
			       	vote_participant.push(vote_list[i].voter);
			    	vote_valid++;
			    }
			    i++;
			}
			sessionStorage.setItem("vote_valid", vote_valid);
		}
	});

	await steem.api.getContentReplies(author, permlink, function(err, result)
	{
		//console.log(err, result);
		if(result != "" && err == null)
		{
			sessionStorage.setItem("coms", JSON.stringify(result));

			coms_list = JSON.parse(sessionStorage.getItem("coms"));
			console.log(coms_list);
			coms_text = $('#coms_field')[0].value; // Comment's keyword
			i = 0;
			coms_valid = 0; // Commentarys valid
			sessionStorage.setItem("coms_nb", coms_list.length);
			while (i < sessionStorage.getItem("coms_nb"))
			{
				var regex =  new RegExp(coms_text, "ig");
				if(regex.test(coms_list[i].body) == true)
				{
					coms_participant.push(coms_list[i].author);
				 	coms_valid++;
				}
			    i++;
			}
			sessionStorage.setItem("coms_valid", coms_valid);
		}
	});
}

function getRandomDraw()
{
	console.log("getRandomDraw");

	if($("#coms_box").is(":checked") == true)
	{
		if($("#vote_box").is(":checked") == true)
		{
			participant_lenght = vote_participant.length;
			x = 0;
			for (i = 0; i < participant_lenght; i++)
			{	
				if($.inArray(vote_participant[i], coms_participant) >= 0)
				{
					participants.push(vote_participant[i]);
					x++;
					$("#tab").append("<tr><td>"+x+"</td><td>"+vote_participant[i]+"</td></tr>");
				}
			}
			num = randomNumber(participants.length);
			sessionStorage.setItem("winner", participants[num]);
		}
		else
		{
			participant_lenght = coms_participant.length;
			x = 0;
			for (i = 0; i < participant_lenght; i++)
			{
				x++;
				$("#tab").append("<tr><td>"+x+"</td><td>"+coms_participant[i]+"</td></tr>");
			}
			num = randomNumber(coms_participant.length);
			sessionStorage.setItem("winner", coms_participant[num]);
		}
	}
	else
	{
		participant_lenght = vote_participant.length;
		x = 0;
		for (i = 0; i < participant_lenght; i++)
		{
			x++;
			$("#tab").append("<tr><td>"+x+"</td><td>"+vote_participant[i]+"</td></tr>");
		}
		num = randomNumber(vote_participant.length);
		sessionStorage.setItem("winner", vote_participant[num]);
	}
	getResult();
}

function getResult()
{
	console.log("getResult");

	sessionStorage.setItem("num_of_draws", number_of_draws++);

	$("#winner").append("<h1><a href='https://busy.org/@"+sessionStorage.getItem("winner")+"' target='_blank'>/@"+sessionStorage.getItem("winner")+"</a></h1><b class='w3-right'><i class='fa fa-certificate'></i> Certified random draw n°"+sessionStorage.getItem("num_of_draws")+"</b>");
	$('.vote_nb').html(sessionStorage.getItem("vote_nb"));
	$('.coms_nb').html(sessionStorage.getItem("coms_nb"));
	$('.vote_nb_valid').html(sessionStorage.getItem("vote_valid"));
	$('.coms_nb_valid').html(sessionStorage.getItem("coms_valid"));

	$("#wait").hide();

	$('#participants').show();
	$('#result').show();
}

function randomNumber(max)
{
	return Math.floor(Math.random()*(max));
}

// FUNCTION END

// EVENT

$("#coms_box").change(function()
{
	if($("#coms_box").is(":checked") == true)
	{
		$("#coms_field").prop('disabled', false);
	}
	else
	{
		$("#coms_field").prop('disabled', true);
		$("#coms_field").prop('value', "");
		if($("#vote_box").is(":checked") == false)
		{
			$("#vote_box").prop('checked', true);
			$("#vote_field").prop('disabled', false);
		}
	}
}).change();

$("#vote_box").change(function()
{
	if($("#vote_box").is(":checked") == true)
	{
		$("#vote_field").prop('disabled', false);
	}
	else
	{
		$("#vote_field").prop('disabled', true);
		$("#vote_field").prop('value', "");
		if($("#coms_box").is(":checked") == false)
		{
			$("#coms_box").prop('checked', true);
			$("#coms_field").prop('disabled', false);
		}
	}
}).change();

$('#link_form').submit(function(event)
{
	event.preventDefault();
	$("#wait").show();

	// RESET

	$("#tab").html("");
	$("#winner").html("");

	$('#participants').hide();
	$('#result').hide();

	vote_participant = [];
	coms_participant = [];
	participants = [];

	// END RESET

	var link_full = $('#link_field')[0].value;

	if(getAuthorPermlink(link_full) == true)
	{
		getInfoFull(sessionStorage.getItem("author"), sessionStorage.getItem("permlink"));
		setTimeout(getRandomDraw, 1000);
		sessionStorage.clear();
	}
	else
	{
		$("#wait").hide();
	}
});

		// EVENT END