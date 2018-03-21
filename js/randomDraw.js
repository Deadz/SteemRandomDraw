// SET

// SET.VIEW
	$('#wait').hide();
	$('#participants').hide();
	$('#result').hide();
	$('#nobody').hide();
	$('#err_div').hide();
// END SET.VIEW

// SET.VAR
	steem.api.setOptions({ url: 'https://api.steemit.com' });
	var vote_participant = [];
	var coms_participant = [];
	var participants = [];
	var number_of_draws = "1";
	var no_winner = $("#winner").html();
// END SET.VAR

// SET.VAL.SAVE
	$("#vote_field").val(localStorage.vote_min);
	$("#coms_field").val(localStorage.coms_text);
	if(localStorage.coms_box == "false")
	$("#coms_box").prop('checked', false);
	else
	$("#coms_box").prop('checked', true);
	if(localStorage.vote_box == "false")
	$("#vote_box").prop('checked', false);
	else
	$("#vote_box").prop('checked', true);
	if(localStorage.nobots_box == "false")
	$("#nobots_box").prop('checked', false);
	else
	$("#nobots_box").prop('checked', true);
// END SET.VAL.SAVE

// END SET
console.log($("#link_form").serialize());
console.log(localStorage);
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

	await steem.api.getActiveVotes(author, permlink, function(err, result) 
	{
		console.log("getVoteValid");
		//console.log(err, result);

		var vote_valid = 0; // Votes valid

		if (err == null) 
		{
			sessionStorage.setItem("vote_nb", result.length);
			localStorage.setItem("vote_min", $('#vote_field')[0].value);

			if ($('#vote_field')[0].value !== "")
			{
				vote_min = $('#vote_field')[0].value*100;
			}
			else
			{
				vote_min = 0;
			}
			
			var participants = [];
			// DELETING BOTS
			$.ajax({
				url: "./list_of_bots/bots.json",
				dataType: 'json',
				async: false,
				data: null,
				success: function(data) 
				{
					for (var i = 0; i < sessionStorage.vote_nb; i++)
					{
						var flag = true;
						for (var j = 0; j < data.bots.length; j++)
						{
							if (result[i].voter === data.bots[j])
							{
								flag = false;
								break;
							}
						}
						if (flag)
						{
							participants.push(result[i]);
						}
					}
				}
			});
			// DELETING BOTS END
			if (participants.length == 0) participants = result;
			
			
			for (var i = 0; i < participants.length; i++)
			{
			    if(participants[i].percent >= vote_min)
			    {
			       	vote_participant.push(participants[i].voter);
			    	vote_valid++;
			    }
			}
			sessionStorage.setItem("vote_valid", vote_valid);
		}
	});

	await steem.api.getContentReplies(author, permlink, function(err, result)
	{
		console.log("getComsValid");
		//console.log(err, result);

		coms_valid = 0; // Comments valid

		if(err == null)
		{
			sessionStorage.setItem("coms_nb", result.length);

			coms_text = $('#coms_field')[0].value;
			localStorage.setItem("coms_text", coms_text);

			var participants = [];
			// DELETING BOTS
			$.ajax({
				url: "./list_of_bots/bots.json",
				dataType: 'json',
				async: false,
				data: null,
				success: function(data) 
				{
					for (var i = 0; i < sessionStorage.coms_nb; i++)
					{
						var flag = true;
						for (var j = 0; j < data.bots.length; j++)
						{
							if (result[i].author === data.bots[j])
							{
								flag = false;
								break;
							}
						}
						if (flag)
						{
							participants.push(result[i]);
						}
					}
				}
			});
			// DELETING BOTS END
			if (participants.length == 0) participants = result;
			
			for (var i = 0; i < participants.length; i++)
			{
				var regex =  new RegExp(coms_text, "ig");
				if(regex.test(participants[i].body) == true)
				{
					coms_participant.push(participants[i].author);
				 	coms_valid++;
				}
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
			sessionStorage.setItem("nb_valid", participants.length);
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

	if(sessionStorage.winner == "undefined")
	{ 

	}
	else
	{
		sessionStorage.setItem("num_of_draws", number_of_draws++);
		$("#winner").html("<h1><a href='https://busy.org/@"+sessionStorage.getItem("winner")+"' target='_blank'>/@"+sessionStorage.getItem("winner")+"</a></h1><b class='w3-right'><i class='fa fa-certificate'></i> Certified random draw n°"+sessionStorage.getItem("num_of_draws")+"</b>");
	}

	$('.vote_nb').html(sessionStorage.getItem("vote_nb"));
	$('.coms_nb').html(sessionStorage.getItem("coms_nb"));
	$('.vote_nb_valid').html(sessionStorage.getItem("vote_valid"));
	$('.coms_nb_valid').html(sessionStorage.getItem("coms_valid"));
	$('.nb_valid').html(sessionStorage.nb_valid);

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
	$("#winner").html(no_winner);

	$('#participants').hide();
	$('#result').hide();

	vote_participant = [];
	coms_participant = [];
	participants = [];

	// END RESET

	// SAVE SET
	if($("#coms_box").is(":checked") == true)
	{
		localStorage.setItem("coms_box", true);
	}
	else
	{
		localStorage.setItem("coms_box", false);
	}
	if($("#vote_box").is(":checked") == true)
	{
		localStorage.setItem("vote_box", true);
	}
	else
	{
		localStorage.setItem("vote_box", false);
	}
	if($("#nobots_box").is(":checked") == true)
	{
		localStorage.setItem("nobots_box", true);
	}
	else
	{
		localStorage.setItem("nobots_box", false);
	}
	// END SAVE SET

	var link_full = $('#link_field')[0].value;

	if(getAuthorPermlink(link_full) == true)
	{
		getInfoFull(sessionStorage.getItem("author"), sessionStorage.getItem("permlink"));
		setTimeout(getRandomDraw, 2000);
		sessionStorage.clear();
	}
	else
	{
		$("#wait").hide();
	}
});

		// EVENT END
