<?php
	include("mysql_info.php");
	include("helpers.php");
	$conn = new mysqli("localhost",USERNAME,PASSWORD,"stonkscf");
	$password = $argv[1];
	if($password != PASSWORD2) exit("");

	$currentStatus = ($conn -> query("SELECT content FROM maps WHERE id='open'") -> fetch_assoc()["content"] == "1");

	$contests = callAPI("https://codeforces.com/api/contest.list?gym=false") -> result;
	$latest = 0;
	$latestContestID = 0;
	$open = false;
	$close = false;
	for($i = 0;$i < count($contests);$i++) {
		if($contests[$i] -> startTimeSeconds > $latest && $contests[$i] -> phase == "FINISHED") {
			$latest = $contests[$i] -> startTimeSeconds;
			$latestContestID = $contests[$i] -> id;
		}
		if(($contests[$i] -> startTimeSeconds) >= 1600000000 && (($contests[$i] -> phase == "BEFORE" && $contests[$i] -> startTimeSeconds - time() <= 1800) || $contests[$i] -> phase == "CODING" || $contests[$i] -> phase == "PENDING_SYSTEM_TEST" || $contests[$i] -> phase == "SYSTEM_TEST")) {
			$close = true;
		}
	}
	$open = count(callAPI("http://codeforces.com/api/contest.ratingChanges?contestId=" . $latestContestID) -> result) > 0;
	if($currentStatus && $close) {
		$conn -> query("UPDATE maps SET content = 0 WHERE id = 'open'");
		echo 'Successfully closed market!\n';
	}else if(!$currentStatus && $open && !$close) {
		callAPI("https://codetiger.me/project/StonksCF/backend/API.php?type=11&adminPassword=" . $password);
		$conn -> query("UPDATE maps SET content = 1 WHERE id = 'open'");
		echo 'Market has been reopened!\n';
	}else{
		echo 'Did nothing :<\n';
	}
?>