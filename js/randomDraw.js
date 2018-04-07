// SET
	// SET.VIEW
		$('#wait').hide();
		$('#result').hide();
		$('#nobody').hide();
		$('#err_div').hide();
		$('#btn_win_list').hide();
		$("#choi_view").hide();
	// END SET.VIEW

	// SET.VAR
		steem.api.setOptions({ url: 'https://api.steemit.com' });
		var vote_participant = [];
		var coms_participant = [];
		var participants = [];
		var win_list = [];
		var bots_list = [];
		var number_of_draws = "1";
		var reset = $("#winner").html();
		$.ajax(
		{
			url: './blacklist/bots.json',
			dataType: 'json',
			success: function(d)
			{
				bots_list = d.bots;
			}
		});
	// END SET.VAR

	// SET.VAL.SAVE
		$("#vote_field").val(localStorage.vote_min);
		$("#coms_field").val(localStorage.coms_text);

		$("#choi_field option[value='"+localStorage.choi_box+"']").prop('selected', true);

		if(localStorage.coms_box == "false") $("#coms_box").prop('checked', false);
		else $("#coms_box").prop('checked', true);
		if(localStorage.vote_box == "false") $("#vote_box").prop('checked', false);
		else $("#vote_box").prop('checked', true);
		if(localStorage.bots_box == "false") $("#bots_box").prop('checked', false);
		else $("#bots_box").prop('checked', true);
		if(localStorage.dble_box == "false") $("#dble_box").prop('checked', false);
		else $("#dble_box").prop('checked', true);
	// END SET.VAL.SAVE
// END SET

// FUNCTION
function getAuthorPermlink(link_full)
{
	return new Promise((resolve, reject) => 
	{
		//console.log("getInfoLink");
		
		regex_v0 = new RegExp("https://golos.io");

		if (regex_v0.test(link_full)) 
		{
			steem.api.setOptions({ url: 'wss://ws.golos.io' }); // assuming websocket is work at ws.golos.io
			steem.config.set('address_prefix','GLS');
			steem.config.set('chain_id','782a3039b478c839e4cb0c941ff4eaeb7df40bdd68bd441afd444b9da763de12');
		}
		else
		{
			steem.api.setOptions({ url: 'https://api.steemit.com' });
		}
		
		regex_v1 = new RegExp("/@");
		regex_v2 = new RegExp("/");

		if (regex_v1.test(link_full))
		{
			link_split = link_full.split(regex_v1)[1];
			sessionStorage.setItem("link_site", link_full.split(regex_v2)[0]+"//"+link_full.split(regex_v2)[2]);
			//console.log(sessionStorage.link_site);
			sessionStorage.setItem("author", link_split.split(regex_v2)[0]);
			//console.log(sessionStorage.author);
			sessionStorage.setItem("permlink", link_split.split(regex_v2)[1]);
			//console.log(sessionStorage.permlink);
			resolve();
		}
		else
		{
			regex_v3 = new RegExp("https://d.tube");
			if (regex_v3.test(link_full)) 
			{
				sessionStorage.setItem("link_site", link_full.split(regex_v2)[0]+"//"+link_full.split(regex_v2)[2]);
				//console.log(sessionStorage.link_site);
				sessionStorage.setItem("author", link_full.split(regex_v2)[4]);
				//console.log(sessionStorage.author);
				sessionStorage.setItem("permlink", link_full.split(regex_v2)[5]);
				//console.log(sessionStorage.permlink);
				resolve();
			}
			else
			{
				reject("Please, Provide a valid link like https://busy.org/fr/@deadzy/my-contribution");
			}
		}
	})
}

function getInfoVote() 
{
	return new Promise((resolve, reject) => 
	{
	    steem.api.getActiveVotes(sessionStorage.author, sessionStorage.permlink, function(err, result)
	    {
			//console.log("getVoteValid");

			if(err == null) 
			{
				sessionStorage.setItem("vote_nb", result.length);

				if($('#vote_field')[0].value != "") vote_min = $('#vote_field')[0].value*100;
				else vote_min = 0;

				for (var i = 0; i < sessionStorage.vote_nb; i++)
				{
				    if(result[i].percent >= vote_min && result[i].voter != sessionStorage.author)
				    {
				    	if(!$("#dble_box").is(":checked")  && $.inArray(result[i].voter, win_list) >= 0) {} // Already win 
				    	else
				    	{
				    		if($("#bots_box").is(":checked") && $.inArray(result[i].voter, bots_list) >= 0) { console.log(result[i].voter);} // Bot
				    		else vote_participant.push(result[i].voter); // Add list
				    	}
				    }
				}
				sessionStorage.setItem("vote_valid", vote_participant.length);
				resolve();
			}
			else
			{
				reject(err);
			}
		});
  	})
}

function getInfoComs() 
{
	return new Promise((resolve, reject) => 
	{
		steem.api.getContentReplies(sessionStorage.author, sessionStorage.permlink, function(err, result)
		{
			//console.log("getComsValid");

			if(err == null)
			{
				sessionStorage.setItem("coms_nb", result.length);

				for (var i = 0; i < sessionStorage.coms_nb; i++)
				{
					var regex =  new RegExp(localStorage.coms_text, "ig");
					if(regex.test(result[i].body) == true && result[i].author != sessionStorage.author)
					{
						if(!$("#dble_box").is(":checked")  && $.inArray(result[i].author, win_list) >= 0) {} // Already win
				    	else
				    	{
				    		if($("#bots_box").is(":checked") && $.inArray(result[i].author, bots_list) >= 0) {} // Bot

				    		else coms_participant.push(result[i].author); // Add list
						}
					}
				}
				sessionStorage.setItem("coms_valid", coms_participant.length);
				resolve();
			}
			else
			{
				reject(err);
			}
		});
	})
}

function randomNumber(max)
{
	return Math.floor(Math.random()*(max));
}

function getRandomDraw()
{
	return new Promise((resolve, reject) => 
	{
		//console.log("getRandomDraw");

		if($("#coms_box").is(":checked"))
		{
			if($("#vote_box").is(":checked")) // Vote & Coms
			{
				nb = 0;

				if($('#choi_field').val() == "or")
				{
					for (i = 0; i < vote_participant.length; i++) 
					{
						nb++;
						participants.push(vote_participant[i]);
						$("#tab").append("<tr><td>"+nb+"</td><td>"+vote_participant[i]+"</td></tr>");
					}
					for (i = 0; i < coms_participant.length; i++)
					{
						nb++;
						participants.push(coms_participant[i]);
						$("#tab").append("<tr><td>"+nb+"</td><td>"+coms_participant[i]+"</td></tr>");
					}
				}
				else
				{
					for (i = 0; i < vote_participant.length; i++)
					{	
						if($.inArray(vote_participant[i], coms_participant) >= 0)
						{
							nb++;
							participants.push(vote_participant[i]);
							$("#tab").append("<tr><td>"+nb+"</td><td>"+vote_participant[i]+"</td></tr>");
						}
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
    	resolve();
	})
}

function getResult()
{
  	//console.log("getResult");

  	if(sessionStorage.user === sessionStorage.author)
  	{
  		$('#post').show();
  	}

	if(sessionStorage.winner != "undefined")
	{ 
		win_list.push(sessionStorage.winner); // Winner list
		sessionStorage.setItem("num_of_draws", number_of_draws++); // Number of draw
		if(sessionStorage.link_site == "https://d.tube")
			$("#winner").html("<h1><img src='images/steem.png'> <a href='https://d.tube/#!/c/"+sessionStorage.winner+"' target='_blank'>@"+sessionStorage.winner+
				"</a></h1><b class='w3-right'><i class='fa fa-certificate'></i> Certified random draw n°"+sessionStorage.num_of_draws+"</b>");
		else 
			$("#winner").html("<h1><img src='images/steem.png'> <a href='"+sessionStorage.link_site+"/@"+sessionStorage.winner+"' target='_blank'>@"+sessionStorage.winner+
				"</a></h1><b class='w3-right'><i class='fa fa-certificate'></i> Certified random draw n°"+sessionStorage.num_of_draws+"</b>");
	}

	$('#coms_nb').html(sessionStorage.coms_nb);
	$('#vote_nb').html(sessionStorage.vote_nb);

	if($("#coms_box").is(":checked")) // If opt coms
	{
		if($("#vote_box").is(":checked")) // If otp coms & vote
		{
			$('#cond').html($('#vote_tit').html()+"<b class='w3-text-blue'> "+$('#choi_field option:selected').text()+" </b>"+$('#coms_tit').html()); // Show condition
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
}

function showErr(err)
{
		$('#err_body').html(err);
		$('#err_div').show();
		$("#wait").hide();
}

// END FUNCTION
const start = async function(link) 
{
	try 
	{
	  	await getAuthorPermlink(link);
		await getInfoVote();
		await getInfoComs();
		await getRandomDraw();
		getResult();
	}
  	catch (error)
  	{
  		showErr(error);
  	}
}

// EVENT
$("#coms_box").change(function()
{
	if($("#coms_box").is(":checked"))
	{
		$("#coms_field").prop('disabled', false);
		$("#coms_view").show();
		if($("#vote_box").is(":checked")) // Vote & Coms
		{
			$("#choi_view").show();
		}
	}
	else
	{
		$("#choi_view").hide();
		$("#coms_field").prop('disabled', true);
		$("#coms_field").prop('value', "");
		$("#coms_view").hide();
		if(!$("#vote_box").is(":checked")) // Coms only
		{
			$("#vote_box").prop('checked', true);
			$("#vote_field").prop('disabled', false);
			$("#vote_view").show();
		}
	}
}).change();

$("#vote_box").change(function()
{
	if($("#vote_box").is(":checked"))
	{
		$("#vote_field").prop('disabled', false);
		$("#vote_view").show();
		if($("#coms_box").is(":checked")) // Vote & Coms
		{
			$("#choi_view").show();
		}
	}
	else
	{
		$("#choi_view").hide();
		$("#vote_field").prop('disabled', true);
		$("#vote_field").prop('value', "");
		$("#vote_view").hide();
		if(!$("#coms_box").is(":checked")) // Vote only
		{
			$("#coms_box").prop('checked', true);
			$("#coms_field").prop('disabled', false);
			$("#coms_view").show();
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

$("#choi_field").change(function() // Ephemeral
{
	if($('#choi_field').val() == "or")
	{
		$("#dble_box").prop('disabled', true);
		$("#dble_box").prop('checked', false);
	}
	else
	{
		$("#dble_box").prop('disabled', false)
	}
}).change();

$('#link_form').submit(function(event)
{
	event.preventDefault();
	$("#wait").show();

	// SAVE SET
		if($("#coms_box").is(":checked")) localStorage.setItem("coms_box", true);
		else localStorage.setItem("coms_box", false);
		if($("#vote_box").is(":checked")) localStorage.setItem("vote_box", true);
		else localStorage.setItem("vote_box", false);
		if($("#bots_box").is(":checked")) localStorage.setItem("bots_box", true);
		else localStorage.setItem("bots_box", false);
		if($("#dble_box").is(":checked")) localStorage.setItem("dble_box", true);
		else localStorage.setItem("dble_box", false);

		localStorage.setItem("choi_box", $('#choi_field').val());
		localStorage.setItem("vote_min", $('#vote_field')[0].value);
		localStorage.setItem("coms_text", $('#coms_field')[0].value);
	// END SAVE SET	

	// RESET
		$("#tab").html("");
		$("#winner").html(reset);
		$('#participants').hide();
		$('#result').hide();
		vote_participant = [];
		coms_participant = [];
		participants = [];
	// END RESET

	start($('#link_field')[0].value);
});

$('#post').click(function()
{
	commentWinnerList(sessionStorage.author, sessionStorage.permlink, win_list);
});

window.onunload = function()
{
  sessionStorage.clear();
};
// END EVENT
