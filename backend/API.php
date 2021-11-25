<?php
	// error_reporting(E_ERROR | E_PARSE);

	// Sensitive information about the database
	include("mysql_info.php");
	include("helpers.php");
	$conn = new mysqli("localhost",USERNAME,PASSWORD,"stonkscf");
  	header('Content-type:application/json;charset=utf-8');

	$type = $_REQUEST['type'];
	if($type == 1) {
		// Retrieve top N users leaderboard, at most N
		$num = max(0,min(100,(int)$_REQUEST['num']));
		$data = [];
		$res = $conn -> query("SELECT * FROM users order by networth DESC LIMIT " . $num);
		while($row = $res -> fetch_assoc()) {
			$obj["name"] = $row["name"];
			$obj["networth"] = $row["networth"];
			$obj["rating"] = $row["rating"];
			array_push($data,$obj);
		}
		echo json_encode($data);
		exit("");
	}else if($type == 2) {
		// Retrieve top N transactions and at most top 500 transactions
		$num = max(0,min(500,(int)$_REQUEST['num']));
		$data = [];
		$res = $conn -> query("SELECT * FROM trades order by tradeTime DESC LIMIT " . $num);
		while($row = $res -> fetch_assoc()) {
			$obj["tradeTime"] = $row["tradeTime"];
			$obj["buyer"] = $row["buyer"];
			$obj["buyerRating"] = $conn -> query("SELECT rating FROM users WHERE name='" . $row["buyer"] . "'") -> fetch_assoc()["rating"];
			$obj["stock"] = $row["stock"];
			$obj["stockRating"] = $conn -> query("SELECT rating FROM users WHERE name='" . $row["stock"] . "'") -> fetch_assoc()["rating"];
			$obj["price"] = $row["price"];
			$obj["qty"] = $row["qty"];
			array_push($data,$obj);
  		}
		echo json_encode($data);
		exit("");
	}else if($type == 3) {
		// Retrieve top 5 hottest stocks
		$data = [];
		$res = $conn -> query("SELECT * FROM users order by hotness desc limit 5;");
		while($row = $res -> fetch_assoc()) {
			$obj["name"] = $row["name"];
			$obj["price"] = ratingToPrice($row["rating"]);
			$obj["rating"] = $row["rating"];
			$obj["hotness"] = $row["hotness"];
			array_push($data,$obj);
		}
		echo json_encode($data);
		exit("");
	}else if($type == 4) {
		// Retrieve announcements
		$data = [];
		$res = $conn -> query("SELECT content FROM maps WHERE id='announcements'");
		array_push($data,$res -> fetch_assoc()["content"]);
		echo json_encode($data);
		exit("");
	}else if($type == 5) {
		// Retrieve Profile
		$username = strtolower($_REQUEST["username"]);

		$stmt = $conn -> prepare("SELECT @rownum := @rownum + 1 AS  rownum,name,networth,rating,cash,available FROM users, (SELECT @rownum := 0) r ORDER BY networth DESC");

		$stmt -> execute();
		$results = $stmt -> get_result();
		$data["total"] = mysqli_num_rows($results);


		while($res = $results -> fetch_assoc()) {
			if($res["name"] != $username) continue;
			$data["name"] = $res["name"];
			$data["networth"] = $res["networth"];
			$data["rank"] = $res["rownum"];
			$data["price"] = ratingToPrice($res["rating"]);
			$data["cash"] = $res["cash"];
			$data["available"] = $res["available"];
		}



		if(!isset($data["name"])) {
			$data["success"] = -9;
			$data["message"] = "The user you are trying to search does not exist on our database";

			echo json_encode($data);
			exit("");
		}

		$data["open"] = ($conn -> query("SELECT content FROM maps WHERE id='open'") -> fetch_assoc()["content"] == "1");

		$data["changes"] = Array();
		$stmt = $conn -> prepare("SELECT * FROM changes WHERE name = ?");
		$stmt -> bind_param("s",$username);
		$stmt -> execute();
		$res = $stmt -> get_result();
		while($row = $res -> fetch_assoc()) {
			$obj["time"] = $row["changeTime"];
			$obj["value"] = $row["value"];
			array_push($data["changes"],$obj);
		}

		$stmt = $conn -> prepare("SELECT * FROM trades WHERE buyer = ?");
		$stmt -> bind_param("s",$username);
		$stmt -> execute();
		$res = $stmt -> get_result();
		$data["holdings"] = Array();
		$data["history"] = Array();
		while($row = $res -> fetch_assoc()) {
			$obj["tradeTime"] = $row["tradeTime"];
			$obj["stock"] = $row["stock"];
			$obj["price"] = $row["price"];
			$obj["qty"] = $row["qty"];
			$obj["rating"] = $conn -> query("SELECT rating FROM users WHERE name='" . $obj["stock"] . "'") -> fetch_assoc()["rating"];

			array_push($data["history"],$obj);

			if(isset($data["holdings"][$obj["stock"]])) {
				$data["holdings"][$obj["stock"]]["qty"] += $obj["qty"];
			}else{
				$data["holdings"][$obj["stock"]]["qty"] = $obj["qty"];
				$data["holdings"][$obj["stock"]]["purchasePrice"] = 0;
				$data["holdings"][$obj["stock"]]["rating"] = $obj["rating"];
				$data["holdings"][$obj["stock"]]["currentPrice"] = ratingToPrice($obj["rating"]);
			}

			// $data["holdings"][$obj["stock"]]["purchasePrice"] += $obj["price"] * $obj["qty"];
			if($obj["qty"] > 0) $data["holdings"][$obj["stock"]]["purchasePrice"] = $obj["price"];
		}
		// foreach($data["holdings"] as $key => $value) {
		// 	$data["holdings"][$key]["purchasePrice"] /= $value["qty"];
		// }

		$stmt = $conn -> prepare("SELECT * FROM trades WHERE stock = ?");
		$stmt -> bind_param("s",$username);
		$stmt -> execute();
		$res = $stmt -> get_result();
		$data["owners"] = Array();
		while($row = $res -> fetch_assoc()) {
			if(isset($data["owners"][$row["buyer"]])) {
				$data["owners"][$row["buyer"]]["qty"] += $row["qty"];
			}else{
				$data["owners"][$row["buyer"]]["qty"] = $row["qty"];
				$data["owners"][$row["buyer"]]["rating"] = $conn -> query("SELECT rating FROM users WHERE name='" . $row["buyer"] . "'") -> fetch_assoc()["rating"];
			}
		}

		$data["success"] = 1;

		echo json_encode($data);
		exit("");
	}else if($type == 6) {
		// Retrieve all available stocks
		$data = [];
		$res = $conn -> query("SELECT * FROM users");
		while($row = $res -> fetch_assoc()) {
			if($row["available"] <= 0) continue;
			$obj["name"] = $row["name"];
			$obj["qty"] = $row["available"];
			$obj["rating"] = $row["rating"];
			$obj["price"] = ratingToPrice($row["rating"]);
			array_push($data,$obj);
		}

		echo json_encode($data);
		exit("");
	}else if($type == 7) {
		// Retrieve all chats from the past week
		$data = [];
		$res = $conn -> query("SELECT * FROM chats WHERE chatTime > DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 7 DAY) ORDER BY chatTime DESC");
		while($row = $res -> fetch_assoc()) {
			$obj["time"] = $row["chatTime"];
			$obj["name"] = $row["name"];
			$obj["content"] = $row["content"];
			array_push($data,$obj);
		}

		echo json_encode($data);
		exit("");
	}else if($type == 8) {
		if($conn -> query("SELECT content FROM maps WHERE id='open'") -> fetch_assoc()["content"] != "1") die("");

		// Make an transaction
		$data = Array();

		$username = strtolower($_REQUEST["username"]);
		$password = $_REQUEST["password"];
		$stock = strtolower($_REQUEST["stock"]);
		$qty = min(1000,max(-1000,(int)$_REQUEST["qty"]));
		if($qty == 0) die("");

		if(!checkUserExists($conn,$stock) || !checkUserCredentials($conn,$username,$password)) die("");

		$stockUser = $conn -> query("SELECT rating,available FROM users WHERE name='" . $stock . "'") -> fetch_assoc();

		$price = ratingToPrice($stockUser["rating"]);
		$available = $stockUser["available"];

		if($qty < 0) {
			// Selling stocks
			$total = 0;
			$res = $conn -> query("SELECT * FROM trades WHERE buyer = '" . $username . "' AND stock = '" . $stock . "'");
			while($row = $res -> fetch_assoc()) {
				$total += $row["qty"];
			}
			if(-$qty > $total) {
				$data["success"] = -1;
				$data["message"] = "You are selling more stocks than you have!";
			}else{
				$money = $price * (-$qty);
				$conn -> query("UPDATE users SET cash=cash + " . $money . " WHERE name='" . $username . "'");
				$conn -> query("UPDATE users SET hotness=hotness - " . (-$qty) . ", available=available + " . (-$qty) . " WHERE name='" . $stock . "'");
				$conn -> query("INSERT INTO trades (buyer,stock,price,qty) VALUES ('" . $username . "','" . $stock . "'," . $price . "," . $qty . ")");
				$data["success"] = 1;
			}
		}else{
			// Buying stocks
			$numOfContests = count(callAPI("https://codeforces.com/api/user.rating?handle=" . $stock) -> result);
			if($numOfContests < 6 && $stock != $username) {
				$data["success"] = -6;
				$data["message"] = "You cannot buy a stock whose user has taken less than 6 contests!";
			}else if($qty > $available) {
				$data["success"] = -11;
				$data["message"] = "You are buying more stocks than there is available!";
			}else{
				$cash = $conn -> query("SELECT cash FROM users WHERE name='" . $username . "'") -> fetch_assoc()["cash"];
				$total = $price * $qty;
				if($total > $cash) {
					$data["success"] = -2;
					$data["message"] = "You do not have enough money!";
				}else{
					$conn -> query("INSERT INTO trades (buyer,stock,price,qty) VALUES ('" . $username . "','" . $stock . "'," . $price . "," . $qty . ")");
					$conn -> query("UPDATE users SET cash=cash - " . $total . " WHERE name='" . $username . "'");
					$conn -> query("UPDATE users SET hotness=hotness + " . $qty . ", available=available - " . $qty . " WHERE name='" . $stock . "'");
					$data["success"] = 1;
				}
			}
		}

		echo json_encode($data);
		exit("");
	}else if($type == 9) {
		// Post a comment
		$username = strtolower($_REQUEST["username"]);
		$password = $_REQUEST["password"];
		$content = $_REQUEST["content"];
		if(strlen($content) > 255) {
			$data["success"] = -3;
			$data["message"] = "Comments are at most 255 characters.";
		}else{
			if(!checkUserCredentials($conn,$username,$password)) die("");
			$lastComment = $conn -> query("SELECT content FROM maps WHERE id='lastComment'") -> fetch_assoc()["content"];
			$currentTime = round(microtime(true) * 1000);
			if($currentTime - $lastComment > 1000) {
				$conn -> query("UPDATE maps SET content=" . $currentTime . " WHERE id='lastComment'");
				$conn -> query("INSERT INTO chats (name,content) VALUES ('" . $username . "','" . $content . "')");
				$data["success"] = 1;
			}else{
				$data["success"] = -10;
				$data["message"] = "Too many comments are being posted at the same time, try again later";
			}
		}

		echo json_encode($data);
		exit("");
	}else if($type == 10) {
		// Register an account
		$data = Array();

		$username = strtolower($_REQUEST["username"]);
		$password = md5($_REQUEST["password"]);
		$CFUsers = callAPI("http://codeforces.com/api/user.info?handles=" . $username) -> result;
		if(count($CFUsers) == 0) {
			$data["success"] = -8;
			$data["message"] = "The codeforces account does not exist!";

			echo json_encode($data);
			exit("");
		}
		$CFUsers = $CFUsers[0];
		$firstName = $CFUsers -> firstName;
		$rating = $CFUsers -> rating;
		if(trim($firstName) == "StonksCF-verify") {
			if(checkUserExists($conn,$username)) {
				$data["success"] = -5;
				$data["message"] = "This username has already been registered. Try logging in instead.";
			}else{
				$pwd = $password;
				$stmt = $conn -> prepare("INSERT INTO users (name,rating,password,networth,hotness,cash,available) VALUES (?,?,?,?,?,?,?)");
				$price = ratingToPrice($rating);

				// Everybody gets 20% of their own stock, and 
				$baseCash = 10000;
				$available = 800;
				$holds = 1000 - $available;
				$networth = $price * $holds + $baseCash;
				$hotness = $holds;
				$cash = $baseCash;

				$stmt -> bind_param("sisdddi",$username,$rating,$pwd,$networth,$hotness,$cash,$available);
				$stmt -> execute();

				$stmt = $conn -> prepare("INSERT INTO trades (buyer,stock,price,qty) VALUES (?,?,?,?)");
				$stmt -> bind_param("ssdi",$username,$username,$price,$holds);
				$stmt -> execute();

				$conn -> query("INSERT INTO changes (name,value) VALUES ('" . $username . "'," . $networth . ")");

				$data["success"] = 1;
			}
		}else{
			$data["success"] = -4;
			$data["message"] = "The account's first name is not 'StonksCF-verify'";
		}
		echo json_encode($data);
		exit("");
	}else if($type == 11) {
		// Recalculates everything. Used at the start of a new trading cycle
		if($_REQUEST["adminPassword"] != PASSWORD2) die("");

		// Calculate new networth
		$res = $conn -> query("SELECT * FROM users;");
		$obj = Array();
		$handles = Array();
		while($row = $res -> fetch_assoc()) {
			$obj[$row["name"]]["hotness"] = floor($row["hotness"] / 2);
			$obj[$row["name"]]["networth"] = $row["cash"];
			array_push($handles,$row["name"]);
		}

		$allUsersData = callAPI("http://codeforces.com/api/user.info?handles=" . join(";",$handles)) -> result;
		for($i = 0;$i < count($handles);$i++) {
			$obj[$handles[$i]]["rating"] = $allUsersData[$i] -> rating;
		}

		$res = $conn -> query("SELECT * FROM trades");

		while($row = $res -> fetch_assoc()) {
			$obj[$row["buyer"]]["networth"] += ratingToPrice($obj[$row["stock"]]["rating"]) * $row["qty"];
		}

		foreach($obj as $user => $pro) {
			$conn -> query("UPDATE users SET rating=" . $pro["rating"] . ", networth=" . $pro["networth"] . ", hotness=" . $pro["hotness"] . " WHERE name='" . $user . "'");

			$conn -> query("INSERT INTO changes (name,value) VALUES ('" . $user . "'," . $pro["networth"] . ");");
		}


		$data = Array("success" => 1);
		echo json_encode($data);
		exit("");
	}else if($type == 12) {
		$username = strtolower($_REQUEST["username"]);
		$password = $_REQUEST["password"];

		$data = Array();
		if(checkUserCredentials($conn,$username,$password)) {
			$data["success"] = 1;
		}else{
			$data["success"] = -7;
			$data["message"] = "Your username or password is not correct!";
		}
		echo json_encode($data);
		exit("");
	}else if($type == 13) {
		// Updates the announcement
		if($_REQUEST["adminPassword"] != PASSWORD2) die("");
		$announcement = $_REQUEST["announcement"];
		$stmt = $conn -> prepare("UPDATE maps SET content = ? WHERE id = 'announcements'");
		$stmt -> bind_param("s",$announcement);
		$stmt -> execute();

		$data = Array();
		$data["success"] = 1;

		echo json_encode($data);
		die("");
	}else if($type == 14) {
		// Toggles the market
		if($_REQUEST["adminPassword"] != PASSWORD2) die("");
		$action = $_REQUEST["action"];
		$stmt = $conn -> prepare("UPDATE maps SET content = ? WHERE id = 'open'");
		$stmt -> bind_param("s",$action);
		$stmt -> execute();

		$data = Array();
		$data["success"] = 1;

		echo json_encode($data);
		die("");
	}

	function checkUserCredentials($conn,$username,$password) {
		$stmt = $conn -> prepare("SELECT password FROM users WHERE name = ?");
		$stmt -> bind_param("s",$username);
		$stmt -> execute();
		$res = $stmt -> get_result();
		if(mysqli_num_rows($res) <= 0) return false;
		return ($res -> fetch_assoc()["password"] == $password);
	}

	function checkUserExists($conn,$username) {
		$stmt = $conn -> prepare("SELECT * FROM users WHERE name = ?");
		$stmt -> bind_param("s",$username);
		$stmt -> execute();
		$res = $stmt -> get_result();
		return (mysqli_num_rows($res) > 0);
	}
?>