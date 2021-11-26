<?php
	include("mysql_info.php");
	include("helpers.php");
	$conn = new mysqli("localhost",USERNAME,PASSWORD,"stonkscf");
	$password = $argv[1];
	if($password != PASSWORD2) exit("");
	$contests = callAPI("https://codeforces.com/api/contest.list?gym=false") -> result;
	$close = false;
	for($i = 0;$i < count($contests);$i++) {
		if(($contests[$i] -> startTimeSeconds) >= 1600000000 && (($contests[$i] -> phase == "BEFORE" && $contests[$i] -> startTimeSeconds - time() <= 1800) || $contests[$i] -> phase == "CODING" || $contests[$i] -> phase == "PENDING_SYSTEM_TEST" || $contests[$i] -> phase == "SYSTEM_TEST")) {
			$close = true;
		}
	}
	if($close) {
		$conn -> query("UPDATE maps SET content = 0 WHERE id = 'open'");
		echo 'Successfully closed market!';
	}else{
		echo 'Market is not closing';
	}
?>