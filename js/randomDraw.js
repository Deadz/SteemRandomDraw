// SET

// SET.VIEW
	$('#wait').hide();
	$('#result').hide();
	$('#nobody').hide();
	$('#err_div').hide();
	$('#btn_win_list').hide();
// END SET.VIEW

// SET.VAR
	steem.api.setOptions({ url: 'https://api.steemit.com' });
	var vote_participant = [];
	var coms_participant = [];
	var participants = [];
	var win_list = [];
	var number_of_draws = "1";
	var reset = $("#winner").html();
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
	if(localStorage.bots_box == "false")
		$("#bots_box").prop('checked', false);
	else
		$("#bots_box").prop('checked', true);
	if(localStorage.dble_box == "false")
		$("#dble_box").prop('checked', false);
	else
		$("#dble_box").prop('checked', true);
// END SET.VAL.SAVE

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
			return false;
}

async function getInfoFull(author, permlink)
{

	await steem.api.getActiveVotes(author, permlink, function(err, result) 
	{
		console.log("getVoteValid");
		//console.log(err, result);

		if (err == null) 
		{
			sessionStorage.setItem("vote_nb", result.length);
			localStorage.setItem("vote_min", $('#vote_field')[0].value);

			if ($('#vote_field')[0].value !== "")
				vote_min = $('#vote_field')[0].value*100;
			else
				vote_min = 0;

			for (var i = 0; i < sessionStorage.vote_nb; i++)
			{
			    if(result[i].percent >= vote_min && result[i].voter != sessionStorage.author)
			    {
			    	if(!$("#dble_box").is(":checked")  && $.inArray(result[i].voter, win_list) >= 0)
			    	{
			    		// already win
			    	}
			    	else
			    	{
			    		if($("#bots_box").is(":checked"))
			    		{
			    			$.ajax({
								url: "./blacklist/bots.json",
								dataType: 'json',
								async: false,
								data: null,
								success: function(data) 
								{
									bots_list = data.bots;
									if ($.inArray(result[i].voter, bots_list) >= 0)
									{
										// Bot
									}
									else
									{
										vote_participant.push(result[i].voter);
									}
								}
							});
						}
			    		else
			    		{
			    			vote_participant.push(result[i].voter);
			    		}
			    	}
			    }
			}
			sessionStorage.setItem("vote_valid", vote_participant.length);
		}
	});

	await steem.api.getContentReplies(author, permlink, function(err, result)
	{
		console.log("getComsValid");
		//console.log(err, result);

		if(err == null)
		{
			sessionStorage.setItem("coms_nb", result.length);

			localStorage.setItem("coms_text", $('#coms_field')[0].value);

			for (var i = 0; i < sessionStorage.coms_nb; i++)
			{
				var regex =  new RegExp(localStorage.coms_text, "ig");
				if(regex.test(result[i].body) == true && result[i].author != sessionStorage.author)
				{
					if(!$("#dble_box").is(":checked")  && $.inArray(result[i].author, win_list) >= 0)
			    	{
			    		// already win
			    	}
			    	else
			    	{
			    		if($("#bots_box").is(":checked"))
			    		{
			    			$.ajax({
								url: "./blacklist/bots.json",
								dataType: 'json',
								async: false,
								data: null,
								success: function(data) 
								{
									bots_list = data.bots;
									if ($.inArray(result[i].author, bots_list) >= 0)
									{
										// Bot
									}
									else
									{
										coms_participant.push(result[i].author);
									}
								}
							});
						}
			    		else
			    		{
			    			coms_participant.push(result[i].author);
			    		}
					}
				}
			}
			sessionStorage.setItem("coms_valid", coms_participant.length);
		}
	});
}

function getRandomDraw()
{
	console.log("getRandomDraw");

	if($("#coms_box").is(":checked") == true)
	{
		if($("#vote_box").is(":checked") == true) // Vote & Coms
		{
			nb = 0;
			for (i = 0; i < vote_participant.length; i++)
			{	
				if($.inArray(vote_participant[i], coms_participant) >= 0)
				{
					nb++;
					participants.push(vote_participant[i]);
					$("#tab").append("<tr><td>"+nb+"</td><td>"+vote_participant[i]+"</td></tr>");
				}
			}
			sessionStorage.setItem("nb_valid", participants.length);
			sessionStorage.setItem("winner", participants[randomNumber(participants.length)]);
		}
		else // Coms
		{
			for (i = 0; i < coms_participant.length; i++)
			{
				$("#tab").append("<tr><td>"+(i+1)+"</td><td>"+coms_participant[i]+"</td></tr>");
			}
			sessionStorage.setItem("winner", coms_participant[randomNumber(coms_participant.length)]);
		}
	}
	else // Vote
	{
		for (i = 0; i < vote_participant.length; i++)
		{
			$("#tab").append("<tr><td>"+(i+1)+"</td><td>"+vote_participant[i]+"</td></tr>");
		}
		sessionStorage.setItem("winner", vote_participant[randomNumber(vote_participant.length)]);
	}
	getResult();
}

function getResult()
{
	console.log("getResult");

	if(sessionStorage.winner != "undefined")
	{ 
		win_list.push(sessionStorage.winner); // Winner list
		sessionStorage.setItem("num_of_draws", number_of_draws++); // Number of draw
		$("#winner").html("<h1><img src='images/steem.png'> <a href='"+sessionStorage.link_site+"/@"+sessionStorage.winner+"' target='_blank'>/@"+sessionStorage.winner+"</a></h1><b class='w3-right'><i class='fa fa-certificate'></i> Certified random draw n°"+sessionStorage.num_of_draws+"</b>");
	}

	$('#coms_nb').html(sessionStorage.coms_nb);
	$('#vote_nb').html(sessionStorage.vote_nb);

	if($("#coms_box").is(":checked") == true) // If opt coms
	{
		if($("#vote_box").is(":checked") == true) // If otp coms & vote
		{
			$('#cond').html($('#vote_tit').html()+" & "+$('#coms_tit').html()); // Show condition
			$('#part_nb').html(sessionStorage.nb_valid);
			if (localStorage.vote_min != "")
			{
				if (localStorage.coms_text != "")
					$('#cond_opt').html($('#vote_cond').html()+" <b>"+localStorage.vote_min+"%</b> & "+$('#coms_cond').html()+" <b>\""+localStorage.coms_text+"\"</b>");
				else
					$('#cond_opt').html($('#vote_cond').html()+" <b>"+localStorage.vote_min+"%</b>");
			}
			else
				if (localStorage.coms_text != "")
					$('#cond_opt').html($('#coms_cond').html()+" <b>\""+localStorage.coms_text+"\"</b>");
				else
					$('#cond_opt').html("");
		}
		else // If coms only
		{
			if (localStorage.coms_text != "")
				$('#cond_opt').html($('#coms_cond').html()+" <b>\""+localStorage.coms_text+"\"</b>");
			else
				$('#cond_opt').html("");
			$('#cond').html($('#coms_tit').html());
			$('#part_nb').html(sessionStorage.coms_valid);
		}
	}
	else // If vote only
	{
		if (localStorage.vote_min != "")
			$('#cond_opt').html($('#vote_cond').html()+" <b>"+localStorage.vote_min+"%</b>");
		else
			$('#cond_opt').html("");
		$('#cond').html($('#vote_tit').html());
		$('#part_nb').html(sessionStorage.vote_valid);
	}

	if(sessionStorage.num_of_draws >= 2)
		$('#btn_win_list').show();

	$("#wait").hide();
	$('#result').show();

	sessionStorage.clear();
}

function randomNumber(max)
{
	return Math.floor(Math.random()*(max+1));
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

	$("#btn_win_list").click(function()
	{
		$("#win_tab").html(""); // RESET
		for (i = 0; i < win_list.length; i++)
		{
			$("#win_tab").append("<tr><td>"+(i+1)+"</td><td>"+win_list[i]+"</td></tr>");
		}
		$("#win_view").show();
	});

	$('#link_form').submit(function(event)
	{
		event.preventDefault();
		$("#wait").show();

		// RESET
			$("#tab").html("");
			$("#winner").html(reset);
			$('#participants').hide();
			$('#result').hide();
			vote_participant = [];
			coms_participant = [];
			participants = [];
		// END RESET

		// SAVE SET
			if($("#coms_box").is(":checked") == true)
				localStorage.setItem("coms_box", true);
			else
				localStorage.setItem("coms_box", false);
			if($("#vote_box").is(":checked") == true)
				localStorage.setItem("vote_box", true);
			else
				localStorage.setItem("vote_box", false);
			if($("#bots_box").is(":checked") == true)
				localStorage.setItem("bots_box", true);
			else
				localStorage.setItem("bots_box", false);
			if($("#dble_box").is(":checked") == true)
				localStorage.setItem("dble_box", true);
			else
				localStorage.setItem("dble_box", false);
		// END SAVE SET

		if(getAuthorPermlink($('#link_field')[0].value) == true)
		{
			getInfoFull(sessionStorage.getItem("author"), sessionStorage.getItem("permlink"));
			setTimeout(getRandomDraw, 2000);
		}
		else
		{
			$('#err_title').html("Error");
			$('#err_body').html("Please, Provide a valid link like https://busy.org/fr/@deadzy/my-contribution");
			$('#err_div').show();
			$("#wait").hide();
		}
	});
// EVENT END
