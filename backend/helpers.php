<?php

function ratingToRank($rating) {
	if($rating < 1200) return 0;
	if($rating < 1400) return 1;
	if($rating < 1600) return 2;
	if($rating < 1900) return 3;
	if($rating < 2100) return 4;
	if($rating < 2300) return 5;
	if($rating < 2400) return 6;
	if($rating < 2600) return 7;
	if($rating < 3000) return 8;
	return 9;
}

function ratingToPrice($rating) {
	return $rating * pow(1.2,ratingToRank($rating)) / 100;
}

function callAPI($url){
	$result = json_decode(file_get_contents($url));
	return $result;
}

?>